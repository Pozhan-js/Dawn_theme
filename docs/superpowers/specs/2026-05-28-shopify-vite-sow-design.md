# Shopify Dawn Theme Vite 工程化接入 SOW

## 1. 文档定位

本文档是面向内部开发团队和 Agent 的技术落地 SOW，用于把现有 Shopify Dawn 主题逐步接入 Vite 工程化开发方式。

本文档关注“如何执行、交付什么、如何验收、哪些边界不能越过”，不是对 Vite 或 Liquid 的泛泛介绍。背景技术方案见 `docs/shopify-vite-theme-development-plan.md`。

## 2. 项目背景

当前项目是 Shopify Dawn / Online Store 2.0 主题导出，已有标准主题目录：

- `layout/`
- `templates/`
- `sections/`
- `snippets/`
- `assets/`
- `config/`
- `locales/`

当前仓库已有 `AGENTS.md` 和 `docs/shopify-vite-theme-development-plan.md`，尚未接入 `package.json`、`vite.config.mjs`、`frontend/` 源码目录或 Vite 运行脚本。

目标开发者熟悉 React/Vue，希望减少直接手写 Liquid 的低效体验，但项目仍需保留 Shopify Theme 的原生能力，包括主题编辑器、Liquid 渲染、SEO、Shopify 对象、section schema 和 Shopify CLI 发布流程。

## 3. SOW 目标

本 SOW 的目标是建立一套可执行、可验收、可持续复用的 Shopify Theme 前端工程化方案：

- 使用 `vite-plugin-shopify` 接入 Vite。
- 建立 `frontend/` 源码目录和 entrypoint 规范。
- 让 TypeScript/SCSS 成为新增交互和样式的主要开发入口。
- 保留 Liquid 作为 Shopify 数据、结构、SEO 和主题编辑器 schema 的边界。
- 建立新模块的标准开发模式：`section + entrypoint + component/controller + scss`。
- 补齐基础质量工具，包括 Theme Check、Liquid Prettier、ESLint、Stylelint 和构建检查。
- 建立本地开发、构建、检查、人工验收的固定流程。

## 4. 非目标

本 SOW 明确不包含以下工作：

- 不把 Dawn 改造成 React/Vue 单页应用。
- 不转向 Headless Shopify、Hydrogen、Next.js 或 Nuxt 架构。
- 不替换 Shopify 的 `sections`、`snippets`、`templates`、`schema` 体系。
- 不在首轮迁移所有 Dawn 原有 CSS/JS。
- 不重写 Header、Footer、商品卡、集合列表等 Dawn 基础模块。
- 不处理 Shopify 后台商品、集合、菜单、支付、市场、多语言运营数据配置。
- 不引入重型 UI 组件库作为主题基础。
- 不把 Storybook 或完整视觉回归平台作为首轮强制交付。

## 5. 推荐执行方案

采用“标准工程化型”方案：

```txt
Liquid 负责 Shopify 数据、结构、SEO、section schema
Vite 负责前端资产构建、HMR、模块化和生产构建
TypeScript 负责局部交互
SCSS 负责新增样式组织
Web Components 或 TS controller 负责中等复杂度组件
React/Vue islands 只用于少量高复杂交互模块
```

该方案在开发效率和 Shopify 原生能力之间取平衡，不做过度架构改造。

## 6. 总体架构

### 6.1 保留主题根目录

继续保留 Dawn 的主题结构：

```txt
layout/
templates/
sections/
snippets/
assets/
config/
locales/
```

### 6.2 新增前端源码层

新增：

```txt
frontend/
  entrypoints/
    theme.ts
    theme.scss
    product.ts
    product.scss
    collection.ts
    collection.scss
  components/
  styles/
  utils/
```

约定：

- `frontend/entrypoints/` 只放会被 Liquid 直接加载的入口。
- `frontend/components/` 放可复用交互组件或 controller。
- `frontend/styles/` 放 SCSS 变量、基础样式和组件样式。
- `frontend/utils/` 放 DOM、事件、格式化等轻量工具。
- `assets/` 保留 Dawn 原资源和 Vite 构建后的主题资产。

### 6.3 Liquid 与 Vite 的连接点

使用 `vite-plugin-shopify` 生成或维护：

```txt
snippets/vite-tag.liquid
```

全局入口由 `layout/theme.liquid` 加载：

```liquid
{% liquid
  render 'vite-tag' with 'theme.scss'
  render 'vite-tag' with 'theme.ts'
%}
```

页面级或模块级入口由对应 section 或模板按需加载：

```liquid
{% liquid
  render 'vite-tag' with 'product.scss'
  render 'vite-tag' with 'product.ts'
%}
```

## 7. 阶段拆分

### 阶段 0：现状审计

目的：确认当前仓库具备接入条件，避免在未知状态下修改主题运行链路。

执行事项：

- 检查主题目录是否完整。
- 检查是否存在 `package.json`、`vite.config.*`、`frontend/`。
- 检查当前 Git 工作区状态，识别已有用户改动。
- 检查 `layout/theme.liquid` 的资源加载位置。
- 检查 `assets/` 中已有 CSS/JS 命名和 Dawn 原入口。
- 检查本机是否可运行 Shopify CLI。

交付物：

- 现状审计记录。
- 需要保护的已有改动清单。
- 首轮接入文件清单。

验收标准：

- 明确哪些文件会被修改。
- 明确哪些已有改动不能覆盖。
- 明确 Shopify CLI 是否可用。

### 阶段 1：Vite 基础设施接入

目的：让主题具备 Vite 开发和生产构建能力。

执行事项：

- 新增 `package.json`。
- 新增 `vite.config.mjs`。
- 安装 `vite`、`vite-plugin-shopify`、`typescript`、`sass`、`concurrently`。
- 新增 `frontend/entrypoints/theme.ts`。
- 新增 `frontend/entrypoints/theme.scss`。
- 生成或确认 `snippets/vite-tag.liquid`。
- 在 `layout/theme.liquid` 中加载 `theme.ts` 和 `theme.scss`。

建议脚本：

```json
{
  "scripts": {
    "dev:vite": "vite --host 0.0.0.0",
    "dev:shopify": "shopify theme dev",
    "dev": "concurrently -k \"npm:dev:vite\" \"npm:dev:shopify\"",
    "build": "vite build",
    "check": "shopify theme check"
  }
}
```

交付物：

- `package.json`
- `vite.config.mjs`
- `frontend/entrypoints/theme.ts`
- `frontend/entrypoints/theme.scss`
- `snippets/vite-tag.liquid`
- `layout/theme.liquid` 中的 Vite 全局入口加载

验收标准：

- `npm install` 成功。
- `npm run build` 成功。
- `npm run dev:vite` 能启动 Vite。
- `shopify theme dev` 可继续启动本地预览。
- 本地预览中能加载 Vite 入口资源。
- 修改 `theme.ts` 或 `theme.scss` 后开发预览能反映变化。

### 阶段 2：模块化开发规范

目的：让后续新增功能按固定模式开发，不再临时决定目录和加载方式。

新模块标准结构：

```txt
sections/example.liquid
frontend/entrypoints/example.ts
frontend/entrypoints/example.scss
frontend/components/example.ts
```

Liquid 职责：

- 输出 HTML 结构。
- 读取 Shopify 对象、metafield、section settings、block settings。
- 提供 SEO 关键内容。
- 保持 schema 可编辑。
- 输出必要的 `data-*` 初始数据。

TypeScript 职责：

- 初始化局部交互。
- 绑定事件。
- 管理局部状态。
- 处理 theme editor section reload。
- 防止重复初始化。

SCSS 职责：

- 管理新增模块样式。
- 使用局部 class 命名。
- 必要时通过 CSS 变量接收 Liquid 动态值。

交付物：

- 模块开发规范文档段落。
- 至少一个示例模块结构说明。
- 入口命名规范。
- controller 初始化规范。

验收标准：

- 新模块能被团队按同一结构复制。
- 页面只加载自己需要的 entrypoint。
- 全局入口不承载页面级复杂逻辑。

### 阶段 3：质量工具与格式化

目的：补齐 Liquid、TS、SCSS 的基础检查，减少运行时和上线前问题。

执行事项：

- 保留并使用 `shopify theme check`。
- 接入 `@shopify/prettier-plugin-liquid`。
- 接入 ESLint 和 TypeScript ESLint。
- 接入 Stylelint。
- 可选接入 `vite-plugin-checker`，让开发态暴露 TS/ESLint/Stylelint 问题。

建议命令：

```txt
npm run build
npm run check
npm run lint
npm run format
```

交付物：

- `.prettierrc` 或等价格式化配置。
- ESLint 配置。
- Stylelint 配置。
- `package.json` 检查脚本。

验收标准：

- Liquid 文件可格式化。
- TS 文件可 lint。
- SCSS/CSS 文件可 lint。
- `npm run build` 成功。
- `npm run check` 能运行 Theme Check。

### 阶段 4：关键页面验证

目的：确认 Vite 接入没有破坏 Dawn 主题关键流程。

人工验证页面：

- 首页
- 商品页
- 集合页
- 购物车页或 cart drawer
- 搜索页，如当前主题启用
- 主题编辑器中被修改的 section

视口：

- 桌面端
- 移动端

可选自动化：

- 使用 Playwright 打开关键页面。
- 截图保存到测试产物目录。
- 检查页面无控制台严重错误。
- 检查关键选择器存在。

交付物：

- 验收清单。
- 可选 Playwright 验证脚本。

验收标准：

- 关键页面无明显样式破坏。
- 商品信息、价格、变体选择、加入购物车流程可用。
- 主题编辑器配置可保存。
- 控制台无由新增 Vite 代码引起的阻断错误。

### 阶段 5：团队交付规范固化

目的：把工程化接入经验沉淀为后续开发的固定入口。

执行事项：

- 更新团队开发文档或 `AGENTS.md` 的相关规则。
- 固定新增模块的文件结构。
- 固定命令和验收清单。
- 固定 React/Vue islands 的准入规则。
- 固定构建产物是否提交到 Git 的策略。

交付物：

- 更新后的团队规范文档。
- Agent 执行约束。
- PR/交付验收清单。

验收标准：

- 新开发者可以按文档新增一个模块。
- Agent 可以按文档生成符合目录和命名规范的改动。
- 验收命令和人工检查点明确。

## 8. React/Vue Islands 准入规则

只有满足以下条件之一，才允许引入 React/Vue islands：

- 模块存在复杂本地状态。
- 模块有多步骤交互流程。
- 模块包含复杂表单、推荐器、配置器、quiz 或 bundle builder。
- 用 Web Components/TS controller 实现会显著增加复杂度。

React/Vue islands 必须遵守：

- 只挂载在局部容器。
- 不接管整页。
- 不引入客户端路由。
- SEO 关键内容仍由 Liquid 输出。
- 初始化失败时页面基础内容仍可见。

## 9. 样式策略

默认策略：

- 继续尊重 Dawn 原有 CSS。
- 新模块样式优先放在 `frontend/entrypoints/*.scss` 或 `frontend/styles/`。
- 不在第一阶段大规模迁移旧 CSS。
- 不把 Tailwind 作为默认强制依赖。

如后续引入 Tailwind：

- 只用于新增模块或局部页面。
- 需要明确 class 命名和 reset 冲突边界。
- 需要验证 Dawn 原组件样式没有被覆盖。

## 10. 构建产物策略

实施前必须明确：

- Vite 构建产物输出到哪里。
- `assets/` 中哪些文件由 Vite 生成。
- 构建产物是否提交到 Git。
- Shopify CLI push 前是否必须执行 `npm run build`。

推荐策略：

- 如果部署链路只依赖本地 `shopify theme push`，构建产物应在 push 前生成。
- 如果主题通过 GitHub 集成自动部署，需要确认 Shopify 是否能获得构建产物；否则应提交必要构建产物或建立 CI 构建流程。

## 11. 风险清单

| 风险 | 影响 | 规避方式 |
| --- | --- | --- |
| Vite 资源未加载 | 页面缺失样式或交互 | 验证 `vite-tag`、入口名和本地预览网络请求 |
| 修改 `theme.liquid` 破坏原资源 | 全站异常 | 只追加 Vite 入口，不删除 Dawn 原资源 |
| Theme Editor reload 重复初始化 | 事件重复绑定 | controller 加初始化标记并监听 section unload/load |
| React/Vue 过度使用 | 主题复杂度上升 | 通过 islands 准入规则限制 |
| Tailwind 与 Dawn CSS 冲突 | 样式回退 | Tailwind 非默认依赖，使用前单独评估 |
| 构建产物策略不清 | 发布后资源丢失 | 阶段 5 固化 Git/CI/push 策略 |
| 未提交用户改动被覆盖 | 丢失现有工作 | 阶段 0 记录并保护已有改动 |

## 12. 验收总清单

技术命令：

```bash
npm install
npm run build
npm run check
shopify theme dev
```

人工验证：

- 首页桌面端正常。
- 首页移动端正常。
- 商品页桌面端正常。
- 商品页移动端正常。
- 集合页桌面端正常。
- 集合页移动端正常。
- 购物车或 cart drawer 正常。
- 主题编辑器中修改过的 section 可以保存。
- 新增 Vite 入口资源在开发态和构建态均可加载。

代码审查：

- 没有把全站改成 SPA。
- 没有删除 Dawn 原有关键资源。
- 新模块遵循 `section + entrypoint + component/controller + scss`。
- Liquid 仍负责 Shopify 数据和 schema。
- TS 只负责局部交互。
- SCSS 没有大范围污染全局样式。

## 13. 交付物汇总

首轮工程化接入应交付：

- `package.json`
- `vite.config.mjs`
- `frontend/entrypoints/theme.ts`
- `frontend/entrypoints/theme.scss`
- `frontend/components/` 目录
- `frontend/styles/` 目录
- `frontend/utils/` 目录
- `snippets/vite-tag.liquid`
- `layout/theme.liquid` Vite 入口加载
- Liquid/TS/SCSS 质量工具配置
- 团队开发规范更新
- 验收清单

本 SOW 设计文档本身不执行上述文件改动；它用于约束后续实施计划和实施过程。

## 14. 实施顺序

推荐顺序：

1. 完成阶段 0 现状审计。
2. 完成阶段 1 Vite 基础设施接入。
3. 使用一个最小全局样式或控制台标记验证 Vite 生效。
4. 完成阶段 2 模块化开发规范。
5. 完成阶段 3 质量工具接入。
6. 完成阶段 4 关键页面验证。
7. 完成阶段 5 团队交付规范固化。

每个阶段完成后都应记录：

- 改了哪些文件。
- 跑了哪些命令。
- 通过了哪些验收。
- 遗留了哪些风险。

## 15. 后续计划入口

在本 SOW 获得确认后，下一步应编写实施计划。实施计划需要把本文档拆成可执行任务，包括每个任务的目标、文件范围、命令、验证方式和回滚策略。

实施计划不应扩大本文档范围；如果要引入 React/Vue islands、Tailwind、Storybook 或 CI，需要作为独立后续任务评估。
