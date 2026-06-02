# Vue Nest POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal proof of concept showing Vue 3 mounted inside a Shopify Liquid section and loading data from a Nest backend API.

**Architecture:** Liquid owns the storefront insertion point and theme editor schema. Vue 3 is compiled by Vite into stable theme assets and mounts only inside elements marked with `data-vue-nest-poc`. Nest runs as a local API server with CORS enabled and returns mock data for the Vue island.

**Tech Stack:** Shopify Liquid section, Vue 3, Vite, TypeScript, NestJS.

---

### Task 1: Scaffolded Project Scripts And Build Config

**Files:**
- Modify: `frontend/vite.config.ts`
- Use: `frontend/package.json`
- Use: `backend/package.json`

- [x] Keep the generated Vue and Nest scaffold projects.
- [x] Configure Vite to emit `../assets/vue-nest-poc.js` and `../assets/vue-nest-poc.css`.
- [x] Use scaffold-native build scripts from `frontend/` and `backend/`.

### Task 2: Nest Mock API

**Files:**
- Modify: `backend/src/main.ts`
- Modify: `backend/src/app.controller.ts`
- Modify: `backend/src/app.service.ts`
- Modify: `backend/src/app.controller.spec.ts`
- Modify: `backend/test/app.e2e-spec.ts`

- [x] Start Nest on `process.env.PORT || 4000`.
- [x] Enable CORS for storefront preview requests.
- [x] Return mock items from `GET /api/vue-nest-poc`.

### Task 3: Vue Island

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/main.ts`
- Modify: `frontend/src/assets/main.css`

- [x] Mount Vue on every `[data-vue-nest-poc]` element.
- [x] Read API URL from `data-api-url`.
- [x] Render loading, success, empty, and error states.

### Task 4: Liquid Section

**Files:**
- Create: `sections/vue-nest-poc.liquid`

- [x] Output the Vue mount element with configurable title and API URL.
- [x] Load `vue-nest-poc.css` and `vue-nest-poc.js` from theme assets.
- [x] Keep schema small and merchant-editable.

### Task 5: Verification

- [x] Run `npm install` in `frontend/`.
- [x] Run `npm run build` in `frontend/`.
- [x] Run `npm run build` in `backend/`.
- [x] Run `npm test -- --runInBand` in `backend/`.
- [x] Run `npm run test:e2e -- --runInBand` in `backend/`.
- [x] Validate the Liquid section with the Shopify Liquid validation helper.
- [ ] Optionally run `npm run dev:backend` and `shopify theme dev` for manual browser verification.
