# Shopify Theme + Vite 提效技术方案

## 1. 背景

当前项目是 Shopify Dawn / Online Store 2.0 主题导出，核心代码仍然遵循 Shopify 主题的标准目录结构：

- `layout/`：全局页面壳，例如 `theme.liquid`
- `templates/`：页面模板，例如首页、商品页、集合页
- `sections/`：可在主题编辑器中配置的页面区块
- `snippets/`：可复用 Liquid 片段
- `assets/`：主题静态资源
- `config/`：主题配置与 schema
- `locales/`：多语言文案

开发者已经熟悉 React/Vue，但直接编写 Liquid 效率较低。因此本方案的目标不是把 Dawn 改造成 React/Vue 单页应用，而是引入 Vite 管理现代前端资产，让 Liquid 继续负责 Shopify 渲染边界。

## 2. 目标

本方案要解决的问题：

- 提升 CSS、JavaScript、TypeScript 和 Tailwind 驱动样式的开发效率。
- 保留 Dawn 的主题结构、主题编辑器能力、SEO 与 Shopify 原生对象渲染能力。
- 降低直接手写大量 Liquid 的心智负担。
- 让复杂交互可以用接近 React/Vue 的组件化方式组织。
- 保持最终产物仍然是标准 Shopify Theme，可以通过 Shopify CLI 开发、检查和发布。

本方案不追求：

- 不把整个主题改成 React/Vue SPA。
- 不引入 Headless Shopify 架构。
- 不绕过 Shopify 的 `sections`、`snippets`、`templates`、`schema` 机制。
- 不在第一阶段大规模重构 Dawn 原有资产。

## 3. 核心结论

推荐采用：

```txt
Liquid 负责结构、数据、SEO、主题编辑器 schema
Vite 负责 TS/JS、Tailwind/CSS、模块化开发、HMR、生产构建
复杂交互默认使用小型 TS controller，必要时使用 Vue Island
```

也就是：

```txt
Shopify Theme = 服务端渲染主体
Vite = 前端资产构建工具
Vue Island = 可选的局部复杂交互增强手段
```

## 4. 技术选型

### 4.1 使用 vite-plugin-shopify

插件：`vite-plugin-shopify`

安装命令：

```bash
npm i -D vite vite-plugin-shopify
```

推荐同时安装：

```bash
npm i -D typescript tailwindcss @tailwindcss/vite
```

`vite-plugin-shopify` 的关键能力：

- 自动识别前端入口文件。
- 生成 `snippets/vite-tag.liquid`。
- 开发环境从 Vite dev server 加载资源，并支持热更新。
- 生产构建后将资源输出到 Shopify 主题可识别的静态资产中。
- 通过 `vite-tag` snippet 在 Liquid 中加载对应入口资源。

参考资料：

- [vite-plugin-shopify npm](https://www.npmjs.com/package/vite-plugin-shopify)
- [Shopify Vite / Volt 文档](https://shopify-vite.barrelny.com/)

### 4.2 推荐不用 Vue 全面接管主题

Vue 适合用于局部高交互模块，例如：

- 产品定制器
- 尺寸推荐器
- Bundle 配置器
- Quiz / Finder
- 复杂筛选器
- 需要大量本地状态的营销模块

不建议用于：

- Header / Footer
- 商品卡片基础渲染
- 集合页基础列表
- 价格、库存、变体基础输出
- SEO 关键内容
- 可由 Shopify section schema 直接管理的简单内容区块

原因是这些内容更依赖 Shopify 原生对象、主题编辑器、SEO 和缓存机制，用 Liquid 更稳。

## 5. 推荐目录结构

保留 Shopify 原目录：

```txt
layout/
templates/
sections/
snippets/
assets/
config/
locales/
```

新增 Vite 前端源码层。当前 POC 使用 Vue 脚手架，因此 Vite 配置位于 `frontend/` 内：

```txt
frontend/
  entrypoints/
    vue-nest-poc.ts
  src/
    App.vue
    main.ts
    assets/
      main.css
  vite.config.ts
  package.json
```

约定：

- `frontend/entrypoints/` 只放会被 Liquid 直接加载的入口文件。
- `frontend/src/` 放 Vue Island 的源码。
- `frontend/src/assets/main.css` 作为 Tailwind v4 入口，并保留少量 Shopify 外壳样式。
- `assets/` 仍然保留 Dawn 原有资源和 Vite 构建产物。
- 不新增 `src/pages`、`src/router`、`app/` 这类应用型目录，除非明确转向 Headless 或 App 架构。

## 6. Vite 配置建议

当前 POC 的配置位于 `frontend/vite.config.ts`：

```js
import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: '../',
      sourceCodeDir: '.',
      entrypointsDir: 'entrypoints',
      snippetFile: 'vite-tag.liquid',
    }),
    tailwindcss(),
    vue(),
  ]
})
```

说明：

- `themeRoot: '../'`：Vite 从 `frontend/` 内运行，主题根目录在上一级。
- `sourceCodeDir: '.'`：前端源码根就是当前 `frontend/`。
- `entrypointsDir: 'entrypoints'`：入口文件统一放在 `frontend/entrypoints/`。
- `snippetFile: 'vite-tag.liquid'`：插件生成 `snippets/vite-tag.liquid`。
- `tailwindcss()`：使用 Tailwind CSS v4 的 Vite 插件。

## 7. Liquid 中的资源加载方式

在特定 section 中加载模块级资源，例如当前 Vue POC section：

```liquid
{% render 'vite-tag', entry: 'vue-nest-poc.ts' %}
```

约定：

- 全站都需要的行为才放到全局入口。
- 只有某个 section 需要的交互放到该 section 对应入口。
- Vue Island 的 Tailwind 样式随入口一起打包。
- 避免把所有页面逻辑都塞进一个巨大的 `theme.ts`。

## 8. package.json 脚本建议

当前主题根目录已新增轻量 `package.json`，作为主题工作流命令入口；`frontend/` 仍保留自己的脚手架依赖和构建命令，`backend/` 不纳入主题命令。

```json
{
  "scripts": {
    "dev:theme": "shopify theme dev",
    "dev:frontend": "npm --prefix frontend run dev",
    "build:frontend": "npm --prefix frontend run build",
    "check:theme": "shopify theme check"
  },
  "devDependencies": {}
}
```

日常开发：

```bash
npm run dev:theme
npm run dev:frontend
```

上线前检查：

```bash
npm run build:frontend
npm run check:theme
npm run check
shopify theme push --unpublished
```

## 9. React/Vue 开发者的 Liquid 对照模型

| React/Vue 概念 | Shopify Theme 对应概念 |
| --- | --- |
| Component | `section` / `snippet` / `block` |
| Props | `render` 参数 / `section.settings` / `block.settings` |
| Slot | `blocks` / `content_for` |
| Computed | `assign` / `capture` / filter |
| Conditional render | `if` / `unless` / `case` |
| List render | `for` / `paginate` |
| Local state | TypeScript controller / Web Component |
| API data | Shopify objects / metafields / metaobjects |
| Global store | 尽量避免；必要时放在轻量 JS module 中 |

建议心智模型：

```txt
Liquid 不是低配 React
Liquid 是 Shopify 的服务端模板层
TS/SCSS 才是现代前端工程层
```

## 10. 组件开发模式

### 10.1 简单内容模块

适合 Liquid：

- Banner
- 富文本区块
- 图片 + 文案
- 商品推荐列表
- FAQ
- Newsletter

推荐结构：

```txt
sections/brand-story.liquid
```

如果样式简单，可以继续使用 Dawn 原有 CSS 组织方式。

### 10.2 中等交互模块

适合 Liquid + TS controller：

```txt
sections/product-recommendation-tabs.liquid
frontend/entrypoints/product-recommendation-tabs.ts
frontend/entrypoints/product-recommendation-tabs.scss
frontend/components/product-recommendation-tabs.ts
```

Liquid 负责输出：

```liquid
<product-recommendation-tabs data-section-id="{{ section.id }}">
  ...
</product-recommendation-tabs>
```

TypeScript 负责：

```ts
class ProductRecommendationTabs extends HTMLElement {
  connectedCallback() {
    // 初始化事件、状态和 DOM 行为
  }
}

customElements.define('product-recommendation-tabs', ProductRecommendationTabs)
```

### 10.3 高复杂交互模块

适合 React/Vue 岛屿组件：

```txt
sections/size-finder.liquid
frontend/entrypoints/size-finder.tsx
frontend/components/SizeFinder.tsx
```

Liquid 只输出挂载点和初始数据：

```liquid
<div
  id="size-finder-{{ section.id }}"
  data-product-id="{{ product.id }}"
  data-product-handle="{{ product.handle }}"
></div>
```

React/Vue 只接管这个局部容器，不接管整页。

## 11. Liquid 编写规则

为了减少 Liquid 出错，团队内建议固定以下规则：

- `snippets/` 中的片段尽量只接收明确参数，不依赖隐式全局变量。
- 使用 `{% render 'snippet', product: product %}`，避免在 snippet 中猜变量来源。
- 复杂条件不要写成一行，Liquid 不支持 JavaScript 式括号条件和三元表达式。
- 超过 50 个对象的列表要考虑 `{% paginate %}`。
- 样式动态值优先用 CSS 变量承接，例如 `--section-gap: {{ section.settings.gap }}px`。
- 多语言文案放进 `locales/`，使用 `{{ 'key' | t }}`。
- 保留 `{{ block.shopify_attributes }}`，保证主题编辑器拖拽和定位能力。
- 修改 section schema 时保持字段命名稳定，避免破坏商家已有配置。

## 12. 分阶段落地计划

### 阶段 1：接入 Vite，但不重构主题

目标：

- 新增 `package.json`
- 新增 `vite.config.mjs`
- 新增 `frontend/entrypoints/theme.ts`
- 新增 `frontend/entrypoints/theme.scss`
- 生成或确认 `snippets/vite-tag.liquid`
- 在 `layout/theme.liquid` 加载全局入口

验收：

- `npm run dev` 能同时启动 Vite 和 Shopify CLI。
- 修改 `theme.ts` 或 `theme.scss` 能在预览中生效。
- `npm run build` 能输出可被 Shopify 主题加载的资产。
- `shopify theme check` 无新增严重错误。

### 阶段 2：新功能统一使用 Vite 三件套

目标：

每个复杂模块采用：

```txt
sections/example.liquid
frontend/entrypoints/example.ts
frontend/entrypoints/example.scss
```

验收：

- 新模块 Liquid 只负责结构、数据和 schema。
- 交互逻辑在 TS 中实现。
- 样式在 SCSS 中实现。
- 页面只加载自己需要的入口资源。

### 阶段 3：逐步迁移高复杂交互

目标：

- 将已有复杂 JS 拆成 TS component。
- 对少量高交互模块引入 React/Vue 岛屿组件。
- 不重写低交互 Dawn 原生模块。

验收：

- 首屏 SEO 内容仍由 Liquid 输出。
- React/Vue 只局部挂载。
- 不引入全站路由。
- 不破坏主题编辑器配置能力。

### 阶段 4：团队规范固化

目标：

- 将 Vite 开发方式写入 `AGENTS.md` 或团队开发文档。
- 固定模块命名、入口命名、验证命令。
- 统一 PR 验收清单。

验收：

- 新成员能按文档新增 section + TS + SCSS。
- Codex 或其他 Agent 能按同一规则改主题。
- 每次上线前都有稳定检查命令。

## 13. 验收清单

每次涉及主题行为或前端资产变更时，至少检查：

- `npm run build`
- `shopify theme check`
- 首页桌面端与移动端
- 商品页桌面端与移动端
- 集合页桌面端与移动端
- 购物车或 cart drawer
- 主题编辑器中被修改 section 的配置保存能力
- 多语言文案是否仍然来自 `locales/`
- 构建产物是否能通过 Shopify CDN 正常加载

如果改动包含 React/Vue 岛屿组件，还要额外检查：

- 禁用 JavaScript 时核心商品信息仍可见。
- 初始化失败时页面不会白屏。
- 页面上多个相同 section 实例不会互相污染状态。
- 卸载或主题编辑器重载 section 时不会重复绑定事件。

## 14. 风险与规避

### 风险 1：把主题改成 SPA

规避：

- React/Vue 只做局部岛屿。
- 商品标题、价格、描述、SEO 关键内容仍由 Liquid 输出。
- 不引入客户端路由。

### 风险 2：构建产物和 Shopify 后台同步混乱

规避：

- 明确 `frontend/` 是源码，`assets/` 中的构建结果是主题运行资产。
- 上线前统一执行 `npm run build`。
- 如果使用 GitHub 集成，需要额外约定构建产物是否提交。

### 风险 3：主题编辑器失效

规避：

- section/block schema 保持稳定。
- block 外层保留 `{{ block.shopify_attributes }}`。
- JS 初始化要兼容 Shopify Theme Editor 的 section reload 事件。

### 风险 4：页面加载过多入口

规避：

- 全局入口只放全站共享逻辑。
- 页面级和模块级逻辑拆成独立 entrypoint。
- 在具体 section 或模板中按需 `render 'vite-tag'`。

## 15. 推荐执行顺序

优先级从高到低：

1. 接入 Vite 基础设施。
2. 将新增样式和脚本放入 `frontend/`。
3. 新增复杂模块时采用 `section + TS controller + SCSS`。
4. 只在确实有复杂状态时引入 React/Vue 岛屿。
5. 将最终约定同步到 `AGENTS.md` 或团队开发文档。

## 16. 最终原则

这套方案的价值不是让 Shopify Theme 看起来像 React/Vue 项目，而是让熟悉 React/Vue 的开发者在不破坏 Shopify 原生能力的前提下，获得现代前端工程体验。

最终边界应保持清晰：

```txt
Liquid 管 Shopify
Vite 管前端资产
TypeScript 管交互
SCSS 管样式组织
React/Vue 只在必要时管局部复杂状态
```
