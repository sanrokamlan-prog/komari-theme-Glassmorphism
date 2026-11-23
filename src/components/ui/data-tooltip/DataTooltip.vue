<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type DataTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  /** 提示文本，留空且无 #content 插槽时不渲染气泡 */
  content?: string
  /** 气泡相对触发元素的方位 */
  placement?: DataTooltipPlacement
  /** 气泡宽度，number 视为 px；默认由内容撑起 */
  width?: number | string
  /** 气泡高度，number 视为 px；默认由内容撑起 */
  height?: number | string
  /** 包裹元素标签，默认 div */
  as?: string
  /** 包裹元素的附加类 */
  class?: HTMLAttributes['class']
  /** 气泡的附加类 */
  contentClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  as: 'div',
})

const placementClass: Record<DataTooltipPlacement, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'top-1/2 right-full mr-2 -translate-y-1/2',
  right: 'top-1/2 left-full ml-2 -translate-y-1/2',
}

const sizeStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width != null)
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height != null)
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return style
})
</script>

<template>
  <component
    :is="as"
    data-slot="data-tooltip"
    :class="cn('group/data-tooltip relative inline-block', props.class)"
  >
    <slot />
    <span
      v-if="content || $slots.content"
      role="tooltip"
      data-slot="data-tooltip-content"
      :class="cn(
        'pointer-events-none absolute z-30 hidden rounded-md px-2 py-1 text-[11px] font-medium leading-snug group-hover/data-tooltip:block group-focus-within/data-tooltip:block whitespace-normal break-words',
        placementClass[placement],
        props.contentClass,
      )"
      :style="sizeStyle"
    >
      <slot name="content">{{ content }}</slot>
    </span>
  </component>
</template>

<style scoped>
/* 统一毛玻璃悬浮提示风格，与卡片视觉体系保持一致 */
[data-slot='data-tooltip-content'] {
  background-color: var(--glass-light-card-hover, rgb(248 250 252 / 0.9)) !important;
  color: var(--glass-light-text, #0f172a) !important;
  border: 1px solid var(--glass-light-border, rgb(226 232 240 / 0.85)) !important;
  backdrop-filter: blur(14px) saturate(160%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(160%) !important;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.16) !important;
}

:global(.dark) [data-slot='data-tooltip-content'] {
  background-color: var(--glass-dark-card-hover, rgb(15 23 42 / 0.92)) !important;
  color: var(--glass-dark-text, #f8fafc) !important;
  border: 1px solid var(--glass-dark-border, rgb(255 255 255 / 0.18)) !important;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.48) !important;
}
</style>
