import type { ThreeNetDisplaySettings } from '@/services/theme-settings.service'
import type { PingTaskInfo } from '@/utils/rpc'
import { computed, onMounted, ref } from 'vue'
import { loadPublicPingTasks } from '@/services/metrics.service'
import { saveThreeNetPingBindings } from '@/services/theme-settings.service'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'

export function useThreeNetPingSettings() {
  const app = useAppStore()
  const nodes = useNodesStore()
  const tasks = ref<PingTaskInfo[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')
  const nodeSearch = ref('')
  const taskSearch = ref('')
  const activeNodeId = ref(nodes.visibleNodes[0]?.uuid ?? '')
  const bindings = ref({ ...app.threeNetPingNodeTaskBindings })
  const changes = ref<Record<string, number[]>>({})
  const globalIds = ref([...app.threeNetPingTaskIds])
  const globalChanged = ref(false)
  const pingEnabled = ref(app.threeNetPingEnabled)
  const sparklineEnabled = ref(app.threeNetPingSparkline)
  const originalDisplay = ref({ threeNetPingEnabled: app.threeNetPingEnabled, threeNetPingSparkline: app.threeNetPingSparkline })
  const displayChanges = computed<ThreeNetDisplaySettings>(() => ({
    ...(pingEnabled.value !== originalDisplay.value.threeNetPingEnabled ? { threeNetPingEnabled: pingEnabled.value } : {}),
    ...(sparklineEnabled.value !== originalDisplay.value.threeNetPingSparkline ? { threeNetPingSparkline: sparklineEnabled.value } : {}),
  }))
  const dirty = computed(() => globalChanged.value || Object.keys(changes.value).length > 0 || Object.keys(displayChanges.value).length > 0)
  const visibleNodes = computed(() => nodes.visibleNodes)
  const filteredNodes = computed(() => visibleNodes.value.filter(node => `${node.name} ${node.uuid}`.toLowerCase().includes(nodeSearch.value.trim().toLowerCase())))
  const activeNode = computed(() => visibleNodes.value.find(node => node.uuid === activeNodeId.value))
  const activeTaskIds = computed(() => activeNodeId.value === 'global' ? globalIds.value : bindings.value[activeNodeId.value] ?? [])
  // Keep stale selections removable independently of catalog loading and search.
  const unavailableTaskIds = computed(() => activeTaskIds.value.filter(id => !tasks.value.some(task => task.id === id)))
  const activeNodeName = computed(() => activeNodeId.value === 'global' ? '全局任务' : activeNode.value?.name)
  const filteredTasks = computed(() => tasks.value.filter(task => `${task.id} ${task.name}`.toLowerCase().includes(taskSearch.value.trim().toLowerCase())))
  const configuredNodeCount = computed(() => visibleNodes.value.filter(node => bindings.value[node.uuid]?.length).length)

  function taskName(id: number) {
    return tasks.value.find(task => task.id === id)?.name ?? `任务 ${id}`
  }
  function nodeTaskSummary(id: string) {
    return bindings.value[id]?.length ? bindings.value[id]!.map(taskName).join('、') : '使用全局任务'
  }
  function toggleTask(id: number) {
    if (saving.value || (!activeNode.value && activeNodeId.value !== 'global'))
      return
    const current = activeTaskIds.value
    if (!current.includes(id) && current.length >= 3) {
      error.value = '每台服务器最多选择 3 个 Ping 任务。'
      return
    }
    const next = current.includes(id) ? current.filter(taskId => taskId !== id) : [...current, id]
    if (activeNodeId.value === 'global') {
      globalIds.value = next
      globalChanged.value = true
      error.value = ''
      return
    }
    bindings.value = { ...bindings.value, [activeNodeId.value]: next }
    changes.value = { ...changes.value, [activeNodeId.value]: next }
    error.value = ''
  }
  async function save() {
    if (saving.value || !dirty.value)
      return
    saving.value = true
    error.value = ''
    try {
      // Sync store auth state as well as checking in the service before mutation.
      if (!await app.verifyLoginState({ force: true }))
        throw new Error('登录状态已过期，请先登录管理员账号。')
      app.publicSettings = await saveThreeNetPingBindings(changes.value, globalChanged.value ? globalIds.value : undefined, displayChanges.value)
      bindings.value = { ...app.threeNetPingNodeTaskBindings }
      globalIds.value = [...app.threeNetPingTaskIds]
      changes.value = {}
      globalChanged.value = false
      pingEnabled.value = app.threeNetPingEnabled
      sparklineEnabled.value = app.threeNetPingSparkline
      originalDisplay.value = { threeNetPingEnabled: pingEnabled.value, threeNetPingSparkline: sparklineEnabled.value }
      window.$message?.success('按服务器 Ping 任务配置已保存。')
    }
    catch (cause) {
      error.value = cause instanceof Error ? cause.message : '保存失败，请稍后重试。'
    }
    finally { saving.value = false }
  }
  onMounted(async () => {
    try {
      tasks.value = await loadPublicPingTasks()
    }
    catch (cause) { error.value = cause instanceof Error ? cause.message : 'Ping 任务加载失败。' }
    finally { loading.value = false }
  })
  return { tasks, loading, saving, error, nodeSearch, taskSearch, activeNodeId, bindings, dirty, pingEnabled, sparklineEnabled, visibleNodes, filteredNodes, activeNode, activeNodeName, activeTaskIds, unavailableTaskIds, filteredTasks, configuredNodeCount, taskName, nodeTaskSummary, toggleTask, save }
}
