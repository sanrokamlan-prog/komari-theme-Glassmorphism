import type { MaybeRefOrGetter } from 'vue'
import type { useNodePingStats } from '@/composables/useNodePingStats'
import type { NodeData } from '@/stores/nodes'
import type { PingTaskInfo } from '@/utils/rpc'
import { computed, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { loadPublicPingTasks } from '@/services/metrics.service'
import { subscribeVisibleRefresh } from '@/services/visibleRefresh.service'
import { useAppStore } from '@/stores/app'
import { shortenPingTaskName } from '@/utils/threeNetSettings'

// Adapted from towersip: explicit IDs, per-node bindings, and separate history
// computations from status metadata so polling does not rebuild SVG paths.
export function useThreeNetPing(node: MaybeRefOrGetter<NodeData>, stats: ReturnType<typeof useNodePingStats>, enabled: MaybeRefOrGetter<boolean>) {
  const app = useAppStore()
  const tasks = shallowRef<PingTaskInfo[]>([])
  let release: (() => void) | undefined
  let generation = 0
  watch(() => app.threeNetPingEnabled && toValue(enabled), async (enabled) => {
    const current = ++generation
    release?.()
    release = undefined
    if (!enabled)
      return
    const refresh = async () => {
      try {
        const result = await loadPublicPingTasks()
        if (current === generation)
          tasks.value = result
      }
      catch { /* Cached history/live status remain usable without a catalog. */ }
    }
    release = subscribeVisibleRefresh(() => {
      void refresh()
    })
    await refresh()
  }, { immediate: true })
  onScopeDispose(() => {
    generation++
    release?.()
  })
  const taskIds = computed(() => {
    if (!app.threeNetPingEnabled)
      return []
    const uuid = toValue(node).uuid
    const configured = app.threeNetPingNodeTaskBindings[uuid]
    if (configured?.length)
      return configured
    if (app.threeNetPingTaskIds.length)
      return app.threeNetPingTaskIds
    return []
  })
  const historyItems = computed(() => taskIds.value.map((id) => {
    const value = stats.taskStats(id)
    return { id, stats: value, values: value.history.map(point => point.latency) }
  }))
  const items = computed(() => historyItems.value.map((item) => {
    const sample = toValue(node).ping?.[String(item.id)]
    const name = sample?.name || tasks.value.find(task => task.id === item.id)?.name || `任务 ${item.id}`
    // Use the same one-hour window as the sparkline. A recovered latest sample
    // must not hide packet loss recorded earlier in that window.
    const loss = item.stats.hasData ? item.stats.avgLoss : null
    const failed = loss !== null && loss >= 100
    const latency = item.stats.hasData ? failed ? -1 : item.stats.avgLatency : null
    return {
      ...item,
      name,
      label: shortenPingTaskName(name, `#${item.id}`),
      latencyValue: latency,
      lossValue: loss,
      latency: latency === null ? '—' : latency < 0 ? '不可达' : `${Math.round(latency)} ms`,
      loss: loss === null ? '—' : `${loss.toFixed(1)}%`,
      failed,
    }
  }))
  return { items }
}
