# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- 文档作者与站点管理员：组织空间、编辑页面、编排目录并完成发版。
- 平台运营与运维人员：管理租户、安全、导入作业、审计与可观测性。
- 文档读者：通过站点域名读取已发版内容并搜索。
- 应用智能体：按授权发现、检索、读取和引用空间的线上内容。

## Product Purpose

Space 是多租户文档与知识交付平台。它把页面、目录和附件收束到空间生命周期中，
通过不可变发版冻结已校验内容，再由各站点整体切换线上版本。

## Positioning

Create and manage your content in one place, then deliver consistent, agent-ready knowledge wherever it’s needed.

同一套 Bundle 契约贯通持续导入、导出和不可变发版；authored 与 synced 来源模式明确声明
内容真相源，避免界面编辑与外部同步互相覆盖。

## Operating Context

维护者通过管理 API 和 CLI 操作；CI 使用 API 令牌持续导入；读者通过独立域名访问。
控制台以高信息密度、清晰状态和键盘可达性优先。

## Capabilities and Constraints

- 统一语言以 `CONTEXT.md` 为准；概念模型以各 `CONCEPT.md` 与 `syncs` 包 `SYNCS.md` 为准。
- 管理面必须契约先行，前后端同票开发，并由真实环境 Gherkin 端到端验收。
- 当前无客户标识、商业数据或可对外宣称的基准，不得在界面中虚构。

## Brand Commitments

- 产品名：Space。
- 产品名源于核心概念 Space（空间）；界面使用 `Space`，工程标识使用 `space`。空间表示内容归属与治理的单位。
- 品牌只使用英文 `Space`；锁立使用现有内容卡片标识加 `Space`，不使用 GitHub Mark。

## Product Principles

1. 一个入口必须完成一个可验证的端到端任务。
2. 读者与应用智能体按当前权限读取站点已生效的线上版本，草稿与内部状态不进入交付面。
3. 地址、权限与身份使用稳定边界，避免重组造成断链或权限漂移。
4. 错误必须可恢复、可追踪，危险动作必须明确确认。

## Accessibility & Inclusion

控制台保持键盘可操作、可见焦点、语义化状态提示和 WCAG AA 对比度。
