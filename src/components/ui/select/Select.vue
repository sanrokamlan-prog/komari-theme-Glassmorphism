<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Icon } from '@iconify/vue'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue?: string
  options: readonly SelectOption[]
  placeholder?: string
  ariaLabel?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
  contentClass?: HTMLAttributes['class']
}>(), {
  modelValue: undefined,
  placeholder: '请选择',
  ariaLabel: undefined,
  disabled: false,
  class: undefined,
  contentClass: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleValueChange(value: unknown) {
  if (typeof value === 'string')
    emit('update:modelValue', value)
}
</script>

<template>
  <SelectRoot
    :model-value="modelValue || undefined"
    :disabled="disabled"
    @update:model-value="handleValueChange"
  >
    <SelectTrigger
      :aria-label="ariaLabel"
      :class="cn(
        'inline-flex h-9 min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background/70 px-3 text-sm text-foreground shadow-xs outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
        props.class,
      )"
    >
      <SelectValue :placeholder="placeholder" class="min-w-0 truncate text-left" />
      <Icon icon="tabler:chevron-down" width="14" height="14" class="shrink-0 text-muted-foreground" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="4"
        :class="cn(
          'z-[120] max-h-80 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-md border border-border/70 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          props.contentClass,
        )"
      >
        <SelectScrollUpButton class="flex h-6 cursor-default items-center justify-center bg-popover/80 text-muted-foreground">
          <Icon icon="tabler:chevron-up" width="14" height="14" />
        </SelectScrollUpButton>
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
          >
            <SelectItemIndicator class="absolute left-2 inline-flex items-center justify-center">
              <Icon icon="tabler:check" width="14" height="14" />
            </SelectItemIndicator>
            <SelectItemText class="min-w-0 truncate">
              {{ option.label }}
            </SelectItemText>
          </SelectItem>
        </SelectViewport>
        <SelectScrollDownButton class="flex h-6 cursor-default items-center justify-center bg-popover/80 text-muted-foreground">
          <Icon icon="tabler:chevron-down" width="14" height="14" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
