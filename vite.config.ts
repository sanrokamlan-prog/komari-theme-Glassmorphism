import type { Plugin } from 'vite'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import vueDevTools from 'vite-plugin-vue-devtools'

const require = createRequire(import.meta.url)
const fs = require('node:fs')
const archiver = require('archiver')

interface ThemeManifest {
  preview?: unknown
  version?: unknown
}

const themeJsonPath = resolve(__dirname, 'komari-theme.json')

function readThemeManifest(): ThemeManifest {
  if (!existsSync(themeJsonPath))
    throw new Error('komari-theme.json not found')

  return JSON.parse(readFileSync(themeJsonPath, 'utf-8')) as ThemeManifest
}

function getThemeVersion(): string {
  const version = readThemeManifest().version

  if (typeof version !== 'string' || !version.trim())
    throw new TypeError('komari-theme.json does not contain a top-level string version field')

  return version.trim()
}

function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  }
  catch {
    return 'unknown'
  }
}

/**
 * Vite 插件：构建后打包 Komari 主题 Zip
 * theme.zip
 * ├── komari-theme.json
 * ├── preview.png
 * └── dist/
 */
function komariThemeZip(): Plugin {
  return {
    name: 'komari-theme-zip',
    apply: 'build',
    closeBundle: async () => {
      const commitHash = getCommitHash()
      const zipFileName = `komari-theme-Glassmorphism-build-${commitHash}.zip`
      const distDir = resolve(__dirname, 'dist')
      const previewPath = resolve(__dirname, 'docs/preview.png')
      const outputPath = resolve(__dirname, zipFileName)
      const themeManifest = readThemeManifest()
      const manifestPreviewName = typeof themeManifest.preview === 'string' && themeManifest.preview.trim()
        ? themeManifest.preview.trim()
        : 'preview.png'

      if (!existsSync(distDir)) {
        console.log('[komari-theme-zip] dist directory not found, skipping zip creation')
        return
      }

      const output = fs.createWriteStream(outputPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
          console.log(`[komari-theme-zip] Created ${zipFileName} (${sizeMB} MB)`)
          resolve(undefined)
        })

        archive.on('error', (err: Error) => {
          console.error('[komari-theme-zip] Error:', err)
          reject(err)
        })

        archive.pipe(output)

        archive.file(themeJsonPath, { name: 'komari-theme.json' })

        if (existsSync(previewPath)) {
          archive.file(previewPath, { name: 'preview.png' })
          if (manifestPreviewName !== 'preview.png') {
            archive.file(previewPath, { name: manifestPreviewName })
          }
        }

        archive.directory(distDir, 'dist')

        archive.finalize()
      })
    },
  }
}

export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(getThemeVersion()),
    __BUILD_GIT_HASH__: JSON.stringify(getCommitHash()),
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    komariThemeZip(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'echarts': ['echarts', 'vue-echarts'],
          'globe': ['globe.gl', 'three'],
          'reka-ui': ['reka-ui'],
          'vueuse': ['@vueuse/core'],
        },
      },
    },
  },
})
