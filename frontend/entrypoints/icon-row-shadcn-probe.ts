import { createApp, type App } from 'vue'
import IconRowShadcnProbe from '../src/islands/IconRowShadcnProbe.vue'
import '../src/styles/icon-row-shadcn-probe.css'

interface ProbeConfig {
  sectionId: string
  label: string
  placeholder: string
  defaultValue: string
  disabled: boolean
  helpText: string
}

type ProbeRoot = HTMLElement & {
  __iconRowShadcnProbeApp?: App<Element>
}

function readConfig(root: HTMLElement): ProbeConfig | null {
  const container = root.closest('[data-icon-row-shadcn-probe-shell]')
  const source = container?.querySelector<HTMLScriptElement>('[data-icon-row-shadcn-probe-config]')

  if (!source?.textContent) {
    return null
  }

  try {
    return JSON.parse(source.textContent) as ProbeConfig
  } catch (error) {
    console.warn('Failed to parse icon-row shadcn probe config', error)
    return null
  }
}

function mountProbe(root: ProbeRoot) {
  const config = readConfig(root)

  if (!config) {
    return
  }

  root.__iconRowShadcnProbeApp?.unmount()
  root.__iconRowShadcnProbeApp = createApp(IconRowShadcnProbe, { config })
  root.__iconRowShadcnProbeApp.mount(root)
}

function mountAllProbes(scope: ParentNode = document) {
  const roots = scope.querySelectorAll<ProbeRoot>('[data-icon-row-shadcn-probe]')

  roots.forEach(mountProbe)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountAllProbes())
} else {
  mountAllProbes()
}

document.addEventListener('shopify:section:load', (event) => {
  const section = event.target instanceof HTMLElement ? event.target : document

  mountAllProbes(section)
})
