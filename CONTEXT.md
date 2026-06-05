# Shopify Theme Development Context

This context defines the language for the Shopify theme development workflow in this repository. It keeps boundaries clear between the storefront theme, Vue-powered interactive islands, and external app or backend services.

## Language

**Theme Repository**:
A repository whose deployable product is a Shopify Online Store theme.
_Avoid_: App repository, storefront app

**Theme Runtime Layer**:
The Shopify files that can be uploaded to and rendered by Shopify.
_Avoid_: Full-stack app, web app

**Frontend Source Layer**:
Developer-owned source code used to build theme assets.
_Avoid_: Theme runtime files, upload target

**Vue Island**:
A Vue component mounted inside a specific Liquid-rendered storefront element.
_Avoid_: Vue app, SPA, full page app

**Component Integration Probe**:
A temporary Vue Island used to verify that a frontend component stack can be built into theme assets and configured from Liquid.
_Avoid_: Production feature, merchant workflow

**Probe Local State**:
Temporary browser state inside a Component Integration Probe that disappears on refresh and has no Shopify persistence.
_Avoid_: Customer data, merchant setting, submitted form value

**Liquid Configuration Payload**:
A JSON payload rendered by Liquid to pass merchant settings into a frontend-built island.
_Avoid_: Vue settings store, client schema source

**Section Instance Isolation**:
The expectation that each repeated Liquid Section on a page owns its own markup, configuration payload, and browser state.
_Avoid_: Global section singleton, shared probe state

**TS Controller**:
A lightweight TypeScript module that enhances Liquid-rendered markup with simple DOM behavior.
_Avoid_: Vue island, component app

**Liquid Section**:
A merchant-configurable Shopify theme section rendered by Liquid.
_Avoid_: Vue section, app block

**Tailwind Island Styling**:
Utility-class styling applied within frontend-built islands or new frontend modules.
_Avoid_: Dawn CSS replacement, global theme restyle

**Theme Base Styling**:
The existing Dawn-wide typography, layout, and element defaults that the Shopify theme already owns.
_Avoid_: Tailwind base layer, shadcn reset

**External Service Layer**:
Backend or Shopify App code that runs outside the Shopify theme runtime.
_Avoid_: Theme backend, Liquid backend

## Relationships

- A **Theme Repository** produces one **Theme Runtime Layer**.
- A **Theme Repository** may contain one **Frontend Source Layer**.
- A **Vue Island** belongs to the **Frontend Source Layer** and renders inside the **Theme Runtime Layer**.
- A **Component Integration Probe** may use a **Vue Island**, but it does not establish that all similar **Liquid Sections** should become Vue-powered.
- **Probe Local State** belongs only to a **Component Integration Probe** and must not be treated as Shopify data.
- A **Liquid Configuration Payload** is the source of truth for a **Vue Island** when merchant settings are needed in the browser.
- **Section Instance Isolation** applies to every **Liquid Section**, including Component Integration Probes rendered inside repeated sections.
- A **Liquid Section** should remain Liquid-first unless its behavior requires a **Vue Island**.
- A **TS Controller** enhances a **Liquid Section** when the interaction is simple and local to the DOM.
- **Tailwind Island Styling** is scoped to **Vue Island** or new frontend-built modules and must not replace **Theme Base Styling**.
- An **External Service Layer** is separate from the **Theme Runtime Layer**.

## Example dialogue

> **Dev:** "Should the Nest backend be uploaded with the Shopify theme?"
> **Domain expert:** "No — the **External Service Layer** is separate. The **Theme Runtime Layer** only uploads Shopify theme files and built assets."

> **Dev:** "Should every new section become a **Vue Island**?"
> **Domain expert:** "No — use a **Liquid Section** by default, add a **TS Controller** for simple interaction, and reserve **Vue Island** for complex stateful modules."

> **Dev:** "Can this shadcn-vue input prove that `icon-row` should be rebuilt in Vue?"
> **Domain expert:** "No — it is a **Component Integration Probe** until it represents a real merchant workflow."

> **Dev:** "Should the typed value from this input be saved to Shopify?"
> **Domain expert:** "No — it is **Probe Local State**, so it is only used to verify local Vue behavior."

> **Dev:** "Should Vue update section schema settings directly while editing?"
> **Domain expert:** "No — the **Liquid Configuration Payload** is refreshed when Shopify re-renders the section."

> **Dev:** "Can two `icon-row` sections share one input state?"
> **Domain expert:** "No — **Section Instance Isolation** means each section instance owns its own payload and probe state."

> **Dev:** "Should we rewrite Dawn's global styles with Tailwind?"
> **Domain expert:** "No — keep Dawn's existing style system and use **Tailwind Island Styling** for frontend-built islands."

> **Dev:** "Can a shadcn-vue probe load Tailwind base styles that change Dawn's body defaults?"
> **Domain expert:** "No — the probe may use **Tailwind Island Styling**, but **Theme Base Styling** remains owned by Dawn."

## Flagged ambiguities

- "Vue project" can mean either **Frontend Source Layer** or **Vue Island** — resolved: use **Frontend Source Layer** for the source package and **Vue Island** for the mounted storefront component.
- "Backend project" is not part of the theme — resolved: use **External Service Layer**.
- "Interactive section" is too broad — resolved: distinguish **TS Controller** for simple DOM behavior from **Vue Island** for complex stateful behavior.
- "Using Tailwind" does not mean replacing Dawn CSS — resolved: use **Tailwind Island Styling** only for frontend-built islands and new modules.
- "Technical validation component" can look like a production **Vue Island** — resolved: call it a **Component Integration Probe** until it supports a real merchant workflow.
- "Importing shadcn-vue styles" can unintentionally imply accepting global Tailwind resets — resolved: **Theme Base Styling** must remain owned by Dawn.
- "Input value" can imply submitted customer data — resolved: in a **Component Integration Probe**, it is only **Probe Local State**.
- "Passing schema to Vue" can imply client-side schema ownership — resolved: Liquid renders a **Liquid Configuration Payload**, and Vue only consumes it.
- "The `icon-row` section" can hide that multiple instances may exist on one page — resolved: enforce **Section Instance Isolation**.
