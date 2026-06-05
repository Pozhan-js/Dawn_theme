# Use shadcn-vue as Local Component Probes

shadcn-vue components should be introduced as local **Component Integration Probes** or narrowly scoped **Vue Islands**, not as a global replacement for Dawn's theme UI system. **Liquid Sections** remain the merchant-configurable structure and schema boundary, frontend code consumes explicit **Liquid Configuration Payloads**, and shadcn/Tailwind styles must remain **Tailwind Island Styling** without overriding Dawn-owned **Theme Base Styling**.
