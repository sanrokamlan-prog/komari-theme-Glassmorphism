import { expect, test } from '@playwright/test'
import { escapePingTooltip, pingChartTaskLabels } from '../../src/utils/pingChartPresentation'
import { smoothPingChartDisplayRows } from '../../src/utils/pingChartSmoothing'
import { buildSparklineGeometry } from '../../src/utils/sparklinePath'
import { parseNodePingBindings, parsePingTaskIds, shortenPingTaskName } from '../../src/utils/threeNetSettings'
import { installKomariFixture } from './fixtures/komari'

const UUID = '00000000-0000-4000-8000-000000000001'

test('curves preserve missing samples, extrema and source data', () => {
  const rows = [{ time: 'a', 1: 100 }, { time: 'b', 1: 1000 }, { time: 'c', 1: null }, { time: 'd', 1: 200 }]
  const smoothed = smoothPingChartDisplayRows(rows, [1])
  expect(smoothed.map(row => row[1])).toEqual([100, 415, null, 200])
  expect(rows[1][1]).toBe(1000)
  const geometry = buildSparklineGeometry([100, 1000, null, 200])
  expect(geometry.linePaths).toHaveLength(2)
  expect(geometry.linePaths.every(path => !path.includes('NaN'))).toBe(true)
  expect(parsePingTaskIds('20,10,20,-1,NaN,30,40')).toEqual([20, 10, 30])
  expect(parsePingTaskIds('[20,10,20,30]')).toEqual([20, 10, 30])
  expect(shortenPingTaskName('浙江省-电信 IPv6', '#20')).toBe('浙江电信v6')
  expect(parseNodePingBindings('invalid')).toEqual({})
  expect(parseNodePingBindings(`{"${UUID}":[30,20,10],"__proto__":[1]}`)[UUID]).toEqual([30, 20, 10])
  const labels = pingChartTaskLabels([{ id: 1, name: '同名' }, { id: 2, name: '同名' }, { id: 3, name: '同名 · #1' }])
  expect(new Set(labels.values()).size).toBe(3)
  expect(escapePingTooltip('<img onerror="x">')).toBe('&lt;img onerror=&quot;x&quot;&gt;')
})

test('default cards keep the original Ping panels', async ({ page }) => {
  let taskRequests = 0
  page.on('request', (request) => {
    if (request.url().endsWith('/rpc2') && request.postDataJSON()?.method === 'public:getPublicPingTasks')
      taskRequests++
  })
  await installKomariFixture(page, { hideEarth: true, pingTaskOrdering: true })
  await page.goto('/')
  await expect(page.locator('[data-node-ping-bars="latency"]')).toHaveCount(12)
  await expect(page.locator('[data-three-net-ping]')).toHaveCount(0)
  expect(taskRequests).toBe(0)
})

test('history refresh pauses in background and resumes once per node', async ({ page }) => {
  await page.clock.install()
  const entities: string[] = []
  page.on('request', (request) => {
    if (!request.url().endsWith('/rpc2'))
      return
    const payload = request.postDataJSON()
    if (payload.method === 'public:queryMetrics' && payload.params.metric_keys?.includes('ping.latency_ms'))
      entities.push(payload.params.entity_id)
  })
  await installKomariFixture(page, { hideEarth: true, pingTaskOrdering: true, threeNetPing: true })
  await page.goto('/')
  await expect(page.locator('[data-three-net-task]')).toHaveCount(36)
  await expect.poll(() => entities.length).toBe(12)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.clock.fastForward(120_000)
  expect(entities).toHaveLength(12)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect.poll(() => entities.length).toBe(24)
  expect(new Set(entities.slice(12)).size).toBe(12)
})

test('same-name tasks keep independent legends and tooltip text stays escaped', async ({ page }) => {
  await installKomariFixture(page, { hideEarth: true, pingTaskOrdering: true, duplicateTaskNames: true })
  await page.goto(`/instance/${UUID}`)
  await expect.poll(() => page.locator('[data-ping-task-id]').count()).toBe(3)
  const result = await page.evaluate(() => {
    interface Chart {
      getOption: () => { series: Array<{ name: string }>, legend: Array<{ selected: Record<string, boolean> }> }
      dispatchAction: (action: Record<string, unknown>) => void
    }
    interface VNode {
      component?: { exposed?: { chart?: Chart | { value?: Chart } }, subTree?: VNode }
      children?: VNode[]
    }
    const root = (document.querySelector('#app') as HTMLElement & { _vnode?: VNode })._vnode
    const pending = root ? [root] : []
    while (pending.length) {
      const node = pending.pop()!
      const exposed = node.component?.exposed?.chart
      const chart = exposed && 'getOption' in exposed ? exposed : exposed?.value
      if (chart) {
        const option = chart.getOption()
        if (option.series.some(series => series.name.includes('<img'))) {
          const names = option.series.map(series => series.name)
          chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 5 })
          chart.dispatchAction({ type: 'legendToggleSelect', name: names[0] })
          return { names, selected: chart.getOption().legend[0].selected }
        }
      }
      if (node.component?.subTree)
        pending.push(node.component.subTree)
      if (Array.isArray(node.children))
        pending.push(...node.children.filter(child => child && typeof child === 'object'))
    }
    return null
  })
  expect(result).not.toBeNull()
  expect(new Set(result!.names).size).toBe(3)
  expect(result!.selected[result!.names[0]]).toBe(false)
  expect(result!.selected[result!.names[1]]).not.toBe(false)
  await expect(page.locator('img[src="x"]')).toHaveCount(0)
  expect(await page.evaluate(() => '__pingInjected' in window)).toBe(false)
})

for (const mobile of [false, true]) {
  test(`optional three-net history and window averages on ${mobile ? 'mobile' : 'desktop'}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1280, height: 844 }, hasTouch: mobile, isMobile: mobile })
    const page = await context.newPage()
    const options = {
      hideEarth: true,
      dark: mobile,
      pingTaskOrdering: true,
      threeNetPing: true,
      pingGaps: true,
      threeNetTaskIds: '20,10,30',
      threeNetNodeBindings: `{"${UUID}":[30,20,10]}`,
      livePingOffset: 0,
    }
    const calls: Array<{ method: string, params?: Record<string, unknown> }> = []
    page.on('request', (request) => {
      if (request.url().endsWith('/rpc2'))
        calls.push(request.postDataJSON())
    })
    try {
      await installKomariFixture(page, options)
      await page.goto('/')
      const cards = page.locator('[data-three-net-ping]')
      await expect(cards).toHaveCount(12)
      const first = cards.first()
      await expect(first.locator('[data-three-net-task]')).toHaveCount(3)
      await expect(first.locator('[data-three-net-task]').first()).toHaveAttribute('data-three-net-task', '30')
      await expect(cards.nth(1).locator('[data-three-net-task]').first()).toHaveAttribute('data-three-net-task', '20')
      const row = first.locator('[data-three-net-task="30"]')
      await expect(row).toContainText('110 ms')
      await expect(row).toContainText('1.5%')
      const curve = row.getByRole('button', { name: /历史延迟/ })
      await expect(row.locator('svg path[stroke]')).toHaveCount(2)
      const dimensions = await row.evaluate((element) => {
        const curve = element.querySelector('.sparkline')!
        return { height: element.getBoundingClientRect().height, color: getComputedStyle(curve).color }
      })
      expect(dimensions.height).toBe(20)
      expect(dimensions.color).toBe(mobile ? 'rgb(163, 230, 53)' : 'rgb(77, 124, 15)')
      expect(calls.filter(call => call.method === 'public:getPublicPingTasks')).toHaveLength(1)
      expect(calls.filter(call => call.method === 'public:queryMetrics' && (call.params?.metric_keys as string[])?.includes('ping.latency_ms'))).toHaveLength(12)
      if (mobile)
        await curve.tap()
      else
        await curve.hover()
      await expect(first.locator('[data-three-net-history]')).toBeVisible()
      await expect(first.locator('[data-three-net-history]')).toContainText('无有效样本')
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await page.screenshot({ path: `test-results/three-net-${mobile ? 'mobile' : 'desktop'}.png`, fullPage: false })
      if (mobile) {
        await page.getByText('Komari Visual Lab', { exact: true }).tap()
        await expect(first.locator('[data-three-net-history]')).toHaveCount(0)
        const rect = await curve.boundingBox()
        const cdp = await context.newCDPSession(page)
        const x = rect!.x + rect!.width / 2
        const y = rect!.y + rect!.height / 2
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 100 }] })
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
        await expect(first.locator('[data-three-net-history]')).toHaveCount(0)
        await expect(page.getByRole('dialog')).toHaveCount(0)
        await cdp.detach()
      }
      else {
        await page.mouse.move(0, 0)
        await expect(first.locator('[data-three-net-history]')).toHaveCount(0)
        await curve.press('ArrowRight')
        await expect(first.locator('[data-three-net-history]')).toBeVisible()
        await curve.press('Escape')
        await expect(first.locator('[data-three-net-history]')).toHaveCount(0)
      }
      options.livePingOffset = 30
      await expect.poll(() => calls.filter(call => call.method === 'common:getNodesLatestStatus').length).toBeGreaterThan(1)
      await expect(row).toContainText('110 ms')
      await row.getByRole('button', { name: '浙江移动 110 ms', exact: true }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(calls.filter(call => call.method === 'public:getPublicPingTasks')).toHaveLength(1)
      await page.getByRole('button', { name: '关闭', exact: true }).click()
      await page.getByRole('button', { name: '查看节点 香港边缘节点-超长名称布局测试 详情' }).click()
      await expect(page.getByText('硬件信息')).toBeVisible()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.getByRole('button', { name: '返回首页' }).click()
      await expect(cards).toHaveCount(12)
    }
    finally {
      await context.close()
    }
  })
}
