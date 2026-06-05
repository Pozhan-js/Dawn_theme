import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import shopify from 'vite-plugin-shopify'

const imageExtensions = new Set(['.apng', '.avif', '.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp'])
const fontExtensions = new Set(['.eot', '.otf', '.ttf', '.woff', '.woff2'])
const themeRoot = fileURLToPath(new URL('../', import.meta.url))
const themeAssetsDir = path.resolve(themeRoot, 'assets')

type ViteManifestEntry = {
  file?: string
  css?: string[]
  assets?: string[]
}

function cleanPreviousViteAssets() {
  const manifestPath = path.join(themeAssetsDir, '.vite/manifest.json')

  if (!fs.existsSync(manifestPath)) {
    return
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, ViteManifestEntry>
  const generatedFiles = new Set<string>()

  for (const entry of Object.values(manifest)) {
    if (entry.file) {
      generatedFiles.add(entry.file)
    }

    for (const cssFile of entry.css ?? []) {
      generatedFiles.add(cssFile)
    }

    for (const assetFile of entry.assets ?? []) {
      generatedFiles.add(assetFile)
    }
  }

  for (const file of generatedFiles) {
    const assetPath = path.resolve(themeAssetsDir, file)

    if (assetPath.startsWith(`${themeAssetsDir}${path.sep}`) && fs.existsSync(assetPath)) {
      fs.rmSync(assetPath, { force: true })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'clean-previous-shopify-vite-assets',
      apply: 'build',
      buildStart() {
        cleanPreviousViteAssets()
      },
    },
    shopify({
      themeRoot: '../',
      sourceCodeDir: '.',
      entrypointsDir: 'entrypoints',
      snippetFile: 'vite-tag.liquid',
    }),
    tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  publicDir: false,
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js-components-[name]-[hash].js',
        chunkFileNames: 'js-vendors-[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extension = assetInfo.name?.match(/\.[^.]+$/)?.[0]?.toLowerCase()

          if (extension === '.css') {
            return 'css-components-[name]-[hash][extname]'
          }

          if (extension && imageExtensions.has(extension)) {
            return 'images-[name]-[hash][extname]'
          }

          if (extension && fontExtensions.has(extension)) {
            return 'fonts-[name]-[hash][extname]'
          }

          return 'misc-[name]-[hash][extname]'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
