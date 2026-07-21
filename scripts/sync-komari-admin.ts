import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const projectRoot = resolve(import.meta.dirname, '..')
const sourceRoot = resolve(process.argv[2] || process.env.KOMARI_WEB_DIR || resolve(projectRoot, '..', 'komari-web'))
const sourceDist = resolve(sourceRoot, 'dist')
const targetDir = resolve(projectRoot, 'public', 'admin-app')
const overrideCss = resolve(projectRoot, 'scripts', 'assets', 'glass-admin.css')
const charsetMarker = '<meta charset="UTF-8" />'
const pwaManifestPattern = /<link[^>]+href="\/admin-app\/manifest\.webmanifest"[^>]*>/g
const pwaRegisterPattern = /<script[^>]+id="vite-plugin-pwa:register-sw"[^>]*><\/script>/g
const workboxFilenamePattern = /^workbox-[\w-]+\.js$/
const runtimeAssetPathRewrites = [
  ['/assets/flags/', '/admin-app/assets/flags/'],
  ['/assets/logo/', '/admin-app/assets/logo/'],
] as const
const runtimeAssetReferencePattern = /assets\/(?:flags|logo)\//g
const adminCssVersion = createHash('sha256').update(readFileSync(overrideCss)).digest('hex').slice(0, 12)

function rewriteRuntimeAssetPaths(directory: string): number {
  let replacements = 0

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      replacements += rewriteRuntimeAssetPaths(entryPath)
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.js'))
      continue

    const source = readFileSync(entryPath, 'utf8')
    let rewritten = source
    let fileReplacements = 0

    for (const [runtimePath, embeddedPath] of runtimeAssetPathRewrites) {
      const occurrences = rewritten.split(runtimePath).length - 1
      rewritten = rewritten.replaceAll(runtimePath, embeddedPath)
      fileReplacements += occurrences
    }

    if (fileReplacements === 0)
      continue

    writeFileSync(entryPath, rewritten)
    replacements += fileReplacements
  }

  return replacements
}

function countRuntimeAssetReferences(directory: string): number {
  let references = 0

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      references += countRuntimeAssetReferences(entryPath)
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.js'))
      continue

    references += readFileSync(entryPath, 'utf8').match(runtimeAssetReferencePattern)?.length ?? 0
  }

  return references
}

if (!existsSync(resolve(sourceRoot, 'package.json')))
  throw new Error(`komari-web source not found: ${sourceRoot}`)

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
execFileSync(npmCommand, ['run', 'build', '--', '--base=/admin-app/'], {
  cwd: sourceRoot,
  stdio: 'inherit',
})

rmSync(targetDir, { recursive: true, force: true })
cpSync(sourceDist, targetDir, { recursive: true })

const rewrittenRuntimeAssetPaths = rewriteRuntimeAssetPaths(targetDir)
const runtimeAssetReferences = countRuntimeAssetReferences(targetDir)
if (runtimeAssetReferences === 0)
  throw new Error('komari-web build output no longer contains runtime flag or OS logo asset references')

const indexPath = resolve(targetDir, 'index.html')
let html = readFileSync(indexPath, 'utf8')
if (!html.includes(charsetMarker))
  throw new Error('komari-web index.html no longer contains the expected charset marker')

const bridge = `<script>;(()=>{let t='';try{t=sessionStorage.getItem('komariOfficialAppRoute')||'';if(t)sessionStorage.removeItem('komariOfficialAppRoute')}catch(e){console.warn('[Glassmorphism] Session storage is unavailable.',e)}if(!t){try{t=new URL(location.href).searchParams.get('__komari_route')||''}catch{}}if(t&&/^\\/(admin|terminal|manage)(\\/|\\?|#|$)/.test(t))history.replaceState(null,'',t)})();</script><link rel="stylesheet" href="/admin-app/glass-admin.css?v=${adminCssVersion}">`
html = html.replace(charsetMarker, `${charsetMarker}${bridge}`)

// The official PWA only controls /admin-app/, while the bridge restores /admin and
// /terminal before React boots. Keeping that worker adds stale-cache risk without
// providing working offline navigation for the real routes.
html = html.replace(pwaRegisterPattern, '')
for (const filename of ['registerSW.js', 'sw.js'])
  rmSync(resolve(targetDir, filename), { force: true })
for (const filename of readdirSync(targetDir).filter(filename => workboxFilenamePattern.test(filename)))
  rmSync(resolve(targetDir, filename), { force: true })

if (!html.includes(`/admin-app/glass-admin.css?v=${adminCssVersion}`) || !html.includes('/admin-app/assets/'))
  throw new Error('komari-web build output is missing the admin bridge stylesheet or /admin-app/ asset base')

writeFileSync(indexPath, `${html.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()}\n`)
cpSync(overrideCss, resolve(targetDir, 'glass-admin.css'))

let commit = 'unknown'
try {
  commit = execFileSync('git', ['-c', `safe.directory=${sourceRoot}`, 'rev-parse', 'HEAD'], {
    cwd: sourceRoot,
    encoding: 'utf8',
  }).trim()
}
catch {}

writeFileSync(resolve(targetDir, 'komari-admin-source.json'), `${JSON.stringify({
  repository: 'https://github.com/komari-monitor/komari-web',
  commit,
  synced_at: new Date().toISOString(),
}, null, 2)}\n`)

console.log(`[sync-komari-admin] Synced complete admin app from ${sourceRoot} (${runtimeAssetReferences} runtime asset paths found, ${rewrittenRuntimeAssetPaths} rewritten)`)
