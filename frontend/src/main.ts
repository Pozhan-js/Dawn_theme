import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

const defaultApiUrl = 'http://localhost:4000/api/vue-nest-poc'
const defaultHeading = 'Vue 已挂载到 Liquid 区块'

function readSourceData(root: HTMLElement) {
  const sourceNode = root.parentElement?.querySelector<HTMLScriptElement>('[data-vue-nest-poc-source]')

  if (!sourceNode?.textContent) {
    return null
  }

  try {
    return JSON.parse(sourceNode.textContent)
  } catch (error) {
    console.warn('Failed to parse Vue Nest POC source data', error)
    return null
  }
}

function mountVueNestPoc(root: HTMLElement) {
  if (root.dataset.vueNestPocMounted === 'true') {
    return
  }

  createApp(App, {
    apiUrl: root.dataset.apiUrl || defaultApiUrl,
    heading: root.dataset.heading || defaultHeading,
    sourceData: readSourceData(root),
  }).mount(root)

  root.dataset.vueNestPocMounted = 'true'
}

function mountAllVueNestPocRoots() {
  const roots = document.querySelectorAll<HTMLElement>('[data-vue-nest-poc]')

  if (roots.length === 0) {
    const devRoot = document.getElementById('app')

    if (devRoot) {
      mountVueNestPoc(devRoot)
    }

    return
  }

  roots.forEach(mountVueNestPoc)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAllVueNestPocRoots)
} else {
  mountAllVueNestPocRoots()
}

document.addEventListener('shopify:section:load', mountAllVueNestPocRoots)
