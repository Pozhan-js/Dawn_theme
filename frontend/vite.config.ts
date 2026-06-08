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
const themeSnippetsDir = path.resolve(themeRoot, 'snippets')
const viteTagSnippetPath = path.join(themeSnippetsDir, 'vite-tag.liquid')

type ViteManifestEntry = {
  file?: string
  css?: string[]
  assets?: string[]
  imports?: string[]
  isEntry?: boolean
  src?: string
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

function liquidAssetUrl(fileName: string) {
  return `'${fileName}' | asset_url | split: '?' | first`
}

function assetScriptTag(fileName: string) {
  return `<script src="{{ ${liquidAssetUrl(fileName)} }}" type="module" crossorigin="anonymous"></script>`
}

function assetPreloadTag(fileName: string) {
  return `<link rel="modulepreload" href="{{ ${liquidAssetUrl(fileName)} }}" crossorigin="anonymous">`
}

function assetStylesheetTag(fileName: string) {
  return `{{ ${liquidAssetUrl(fileName)} | stylesheet_tag: preload: preload_stylesheet }}`
}

function snippetFileNameForEntry(entryPath: string) {
  return `${path.basename(entryPath, path.extname(entryPath))}-vite-tag.liquid`
}

function generateEntrypointSnippets() {
  const manifestPath = path.join(themeAssetsDir, '.vite/manifest.json')

  if (!fs.existsSync(manifestPath)) {
    return
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, ViteManifestEntry>

  for (const [entryPath, entry] of Object.entries(manifest)) {
    if (entry.isEntry !== true || !entry.file) {
      continue
    }

    const lines = [
      '{% comment %}',
      '  IMPORTANT: This snippet is automatically generated from a Vite entrypoint.',
      '  Do not modify it directly; run the frontend build instead.',
      '{% endcomment %}',
      assetScriptTag(entry.file),
    ]

    for (const importName of entry.imports ?? []) {
      const importedEntry = manifest[importName]

      if (importedEntry?.file) {
        lines.push(assetPreloadTag(importedEntry.file))
      }

      for (const cssFile of importedEntry?.css ?? []) {
        lines.push(assetStylesheetTag(cssFile))
      }
    }

    for (const cssFile of entry.css ?? []) {
      lines.push(assetStylesheetTag(cssFile))
    }

    fs.writeFileSync(path.join(themeSnippetsDir, snippetFileNameForEntry(entryPath)), `${lines.join('\n')}\n`)
  }

  fs.rmSync(viteTagSnippetPath, { force: true })
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
    {
      name: 'generate-entrypoint-vite-snippets',
      enforce: 'post',
      apply: 'build',
      closeBundle() {
        generateEntrypointSnippets()
      },
    },
    tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  publicDir: false,
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extension = assetInfo.name?.match(/\.[^.]+$/)?.[0]?.toLowerCase()

          if (extension === '.css') {
            return '[name]-[hash][extname]'
          }

          if (extension && imageExtensions.has(extension)) {
            return '[name]-[hash][extname]'
          }

          if (extension && fontExtensions.has(extension)) {
            return '[name]-[hash][extname]'
          }

          return '[name]-[hash][extname]'
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
