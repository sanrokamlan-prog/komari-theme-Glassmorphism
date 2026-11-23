import type { NodeData } from '@/stores/nodes'
import { getCachedIpGeo } from '@/utils/ipGeoHelper'
import { getRegionByAlias, isRegionMatch } from '@/utils/regionHelper'
import { isFreeNode } from '@/utils/tagHelper'

const SEARCH_TERM_SEPARATOR = /\s+/
const SEARCH_OR_SEPARATOR = /[|,，]+/
const TWO_LETTER_CODE_REGEX = /^[a-z]{2}$/
const CORES_TERM_REGEX = /^(\d+)(?:c|核|cores?)$/
const MEM_GB_TERM_REGEX = /^(\d+(?:\.\d+)?)gb?$/
const MEM_MB_TERM_REGEX = /^(\d+)mb?$/

function normalizeSearchValue(value: unknown): string {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase().trim()
}

function matchesIpv4Pattern(ip: string | undefined, pattern: string): boolean {
  if (!ip)
    return false

  const patternParts = pattern.split('.')
  const ipParts = ip.split('.')
  if (patternParts.length !== 4 || ipParts.length !== 4)
    return false

  return patternParts.every((part, index) => part === 'x' || part === '*' || part === ipParts[index])
}

function matchesNodeIp(node: NodeData, term: string): boolean {
  const ipv4 = normalizeSearchValue(node.ipv4)
  const ipv6 = normalizeSearchValue(node.ipv6)
  return ipv4.includes(term)
    || ipv6.includes(term)
    || matchesIpv4Pattern(ipv4, term)
}

function matchesSpecialKeyword(node: NodeData, term: string): boolean | null {
  switch (term) {
    case 'online':
    case '在线':
      return node.online
    case 'offline':
    case '离线':
      return !node.online
    case 'ipv4':
    case 'v4':
      return Boolean(node.ipv4?.trim())
    case 'ipv6':
    case 'v6':
      return Boolean(node.ipv6?.trim())
    case 'gpu':
      return Boolean(node.gpu_name?.trim()) || (node.gpu ?? 0) > 0
    case 'free':
    case '免费':
      return isFreeNode(node)
    case 'unlimited':
    case '无限流量':
      return (node.traffic_limit ?? 0) <= 0
    default:
      return null
  }
}

function matchesSpecTerm(node: NodeData, term: string): boolean {
  const coresMatch = term.match(CORES_TERM_REGEX)
  if (coresMatch) {
    return node.cpu_cores === Number(coresMatch[1])
  }

  const memGbMatch = term.match(MEM_GB_TERM_REGEX)
  if (memGbMatch && node.mem_total > 0) {
    const targetGb = Number(memGbMatch[1])
    const actualGb = node.mem_total / (1024 ** 3)
    return Math.abs(actualGb - targetGb) <= Math.max(0.25, targetGb * 0.15)
  }

  const memMbMatch = term.match(MEM_MB_TERM_REGEX)
  if (memMbMatch && node.mem_total > 0) {
    const targetMb = Number(memMbMatch[1])
    const actualMb = node.mem_total / (1024 ** 2)
    return Math.abs(actualMb - targetMb) <= Math.max(64, targetMb * 0.15)
  }

  return false
}

interface NodeSearchCorpus {
  primaryText: string
  technicalText: string
  geoCountryCode: string
}

function buildSearchCorpus(node: NodeData): NodeSearchCorpus {
  const geo = getCachedIpGeo(node.ipv4) ?? getCachedIpGeo(node.ipv6)
  const primaryText = [
    node.name,
    node.region,
    node.group,
    ...node.groups,
    node.tags,
    node.public_remark,
    node.remark,
    geo?.city,
  ].map(normalizeSearchValue).filter(Boolean).join('\n')

  const technicalText = [
    node.uuid,
    node.cpu_name,
    node.gpu_name,
    node.os,
    node.kernel_version,
    node.virtualization,
    node.arch,
    node.currency,
    geo?.org,
    geo?.asn,
  ].map(normalizeSearchValue).filter(Boolean).join('\n')

  return {
    primaryText,
    technicalText,
    geoCountryCode: normalizeSearchValue(geo?.countryCode),
  }
}

function isKnownTwoLetterRegionCode(term: string): boolean {
  return TWO_LETTER_CODE_REGEX.test(term) && getRegionByAlias(term) !== null
}

function matchesSingleTerm(node: NodeData, corpus: NodeSearchCorpus, term: string): boolean {
  const special = matchesSpecialKeyword(node, term)
  if (special !== null)
    return special

  // 2 字母国家/地区代码（如 se / de / in / us / hk / jp）只匹配地区与名称/分组/标签/备注，
  // 避免误命中操作系统、CPU、厂商名中的子串（如 se 命中 Server/Release、de 命中 Debian、in 命中 Linux/Intel）。
  if (isKnownTwoLetterRegionCode(term)) {
    return Boolean(node.region && isRegionMatch(node.region, term))
      || corpus.geoCountryCode === term
      || corpus.primaryText.includes(term)
  }

  return corpus.primaryText.includes(term)
    || corpus.technicalText.includes(term)
    || matchesNodeIp(node, term)
    || Boolean(node.region && isRegionMatch(node.region, term))
    || matchesSpecTerm(node, term)
}

/**
 * 节点智能搜索：
 * - 空格分词（AND）：如 `hk 2c`
 * - `|` 或 `,` 或匹配（OR）：如 `hk|jp`、`香港,日本`
 * - `-` 或 `!` 排除（NOT）：如 `us -离线`
 * - 支持名称、地区（中/英/代码）、城市、厂商/ASN、IP（含通配如 1.2.x.x）、CPU/GPU/OS、规格（2c/4g/512m）及状态词（在线/离线/ipv6/免费）
 */
export function isNodeMatchSearch(node: NodeData, search: string): boolean {
  const normalizedSearch = normalizeSearchValue(search)
  if (!normalizedSearch)
    return true

  const corpus = buildSearchCorpus(node)

  return normalizedSearch.split(SEARCH_TERM_SEPARATOR).every((rawTerm) => {
    if (!rawTerm)
      return true

    const negated = (rawTerm.startsWith('-') || rawTerm.startsWith('!')) && rawTerm.length > 1
    const cleanTerm = negated ? rawTerm.slice(1) : rawTerm
    const orTerms = cleanTerm.split(SEARCH_OR_SEPARATOR).filter(Boolean)
    if (!orTerms.length)
      return true

    const matched = orTerms.some(term => matchesSingleTerm(node, corpus, term))
    return negated ? !matched : matched
  })
}
