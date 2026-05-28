# Repository Guidelines

## Project Structure & Module Organization

This repository is a Shopify Dawn / Online Store 2.0 theme export. Keep changes in the established folders:

- `layout/`: global page shells such as `theme.liquid` and `password.liquid`.
- `templates/`: JSON or Liquid page templates, including `index.json`, `product.json`, and `collection.json`.
- `sections/`: merchant-configurable sections such as `header.liquid`, `main-product.liquid`, and `featured-collection.liquid`.
- `snippets/`: reusable Liquid fragments rendered by sections, for example `price.liquid` and `card-product.liquid`.
- `assets/`: CSS, JavaScript, SVG, and image files used by the theme.
- `config/`: theme schema and saved settings.
- `locales/`: storefront and schema translations.

Do not introduce app-style source folders unless the theme build process is explicitly added.

## Build, Test, and Development Commands

This checkout has no `package.json`, Makefile, or committed CLI config. Use Shopify CLI from the root:

- `shopify theme dev`: starts a local preview against a connected Shopify store.
- `shopify theme check`: runs Shopify Theme Check for Liquid, JSON, and theme best-practice issues.
- `shopify theme pull`: syncs remote theme files into this checkout.
- `shopify theme push`: uploads local theme changes to the connected store.

Confirm the target store before pulling or pushing.

## Coding Style & Naming Conventions

Follow Dawn conventions. Use two-space indentation in Liquid, JSON, CSS, and JavaScript. Name files with lowercase kebab-case, for example `component-cart.css` or `main-product.liquid`. Keep section IDs, block types, schema keys, and translation keys stable unless a migration is intentional. Prefer scoped CSS in component or section assets over broad global overrides in `base.css`.

## Testing Guidelines

There is no automated test suite in this export. Before handing off changes, run `shopify theme check` and manually verify affected templates in `shopify theme dev`. For visual changes, check desktop and mobile widths. For product, cart, customer, and localization changes, test the actual storefront flow rather than only reviewing Liquid syntax.

## Commit & Pull Request Guidelines

This directory is not currently a Git repository, so no local commit history exists. If Git is initialized, use short imperative commit messages such as `Update product gallery spacing`. Pull requests should describe changed templates or sections, include screenshots for visual changes, mention the tested store or preview URL, and list validation commands run.

## Agent-Specific Instructions

Always respond in Chinese-simplified. When changing theme behavior, preserve Dawn's folder structure and merchant-editable schema unless the task explicitly requires a structural rewrite.
