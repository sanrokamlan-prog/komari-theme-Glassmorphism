import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { installKomariFixture } from './fixtures/komari'

const UUID = '00000000-0000-4000-8000-000000000001'
const OTHER = '00000000-0000-4000-8000-000000000002'

async function updateGeoState(page: Page, change: { urls?: string, guest?: boolean }) {
  await page.evaluate((change) => {
    interface AppStore {
      publicSettings: { theme_settings: Record<string, unknown> }
      authStatus: string
    }
    const root = document.querySelector('#app') as HTMLElement & {
      __vue_app__: { config: { globalProperties: { $pinia: { _s: Map<string, AppStore> } } } }
    }
    const store = root.__vue_app__.config.globalProperties.$pinia._s.get('app')!
    if (change.urls !== undefined)
      store.publicSettings.theme_settings = { ...store.publicSettings.theme_settings, ipGeoProviderUrls: change.urls }
    if (change.guest)
      store.authStatus = 'guest'
  }, change)
}

test('admin entry supports middle click, Ctrl click and normal navigation', async ({ page }) => {
  await installKomariFixture(page, { hideEarth: true })
  await page.context().route('**/admin', route => route.fulfill({ contentType: 'text/html', body: '<h1>Admin fixture</h1>' }))
  await page.goto('/')
  const entry = page.getByRole('link', { name: '后台管理', exact: true })
  await expect(entry).toHaveAttribute('href', '/admin')
  for (const options of [{ button: 'middle' as const }, { modifiers: ['Control' as const] }]) {
    const popupPromise = page.context().waitForEvent('page')
    await entry.click(options)
    const popup = await popupPromise
    await expect(popup).toHaveURL(/\/admin$/)
    await expect(page).toHaveURL('http://127.0.0.1:4173/')
    await popup.close()
  }
  await entry.click()
  await expect(page).toHaveURL(/\/admin$/)
})

test('geo respects source priority and keeps two Japanese city names separate', async ({ page }) => {
  await installKomariFixture(page, {
    earthRenderer: 'tiled',
    loggedIn: true,
    nodeIpOverrides: {
      [UUID]: { ipv4: '8.8.8.8', ipv6: '', region: 'JP' },
      [OTHER]: { ipv4: '1.1.1.1', ipv6: '', region: 'JP' },
    },
  })
  const calls: string[] = []
  await page.route(/^https:\/\/(?:api\.ip\.sb|ipinfo\.io|ipwho\.is|ipapi\.co)\/.+/, async (route) => {
    const url = route.request().url()
    calls.push(url)
    const osaka = url.includes('1.1.1.1') && url.includes('api.ip.sb')
    await route.fulfill({ json: { latitude: osaka ? 34.69 : 35.68, longitude: osaka ? 135.5 : 139.76, city: osaka ? '大阪' : '東京', country_code: 'JP', loc: '35.68,139.76', country: 'JP' } })
  })
  await page.goto('/')
  await expect(page.locator('.legend-name').getByText('東京', { exact: true })).toBeVisible()
  await expect(page.locator('.legend-name').getByText('大阪', { exact: true })).toBeVisible()
  expect(calls).toHaveLength(2)
  expect(calls.every(url => url.startsWith('https://api.ip.sb/'))).toBe(true)
})

for (const action of ['change provider', 'revoke permission'] as const) {
  test(`geo ignores in-flight results after ${action}`, async ({ page }) => {
    await installKomariFixture(page, {
      earthRenderer: 'tiled',
      loggedIn: true,
      nodeIpOverrides: { [UUID]: { ipv4: '8.8.8.8', ipv6: '', region: 'JP' } },
      themeSettingsOverrides: { ipGeoProviderUrls: 'https://geo-a.example/{ip}' },
    })
    let releaseOld!: () => void
    let oldFinished!: () => void
    const held = new Promise<void>((resolve) => {
      releaseOld = resolve
    })
    const finished = new Promise<void>((resolve) => {
      oldFinished = resolve
    })
    let started = false
    let freshCalls = 0
    await page.route('https://geo-a.example/**', async (route) => {
      started = true
      await held
      await route.fulfill({ json: { lat: 35.68, lng: 139.76, city: '東京', country_code: 'JP' } })
      oldFinished()
    })
    await page.route('https://geo-b.example/**', async (route) => {
      freshCalls++
      await route.fulfill({ json: { lat: 34.69, lng: 135.5, city: '大阪', country_code: 'JP' } })
    })
    await page.goto('/')
    await expect.poll(() => started).toBe(true)
    await updateGeoState(page, action === 'change provider' ? { urls: 'https://geo-b.example/{ip}' } : { guest: true })
    if (action === 'change provider')
      await expect(page.locator('.legend-name').getByText('大阪', { exact: true })).toBeVisible()
    releaseOld()
    await finished
    await expect.poll(() => page.evaluate(() => Object.values(localStorage).some(value => value.includes('東京')))).toBe(true)
    await expect(page.locator('.legend-name').getByText('東京', { exact: true })).toHaveCount(0)
    if (action === 'change provider') {
      await expect(page.locator('.legend-name').getByText('大阪', { exact: true })).toBeVisible()
      // Both providers have a valid cached answer for the same IP; switching
      // back must select the matching answer without another external request.
      await updateGeoState(page, { urls: 'https://geo-a.example/{ip}' })
      await expect(page.locator('.legend-name').getByText('東京', { exact: true })).toBeVisible()
      expect(freshCalls).toBe(1)
      await updateGeoState(page, { urls: '' })
      await expect(page.locator('.legend-name').getByText('東京', { exact: true })).toHaveCount(0)
    }
  })
}

for (const source of ['metric', 'legacy', 'empty', 'full loss'] as const) {
  test(`three-net window averages ignore recovered latest probes: ${source}`, async ({ page }) => {
    await installKomariFixture(page, { hideEarth: true, pingTaskOrdering: true, threeNetPing: true, livePingLoss: 0 })
    await page.route('**/rpc2', async (route) => {
      const payload = route.request().postDataJSON()
      if (source !== 'metric' && payload.method === 'public:getPingMetricStats') {
        if (source === 'full loss') {
          return route.fulfill({ json: { jsonrpc: '2.0', id: payload.id, result: { stats: [20, 10, 30].map(id => ({ entity_id: UUID, task_id: String(id), total: 200, valid: 0, loss: 100, loss_approximate: false, avg: null, latest: null })) } } })
        }
        return route.fulfill({ json: { jsonrpc: '2.0', id: payload.id, error: { code: -32601, message: 'Legacy backend' } } })
      }
      if (source === 'empty' && ['public:getPingRecords', 'common:getRecords'].includes(payload.method))
        return route.fulfill({ json: { jsonrpc: '2.0', id: payload.id, result: { records: [], tasks: [], count: 0 } } })
      return route.fallback()
    })
    await page.goto('/')
    const row = page.locator('[data-three-net-ping]').first().locator('[data-three-net-task="30"]')
    await expect(row).toBeVisible()
    if (source === 'empty') {
      await expect(row).not.toContainText(/\d+ ms|\d+\.\d+%/)
    }
    else if (source === 'full loss') {
      await expect(row).toContainText('不可达')
      await expect(row).toContainText('100.0%')
    }
    else {
      await expect(row).toContainText(source === 'metric' ? '110 ms' : '130 ms')
      await expect(row).toContainText(source === 'metric' ? '1.5%' : '6.3%')
    }
    await expect(row.locator('[title="最近一小时窗口平均延迟"]')).toBeVisible()
  })
}
