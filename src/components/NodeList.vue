<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { useVirtualList } from '@vueuse/core'
import { computed, ref, TransitionGroup, watch } from 'vue'
import NodePingListCell from '@/components/NodePingListCell.vue'
import TrafficProgress from '@/components/TrafficProgress.vue'
import { Badge } from '@/components/ui/badge'
import { DataTooltip } from '@/components/ui/data-tooltip'
import { ProgressThin } from '@/components/ui/progress-thin'
import { useNodeProviderMetadata } from '@/composables/useNodeProviderMetadata'
import { UI_CONFIG } from '@/constants/ui'
import { useAppStore } from '@/stores/app'
import { formatBytesPerSecondWithConfig, formatBytesWithConfig, formatDateTime, formatUptimeWithFormat, getStatus } from '@/utils/helper'
import { getRealtimeTotalSpeed, getTrafficUsed, getTrafficUsedPercentage, hasTrafficLimit } from '@/utils/nodeMetricsHelper'
import { getOSImage, getOSName } from '@/utils/osImageHelper'
import { getRegionCode, getRegionDisplayName } from '@/utils/regionHelper'
import { formatPriceWithCycle, getDaysUntilExpired, getExpireStatus, parseTags } from '@/utils/tagHelper'

interface ColumnConfig {
  key: string
  label: string
  width: string | number
  sortable: boolean
}

interface NodeMetadataItem {
  key: string
  value: string
  title?: string
  icon?: string
  flagSrc?: string
  variant?: 'secondary' | 'outline'
  class?: string
  style?: CSSProperties
}

const props = defineProps<{
  nodes: NodeData[]
  transitionKey?: string
  sortResetKey?: string
  pingEnabled: boolean
}>()

const emit = defineEmits<{
  click: [node: NodeData]
  pingClick: [node: NodeData]
}>()

const rowStaggerMs = UI_CONFIG.motion.staggerMs
const rowStaggerLimit = UI_CONFIG.motion.staggerLimit

const appStore = useAppStore()

function toggleFavorite(node: NodeData): void {
  appStore.toggleFavoriteNode(node.uuid)
}

// 未登录且开启「未登录隐藏价格」时，隐藏价格信息
const showPrice = computed(() => appStore.privateFeaturesAllowed || !appStore.hidePriceWhenLoggedOut)

const baseColumns: ColumnConfig[] = [
  { key: 'status', label: '状态', width: '40px', sortable: false },
  { key: 'os', label: '系统', width: '44px', sortable: false },
  { key: 'name', label: '节点', width: 'minmax(180px, 0.9fr)', sortable: true },
  { key: 'metadata', label: '信息', width: 'minmax(230px, 1.1fr)', sortable: false },
  { key: 'uptime', label: '运行时间', width: '116px', sortable: true },
  { key: 'cpu', label: 'CPU', width: '96px', sortable: true },
  { key: 'mem', label: '内存', width: '96px', sortable: true },
  { key: 'disk', label: '硬盘', width: '96px', sortable: true },
  { key: 'traffic', label: '流量', width: '100px', sortable: true },
  { key: 'rate', label: '速率', width: '92px', sortable: true },
]

const columns = computed(() => baseColumns.filter(col => col.key !== 'metadata' || appStore.nodeListMetadataEnabled))
const providerMetadataEnabled = computed(() => {
  return appStore.nodeListMetadataEnabled
    && appStore.nodeListMetadataFields.some(field => field === 'provider' || field === 'city' || field === 'asn')
})

const { getNodeProviderMetadata } = useNodeProviderMetadata({
  nodes: () => props.nodes,
  customAliases: () => appStore.providerAliases,
  enabled: () => providerMetadataEnabled.value,
  allowGeoLookup: () => appStore.privateFeaturesAllowed,
  geoPermission: 'providerGeoLookup',
})

const sortKey = ref<string>('')
const sortDir = ref<1 | -1>(1)

watch(
  () => props.sortResetKey,
  () => {
    sortKey.value = ''
    sortDir.value = 1
  },
)

function handleSort(col: ColumnConfig) {
  if (!col.sortable)
    return
  if (sortKey.value === col.key) {
    sortDir.value = sortDir.value === 1 ? -1 : 1
  }
  else {
    sortKey.value = col.key
    sortDir.value = 1
  }
}

const sortedNodes = computed(() => {
  const nodes = [...props.nodes]
  const key = sortKey.value
  const dir = sortDir.value
  if (!key)
    return nodes
  return nodes.sort((a, b) => {
    switch (key) {
      case 'status': return dir * ((a.online ? 1 : 0) - (b.online ? 1 : 0))
      case 'region': {
        const va = (a.region || '').toLowerCase()
        const vb = (b.region || '').toLowerCase()
        return dir * (va < vb ? -1 : va > vb ? 1 : 0)
      }
      case 'name': {
        const va = (a.name || '').toLowerCase()
        const vb = (b.name || '').toLowerCase()
        return dir * (va < vb ? -1 : va > vb ? 1 : 0)
      }
      case 'uptime': return dir * ((a.uptime ?? 0) - (b.uptime ?? 0))
      case 'os': {
        const va = (a.os || '').toLowerCase()
        const vb = (b.os || '').toLowerCase()
        return dir * (va < vb ? -1 : va > vb ? 1 : 0)
      }
      case 'cpu': return dir * ((a.cpu ?? 0) - (b.cpu ?? 0))
      case 'mem': return dir * ((a.ram ?? 0) / (a.mem_total || 1) - (b.ram ?? 0) / (b.mem_total || 1))
      case 'disk': return dir * ((a.disk ?? 0) / (a.disk_total || 1) - (b.disk ?? 0) / (b.disk_total || 1))
      case 'traffic':
      case 'rate':
        return dir * (getRealtimeTotalSpeed(a) - getRealtimeTotalSpeed(b))
      default: return 0
    }
  })
})

const VIRTUAL_LIST_THRESHOLD = UI_CONFIG.virtualList.nodeThreshold
const VIRTUAL_ROW_HEIGHT = UI_CONFIG.virtualList.nodeRowHeight
const shouldVirtualizeNodes = computed(() => sortedNodes.value.length > VIRTUAL_LIST_THRESHOLD)
const {
  list: virtualRows,
  containerProps: virtualContainerProps,
  wrapperProps: virtualWrapperProps,
} = useVirtualList(sortedNodes, {
  itemHeight: VIRTUAL_ROW_HEIGHT,
  overscan: UI_CONFIG.virtualList.overscan,
})
const renderedRows = computed(() => shouldVirtualizeNodes.value
  ? virtualRows.value
  : sortedNodes.value.map((node, index) => ({ data: node, index })))
const nodeRowsViewportBind = computed(() => shouldVirtualizeNodes.value ? virtualContainerProps : {})
const nodeRowsViewportClass = computed(() => shouldVirtualizeNodes.value ? 'max-h-[min(72vh,54rem)] overflow-y-auto' : '')
const nodeRowsContainerComponent = computed(() => shouldVirtualizeNodes.value ? 'div' : TransitionGroup)
const nodeRowsContainerBind = computed(() => {
  if (shouldVirtualizeNodes.value) {
    return {
      ...virtualWrapperProps.value,
      class: 'flex flex-col',
    }
  }

  return {
    appear: !appStore.disablePageAnimation,
    css: !appStore.disablePageAnimation,
    name: 'node-row-switch',
    tag: 'div',
    class: 'flex flex-col',
  }
})

const formatBytes = (bytes: number) => formatBytesWithConfig(bytes, appStore.byteDecimals)
const formatBytesPerSecond = (bytes: number) => formatBytesPerSecondWithConfig(bytes, appStore.byteDecimals)
const formatUptime = (seconds: number) => formatUptimeWithFormat(seconds, 'hour')

const columnKeys = computed(() => columns.value.map(c => c.key))

const gridStyle = computed(() => ({
  gridTemplateColumns: columns.value.map(c => c.width).join(' '),
}))

const offlineOverlayContentStyle = computed(() => {
  const keys = columnKeys.value
  const statusIndex = keys.indexOf('status')
  const regionIndex = keys.indexOf('region')
  const nameIndex = keys.indexOf('name')
  const startColumn = nameIndex !== -1
    ? nameIndex + 1
    : regionIndex !== -1
      ? regionIndex + 2
      : statusIndex === -1 ? 1 : statusIndex + 2
  return { gridColumn: `${startColumn} / -1` }
})

const nodeMetadataItemsByUuid = computed(() => {
  const itemsByUuid: Record<string, NodeMetadataItem[]> = {}
  for (const node of props.nodes)
    itemsByUuid[node.uuid] = buildNodeMetadataItems(node)
  return itemsByUuid
})

function getFlagSrc(region: string): string {
  return `/images/flags/${getRegionCode(region)}.svg`
}

function getRegionAltText(region: string): string {
  return getRegionDisplayName(region) || getRegionCode(region)
}

function hasRegion(region: string | null | undefined): boolean {
  return Boolean(region?.trim())
}

function handleClick(node: NodeData) {
  emit('click', node)
}

function handleRowKeydown(event: KeyboardEvent, node: NodeData) {
  if (event.key !== 'Enter' && event.key !== ' ')
    return
  event.preventDefault()
  handleClick(node)
}

function getRowTransitionKey(node: NodeData): string {
  return props.transitionKey ? `${props.transitionKey}-${node.uuid}` : node.uuid
}

function getRowTransitionStyle(index: number): Record<string, string> {
  return {
    '--node-row-delay': `${Math.min(index, rowStaggerLimit) * rowStaggerMs}ms`,
  }
}

function formatOfflineTime(node: NodeData): string {
  return formatDateTime(node.time)
}

function getNodeMessage(node: NodeData): string {
  return node.message?.trim() ?? ''
}

function getNodeMessageTooltip(node: NodeData): string {
  const message = getNodeMessage(node)
  if (!message)
    return ''
  const updatedAt = node.status_updated_at ? `\n更新时间：${formatDateTime(node.status_updated_at)}` : ''
  return `${message}${updatedAt}`
}

function getPriceTags(node: NodeData): Array<string> {
  const tags: Array<string> = []
  const lang = appStore.lang
  if (node.price !== 0) {
    const days = getDaysUntilExpired(node.expired_at)
    const status = getExpireStatus(node.expired_at)
    if (status === 'expired')
      tags.push(lang === 'zh-CN' ? '已过期' : 'Expired')
    else if (status === 'long_term')
      tags.push(lang === 'zh-CN' ? '长期' : 'Long-term')
    else tags.push(lang === 'zh-CN' ? `剩余 ${days} 天` : `${days} days left`)
    const priceText = formatPriceWithCycle(node.price, node.billing_cycle, node.currency, lang)
    tags.push(priceText)
  }
  return tags
}

function getNodeMetadataItems(node: NodeData): NodeMetadataItem[] {
  return nodeMetadataItemsByUuid.value[node.uuid] ?? []
}

function buildNodeMetadataItems(node: NodeData): NodeMetadataItem[] {
  const items: NodeMetadataItem[] = []
  const providerMetadata = getNodeProviderMetadata(node)

  for (const field of appStore.nodeListMetadataFields) {
    switch (field) {
      case 'provider': {
        const provider = providerMetadata?.provider
        if (!provider?.displayName)
          break

        items.push({
          key: 'provider',
          value: provider.displayName,
          icon: provider.primary.icon,
          title: provider.tooltipLines.length > 0 ? provider.tooltipLines.join('\n') : provider.displayName,
          variant: 'secondary',
          class: 'min-w-0 shrink max-w-[9rem] bg-secondary/85 text-secondary-foreground border-border/40',
        })
        break
      }
      case 'region': {
        if (!hasRegion(node.region))
          break

        const displayName = getRegionDisplayName(node.region)
        if (!displayName)
          break

        items.push({
          key: 'region',
          value: displayName,
          flagSrc: getFlagSrc(node.region),
          title: displayName,
          variant: 'outline',
          class: 'shrink-0 bg-background/45 text-foreground/80 border-border/60',
        })
        break
      }
      case 'city': {
        const cityName = providerMetadata?.geo?.city?.trim()
        if (!cityName)
          break

        items.push({
          key: 'city',
          value: cityName,
          icon: 'tabler:map-pin',
          title: [cityName, providerMetadata?.geo?.countryCode].filter(Boolean).join(' · '),
          variant: 'outline',
          class: 'min-w-0 shrink max-w-[7.5rem] bg-background/45 text-foreground/80 border-border/60',
        })
        break
      }
      case 'asn': {
        const asn = providerMetadata?.geo?.asn
        if (!asn)
          break

        items.push({
          key: 'asn',
          value: asn,
          icon: 'tabler:network',
          title: providerMetadata?.geo?.org ? `${asn}\n${providerMetadata.geo.org}` : asn,
          variant: 'outline',
          class: 'shrink-0 bg-info/10 text-info border-info/25 font-mono',
        })
        break
      }
      case 'tags': {
        if (!appStore.nodeTagsVisible)
          break

        parseTags(node.tags).forEach((tag, index) => {
          items.push({
            key: `tag-${index}-${tag.text}`,
            value: tag.text,
            title: tag.text,
            icon: 'tabler:tag',
            variant: 'outline',
            class: 'max-w-[8rem] bg-background/45 text-foreground/80 border-border/60',
            style: tag.hex ? { borderColor: `${tag.hex}66`, color: tag.hex } : undefined,
          })
        })
        break
      }
      case 'group': {
        node.groups.forEach((group, index) => {
          items.push({
            key: `group-${index}-${group}`,
            value: group,
            title: group,
            icon: 'tabler:folder',
            variant: 'outline',
            class: 'max-w-[8rem] bg-background/45 text-foreground/80 border-border/60',
          })
        })
        break
      }
    }
  }

  return items
}
</script>

<template>
  <div class="node-list-shell overflow-x-auto overflow-y-hidden min-w-0 rounded-xl">
    <div class="min-w-fit w-full flex flex-col">
      <!-- 表头 -->
      <div class="grid px-3 py-2.5 bg-slate-500/8 dark:bg-white/[0.04] border-b border-border/60 gap-2.5" :style="gridStyle">
        <div
          v-for="col in columns" :key="col.key"
          :class="[col.sortable ? 'cursor-pointer select-none hover:text-foreground transition-colors' : '', ['status', 'os'].includes(col.key) ? 'text-center' : 'text-left']"
          @click="handleSort(col)"
        >
          <span class="inline-flex items-center gap-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
            <span>{{ col.label }}</span>
            <span v-if="col.sortable && sortKey === col.key" class="text-selection">{{ sortDir === 1 ? '↑' : '↓' }}</span>
          </span>
        </div>
      </div>

      <div v-bind="nodeRowsViewportBind" :class="nodeRowsViewportClass">
        <component :is="nodeRowsContainerComponent" v-bind="nodeRowsContainerBind">
          <div
            v-for="({ data: node, index }) in renderedRows"
            :key="getRowTransitionKey(node)"
            class="node-list-row flex flex-col relative h-16 min-h-16 max-h-16 justify-center px-3 cursor-pointer border-b border-border/40 last:border-b-0 odd:bg-transparent even:bg-slate-500/[0.025] dark:even:bg-white/[0.02] hover:bg-slate-500/[0.08] dark:hover:bg-white/[0.06] transition-colors"
            :class="[!node.online && 'bg-destructive/[0.04]']"
            :style="getRowTransitionStyle(index)"
            role="button"
            tabindex="0"
            :aria-label="`查看节点 ${node.name} 详情`"
            @click="handleClick(node)"
            @keydown="handleRowKeydown($event, node)"
          >
            <div class="grid gap-2.5 items-center" :style="gridStyle">
              <template v-for="col in columns" :key="col.key">
                <!-- 在线状态指示器 -->
                <div v-if="col.key === 'status'" class="flex justify-center">
                  <div class="size-2 rounded-full relative" :class="[node.online ? 'bg-success' : 'bg-destructive']">
                    <div
                      class="animate-ping absolute inset-0 rounded-full opacity-50"
                      :class="[node.online ? 'bg-success' : 'bg-destructive']"
                    />
                  </div>
                </div>

                <!-- 节点名称 -->
                <div v-else-if="col.key === 'name'" class="space-y-0.5 min-w-0" :class="[!node.online && 'blur-sm opacity-30']">
                  <div class="flex gap-1.5 items-center text-[13px] font-semibold text-foreground min-w-0">
                    <img
                      v-if="hasRegion(node.region)" :src="getFlagSrc(node.region)"
                      :alt="getRegionAltText(node.region)" class="size-5 rounded-sm shrink-0"
                    >
                    <span class="truncate">{{ node.name }}</span>
                    <button
                      type="button"
                      class="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-slate-500/10 hover:text-amber-500"
                      :class="appStore.isFavoriteNode(node.uuid) && 'text-amber-500'"
                      :aria-label="appStore.isFavoriteNode(node.uuid) ? `取消收藏 ${node.name}` : `收藏 ${node.name}`"
                      :title="appStore.isFavoriteNode(node.uuid) ? '取消收藏' : '收藏节点'"
                      @click.stop="toggleFavorite(node)"
                      @keydown.stop
                    >
                      <Icon :icon="appStore.isFavoriteNode(node.uuid) ? 'tabler:star-filled' : 'tabler:star'" width="13" height="13" />
                    </button>
                    <DataTooltip
                      v-if="getNodeMessage(node)"
                      :content="getNodeMessageTooltip(node)"
                      placement="top"
                      as="span"
                      class="inline-flex shrink-0 text-amber-500"
                      content-class="w-56 whitespace-pre-line leading-snug text-left"
                    >
                      <Icon icon="tabler:alert-triangle-filled" width="13" height="13" aria-label="节点消息" />
                    </DataTooltip>
                  </div>
                  <div
                    v-if="showPrice && getPriceTags(node).length > 0"
                    class="text-[11px] font-medium text-foreground/60 truncate"
                  >
                    <span v-for="(tag, tagIndex) in getPriceTags(node)" :key="tagIndex" :class="!!tagIndex && 'ml-3'">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- 信息 / 标签（单行不折行，长厂商名自动压缩，保证地区与 ASN 完整显示） -->
                <div v-else-if="col.key === 'metadata'" class="min-w-0">
                  <div v-if="getNodeMetadataItems(node).length > 0" class="flex flex-nowrap gap-1 items-center min-w-0">
                    <DataTooltip
                      v-for="item in getNodeMetadataItems(node)"
                      :key="item.key"
                      as="span"
                      :placement="index === 0 ? 'bottom' : 'top'"
                      :content="item.title ?? item.value"
                      class="inline-flex min-w-0"
                      :class="item.key === 'provider' || item.key === 'city' ? 'shrink' : 'shrink-0'"
                      content-class="max-w-64 whitespace-pre-wrap break-words text-left"
                    >
                      <Badge
                        :variant="item.variant ?? 'secondary'"
                        :style="item.style"
                        class="h-5 overflow-hidden whitespace-nowrap rounded-md px-1.5 text-[10.5px] font-medium shadow-none"
                        :class="item.class"
                      >
                        <img v-if="item.flagSrc" :src="item.flagSrc" :alt="item.value" class="size-3.5 rounded-[2px] shrink-0">
                        <Icon v-else-if="item.icon" :icon="item.icon" width="11" height="11" class="shrink-0" />
                        <span class="truncate">{{ item.value }}</span>
                      </Badge>
                    </DataTooltip>
                  </div>
                </div>

                <!-- 延迟/丢包 -->
                <!-- <div v-else-if="col.key === 'ping'">
              <NodePingListCell :uuid="node.uuid" :online="node.online" :enabled="props.pingEnabled" />
            </div> -->

                <!-- 运行时间 -->
                <div v-else-if="col.key === 'uptime'" class="flex flex-col gap-0.5 min-w-0">
                  <span class="text-[11px] font-medium text-foreground/70 truncate">
                    {{ formatUptime(node.uptime ?? 0) }}
                  </span>
                  <NodePingListCell :uuid="node.uuid" :online="node.online" :enabled="props.pingEnabled" @click="emit('pingClick', node)" />
                </div>

                <!-- 操作系统 -->
                <div v-else-if="col.key === 'os'" class="flex justify-center">
                  <img :src="getOSImage(node.os)" :alt="getOSName(node.os)" class="size-4.5">
                </div>

                <!-- CPU -->
                <DataTooltip
                  v-else-if="col.key === 'cpu'"
                  as="div"
                  :placement="index === 0 ? 'bottom' : 'top'"
                  :content="`负载 ${(node.load ?? 0).toFixed(2)}, ${(node.load5 ?? 0).toFixed(2)}, ${(node.load15 ?? 0).toFixed(2)}`"
                  class="min-w-0 w-full"
                  content-class="whitespace-nowrap tabular-nums"
                >
                  <div class="space-y-1">
                    <div class="text-[11px] font-medium tabular-nums text-foreground/80 truncate">
                      {{ (node.cpu ?? 0).toFixed(1) }}%
                    </div>
                    <ProgressThin :percentage="node.cpu ?? 0" :status="getStatus(node.cpu ?? 0)" :height="4" />
                  </div>
                </DataTooltip>

                <!-- 内存 -->
                <DataTooltip
                  v-else-if="col.key === 'mem'"
                  as="div"
                  :placement="index === 0 ? 'bottom' : 'top'"
                  :content="`${formatBytes(node.ram ?? 0)} / ${formatBytes(node.mem_total ?? 0)}${(node.swap_total ?? 0) > 0 ? `\nSwap ${formatBytes(node.swap ?? 0)} / ${formatBytes(node.swap_total ?? 0)}` : ''}`"
                  class="min-w-0 w-full"
                  content-class="whitespace-pre text-left tabular-nums"
                >
                  <div class="space-y-1">
                    <div class="text-[11px] font-medium tabular-nums text-foreground/80 truncate">
                      {{ ((node.ram ?? 0) / (node.mem_total || 1) * 100).toFixed(1) }}%
                    </div>
                    <ProgressThin
                      :percentage="(node.ram ?? 0) / (node.mem_total || 1) * 100"
                      :status="getStatus((node.ram ?? 0) / (node.mem_total || 1) * 100)" :height="4"
                    />
                  </div>
                </DataTooltip>

                <!-- 硬盘 -->
                <DataTooltip
                  v-else-if="col.key === 'disk'"
                  as="div"
                  :placement="index === 0 ? 'bottom' : 'top'"
                  :content="`${formatBytes(node.disk ?? 0)} / ${formatBytes(node.disk_total ?? 0)}`"
                  class="min-w-0 w-full"
                  content-class="whitespace-nowrap tabular-nums"
                >
                  <div class="space-y-1">
                    <div class="text-[11px] font-medium tabular-nums text-foreground/80 truncate">
                      {{ ((node.disk ?? 0) / (node.disk_total || 1) * 100).toFixed(1) }}%
                    </div>
                    <ProgressThin
                      :percentage="(node.disk ?? 0) / (node.disk_total || 1) * 100"
                      :status="getStatus((node.disk ?? 0) / (node.disk_total || 1) * 100)" :height="4"
                    />
                  </div>
                </DataTooltip>

                <!-- 流量 -->
                <DataTooltip
                  v-else-if="col.key === 'traffic'"
                  as="div"
                  :placement="index === 0 ? 'bottom' : 'top'"
                  :content="`${formatBytes(getTrafficUsed(node))} / ${hasTrafficLimit(node) ? formatBytes(node.traffic_limit) : '∞'}\n↑ ${formatBytes(node.net_total_up ?? 0)}  ↓ ${formatBytes(node.net_total_down ?? 0)}`"
                  class="min-w-0 w-full"
                  content-class="whitespace-pre text-left tabular-nums"
                >
                  <div class="space-y-1 w-full">
                    <div class="text-[11px] font-medium tabular-nums text-foreground/80 truncate">
                      {{ hasTrafficLimit(node) ? `${getTrafficUsedPercentage(node).toFixed(1)}%` : '∞' }}
                    </div>
                    <TrafficProgress
                      :upload="node.net_total_up ?? 0" :download="node.net_total_down ?? 0"
                      :traffic-limit="node.traffic_limit" :traffic-limit-type="(node.traffic_limit_type || 'sum')"
                      height="4px"
                    />
                  </div>
                </DataTooltip>

                <!-- 速率 -->
                <div v-else-if="col.key === 'rate'" class="min-w-0">
                  <div class="text-[11px] font-medium tabular-nums flex flex-col">
                    <span class="text-success flex flex-row gap-1 items-center truncate">
                      <Icon icon="tabler:chevron-up" width="12" height="12" class="shrink-0" />
                      {{ formatBytesPerSecond(node.net_out ?? 0) }}
                    </span>
                    <span class="text-blue-600 dark:text-blue-400 flex flex-row gap-1 items-center truncate">
                      <Icon icon="tabler:chevron-down" width="12" height="12" class="shrink-0" />
                      {{ formatBytesPerSecond(node.net_in ?? 0) }}
                    </span>
                  </div>
                </div>
              </template>
            </div>

            <div
              v-if="!node.online" class="absolute inset-0 z-2 p-2 bg-background/10 rounded-lg flex items-center"
              aria-hidden="true"
            >
              <div class="grid gap-2 items-center justify-center" :style="gridStyle">
                <div class="h-full space-y-1" :style="offlineOverlayContentStyle">
                  <div class="text-sm font-semibold truncate">
                    <span class="text-destructive">离线</span> {{ node.name }}
                  </div>
                  <div class="text-xs font-medium text-foreground/65">
                    {{ formatOfflineTime(node) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-list-shell {
  background-color: var(--glass-light-card, rgb(241 245 249 / 0.8));
  border: 1px solid var(--glass-light-border, rgb(226 232 240 / 0.72));
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  box-shadow: var(--glass-light-shadow, 0 8px 28px rgb(15 23 42 / 0.14));
  color: var(--glass-light-text, var(--color-foreground));
}

:global(.dark) .node-list-shell {
  background-color: var(--glass-dark-card, rgb(10 14 22 / 0.84));
  border: 1px solid var(--glass-dark-border, rgb(255 255 255 / 0.16));
  box-shadow: var(--glass-dark-shadow, 0 8px 30px rgb(0 0 0 / 0.48));
  color: var(--glass-dark-text, var(--color-foreground));
}

.node-row-switch-enter-active,
.node-row-switch-leave-active {
  transition:
    opacity 170ms ease,
    transform 210ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 170ms ease;
}

.node-row-switch-enter-active {
  transition-delay: var(--node-row-delay, 0ms);
}

.node-row-switch-move {
  transition: transform 210ms cubic-bezier(0.22, 1, 0.36, 1);
}

.node-row-switch-enter-from {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(3px);
}

.node-row-switch-leave-to {
  opacity: 0;
  transform: translateY(-5px);
  filter: blur(2px);
}

@media (prefers-reduced-motion: reduce) {
  .node-row-switch-enter-active,
  .node-row-switch-leave-active,
  .node-row-switch-move {
    transition: none;
    transition-delay: 0ms;
  }

  .node-row-switch-enter-from,
  .node-row-switch-leave-to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
