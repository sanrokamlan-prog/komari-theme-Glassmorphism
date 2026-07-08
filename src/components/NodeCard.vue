<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { CardX } from '@/components/ui/card-x'
import { DataTooltip } from '@/components/ui/data-tooltip'
import { ProgressThin } from '@/components/ui/progress-thin'
import { useNodePingDisplay } from '@/composables/useNodePingDisplay'
import { useAppStore } from '@/stores/app'
import { formatBytesPerSecondWithConfig, formatBytesWithConfig, formatDateTime, getStatus, getUptimeDays } from '@/utils/helper'
import { getDiskPercentage, getMemoryPercentage, getTrafficUsed, getTrafficUsedPercentage, hasTrafficLimit } from '@/utils/nodeMetricsHelper'
import { getOSImage, getOSName } from '@/utils/osImageHelper'
import { getRegionCode, getRegionDisplayName } from '@/utils/regionHelper'
import { formatCurrencyValue, formatPriceWithCycle, getDaysUntilExpired, getExpireStatus, getRemainingValue, parseTags } from '@/utils/tagHelper'

const props = defineProps<{ node: NodeData }>()
const emit = defineEmits<{ click: [] }>()
const appStore = useAppStore()

function handleKeyboardOpen(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ')
    return
  event.preventDefault()
  emit('click')
}

interface RemainingInfoTag {
  icon: string
  text?: string
  prefix?: string
  value?: string
  unit?: string
}

const isMiniNodeCard = computed(() => appStore.nodeCardSize === 'mini')
const nodeCardXSize = computed(() => appStore.nodeCardSize === 'large' ? 'large' : 'medium')
const nodeCardContentClass = computed(() => appStore.nodeCardSize === 'large' ? 'gap-4' : isMiniNodeCard.value ? 'gap-2' : 'gap-3')
const nodeCardContentPaddingClass = computed(() => isMiniNodeCard.value ? 'pb-2' : '')
const nodeCardMetricGridClass = 'grid-cols-3'
const nodeCardMetricBoxClass = computed(() => isMiniNodeCard.value
  ? 'px-1 py-1'
  : appStore.nodeCardSize === 'compact' ? 'px-1.5 py-1.5' : 'px-2 py-1.5')
const nodeCardPanelClass = computed(() => appStore.nodeCardSize === 'large' ? 'h-14' : appStore.nodeCardSize === 'comfortable' ? 'h-12' : isMiniNodeCard.value ? 'h-7' : 'h-11')
const nodeCardPingPanelClass = computed(() => isMiniNodeCard.value ? 'gap-1 p-1' : 'gap-1.5 p-2')

const formatBytes = (bytes: number) => formatBytesWithConfig(bytes, appStore.byteDecimals)
const formatBytesPerSecond = (bytes: number) => formatBytesPerSecondWithConfig(bytes, appStore.byteDecimals)
const offlineTime = computed(() => formatDateTime(props.node.time))

const cpuStatus = computed(() => getStatus(props.node.cpu ?? 0))
const memPercentage = computed(() => getMemoryPercentage(props.node))
const memStatus = computed(() => getStatus(memPercentage.value))
const diskPercentage = computed(() => getDiskPercentage(props.node))
const diskStatus = computed(() => getStatus(diskPercentage.value))

const {
  latencyRenderBars,
  lossRenderBars,
  latencyDisplay,
  lossDisplay,
  latencyPanelTooltip,
  lossPanelTooltip,
} = useNodePingDisplay(() => props.node.uuid)

const trafficUsedPercentage = computed(() => getTrafficUsedPercentage(props.node))
const trafficUsed = computed(() => getTrafficUsed(props.node))

// 流量状态颜色
const trafficStatus = computed(() => {
  if (!hasTrafficLimit(props.node))
    return 'success'
  if (trafficUsedPercentage.value >= 95)
    return 'error'
  if (trafficUsedPercentage.value >= 80)
    return 'warning'
  if (trafficUsedPercentage.value >= 60)
    return 'info'
  return 'success'
})

const trafficPercentageClass = computed(() => {
  if (!hasTrafficLimit(props.node))
    return 'text-muted-foreground'
  if (trafficUsedPercentage.value >= 95)
    return 'text-red-500'
  if (trafficUsedPercentage.value >= 80)
    return 'text-orange-500'
  if (trafficUsedPercentage.value >= 60)
    return 'text-yellow-500'
  return 'text-green-600'
})

// 是否显示金额：未登录且开启「未登录隐藏价格」时不显示价格 / 剩余价值，
// 但在线天数、剩余天数等非金额信息仍然展示
const showPrice = computed(() => appStore.isLoggedIn || !appStore.hidePriceWhenLoggedOut)

const uptimeDaysText = computed(() => {
  const days = getUptimeDays(props.node.uptime)
  return appStore.lang === 'zh-CN' ? `在线 ${days} 天` : `${days} days online`
})

const priceText = computed(() => {
  const node = props.node
  if (node.price === 0 || !showPrice.value)
    return ''
  return formatPriceWithCycle(node.price, node.billing_cycle, node.currency, appStore.lang)
})

// 第三列：剩余天数（始终） + 剩余价值（仅在允许显示金额时），带图标与相邻列对齐
const remainingInfoTags = computed<RemainingInfoTag[]>(() => {
  const node = props.node
  if (node.price === 0)
    return []
  const lang = appStore.lang
  const days = getDaysUntilExpired(node.expired_at)
  const status = getExpireStatus(node.expired_at)
  const items: RemainingInfoTag[] = []

  if (status === 'expired') {
    items.push({ icon: 'tabler:calendar-stats', text: lang === 'zh-CN' ? '已过期' : 'Expired' })
  }
  else if (status === 'long_term') {
    items.push({ icon: 'tabler:calendar-stats', text: lang === 'zh-CN' ? '长期' : 'Long-term' })
  }
  else if (lang === 'zh-CN') {
    items.push({ icon: 'tabler:calendar-stats', prefix: '剩余', value: String(days), unit: '天' })
  }
  else {
    items.push({ icon: 'tabler:calendar-stats', prefix: 'left', value: String(days), unit: 'days' })
  }

  if (showPrice.value) {
    const remainingValue = getRemainingValue(node.price, node.billing_cycle, node.expired_at)
    items.push({ icon: 'tabler:coins', text: formatCurrencyValue(remainingValue, node.currency) })
  }
  return items
})

const customTags = computed(() => parseTags(props.node.tags).map(t => t.text))

function getRegionAltText(region: string): string {
  return getRegionDisplayName(region) || getRegionCode(region)
}

function hasRegion(region: string | null | undefined): boolean {
  return Boolean(region?.trim())
}
</script>

<template>
  <CardX
    hoverable
    :size="nodeCardXSize"
    :content-class="nodeCardContentPaddingClass"
    class="node-card w-full cursor-pointer border-none shadow-[0_0_0_3px] shadow-transparent transition-all duration-200 rounded-xl"
    :class="[!props.node.online && '!shadow-red-500/30']"
    role="button"
    tabindex="0"
    :aria-label="`查看节点 ${props.node.name} 详情`"
    @click="emit('click')"
    @keydown="handleKeyboardOpen"
  >
    <!-- 头部：在线点 + 名称 -->
    <template #header>
      <div class="flex items-center gap-2 min-w-0">
        <div class="relative size-2.5 shrink-0">
          <span
            class="size-2.5 rounded-full block"
            :class="props.node.online ? 'bg-green-500' : 'bg-red-500'"
          />
          <span
            class="animate-ping absolute inset-0 rounded-full opacity-60"
            :class="props.node.online ? 'bg-green-500' : 'bg-red-500'"
          />
        </div>
        <span class="text-sm font-bold flex-1 min-w-0 truncate">{{ props.node.name }}</span>
      </div>
    </template>

    <!-- 头部右侧：OS + 国旗 -->
    <template #header-extra>
      <div class="flex gap-1.5 items-center shrink-0">
        <img :src="getOSImage(props.node.os)" :alt="getOSName(props.node.os)" class="size-4">
        <img
          v-if="hasRegion(props.node.region)"
          :src="`/images/flags/${getRegionCode(props.node.region)}.svg`"
          :alt="getRegionAltText(props.node.region)"
          class="size-5 shrink-0"
        >
      </div>
    </template>

    <template #default>
      <div class="flex flex-col relative" :class="nodeCardContentClass">
        <!-- 在线天数固定展示，价格独立展示，避免不同主机卡片高度不一致 -->
        <div class="relative z-20 flex items-center gap-1.5 -mt-1 h-[19px] overflow-hidden">
          <span class="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-slate-500/10 text-muted-foreground leading-tight">
            {{ uptimeDaysText }}
          </span>
          <span
            v-if="priceText"
            class="min-w-0 truncate text-[11px] px-2 py-0.5 rounded-full bg-slate-500/10 text-muted-foreground leading-tight"
          >
            {{ priceText }}
          </span>
        </div>

        <!-- 四项进度条 -->
        <div v-if="isMiniNodeCard" class="grid grid-cols-[3fr_2fr] gap-x-4 gap-y-2">
          <div class="grid grid-cols-2 gap-x-3 gap-y-1">
            <div class="flex flex-col gap-1">
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground">C</span>
                <span class="tabular-nums font-medium">{{ (props.node.cpu ?? 0).toFixed(1) }}%</span>
              </div>
              <ProgressThin :percentage="props.node.cpu ?? 0" :status="cpuStatus" :height="4" />
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground">M</span>
                <span class="tabular-nums font-medium">{{ memPercentage.toFixed(1) }}%</span>
              </div>
              <ProgressThin :percentage="memPercentage" :status="memStatus" :height="4" />
            </div>

            <div class="col-span-2 text-[11px] text-muted-foreground truncate">
              {{ formatBytes(props.node.ram ?? 0) }} / {{ formatBytes(props.node.mem_total ?? 0) }}
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">流量</span>
              <span class="tabular-nums font-medium" :class="trafficPercentageClass">
                {{ hasTrafficLimit(props.node) ? `${trafficUsedPercentage.toFixed(1)}%` : '∞' }}
              </span>
            </div>
            <ProgressThin :percentage="trafficUsedPercentage" :status="trafficStatus" :height="4" />
            <div class="text-[11px] truncate" :class="trafficUsedPercentage >= 95 ? 'text-red-500' : 'text-muted-foreground'">
              {{ formatBytes(trafficUsed) }}
              <template v-if="hasTrafficLimit(props.node)">
                / {{ formatBytes(props.node.traffic_limit) }}
              </template>
              <template v-else>
                / ∞
              </template>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <!-- CPU -->
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">CPU</span>
              <span class="tabular-nums font-medium">{{ (props.node.cpu ?? 0).toFixed(1) }}%</span>
            </div>
            <ProgressThin :percentage="props.node.cpu ?? 0" :status="cpuStatus" :height="4" />
            <div class="text-[11px] text-muted-foreground truncate">
              {{ (props.node.load ?? 0).toFixed(2) }}, {{ (props.node.load5 ?? 0).toFixed(2) }}, {{ (props.node.load15 ?? 0).toFixed(2) }}
            </div>
          </div>

          <!-- 内存 -->
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">内存</span>
              <span class="tabular-nums font-medium">{{ memPercentage.toFixed(1) }}%</span>
            </div>
            <ProgressThin :percentage="memPercentage" :status="memStatus" :height="4" />
            <div class="text-[11px] text-muted-foreground truncate">
              {{ formatBytes(props.node.ram ?? 0) }} / {{ formatBytes(props.node.mem_total ?? 0) }}
            </div>
          </div>

          <!-- 硬盘 -->
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">硬盘</span>
              <span class="tabular-nums font-medium">{{ diskPercentage.toFixed(1) }}%</span>
            </div>
            <ProgressThin :percentage="diskPercentage" :status="diskStatus" :height="4" />
            <div class="text-[11px] text-muted-foreground truncate">
              {{ formatBytes(props.node.disk ?? 0) }} / {{ formatBytes(props.node.disk_total ?? 0) }}
            </div>
          </div>

          <!-- 流量（分级颜色） -->
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">流量</span>
              <span class="tabular-nums font-medium" :class="trafficPercentageClass">
                {{ hasTrafficLimit(props.node) ? `${trafficUsedPercentage.toFixed(1)}%` : '∞' }}
              </span>
            </div>
            <ProgressThin :percentage="trafficUsedPercentage" :status="trafficStatus" :height="4" />
            <div class="text-[11px] truncate" :class="trafficUsedPercentage >= 95 ? 'text-red-500' : 'text-muted-foreground'">
              {{ formatBytes(trafficUsed) }}
              <template v-if="hasTrafficLimit(props.node)">
                / {{ formatBytes(props.node.traffic_limit) }}
              </template>
              <template v-else>
                / ∞
              </template>
            </div>
          </div>
        </div>

        <!-- 三列：网速 / 总流量 / 剩余天数+价格或负载 -->
        <div class="grid gap-1.5" :class="nodeCardMetricGridClass">
          <!-- 实时网速 -->
          <div class="flex flex-col gap-0.5 rounded-lg bg-slate-500/5 min-w-0 overflow-hidden" :class="nodeCardMetricBoxClass">
            <div class="text-[11px] text-green-600 flex items-center gap-1">
              <Icon icon="tabler:chevron-up" width="11" height="11" />
              <span class="truncate min-w-0 overflow-hidden">{{ formatBytesPerSecond(props.node.net_out ?? 0) }}</span>
            </div>
            <div class="text-[11px] text-blue-600 flex items-center gap-1">
              <Icon icon="tabler:chevron-down" width="11" height="11" />
              <span class="truncate min-w-0 overflow-hidden">{{ formatBytesPerSecond(props.node.net_in ?? 0) }}</span>
            </div>
          </div>

          <!-- 总流量 -->
          <div class="flex flex-col gap-0.5 rounded-lg bg-slate-500/5 min-w-0 overflow-hidden" :class="nodeCardMetricBoxClass">
            <div class="text-[11px] text-muted-foreground flex items-center gap-1">
              <Icon icon="tabler:upload" width="11" height="11" />
              <span class="truncate min-w-0 overflow-hidden">{{ formatBytes(props.node.net_total_up ?? 0) }}</span>
            </div>
            <div class="text-[11px] text-muted-foreground flex items-center gap-1">
              <Icon icon="tabler:download" width="11" height="11" />
              <span class="truncate min-w-0 overflow-hidden">{{ formatBytes(props.node.net_total_down ?? 0) }}</span>
            </div>
          </div>

          <!-- 第三列：有价格显示剩余天数+价格，否则显示负载 -->
          <div class="flex flex-col gap-0.5 rounded-lg bg-slate-500/5 min-w-0 overflow-hidden" :class="nodeCardMetricBoxClass">
            <template v-if="remainingInfoTags.length">
              <div
                v-for="(item, i) in remainingInfoTags" :key="i"
                class="text-[11px] text-muted-foreground flex items-center gap-0.5"
              >
                <Icon :icon="item.icon" width="11" height="11" class="shrink-0" />
                <span v-if="item.text" class="truncate min-w-0 overflow-hidden">{{ item.text }}</span>
                <template v-else>
                  <span v-if="item.prefix" class="shrink-0">{{ item.prefix }}</span>
                  <span v-if="item.value" class="shrink-0 tabular-nums">{{ item.value }}</span>
                  <span v-if="item.unit" class="shrink-0">{{ item.unit }}</span>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="text-[11px] text-muted-foreground truncate">
                {{ (props.node.load ?? 0).toFixed(2) }}
              </div>
              <div class="text-[11px] text-muted-foreground truncate">
                {{ (props.node.load5 ?? 0).toFixed(2) }} / {{ (props.node.load15 ?? 0).toFixed(2) }}
              </div>
            </template>
          </div>
        </div>

        <!-- 延迟 + 丢包 -->
        <div class="grid grid-cols-2 gap-1.5">
          <div
            class="group/panel relative flex flex-col rounded-lg bg-slate-500/5"
            :class="[nodeCardPingPanelClass, nodeCardPanelClass, !props.node.online ? 'blur-xs opacity-50' : '']"
            :title="latencyPanelTooltip"
          >
            <div class="flex items-center justify-between text-[11px] leading-none">
              <span class="text-muted-foreground">延迟</span>
              <span class="font-medium">{{ latencyDisplay }}</span>
            </div>
            <div
              class="grid h-full items-end gap-[1px] opacity-80 group-hover/panel:opacity-100"
              :style="{ gridTemplateColumns: `repeat(${latencyRenderBars.length}, minmax(0, 1fr))` }"
            >
              <DataTooltip
                v-for="bar in latencyRenderBars" :key="bar.key"
                placement="top" :content="bar.tooltip" class="h-full w-full"
              >
                <span
                  class="block h-full w-full rounded-[1px] transition-transform duration-150 group-hover/data-tooltip:scale-y-160 group-hover/panel:opacity-60 group-hover/data-tooltip:!opacity-100"
                  :class="bar.className"
                />
              </DataTooltip>
            </div>
          </div>

          <div
            class="group/panel relative flex flex-col rounded-lg bg-slate-500/5"
            :class="[nodeCardPingPanelClass, nodeCardPanelClass, !props.node.online ? 'blur-xs opacity-50' : '']"
            :title="lossPanelTooltip"
          >
            <div class="flex items-center justify-between text-[11px] leading-none">
              <span class="text-muted-foreground">丢包</span>
              <span class="font-medium">{{ lossDisplay }}</span>
            </div>
            <div
              class="grid h-full items-end gap-[1px] opacity-80 group-hover/panel:opacity-100"
              :style="{ gridTemplateColumns: `repeat(${lossRenderBars.length}, minmax(0, 1fr))` }"
            >
              <DataTooltip
                v-for="bar in lossRenderBars" :key="bar.key"
                placement="top" :content="bar.tooltip" class="h-full w-full"
              >
                <span
                  class="block h-full w-full rounded-[1px] transition-transform duration-150 group-hover/data-tooltip:scale-y-160 group-hover/panel:opacity-60 group-hover/data-tooltip:!opacity-100"
                  :class="bar.className"
                />
              </DataTooltip>
            </div>
          </div>
        </div>

        <!-- 自定义标签 -->
        <div v-if="customTags.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="(tag, i) in customTags" :key="i"
            variant="outline"
            class="!text-[11px] rounded-full text-muted-foreground border-muted-foreground/15 px-2 py-0"
          >
            {{ tag }}
          </Badge>
        </div>

        <!-- 离线遮罩 -->
        <div
          v-if="!props.node.online"
          class="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-[2px]"
        >
          <div class="text-sm font-semibold text-destructive">
            离线
          </div>
          <div class="text-[11px] text-muted-foreground mt-1">
            {{ offlineTime }}
          </div>
        </div>
      </div>
    </template>
  </CardX>
</template>

<style scoped>
.node-card {
  position: relative;
  overflow: hidden;
}
</style>
