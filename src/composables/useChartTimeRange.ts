import type { MaybeRefOrGetter } from 'vue'
import dayjs from 'dayjs'
import { computed, ref, toValue } from 'vue'

export interface ChartPresetView {
  label: string
  hours: number
}

export interface ChartViewOption {
  label: string
  hours?: number
}

export interface CustomTimeRange {
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  hours: number
}

export interface UseChartTimeRangeOptions {
  presetViews: readonly ChartPresetView[]
  maxPreserveHours: MaybeRefOrGetter<number>
  includeRealtime?: boolean
  realtimeLabel?: string
  customLabel?: string
  defaultCustomHours?: number
  minExtraHours?: number
}

export function useChartTimeRange(options: UseChartTimeRangeOptions) {
  const realtimeLabel = options.realtimeLabel ?? '实时'
  const customLabel = options.customLabel ?? '自定义'
  const defaultCustomHours = options.defaultCustomHours ?? 24
  const minExtraHours = options.minExtraHours ?? 1

  const availableViews = computed<ChartViewOption[]>(() => {
    const views: ChartViewOption[] = options.includeRealtime ? [{ label: realtimeLabel }] : []
    const maxHours = toValue(options.maxPreserveHours)

    for (const v of options.presetViews) {
      if (maxHours >= v.hours) {
        views.push({ label: v.label, hours: v.hours })
      }
    }

    const maxPreset = options.presetViews.at(-1)
    if (maxPreset && maxHours > maxPreset.hours) {
      const label = maxHours % 24 === 0
        ? `${Math.floor(maxHours / 24)} 天`
        : `${maxHours} 小时`
      views.push({ label, hours: maxHours })
    }
    else if (maxHours > minExtraHours && !options.presetViews.some(v => v.hours === maxHours)) {
      const label = maxHours % 24 === 0
        ? `${Math.floor(maxHours / 24)} 天`
        : `${maxHours} 小时`
      views.push({ label, hours: maxHours })
    }

    views.push({ label: customLabel })
    return views
  })

  const selectedView = ref<string>(options.includeRealtime ? realtimeLabel : '')
  const customStartInput = ref('')
  const customEndInput = ref('')

  const isCustomRange = computed(() => selectedView.value === customLabel)
  const customRange = computed<CustomTimeRange | null>(() => {
    if (!customStartInput.value || !customEndInput.value)
      return null

    const start = dayjs(customStartInput.value)
    const end = dayjs(customEndInput.value)
    if (!start.isValid() || !end.isValid() || !end.isAfter(start))
      return null

    return {
      start,
      end,
      hours: Math.max(1, Math.ceil(end.diff(start, 'hour', true))),
    }
  })

  const customRangeError = computed(() => {
    if (!isCustomRange.value || (!customStartInput.value && !customEndInput.value))
      return ''
    if (!customStartInput.value || !customEndInput.value)
      return '请选择开始和结束时间'
    return customRange.value ? '' : '结束时间必须晚于开始时间'
  })

  function ensureDefaultCustomRange(): void {
    if (customStartInput.value && customEndInput.value)
      return

    const end = dayjs()
    const hours = Math.max(1, Math.min(defaultCustomHours, toValue(options.maxPreserveHours)))
    customStartInput.value = end.subtract(hours, 'hour').format('YYYY-MM-DDTHH:mm')
    customEndInput.value = end.format('YYYY-MM-DDTHH:mm')
  }

  return {
    customLabel,
    availableViews,
    selectedView,
    customStartInput,
    customEndInput,
    isCustomRange,
    customRange,
    customRangeError,
    ensureDefaultCustomRange,
  }
}
