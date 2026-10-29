<script setup lang="ts">
import type { useNodePingStats } from '@/composables/useNodePingStats'
import type { NodeData } from '@/stores/nodes'
import { computed, watch } from 'vue'
import { DataTooltip } from '@/components/ui/data-tooltip'
import Sparkline from '@/components/ui/sparkline/Sparkline.vue'
import { getLatencyToneClass, getLossToneClass } from '@/composables/useNodePingDisplay'
import { sparklineMarkerPercent, useSparklinePeriodInspect } from '@/composables/useSparklinePeriodInspect'
import { useThreeNetPing } from '@/composables/useThreeNetPing'
import { useAppStore } from '@/stores/app'
import { formatDateTime } from '@/utils/helper'

const props = defineProps<{ node: NodeData, stats: ReturnType<typeof useNodePingStats>, enabled: boolean }>()
const emit = defineEmits<{ open: [] }>()
const app = useAppStore()
const TEXT_TONES: Record<string, string> = {
  'bg-signal-1': 'text-signal-1',
  'bg-signal-2': 'text-signal-2',
  'bg-signal-3': 'text-signal-3',
  'bg-signal-4': 'text-signal-4',
  'bg-signal-5': 'text-signal-5',
}
const { items } = useThreeNetPing(() => props.node, props.stats, () => props.enabled)
const rows = computed(() => {
  const source = items.value.length
    ? items.value
    : [{
        id: 'summary',
        name: '延迟',
        label: '延迟',
        stats: {
          history: props.stats.history.value,
        },
        values: props.stats.history.value.map(point => point.latency),
        latency: props.stats.hasData.value ? `${Math.round(props.stats.avgLatency.value)} ms` : props.stats.loading.value ? '加载中' : '—',
        loss: props.stats.hasData.value ? `${props.stats.avgLoss.value.toFixed(1)}%` : '—',
        latencyValue: props.stats.hasData.value ? props.stats.avgLatency.value : null,
        lossValue: props.stats.hasData.value ? props.stats.avgLoss.value : null,
        failed: false,
      }]
  return source.map((item) => {
    const latencyBar = item.failed ? 'bg-signal-5' : item.latencyValue === null ? 'bg-muted-foreground/40' : (getLatencyToneClass(item.latencyValue).split(' ')[0] ?? 'bg-signal-1')
    const lossBar = item.lossValue === null ? 'bg-muted-foreground/40' : (getLossToneClass(item.lossValue).split(' ')[0] ?? 'bg-signal-1')
    return { ...item, dotClass: latencyBar, latencyToneClass: TEXT_TONES[latencyBar] ?? 'text-muted-foreground', lossToneClass: TEXT_TONES[lossBar] ?? 'text-muted-foreground' }
  })
})
const { inspect, onPointerDown, onPointerMove, onPointerUp, onPointerLeave, clear } = useSparklinePeriodInspect()
const inspected = computed(() => {
  const selection = inspect.value
  if (!selection)
    return null
  const item = rows.value.find(item => String(item.id) === selection.rowKey)
  const point = item?.stats.history[selection.index]
  return point && item ? { item, point } : null
})
watch(() => props.node.uuid, clear)

function inspectKeyboard(event: KeyboardEvent, id: number | string, count: number) {
  if (!count)
    return
  if (event.key === 'Escape') {
    clear()
    return
  }
  if (!['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key))
    return
  event.preventDefault()
  event.stopPropagation()
  const previous = inspect.value?.rowKey === String(id) ? inspect.value.index : Math.floor(count / 2)
  const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
  inspect.value = { rowKey: String(id), index: Math.max(0, Math.min(count - 1, previous + delta)), sticky: false }
}
</script>

<template>
  <div :data-three-net-ping="items.length ? '' : undefined" class="select-none min-w-0" :class="[app.threeNetPingSparkline ? 'ping-sparkline-list gap-y-1' : 'flex flex-col gap-1.5', !props.node.online && 'opacity-50']" @click.stop @keydown.stop>
    <template v-if="app.threeNetPingSparkline">
      <!-- Shared columns and 20px rows ported from towersip's NodeCard. -->
      <div v-for="item in rows" :key="item.id" :data-three-net-task="item.id === 'summary' ? undefined : item.id" class="ping-sparkline-row min-h-5 min-w-0 items-center rounded-md px-0.5 leading-none hover:bg-slate-500/5" :class="app.nodeCardSize === 'mini' ? 'text-[10px]' : 'text-[11px]'">
        <span class="size-1.5 rounded-full" :class="item.dotClass" />
        <button type="button" class="min-w-0 truncate text-left text-muted-foreground" :title="`${item.name}，打开完整图表`" :aria-label="`${item.name} ${item.latency}`" @click="clear(); emit('open')">
          {{ item.label }}
        </button>
        <button type="button" class="text-right font-medium tabular-nums" :class="item.latencyToneClass" title="最近一小时窗口平均延迟" @click="clear(); emit('open')">
          {{ item.latency }}
        </button>
        <button
          type="button" class="ping-sparkline-hit relative h-4 min-w-0 overflow-visible outline-offset-2" :class="item.latencyToneClass" :aria-label="`${item.name} 历史延迟，左右方向键选择历史点`"
          @pointerdown="onPointerDown($event, String(item.id), item.values.length)"
          @pointermove="onPointerMove($event, String(item.id), item.values.length)"
          @pointerup="onPointerUp($event, String(item.id), item.values.length)"
          @pointerleave="onPointerLeave($event, String(item.id))"
          @pointercancel="clear" @blur="clear" @keydown="inspectKeyboard($event, item.id, item.values.length)"
        >
          <span class="pointer-events-none absolute inset-x-0 top-1/2 h-4 -translate-y-1/2">
            <Sparkline :values="item.values" />
          </span>
          <template v-if="inspect?.rowKey === String(item.id) && item.values.length">
            <span class="pointer-events-none absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" :style="{ left: `${sparklineMarkerPercent(inspect.index, item.values.length)}%` }" />
            <span v-if="inspected" data-three-net-history role="status" class="ping-history-tooltip pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 w-max max-w-52 -translate-x-1/2 rounded bg-foreground p-1.5 text-center text-[10px] leading-snug text-background shadow-lg">
              <span class="block">{{ inspected.item.name }} · {{ formatDateTime(inspected.point.time, 'HH:mm:ss') }}</span>
              <span class="block">延迟 {{ inspected.point.latency === null ? '无有效样本' : `${Math.round(inspected.point.latency)} ms` }}</span>
              <span>丢包 {{ inspected.point.loss === null ? '无样本' : `${inspected.point.loss.toFixed(1)}%` }}</span>
            </span>
          </template>
        </button>
        <button type="button" class="ping-loss-cell grid min-w-[3.75rem] grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-0.5 whitespace-nowrap font-medium tabular-nums" :title="`${item.name} 最近一小时窗口丢包率`" @click="clear(); emit('open')">
          <span class="text-muted-foreground">丢包</span>
          <span class="text-right" :class="item.lossToneClass">{{ item.loss }}</span>
        </button>
      </div>
    </template>
    <template v-else>
      <div v-for="item in rows" :key="item.id" :data-three-net-task="item.id === 'summary' ? undefined : item.id" class="grid grid-cols-2 gap-1.5">
        <button v-for="metric in (['latency', 'loss'] as const)" :key="metric" type="button" class="group/panel flex min-w-0 flex-col rounded-lg bg-slate-500/5" :title="metric === 'latency' ? '最近一小时窗口平均延迟' : '最近一小时窗口丢包率'" :class="[app.nodeCardSize === 'mini' ? 'p-1 gap-1 h-7' : 'p-2 gap-1.5', app.nodeCardSize === 'large' ? 'h-14' : app.nodeCardSize === 'comfortable' ? 'h-12' : app.nodeCardSize === 'mini' ? 'h-7' : 'h-11']" @click="emit('open')">
          <span class="flex w-full justify-between text-[11px] leading-none"><span class="min-w-0 truncate text-muted-foreground">{{ metric === 'latency' ? item.label : '丢包' }}</span><span class="font-medium tabular-nums">{{ item[metric] }}</span></span>
          <span :data-node-ping-bars="item.id === 'summary' ? metric : `task-${item.id}-${metric}`" class="grid min-h-0 w-full flex-1 gap-px" :style="{ gridTemplateColumns: `repeat(${item.stats.history.length || 20}, minmax(0, 1fr))` }">
            <DataTooltip v-for="(point, index) in item.stats.history.length ? item.stats.history : Array.from({ length: 20 }, () => ({ time: '', latency: null, loss: null }))" :key="index" :content="`${point.time ? formatDateTime(point.time, 'HH:mm:ss') : ''}\n${point[metric] === null ? '无采样数据' : metric === 'latency' ? `${Math.round(point.latency!)} ms` : `${point.loss!.toFixed(1)}%`}`" placement="top" class="h-full w-full">
              <span class="block h-full w-full rounded-[1px]" :class="point[metric] === null ? 'bg-muted-foreground/15' : metric === 'latency' ? getLatencyToneClass(point.latency!) : getLossToneClass(point.loss!)" />
            </DataTooltip>
          </span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ping-sparkline-list {
  display: grid;
  grid-template-columns: auto minmax(0, max-content) max-content minmax(3.5rem, 1fr) max-content;
  column-gap: 0.25rem;
}

.ping-sparkline-row {
  display: grid;
  grid-column: 1 / -1;
  column-gap: inherit;
  grid-template-columns: auto minmax(0, max-content) max-content minmax(3.5rem, 1fr) max-content;
  grid-template-columns: subgrid;
}

.ping-sparkline-list,
.ping-sparkline-row,
.ping-sparkline-hit {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.ping-sparkline-hit {
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}

.ping-loss-cell {
  justify-self: end;
}

/* Keep the downstream status hues readable on light glass. */
.text-signal-2 {
  color: #15803d;
}
.text-signal-3 {
  color: #4d7c0f;
}
.text-signal-4 {
  color: #a16207;
}
:global(.dark .ping-sparkline-list .text-signal-2) {
  color: var(--signal-2);
}
:global(.dark .ping-sparkline-list .text-signal-3) {
  color: var(--signal-3);
}
:global(.dark .ping-sparkline-list .text-signal-4) {
  color: var(--signal-4);
}
:global(.color-vision-friendly .ping-sparkline-list .text-signal-2) {
  color: #0072b2;
}
:global(.color-vision-friendly .ping-sparkline-list .text-signal-3) {
  color: #007a58;
}
:global(.color-vision-friendly .ping-sparkline-list .text-signal-4) {
  color: #946200;
}
:global(.color-vision-friendly.dark .ping-sparkline-list .text-signal-2) {
  color: var(--signal-2);
}
:global(.color-vision-friendly.dark .ping-sparkline-list .text-signal-3) {
  color: var(--signal-3);
}
:global(.color-vision-friendly.dark .ping-sparkline-list .text-signal-4) {
  color: var(--signal-4);
}

/* Override the site's glass surface rule: history tooltips need an opaque surface. */
.ping-history-tooltip {
  background: var(--color-foreground) !important;
  color: var(--color-background) !important;
}

@media (pointer: coarse), (max-width: 420px) {
  .ping-sparkline-hit {
    min-height: 2rem;
    margin-block: -0.375rem;
  }
}

@media (max-width: 420px) {
  .ping-sparkline-list,
  .ping-sparkline-row {
    grid-template-columns: auto minmax(0, max-content) max-content minmax(3rem, 1fr) max-content;
  }
  .ping-sparkline-row {
    grid-template-columns: subgrid;
  }
}
</style>
