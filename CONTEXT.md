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

**TS Controller**:
A lightweight TypeScript module that enhances Liquid-rendered markup with simple DOM behavior.
_Avoid_: Vue island, component app

**Liquid Section**:
A merchant-configurable Shopify theme section rendered by Liquid.
_Avoid_: Vue section, app block

**Tailwind Island Styling**:
Utility-class styling applied within frontend-built islands or new frontend modules.
_Avoid_: Dawn CSS replacement, global theme restyle

**External Service Layer**:
Backend or Shopify App code that runs outside the Shopify theme runtime.
_Avoid_: Theme backend, Liquid backend

## Relationships

- A **Theme Repository** produces one **Theme Runtime Layer**.
- A **Theme Repository** may contain one **Frontend Source Layer**.
- A **Vue Island** belongs to the **Frontend Source Layer** and renders inside the **Theme Runtime Layer**.
- A **Liquid Section** should remain Liquid-first unless its behavior requires a **Vue Island**.
- A **TS Controller** enhances a **Liquid Section** when the interaction is simple and local to the DOM.
- **Tailwind Island Styling** is scoped to **Vue Island** or new frontend-built modules.
- An **External Service Layer** is separate from the **Theme Runtime Layer**.

## Example dialogue

> **Dev:** "Should the Nest backend be uploaded with the Shopify theme?"
> **Domain expert:** "No — the **External Service Layer** is separate. The **Theme Runtime Layer** only uploads Shopify theme files and built assets."

> **Dev:** "Should every new section become a **Vue Island**?"
> **Domain expert:** "No — use a **Liquid Section** by default, add a **TS Controller** for simple interaction, and reserve **Vue Island** for complex stateful modules."

> **Dev:** "Should we rewrite Dawn's global styles with Tailwind?"
> **Domain expert:** "No — keep Dawn's existing style system and use **Tailwind Island Styling** for frontend-built islands."

## Flagged ambiguities

- "Vue project" can mean either **Frontend Source Layer** or **Vue Island** — resolved: use **Frontend Source Layer** for the source package and **Vue Island** for the mounted storefront component.
- "Backend project" is not part of the theme — resolved: use **External Service Layer**.
- "Interactive section" is too broad — resolved: distinguish **TS Controller** for simple DOM behavior from **Vue Island** for complex stateful behavior.
- "Using Tailwind" does not mean replacing Dawn CSS — resolved: use **Tailwind Island Styling** only for frontend-built islands and new modules.
