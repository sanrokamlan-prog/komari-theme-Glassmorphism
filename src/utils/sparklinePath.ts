// Adapted from towersip (MIT), a41270e. Preserve gaps and true extrema.
export interface SparklineGeometry {
  linePaths: string[]
  fillPaths: string[]
  width: number
  height: number
}

interface SparklinePoint {
  x: number
  y: number
}

/** 最小跨度下限：小于此值时波动贴近平线，避免几毫秒的抖动被放大成满幅起伏。 */
const MIN_SPAN = 8
/** 跨度相对基线值的最小比例，量级越大越要求可见的起伏。 */
const MIN_SPAN_RATIO = 0.2

/**
 * 计算曲线纵向量程。
 */
export function robustDomain(values: number[]): { min: number, max: number } {
  if (!values.length)
    return { min: 0, max: 1 }

  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)

  if (dataMin === dataMax) {
    const magnitude = Math.max(Math.abs(dataMin), 1)
    const pad = Math.max(MIN_SPAN / 2, magnitude * MIN_SPAN_RATIO / 2)
    return { min: dataMin - pad, max: dataMax + pad }
  }

  const magnitude = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1)
  const span = Math.max(dataMax - dataMin, MIN_SPAN, magnitude * MIN_SPAN_RATIO)
  const center = (dataMin + dataMax) / 2

  return { min: center - span / 2, max: center + span / 2 }
}

/**
 * 生成单调平滑折线路径（水平切线三次贝塞尔，不会过冲出极值）。
 */
function smoothPath(points: SparklinePoint[]): string {
  if (points.length < 2)
    return linearPath(points)

  const parts: string[] = [`M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`]

  for (let index = 0; index < points.length - 1; index++) {
    const current = points[index]!
    const next = points[index + 1]!
    const midX = (current.x + next.x) / 2
    parts.push(` C ${midX.toFixed(2)} ${current.y.toFixed(2)}, ${midX.toFixed(2)} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`)
  }

  return parts.join(' ')
}

function linearPath(points: SparklinePoint[]): string {
  if (!points.length)
    return ''
  if (points.length === 1)
    return `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`

  let path = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`
  for (let index = 0; index < points.length - 1; index++) {
    const p2 = points[index + 1]!
    path += ` L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return path
}

function toSegments(values: Array<number | null | undefined>): Array<Array<{ index: number, value: number }>> {
  const segments: Array<Array<{ index: number, value: number }>> = []
  let current: Array<{ index: number, value: number }> = []

  values.forEach((value, index) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      current.push({ index, value })
      return
    }
    if (current.length) {
      segments.push(current)
      current = []
    }
  })

  if (current.length)
    segments.push(current)

  return segments
}

export function buildSparklineGeometry(
  values: Array<number | null | undefined>,
  options: { width?: number, height?: number, padding?: number } = {},
): SparklineGeometry {
  const width = options.width ?? 120
  const height = options.height ?? 28
  const padding = options.padding ?? 2
  const finiteValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (!finiteValues.length) {
    return {
      linePaths: [],
      fillPaths: [],
      width,
      height,
    }
  }

  const domain = robustDomain(finiteValues)
  const range = domain.max - domain.min || 1
  const innerHeight = Math.max(1, height - padding * 2)
  const lastIndex = Math.max(values.length - 1, 1)

  const yFor = (value: number) => {
    const ratio = (value - domain.min) / range
    const y = padding + (1 - ratio) * innerHeight
    return Math.min(height - padding, Math.max(padding, y))
  }

  const xFor = (index: number) => {
    if (values.length <= 1)
      return width / 2
    return (index / lastIndex) * width
  }

  const linePaths: string[] = []
  const fillPaths: string[] = []
  const baseline = height - padding
  const singlePoint = finiteValues.length === 1

  for (const segment of toSegments(values)) {
    const points = segment.map(item => ({
      x: xFor(item.index),
      y: yFor(item.value),
    }))
    if (points.length === 1 || singlePoint) {
      const point = points[0]!
      const left = Math.max(0, point.x - 4)
      const right = Math.min(width, point.x + 4)
      points.unshift({ x: left, y: point.y })
      points.push({ x: right, y: point.y })
    }

    const linePath = smoothPath(points)
    if (!linePath)
      continue

    linePaths.push(linePath)
    const first = points[0]!
    const last = points.at(-1)!
    fillPaths.push(`${linePath} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} L ${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`)
  }

  return { linePaths, fillPaths, width, height }
}
