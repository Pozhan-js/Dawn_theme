import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import shopify from 'vite-plugin-shopify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    shopify({
      themeRoot: '../',
      sourceCodeDir: '.',
      entrypointsDir: 'entrypoints',
      snippetFile: 'vite-tag.liquid',
    }),
    vue(),
    vueDevTools(),
  ],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
