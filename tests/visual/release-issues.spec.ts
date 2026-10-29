import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { expect, test } from '@playwright/test'

const script = readFileSync('.github/workflows/resolve-released-issues.yml', 'utf8')
  .split('          script: |')[1]
  .split('\n')
  .map(line => line.replace(/^ {12}/, ''))
  .join('\n')

async function simulate(message: string, options: { duplicate?: boolean, badDigest?: boolean, failedCheck?: boolean, badTag?: boolean } = {}) {
  const comments: Array<{ issue_number: number, body: string }> = []
  const updates: Array<{ issue_number: number, state: string }> = []
  const sha = 'a'.repeat(40)
  const manifest = JSON.stringify({ version: '3.4.4' })
  const bytes = Buffer.from('verified archive fixture')
  const digest = createHash('sha256').update(bytes).digest('hex')
  const github = {
    rest: {
      repos: {
        getCommit: async () => ({ data: { commit: { message } } }),
        getContent: async () => ({ data: { content: Buffer.from(manifest).toString('base64') } }),
        getReleaseByTag: async () => ({ data: { html_url: 'https://example.com/release', assets: [{ name: 'komari-theme-Glassmorphism-build-aaaaaaa.zip', size: bytes.length, digest: `sha256:${options.badDigest ? 'bad' : digest}`, browser_download_url: 'https://example.com/theme.zip' }] } }),
      },
      git: { getRef: async () => ({ data: { object: { type: 'commit', sha: options.badTag ? 'wrong' : sha } } }) },
      actions: { listWorkflowRunsForRepo: 'runs' },
      issues: {
        get: async () => ({ data: { state: 'open' } }),
        listComments: 'comments',
        createComment: async (comment: { issue_number: number, body: string }) => comments.push(comment),
        update: async (update: { issue_number: number, state: string }) => updates.push(update),
      },
    },
    paginate: async (method: string) => method === 'runs'
      ? ['Code Quality', 'Visual Regression', 'Release On Version Bump'].map(name => ({ name, event: 'push', status: 'completed', conclusion: options.failedCheck ? 'failure' : 'success' }))
      : options.duplicate ? [{ user: { login: 'github-actions[bot]' }, body: '<!-- verified-release:v3.4.4:issue-64 -->' }] : [],
  }
  const modules: Record<string, unknown> = {
    'node:crypto': { createHash },
    'node:path': { join },
    'node:os': { tmpdir: () => '/tmp' },
    'node:fs': { mkdtempSync: () => '/tmp/theme-fixture', writeFileSync: () => {}, rmSync: () => {} },
    'node:child_process': { execFileSync: (_command: string, args: string[]) => args[0] === '-Z1' ? 'komari-theme.json\npreview.png\ndist/index.html' : manifest },
  }
  await runInNewContext(`(async () => {\n${script}\n})()`, {
    require: (name: string) => modules[name],
    Buffer,
    context: { repo: { owner: 'fixture', repo: 'fixture' }, payload: { workflow_run: { head_sha: sha } } },
    github,
    core: { info: () => {} },
    fetch: async () => ({ ok: true, arrayBuffer: async () => bytes }),
  })
  return { comments, updates }
}

test('release replies can request confirmation without closing that issue', async () => {
  const result = await simulate('Fix release\n\nRelease-Issues: #64\nVerify-Issues: #63\nIssue-Reply-63: 已修复定位代码缺陷，请验证实际 JP 城市变化。')
  expect(result.comments.map(comment => comment.issue_number)).toEqual([64, 63])
  expect(result.updates.map(update => update.issue_number)).toEqual([64])
  expect(result.comments[1].body).toContain('请验证实际 JP 城市变化')
  expect(result.comments[1].body).toContain('暂时保留本 issue')
})

test('verification-only trailers work and take precedence over closing', async () => {
  for (const message of ['Verify-Issues: #63', 'Release-Issues: #63\nVerify-Issues: #63']) {
    const result = await simulate(message)
    expect(result.comments).toHaveLength(1)
    expect(result.updates).toEqual([])
  }
})

test('release replies remain idempotent and require explicit trailers and successful checks', async () => {
  expect((await simulate('Release-Issues: #64', { duplicate: true })).comments).toEqual([])
  expect(await simulate('mentions #63 and #64')).toEqual({ comments: [], updates: [] })
  expect(await simulate('Release-Issues: #64\nVerify-Issues: #63', { failedCheck: true })).toEqual({ comments: [], updates: [] })
  for (const options of [{ badDigest: true }, { badTag: true }])
    await expect(simulate('Release-Issues: #64\nVerify-Issues: #63', options)).rejects.toThrow()
})
