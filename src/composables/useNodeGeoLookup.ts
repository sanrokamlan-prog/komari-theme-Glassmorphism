import type { useAppStore } from '@/stores/app'
import type { NodeData } from '@/stores/nodes'
import type { IpGeo } from '@/utils/ipGeoHelper'
import { computed, ref } from 'vue'
import { getNodeIps } from '@/services/provider.service'
import { getCountryCodeFromRegion } from '@/utils/geoHelper'
import { isPublicIp } from '@/utils/ipAddress'
import { lookupIpGeo, setIpGeoProviderUrls } from '@/utils/ipGeoHelper'

/**
 * 节点 IP → 地理位置的共享查询状态。
 *
 * 地球与节点卡片国旗必须显示同一个国家，因此两者共用这一份查询结果和同一份
 * 主题设置（`ipGeoProviderUrls`），而不是各自走不同的数据源。查询本身按 IP 去重、
 * 带 localStorage 缓存，并遵循 `providerGeoLookup` 权限检查。
 */

const ipGeoMap = ref(new Map<string, IpGeo>())
const failedIpAttempts = new Map<string, number>()
let generation = 0
let providerSignature = ''

const IP_GEO_RETRY_INTERVAL_MS = 10 * 60 * 1000
const IP_GEO_BATCH_SIZE = 8

/** 查询未完成时挂起本轮请求，供多个调用方共享同一次网络往返。 */
const pending = new Map<string, Promise<void>>()

function applyProviderUrls(appStore: ReturnType<typeof useAppStore>): void {
  const signature = JSON.stringify(appStore.ipGeoProviderUrls)
  if (signature !== providerSignature) {
    resetNodeGeoLookup()
    providerSignature = signature
  }
  setIpGeoProviderUrls(appStore.ipGeoProviderUrls)
}

/**
 * 确保所有可见节点的 IP 地理位置已查询完成。
 * 权限不足、未登录或主题设置显式留空时直接返回，卡片与地球都回落到后台 region。
 */
export async function ensureNodeGeoLookup(appStore: ReturnType<typeof useAppStore>, nodes: NodeData[]): Promise<void> {
  applyProviderUrls(appStore)
  const current = generation

  if (appStore.ipGeoProviderUrls?.length === 0)
    return
  if (!appStore.privateFeaturesAllowed)
    return
  if (!await appStore.requireLoginPermission('providerGeoLookup', { force: false }))
    return
  if (current !== generation || !appStore.privateFeaturesAllowed)
    return

  // 同一批节点重复调用时复用上一次请求，避免并发重复查询。
  const signature = nodes.map(node => `${node.uuid}:${getNodeIps(node).join(',')}`).join('|')
  const existing = pending.get(signature)
  if (existing)
    return existing

  const task = (async () => {
    const now = Date.now()
    const batches: string[][] = []

    for (const node of nodes) {
      const candidates = getNodeIps(node).filter(isPublicIp)
      if (candidates.some(ip => ipGeoMap.value.has(ip)))
        continue
      const available = candidates.filter((ip) => {
        const failedAt = failedIpAttempts.get(ip)
        return !failedAt || now - failedAt >= IP_GEO_RETRY_INTERVAL_MS
      })
      if (available.length)
        batches.push(available)
    }

    for (let i = 0; i < batches.length; i += IP_GEO_BATCH_SIZE) {
      const batch = batches.slice(i, i + IP_GEO_BATCH_SIZE)
      const results = (await Promise.all(batch.map(async (candidates) => {
        const attempts: Array<{ ip: string, geo: IpGeo | null }> = []
        for (const ip of candidates) {
          if (current !== generation)
            break
          const geo = ipGeoMap.value.get(ip) ?? await lookupIpGeo(ip)
          attempts.push({ ip, geo })
          if (geo)
            break
        }
        return attempts
      }))).flat()

      if (current !== generation || !appStore.privateFeaturesAllowed)
        return
      const resolved = results.filter((result): result is { ip: string, geo: IpGeo } => result.geo !== null)
      for (const { ip, geo } of results) {
        if (geo)
          failedIpAttempts.delete(ip)
        else
          failedIpAttempts.set(ip, Date.now())
      }

      if (resolved.length) {
        const next = new Map(ipGeoMap.value)
        for (const { ip, geo } of resolved)
          next.set(ip, geo)
        ipGeoMap.value = next
      }
    }
  })().finally(() => {
    if (pending.get(signature) === task)
      pending.delete(signature)
  })

  pending.set(signature, task)
  await task
}

/** 已解析的 IP →地理位置，未查询到的 IP 返回 undefined。 */
export function getResolvedIpGeo(node: NodeData): IpGeo | undefined {
  return getNodeIps(node).map(ip => ipGeoMap.value.get(ip)).find(Boolean)
}

/** 清空缓存，用于权限撤销或设置变更。 */
export function resetNodeGeoLookup(): void {
  generation++
  ipGeoMap.value = new Map()
  failedIpAttempts.clear()
  pending.clear()
}

/**
 * 节点的展示地区代码。
 *
 * 优先采用 IP 查询结果的国家，这样地球落点与卡片国旗来自同一次查询；
 * 查询尚未完成或失败时回落到后台下发的 `region`。
 */
export function useNodeDisplayCountry(node: () => NodeData) {
  return computed(() => {
    const geo = getResolvedIpGeo(node())
    const fallback = getCountryCodeFromRegion(node().region)
    return (geo?.countryCode || fallback || '').toUpperCase()
  })
}
