<script setup lang="ts">
import { computed, useId } from 'vue'
import { buildSparklineGeometry } from '@/utils/sparklinePath'

const props = withDefaults(defineProps<{
  values?: Array<number | null | undefined>
  fill?: boolean
}>(), {
  values: () => [],
  fill: true,
})

const fillGradientId = `sparkline-fill-${useId().replace(/[^\w-]/g, '')}`
const geometry = computed(() => buildSparklineGeometry(props.values ?? []))
const viewBox = computed(() => `0 0 ${geometry.value.width} ${geometry.value.height}`)
</script>

<template>
  <svg
    class="sparkline h-full w-full overflow-hidden"
    :viewBox="viewBox"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs v-if="props.fill && geometry.fillPaths.length">
      <linearGradient :id="fillGradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0.26" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0.02" />
      </linearGradient>
    </defs>
    <path
      v-for="(path, index) in geometry.fillPaths"
      v-show="props.fill"
      :key="`fill-${index}`"
      :d="path"
      :fill="`url(#${fillGradientId})`"
    />
    <path
      v-for="(path, index) in geometry.linePaths"
      :key="`line-${index}`"
      :d="path"
      fill="none"
      stroke="currentColor"
      stroke-width="1.35"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>
