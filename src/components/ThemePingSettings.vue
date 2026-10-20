<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { AppDialog } from '@/components/ui/app-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardX } from '@/components/ui/card-x'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { useThreeNetPingSettings } from '@/composables/useThreeNetPingSettings'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()
const { loading, saving, error, nodeSearch, taskSearch, activeNodeId, bindings, dirty, pingEnabled, sparklineEnabled, visibleNodes, filteredNodes, activeNodeName, activeTaskIds, unavailableTaskIds, filteredTasks, configuredNodeCount, nodeTaskSummary, toggleTask, save } = useThreeNetPingSettings()
</script>

<template>
  <AppDialog :open="open" title="按服务器配置 Ping 任务" description="勾选线路并保存到主题设置" content-class="max-w-5xl" @update:open="emit('update:open', $event)">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="mt-1 text-sm text-muted-foreground">
          每台服务器可选择 1～3 条线路；取消全部选择后恢复全局任务。
        </p>
      </div>
      <Button class="hidden sm:inline-flex" :disabled="!dirty || saving" @click="save">
        <Icon icon="tabler:device-floppy" />{{ saving ? '保存中' : dirty ? '保存配置' : '配置已保存' }}
      </Button>
    </div>
    <div v-if="error" class="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {{ error }}
    </div>
    <CardX class="mt-5" size="small">
      <div class="mb-4 flex flex-wrap gap-4 text-sm">
        <label class="flex items-center gap-2"><input v-model="pingEnabled" type="checkbox" :disabled="saving" class="size-4 accent-primary">显示三网延迟</label>
        <label class="flex items-center gap-2"><input v-model="sparklineEnabled" type="checkbox" :disabled="saving" class="size-4 accent-primary">三网新版样式</label>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span><Icon icon="tabler:server" class="mr-1 text-primary" />已配置 {{ configuredNodeCount }} 台服务器</span><Badge variant="outline">
          每台最多 3 个任务
        </Badge>
      </div>
    </CardX>
    <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.5fr)]">
      <CardX content-class="p-0" size="small">
        <template #header>
          <div class="flex items-center justify-between">
            <span>服务器列表</span><Badge variant="secondary">
              {{ visibleNodes.length }}
            </Badge>
          </div>
        </template>
        <div class="border-b px-3 py-2">
          <Input v-model="nodeSearch" class="h-8 text-xs" placeholder="搜索服务器" />
        </div>
        <button type="button" class="w-full border-b px-4 py-3 text-left text-sm font-medium" :class="activeNodeId === 'global' && 'bg-primary/10'" @click="activeNodeId = 'global'">
          全局任务
        </button>
        <div v-if="filteredNodes.length" class="max-h-[min(42dvh,22rem)] overflow-y-auto p-2 sm:max-h-[min(62vh,44rem)]">
          <button v-for="node in filteredNodes" :key="node.uuid" type="button" class="mb-1 w-full rounded-md px-2.5 py-2 text-left hover:bg-accent/60" :class="activeNodeId === node.uuid && 'bg-primary/10'" @click="activeNodeId = node.uuid">
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full" :class="node.online ? 'bg-success' : 'bg-muted-foreground/40'" /><span class="min-w-0 flex-1 truncate text-sm font-medium">{{ node.name }}</span><Badge v-if="bindings[node.uuid]?.length" variant="default" class="h-5 px-1.5 text-[10px]">
                {{ bindings[node.uuid]?.length }}/3
              </Badge>
            </div>
            <div class="mt-1 truncate pl-4 text-[11px] text-muted-foreground">
              {{ nodeTaskSummary(node.uuid) }}
            </div>
          </button>
        </div>
        <Empty v-else description="暂无匹配服务器" class="py-12" />
      </CardX>
      <CardX v-if="activeNodeName" size="small">
        <template #header>
          <div class="truncate font-medium">
            {{ activeNodeName }}
          </div>
        </template>
        <div class="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm text-muted-foreground">
          <span>勾选该服务器要展示的任务</span><Badge variant="outline">
            {{ activeTaskIds.length }} / 3
          </Badge>
        </div>
        <Input v-model="taskSearch" class="mt-4" placeholder="搜索 Ping 任务名称或 ID" />
        <div v-if="!loading && unavailableTaskIds.length" class="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <p class="text-sm font-medium">
            以下已选任务不在当前任务列表中
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            任务可能已删除或暂时不可用。移除并保存可释放选择名额。
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button v-for="id in unavailableTaskIds" :key="id" variant="outline" size="sm" :disabled="saving" :aria-label="`移除任务 ID ${id}`" @click="toggleTask(id)">
              移除任务 ID {{ id }}<Icon icon="tabler:x" />
            </Button>
          </div>
        </div>
        <div v-if="loading" class="py-12 text-center text-sm text-muted-foreground">
          正在加载 Ping 任务…
        </div>
        <div v-else-if="filteredTasks.length" class="mt-4 grid gap-2 sm:grid-cols-2">
          <label v-for="task in filteredTasks" :key="task.id" class="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5" :class="activeTaskIds.includes(task.id) ? 'border-primary/50 bg-primary/10' : 'border-border hover:bg-accent/50'"><input type="checkbox" class="size-4 accent-primary" :checked="activeTaskIds.includes(task.id)" :disabled="saving" @change="toggleTask(task.id)"><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">{{ task.name }}</span><span class="block text-[11px] text-muted-foreground">ID {{ task.id }}</span></span><Icon v-if="activeTaskIds.includes(task.id)" icon="tabler:check" class="text-primary" /></label>
        </div>
        <Empty v-else description="暂无匹配 Ping 任务" class="py-12" />
      </CardX>
      <CardX v-else size="small">
        <Empty description="请选择服务器" />
      </CardX>
    </div>
    <div class="h-16 sm:hidden" />
    <div class="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-card p-3 sm:hidden">
      <Button class="h-11 w-full" :disabled="!dirty || saving" @click="save">
        <Icon icon="tabler:device-floppy" />{{ saving ? '保存中' : dirty ? '保存配置' : '配置已保存' }}
      </Button>
    </div>
  </AppDialog>
</template>
