<script setup lang="ts">
import type { HomeQuickControlKey } from '@/stores/app'
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { useDebounceFn } from '@vueuse/core'
import { computed, defineAsyncComponent, nextTick, onActivated, onDeactivated, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import * as financeHelper from '@/utils/financeHelper'
import {
  getRealtimePeakSpeed,
  getTotalTraffic,
  isExpiringNode,
  isHighLoadNode,
} from '@/utils/nodeMetricsHelper'
import { isRegionMatch } from '@/utils/regionHelper'
import { hasFreeNodeTag } from '@/utils/tagHelper'

interface QuickControlOption {
  key: HomeQuickControlKey
  label: string
  icon: string
}

defineOptions({ name: 'HomeView' })

const NodeCard = defineAsyncComponent(() => import('@/components/NodeCard.vue'))
const NodeGeneralCards = defineAsyncComponent(() => import('@/components/NodeGeneralCards.vue'))
const NodeList = defineAsyncComponent(() => import('@/components/NodeList.vue'))

const nodeItemStaggerMs = 35
const nodeItemStaggerLimit = 12

const appStore = useAppStore()
const nodesStore = useNodesStore()
const router = useRouter()

onActivated(() => {
  if (appStore.homeScrollPosition > 0) {
    nextTick(() => {
      window.scrollTo({ top: appStore.homeScrollPosition, behavior: 'instant' })
    })
  }
})

onDeactivated(() => {
  appStore.homeScrollPosition = window.scrollY
})

const searchText = ref('')
const debouncedSearchText = ref('')
const activeQuickControl = ref<HomeQuickControlKey>(appStore.homeQuickDefaultControl)
const exchangeRates = ref(financeHelper.DEFAULT_EXCHANGE_RATES)
const excludeFreeNodes = ref(true)

const quickControlDefinitions: Record<HomeQuickControlKey, QuickControlOption> = {
  default: { key: 'default', label: '默认', icon: 'tabler:sort-ascending' },
  monthlyCost: { key: 'monthlyCost', label: '月成本', icon: 'tabler:calendar-dollar' },
  totalTraffic: { key: 'totalTraffic', label: '总流量', icon: 'tabler:database' },
  upload: { key: 'upload', label: '上行', icon: 'tabler:chevron-up' },
  download: { key: 'download', label: '下行', icon: 'tabler:chevron-down' },
  peak: { key: 'peak', label: '峰值', icon: 'tabler:activity' },
  offline: { key: 'offline', label: '离线', icon: 'tabler:plug-connected-x' },
  highLoad: { key: 'highLoad', label: '高负载', icon: 'tabler:alert-triangle' },
  expiring: { key: 'expiring', label: '即将到期', icon: 'tabler:calendar-exclamation' },
}

const updateDebouncedSearch = useDebounceFn((value: string) => {
  debouncedSearchText.value = value
}, 300)

watch(searchText, (value) => {
  updateDebouncedSearch(value)
})

const groups = computed(() => [
  { tab: '全部节点', name: 'all' },
  ...nodesStore.groups.map(g => ({ tab: g, name: g })),
])

const quickControls = computed(() => appStore.homeQuickControlOrder.map(key => quickControlDefinitions[key]))
const showQuickControls = computed(() => appStore.homeQuickControlsEnabled && quickControls.value.length > 0)

watch(
  () => [appStore.homeQuickDefaultControl, appStore.homeQuickControlOrder.join('|'), appStore.homeQuickControlsEnabled] as const,
  () => {
    if (!appStore.homeQuickControlsEnabled) {
      activeQuickControl.value = 'default'
      return
    }

    if (!appStore.homeQuickControlOrder.includes(activeQuickControl.value))
      activeQuickControl.value = appStore.homeQuickDefaultControl
  },
  { immediate: true },
)

onMounted(async () => {
  excludeFreeNodes.value = financeHelper.shouldExcludeFreeNodes()
  const { rates } = await financeHelper.getDailyExchangeRates()
  exchangeRates.value = rates
})

watch(
  () => nodesStore.groups,
  (gs) => {
    const cur = appStore.nodeSelectedGroup
    if (cur !== 'all' && !gs.includes(cur)) {
      appStore.nodeSelectedGroup = 'all'
    }
  },
  { immediate: true },
)

function getNodeMonthlyCostCNY(node: NodeData): number {
  if (excludeFreeNodes.value && hasFreeNodeTag(node.tags))
    return 0

  return financeHelper.calculateMonthlyCostCNY(node, exchangeRates.value)
}

function isNodeMatchSearch(node: NodeData, search: string): boolean {
  if (!search.trim())
    return true
  const lowerSearch = search.toLowerCase().trim()
  if (node.name.toLowerCase().includes(lowerSearch))
    return true
  if (node.region && isRegionMatch(node.region, search))
    return true
  if (node.os && node.os.toLowerCase().includes(lowerSearch))
    return true
  if (node.groups.some(group => group.toLowerCase().includes(lowerSearch)))
    return true
  if (node.tags && node.tags.toLowerCase().includes(lowerSearch))
    return true
  if (node.remark && node.remark.toLowerCase().includes(lowerSearch))
    return true
  return false
}

function sortNodesByComputedValue(nodes: NodeData[], selector: (node: NodeData) => number): NodeData[] {
  return nodes
    .map(node => ({ node, value: selector(node) }))
    .sort((a, b) => b.value - a.value)
    .map(item => item.node)
}

function placeOfflineNodesLast(nodes: NodeData[]): NodeData[] {
  if (!appStore.offlineNodesLast)
    return nodes

  return [...nodes].sort((a, b) => {
    if (a.online === b.online)
      return 0
    return a.online ? -1 : 1
  })
}

function getQuickControlNodes(nodes: NodeData[], control: HomeQuickControlKey): NodeData[] {
  let result: NodeData[]

  switch (control) {
    case 'monthlyCost':
      result = sortNodesByComputedValue(nodes, getNodeMonthlyCostCNY)
      break
    case 'totalTraffic':
      result = sortNodesByComputedValue(nodes, getTotalTraffic)
      break
    case 'upload':
      result = [...nodes].sort((a, b) => (b.net_out || 0) - (a.net_out || 0))
      break
    case 'download':
      result = [...nodes].sort((a, b) => (b.net_in || 0) - (a.net_in || 0))
      break
    case 'peak':
      result = sortNodesByComputedValue(nodes, getRealtimePeakSpeed)
      break
    case 'offline':
      return nodes.filter(node => !node.online)
    case 'highLoad':
      result = nodes.filter(node => isHighLoadNode(node, appStore.homeHighLoadThreshold))
      break
    case 'expiring':
      result = nodes.filter(node => isExpiringNode(node, appStore.homeExpiringDays))
      break
    case 'default':
    default:
      result = nodes
      break
  }

  return placeOfflineNodesLast(result)
}

const groupNodeList = computed(() => {
  const selectedGroup = appStore.nodeSelectedGroup
  if (selectedGroup === 'all')
    return nodesStore.visibleNodes
  return nodesStore.visibleNodes.filter(node => node.groups.includes(selectedGroup))
})

const nodeList = computed(() => {
  let filtered = groupNodeList.value
  if (debouncedSearchText.value.trim()) {
    filtered = filtered.filter(n => isNodeMatchSearch(n, debouncedSearchText.value))
  }
  return getQuickControlNodes(filtered, activeQuickControl.value)
})

const quickControlCounts = computed<Record<HomeQuickControlKey, number>>(() => {
  let base = groupNodeList.value
  if (debouncedSearchText.value.trim())
    base = base.filter(n => isNodeMatchSearch(n, debouncedSearchText.value))

  const counts = {} as Record<HomeQuickControlKey, number>
  for (const key of appStore.homeQuickControlOrder)
    counts[key] = getQuickControlNodes(base, key).length
  return counts
})

const emptyDescription = computed(() => {
  if (debouncedSearchText.value.trim())
    return '没有匹配的节点'
  if (activeQuickControl.value !== 'default')
    return '当前快捷筛选下暂无节点'
  return '暂无节点'
})

function clearSearch() {
  searchText.value = ''
  debouncedSearchText.value = ''
}

const nodeListSortResetKey = computed(() => {
  return `${appStore.nodeSelectedGroup}|${debouncedSearchText.value.trim()}|${activeQuickControl.value}`
})

function handleNodeClick(node: NodeData) {
  router.push({ name: 'instance-detail', params: { id: node.uuid } })
}

function getNodeItemTransitionKey(node: NodeData): string {
  return `${appStore.nodeSelectedGroup}-${activeQuickControl.value}-${node.uuid}`
}

function getNodeItemTransitionStyle(index: number): Record<string, string> {
  return {
    '--node-item-delay': `${Math.min(index, nodeItemStaggerLimit) * nodeItemStaggerMs}ms`,
  }
}

function setQuickControl(key: HomeQuickControlKey) {
  activeQuickControl.value = key
}

const nodeCardGridClass = computed(() => {
  const sizeClass: Record<typeof appStore.nodeCardSize, string> = {
    mini: 'gap-3 sm:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]',
    compact: 'gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]',
    comfortable: 'gap-4 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]',
    large: 'gap-5 sm:grid-cols-[repeat(auto-fill,minmax(420px,1fr))]',
  }
  return ['grid grid-cols-1', sizeClass[appStore.nodeCardSize]]
})
</script>

<template>
  <div class="home-view">
    <div v-if="appStore.connectionError" class="alert px-4">
      <Alert variant="destructive" class="border-none backdrop-blur-xs bg-red-400/10 rounded-md">
        <AlertTitle>RPC 服务错误</AlertTitle>
        <AlertDescription>连接服务器失败，请检查网络设置或刷新页面后再试。</AlertDescription>
      </Alert>
    </div>

    <div v-if="appStore.alertEnabled && appStore.alertContent" class="alert px-4">
      <Alert class="border-none bg-background/60 backdrop-blur-xs rounded-md">
        <AlertTitle v-if="appStore.alertTitle">
          {{ appStore.alertTitle }}
        </AlertTitle>
        <AlertDescription>
          <MarkdownRenderer :content="appStore.alertContent" />
        </AlertDescription>
      </Alert>
    </div>

    <NodeGeneralCards
      v-if="!appStore.hideGeneralCard"
      :nodes="groupNodeList"
      :globe-nodes="groupNodeList"
      :transition-key="appStore.nodeSelectedGroup"
    />

    <div class="node-info p-4 pt-0 flex flex-col gap-4 relative z-1 pointer-events-none" :class="!!appStore.hideGeneralCard && 'pt-4'">
      <div class="nodes">
        <Tabs v-model="appStore.nodeSelectedGroup" class="w-full flex-col gap-4">
          <div class="flex gap-2 items-center flex-nowrap">
            <div class="home-controls-scroll min-w-0 flex-1 overflow-x-auto overscroll-x-contain rounded-sm pointer-events-auto touch-pan-x">
              <div class="flex w-max gap-2">
                <TabsList class="w-max h-8 bg-background/50 backdrop-blur-xl rounded-md pointer-events-auto">
                  <TabsTrigger
                    v-for="g in groups" :key="g.name" :value="g.name"
                    class="h-6.5 flex-none shrink-0 text-xs border-none data-[state=active]:text-green-600 shadow-none rounded-sm"
                  >
                    {{ g.tab }}
                  </TabsTrigger>
                </TabsList>

                <div
                  v-if="showQuickControls"
                  class="flex h-8 w-max items-center gap-1 rounded-md bg-background/50 px-1 backdrop-blur-xl pointer-events-auto"
                >
                  <button
                    v-for="control in quickControls" :key="control.key"
                    type="button"
                    class="inline-flex h-6.5 flex-none shrink-0 items-center gap-1 rounded-sm px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    :class="activeQuickControl === control.key ? 'bg-background text-green-600 shadow-sm' : ''"
                    :aria-pressed="activeQuickControl === control.key"
                    :aria-label="`切换到${control.label}节点，${quickControlCounts[control.key] ?? 0} 台`"
                    @click="setQuickControl(control.key)"
                  >
                    <Icon :icon="control.icon" :width="12" :height="12" />
                    <span>{{ control.label }}</span>
                    <span class="rounded-full bg-slate-500/10 px-1 text-[10px] tabular-nums text-foreground/65">
                      {{ quickControlCounts[control.key] ?? 0 }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div class="search flex gap-2 items-center pointer-events-auto">
              <Button
                variant="outline" size="icon" aria-label="卡片视图"
                class="w-8 h-8 border-none  bg-background/50 backdrop-blur-xs shadow-none hover:bg-background/60 rounded-md"
                :class="[appStore.nodeViewMode === 'card' ? '!text-green-600 !bg-background' : '']"
                @click="appStore.nodeViewMode = 'card'"
              >
                <Icon icon="tabler:layout-grid" :width="14" :height="14" />
              </Button>
              <Button
                variant="outline" size="icon" aria-label="列表视图"
                class="w-8 h-8 border-none bg-background/50 backdrop-blur-xs shadow-none hover:bg-background/60 rounded-md"
                :class="[appStore.nodeViewMode === 'list' ? '!text-green-600 !bg-background' : '']"
                @click="appStore.nodeViewMode = 'list'"
              >
                <Icon icon="tabler:table" :width="14" :height="14" />
              </Button>
              <div class="relative z-1 h-8" :class="searchText ? 'w-60' : 'w-8'">
                <div class="absolute top-0 right-0">
                  <Input
                    v-model="searchText" placeholder="搜索节点名称、地区、系统"
                    aria-label="搜索节点"
                    class="transition-all border-none shadow-none h-8 bg-background/50 backdrop-blur-xs rounded-md hover:!bg-background/60 focus:!pl-7.5 focus:placeholder:!text-muted-foreground focus:!bg-background/80 focus:!ring-slate-500/10"
                    :class="searchText ? '!w-60 !pl-7.5 pr-7 placeholder:!text-muted-foreground' : 'w-8 placeholder:text-transparent focus:!w-60'"
                    @keydown.esc.prevent="clearSearch"
                  />
                  <Icon
                    icon="tabler:search" :width="14" :height="14"
                    class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <button
                    v-if="searchText"
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="清空搜索"
                    @click="clearSearch"
                  >
                    <Icon icon="tabler:x" :width="14" :height="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <TabsContent v-for="g in groups" :key="g.name" :value="g.name" class="pointer-events-auto">
            <TransitionGroup
              v-if="nodeList.length !== 0 && appStore.nodeViewMode === 'card'"
              :appear="!appStore.disablePageAnimation"
              :css="!appStore.disablePageAnimation"
              name="node-card-switch"
              tag="div"
              :class="nodeCardGridClass"
            >
              <div
                v-for="(node, index) in nodeList"
                :key="getNodeItemTransitionKey(node)"
                class="min-w-0"
                :style="getNodeItemTransitionStyle(index)"
              >
                <NodeCard :node="node" @click="handleNodeClick(node)" />
              </div>
            </TransitionGroup>
            <NodeList
              v-else-if="nodeList.length !== 0 && appStore.nodeViewMode === 'list'"
              :nodes="nodeList"
              :transition-key="appStore.nodeSelectedGroup"
              :sort-reset-key="nodeListSortResetKey"
              @click="handleNodeClick"
            />
            <div v-else class="text-muted-foreground text-center py-8">
              <Empty :description="emptyDescription" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-controls-scroll {
  scrollbar-width: none;
}

.home-controls-scroll::-webkit-scrollbar {
  display: none;
}

.node-card-switch-enter-active,
.node-card-switch-leave-active {
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 180ms ease;
}

.node-card-switch-enter-active {
  transition-delay: var(--node-item-delay, 0ms);
}

.node-card-switch-move {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.node-card-switch-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
  filter: blur(3px);
}

.node-card-switch-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
  filter: blur(2px);
}

@media (prefers-reduced-motion: reduce) {
  .node-card-switch-enter-active,
  .node-card-switch-leave-active,
  .node-card-switch-move {
    transition: none;
    transition-delay: 0ms;
  }

  .node-card-switch-enter-from,
  .node-card-switch-leave-to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
