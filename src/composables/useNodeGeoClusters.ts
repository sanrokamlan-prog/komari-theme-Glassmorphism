import type { NodeData } from '@/stores/nodes'
import { computed, watch } from 'vue'
import { ensureNodeGeoLookup, getResolvedIpGeo, resetNodeGeoLookup } from '@/composables/useNodeGeoLookup'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import { formatCityNameZh } from '@/utils/cityNameHelper'
import { getCoordByCode, getCountryCodeFromRegion } from '@/utils/geoHelper'
import { getRegionDisplayName } from '@/utils/regionHelper'

interface UseNodeGeoClustersOptions {
  nodes?: () => NodeData[] | undefined
}

export interface RegionCluster {
  id: string
  code: string
  coord: [number, number]
  label: string
  asn?: string
  org?: string
  servers: number
  onlineServers: number
}

interface ClusterSummary {
  clusters: RegionCluster[]
  totalServers: number
  onlineServers: number
}

export function useNodeGeoClusters(options: UseNodeGeoClustersOptions = {}) {
  const nodesStore = useNodesStore()
  const appStore = useAppStore()

  const displayNodes = computed(() => options.nodes?.() ?? nodesStore.visibleNodes)

  function nodeClusterInfo(node: NodeData): { id: string, code: string, coord: [number, number], label: string, asn?: string, org?: string } | null {
    const regionCode = getCountryCodeFromRegion(node.region)
    const geo = getResolvedIpGeo(node)

    if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
      const code = (geo.countryCode || regionCode || '').toUpperCase()
      const citySlug = encodeURIComponent((geo.city?.trim() || `${geo.lat.toFixed(2)},${geo.lng.toFixed(2)}`).normalize('NFKC').toLowerCase())
      const label = formatCityNameZh(geo.city) || getRegionDisplayName(node.region) || getRegionDisplayName(code) || ''
      return {
        id: `${(code || 'xx').toLowerCase()}-${citySlug || 'city'}`,
        code: code || (regionCode ?? ''),
        coord: [geo.lat, geo.lng],
        label,
        asn: geo.asn,
        org: geo.org,
      }
    }

    if (regionCode) {
      const coord = getCoordByCode(regionCode)
      if (coord)
        return { id: regionCode.toLowerCase(), code: regionCode, coord, label: getRegionDisplayName(node.region) || getRegionDisplayName(regionCode) || '' }
    }

    return null
  }

  const clusterSummary = computed<ClusterSummary>(() => {
    const clustersById = new Map<string, RegionCluster>()
    let onlineServers = 0

    for (const node of displayNodes.value) {
      if (node.online)
        onlineServers += 1

      const info = nodeClusterInfo(node)
      if (!info)
        continue

      let cluster = clustersById.get(info.id)
      if (!cluster) {
        cluster = { id: info.id, code: info.code, coord: info.coord, label: info.label, asn: info.asn, org: info.org, servers: 0, onlineServers: 0 }
        clustersById.set(info.id, cluster)
      }
      if (!cluster.asn && info.asn)
        cluster.asn = info.asn
      if (!cluster.org && info.org)
        cluster.org = info.org
      cluster.servers += 1

      if (node.online)
        cluster.onlineServers += 1
    }

    return {
      clusters: Array.from(clustersById.values()).sort((a, b) => b.servers - a.servers),
      totalServers: displayNodes.value.length,
      onlineServers,
    }
  })

  const regionClusters = computed<RegionCluster[]>(() => clusterSummary.value.clusters)
  const totalServers = computed(() => clusterSummary.value.totalServers)
  const onlineServers = computed(() => clusterSummary.value.onlineServers)
  const offlineServers = computed(() => totalServers.value - onlineServers.value)

  function clusterKey(cluster: RegionCluster) {
    return `${cluster.id}:${cluster.coord[0]},${cluster.coord[1]}:${cluster.label}:${cluster.asn ?? ''}:${cluster.org ?? ''}:${cluster.servers}:${cluster.onlineServers}`
  }

  // 地球与节点卡片共用同一份 IP 查询结果；节点或查询地址变化时重新补齐缺失项。
  watch([displayNodes, () => appStore.ipGeoProviderUrls, () => appStore.privateFeaturesAllowed], () => {
    if (!appStore.privateFeaturesAllowed) {
      resetNodeGeoLookup()
      return
    }
    void ensureNodeGeoLookup(appStore, displayNodes.value)
  }, { immediate: true, deep: true })

  return {
    displayNodes,
    regionClusters,
    totalServers,
    onlineServers,
    offlineServers,
    clusterKey,
  }
}
