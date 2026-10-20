import { expect, test } from '@playwright/test'
import { installKomariFixture } from './fixtures/komari'

const UUID = '00000000-0000-4000-8000-000000000001'
const OTHER = '00000000-0000-4000-8000-000000000002'
const HIDDEN = '11111111-1111-4111-8111-111111111111'

test('downstream compact curves add only row height and keep the same card width', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 844 } })
  const dimensions: Array<{ width: number, height: number }> = []
  for (const mode of ['default', 'curves', 'bars'] as const) {
    const page = await context.newPage()
    await installKomariFixture(page, { hideEarth: true, pingTaskOrdering: true, threeNetPing: mode !== 'default', threeNetSparkline: mode === 'curves' })
    await page.goto('/')
    await expect(page.locator('.node-card')).toHaveCount(12)
    if (mode !== 'default')
      await expect(page.locator('[data-three-net-task]')).toHaveCount(36)
    const rect = await page.locator('.node-card').first().boundingBox()
    dimensions.push({ width: rect!.width, height: rect!.height })
    if (mode === 'bars') {
      await expect(page.locator('[data-node-ping-bars="task-20-latency"]')).toHaveCount(12)
      await expect(page.locator('.sparkline')).toHaveCount(0)
    }
    await page.close()
  }
  expect(dimensions[1]!.width).toBe(dimensions[0]!.width)
  expect(dimensions[1]!.height - dimensions[0]!.height).toBe(24)
  expect(dimensions[2]!.height).toBeGreaterThan(dimensions[1]!.height)
  await context.close()
})

test('empty selection falls back to summary and standalone sparkline works', async ({ page }) => {
  await installKomariFixture(page, { hideEarth: true, pingTaskOrdering: true, threeNetPing: true, threeNetTaskIds: '[]' })
  await page.goto('/')
  await expect(page.locator('.node-card')).toHaveCount(12)
  await expect(page.locator('[data-three-net-task]')).toHaveCount(0)
  await expect(page.locator('.sparkline')).toHaveCount(12)
})

for (const mobile of [false, true]) {
  test(`task picker saves IDs and preserves latest settings on ${mobile ? 'mobile' : 'desktop'}`, async ({ page }) => {
    await page.setViewportSize({ width: mobile ? 390 : 1280, height: 844 })
    const options = {
      hideEarth: true,
      pingTaskOrdering: true,
      threeNetPing: true,
      loggedIn: true,
      threeNetNodeBindings: JSON.stringify({ [UUID]: [30], [HIDDEN]: [10] }),
      themeSettingsOverrides: {} as Record<string, unknown>,
    }
    const saves: Record<string, unknown>[] = []
    await installKomariFixture(page, options)
    await page.route('**/api/admin/theme/settings?theme=*', async (route) => {
      expect(new URL(route.request().url()).searchParams.get('theme')).toBe('Glassmorphism')
      const body = route.request().postDataJSON()
      saves.push(body)
      options.themeSettingsOverrides = body
      await route.fulfill({ status: 204 })
    })
    await page.goto('/')
    await page.getByRole('button', { name: '按服务器配置 Ping 任务', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('checkbox', { name: '浙江电信' })).toBeVisible()
    await dialog.getByRole('checkbox', { name: '浙江电信' }).check()
    // Simulate changes saved in another tab after this editor was opened.
    options.themeSettingsOverrides = {
      backgroundOverlay: 23,
      threeNetPingNodeTaskBindings: JSON.stringify({ [UUID]: [30], [HIDDEN]: [10], [OTHER]: [20] }),
    }
    await dialog.getByRole('button', { name: '保存配置', exact: true }).click()
    await expect(dialog.getByRole('button', { name: '配置已保存', exact: true })).toBeDisabled()
    expect(saves).toHaveLength(1)
    expect(saves[0]!.backgroundOverlay).toBe(23)
    expect(saves[0]!.threeNetPingTaskIds).toBe('[20,10,30]')
    expect(JSON.parse(saves[0]!.threeNetPingNodeTaskBindings as string)).toEqual({ [UUID]: [30, 20], [HIDDEN]: [10], [OTHER]: [20] })
    await dialog.getByRole('button', { name: '全局任务', exact: true }).click()
    await dialog.getByRole('checkbox', { name: '浙江联通' }).uncheck()
    await dialog.getByRole('button', { name: '保存配置', exact: true }).click()
    await expect(dialog.getByRole('button', { name: '配置已保存', exact: true })).toBeDisabled()
    expect(saves[1]!.threeNetPingTaskIds).toBe('[20,30]')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/three-net-settings-${mobile ? 'mobile' : 'desktop'}.png` })
    options.loggedIn = false
    await dialog.getByRole('checkbox', { name: '三网新版样式', exact: true }).uncheck()
    await dialog.getByRole('button', { name: '保存配置', exact: true }).click()
    await expect(dialog.getByText('登录状态已过期，请先登录管理员账号。', { exact: true })).toBeVisible()
    expect(saves).toHaveLength(2)
  })
}

test('guest has no theme settings entry', async ({ page }) => {
  await installKomariFixture(page, { hideEarth: true, threeNetPing: true, loggedIn: false })
  await page.goto('/')
  await expect(page.locator('.node-card')).toHaveCount(12)
  await expect(page.getByRole('button', { name: '按服务器配置 Ping 任务', exact: true })).toHaveCount(0)
})

for (const scope of ['node', 'global'] as const) {
  for (const catalog of ['normal', 'empty', 'error'] as const) {
    test(`unavailable Ping selections can be removed and saved: ${scope}, ${catalog} catalog`, async ({ page }) => {
      await page.setViewportSize({ width: scope === 'global' ? 390 : 1280, height: 844 })
      const options = {
        hideEarth: true,
        pingTaskOrdering: true,
        threeNetPing: true,
        loggedIn: true,
        threeNetTaskIds: '[30,7,10]',
        threeNetNodeBindings: JSON.stringify({ [UUID]: [30, 7, 10], [OTHER]: [20], [HIDDEN]: [7] }),
        themeSettingsOverrides: {} as Record<string, unknown>,
      }
      await installKomariFixture(page, options)
      if (catalog !== 'normal') {
        await page.route('**/rpc2', async (route) => {
          const payload = route.request().postDataJSON()
          if (payload.method !== 'public:getPublicPingTasks')
            return route.fallback()
          await route.fulfill({ json: {
            jsonrpc: '2.0',
            id: payload.id,
            ...(catalog === 'empty' ? { result: [] } : { error: { code: -32601, message: 'Catalog unavailable' } }),
          } })
        })
      }
      const saves: Record<string, unknown>[] = []
      await page.route('**/api/admin/theme/settings?theme=*', async (route) => {
        const body = route.request().postDataJSON()
        saves.push(body)
        options.themeSettingsOverrides = body
        await route.fulfill({ status: 204 })
      })
      await page.goto('/')
      await page.getByRole('button', { name: '按服务器配置 Ping 任务', exact: true }).click()
      const dialog = page.getByRole('dialog')
      if (scope === 'global')
        await dialog.getByRole('button', { name: '全局任务', exact: true }).click()
      const remove = dialog.getByRole('button', { name: '移除任务 ID 7', exact: true })
      await expect(remove).toBeVisible()
      // Neither failed/empty catalogs nor searching should silently change saved selections.
      await expect(dialog.getByRole('button', { name: '配置已保存', exact: true })).toBeDisabled()
      await dialog.getByPlaceholder('搜索 Ping 任务名称或 ID').fill('no-matching-task')
      await expect(remove).toBeVisible()
      if (catalog === 'normal') {
        await remove.scrollIntoViewIfNeeded()
        await page.screenshot({ path: `test-results/issue-62-${scope}.png` })
      }
      await remove.click()
      await expect(remove).toHaveCount(0)
      await dialog.getByPlaceholder('搜索 Ping 任务名称或 ID').fill('')
      if (catalog === 'normal') {
        await expect(dialog.getByRole('button', { name: '移除任务 ID 30', exact: true })).toHaveCount(0)
        await dialog.getByRole('checkbox', { name: '浙江电信' }).check()
      }
      else {
        await dialog.getByRole('button', { name: '移除任务 ID 30', exact: true }).click()
        await dialog.getByRole('button', { name: '移除任务 ID 10', exact: true }).click()
      }
      await dialog.getByRole('button', { name: '保存配置', exact: true }).click()
      await expect(dialog.getByRole('button', { name: '配置已保存', exact: true })).toBeDisabled()
      expect(saves).toHaveLength(1)
      const next = catalog === 'normal' ? [30, 10, 20] : []
      const bindings = JSON.parse(saves[0]!.threeNetPingNodeTaskBindings as string)
      expect(bindings[OTHER]).toEqual([20])
      expect(bindings[HIDDEN]).toEqual([7])
      if (scope === 'node') {
        expect(bindings[UUID]).toEqual(next.length ? next : undefined)
        expect(saves[0]!.threeNetPingTaskIds).toBe('[30,7,10]')
      }
      else {
        expect(bindings[UUID]).toEqual([30, 7, 10])
        expect(JSON.parse(saves[0]!.threeNetPingTaskIds as string)).toEqual(next)
      }
      await expect(dialog.getByRole('button', { name: '移除任务 ID 7', exact: true })).toHaveCount(0)
    })
  }
}
