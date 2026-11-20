# 产品需求 — Space

Space 让维护者在空间内统一管理内容，通过发版向人和应用智能体交付一致、受控、可追溯的知识。本文统一维护产品范围、验收口径和规格导航；架构理由见 [架构决策](../adr/README.md)，术语见 [CONTEXT](../../CONTEXT.md)。

## 文档边界

| 需要回答的问题 | 权威来源 |
| --- | --- |
| 为谁解决什么问题、范围和验收是什么 | 本文 |
| 为什么采用这些边界、替代过什么方案 | [架构决策](../adr/README.md) |
| 单概念的状态、动作和错误 | 下文索引的源码共置 `CONCEPT.md` |
| 跨概念如何组合、何时提交和补偿 | [组合根](../../backend/apps/control/src/main/java/io/space/control/compositions/SYNCS.md)及各 flow 的 `SYNCS.md` |
| HTTP 映射与交换包 | [HTTP 入口](../tech/API.md)、[Bundle v1](../tech/BUNDLE.md) |
| 接口精确字段及运行方式 | [生成契约](../../contracts/README.md)、[部署](../tech/DELIVERY.md)、[测试](../tech/TESTING.md) |

PRD 与 ADR 各维护一份。行为更新落在共置规格；接口字段以生成契约为准，界面映射不建立第二份领域模型。

## 用户与核心场景

平台运营员管理租户和运行状态；租户/站点管理员管理成员、授权与托管；作者和空间维护者创作或接收外部内容；CI 与维护智能体通过受限凭据执行任务；读者和消费智能体按当前权限读取线上内容。

| 场景 | 用户可确认的结果 |
| --- | --- |
| 开站 | 创建默认私有站点、挂载空间、核验域名；显式授权后可公开访问 |
| 导入发版 | 上传或一次性拉取文档包，完成适配、校验和漂移确认，观察各站实际交付结果 |
| 阅读 | 通过规范地址、目录、标签和搜索发现内容；人读页面与机器读取遵循同一线上版本和权限 |
| 创作 | 保存工作稿、处理基线冲突、取回历史修订；页面进版后按自动或手动流程构建发版 |
| 恢复 | 还原回收页、回滚内容主版本、恢复可重试作业；分别核验业务、交付与清理状态 |
| 重组治理 | 移动空间/页面、调整挂载与地址、收窄权限、终结资源；旧地址可追踪，已撤权内容不可继续读取 |

## 产品范围与不变量

| 领域 | 范围与约束 |
| --- | --- |
| 身份与租户 | 稳定的全局用户身份、租户隔离、成员邀请、用户组、管理/阅读会话、受限机器凭据；停用可逆，注销经确认后不可逆，最后所有者须先转移 |
| 内容组织 | 空间承担内容生命周期；分组最多 3 级，目录最多 7 级。目录只编排阅读，地址与权限使用稳定资源身份；附件随页 |
| 创作与修订 | 多格式页面、SEO/属性、标签、附件、软删和修订；保存使用乐观并发基线，取回修订产生新编辑 |
| 来源模式 | authored 接受界面创作、拒绝整体导入；synced 接受外部包，既有页面可紧急热修。热修保存即发版并形成漂移，下次覆盖须确认；不双向写回 |
| 发版 | published 是可收录标记；Release 是不可变内容快照。authored 默认自动发版，可关闭；空间至多一个主版本，归档保留按数量配置，默认 7 份 |
| 托管与地址 | 一个空间可挂载到多个站点；站点持空间 slug，空间持页面相对路径。页面及附件检查路径唯一与前缀冲突；改地址或迁移维护旧地址重定向 |
| 权限 | 站点/空间授权，页面仅收窄；新站默认私有。用户、用户组与机器主体按各自凭据规则判权；平台运营权限不隐式授予客户正文访问 |
| 阅读与搜索 | 只读已上线内容和当前权限；完整分页，不拼接不同版本。切版或权限集合变化要求重搜/重启读取；已有下载不能追溯撤回 |
| 交付与恢复 | 管理主版本选择与逐站上线分别确认。普通交付失败继续服务旧完整版本；安全收窄先建立屏障，恢复通过持久意图推进，重试预算按任务区分 |
| 运维 | 导入、交付、邮件、Webhook、清理和审计可追踪；查询故障不得伪装成空结果，受理不等于业务或交付完成；统计须标记采集缺口 |

导入、导出共用 Bundle v1；Bundle、华为云、OKF 及普通目录树由进程内适配器转换。公开 HTTPS 地址只做一次性拉取，平台不保存上游 PAT、不建立可重拉的来源配置、不定时同步；导入作业保存 sourceUrl 元数据供回显。作者搜索草稿使用管理列表过滤，站内搜索只检索线上发布内容。

## 限界上下文与概念索引（19 产品概念 / 4 上下文；20 平台概念）

上下文是部署与投资边界，不等同于运行进程。概念规格只描述自身行为；类型实例化、依赖与跨概念流程由组合层维护。

### IAM 身份与访问（通用域 · 能买不建）

| 概念 | purpose | 规格 |
| --- | --- | --- |
| User | 让每一个人拥有可指代、可核验、可终结的稳定身份 | [user/CONCEPT.md](../../backend/libraries/user/CONCEPT.md) |
| Password [User] | 让用户凭只有自己知道的秘密证明身份 | [password/CONCEPT.md](../../backend/libraries/password/CONCEPT.md) |
| Session [Principal] | 让主体认证一次后，在一段时间内免于反复证明身份 | [session/CONCEPT.md](../../backend/libraries/session/CONCEPT.md) |
| ApiToken [Owner, Tenant, Space] | 让程序持有一个受限、可吊销且可独立授权的机器身份 | [api-token/CONCEPT.md](../../backend/libraries/api-token/CONCEPT.md) |
| ManagementToken [Owner, Tenant] | 让用户签发一个有限期、可撤销且进一步受限的管理凭据 | [management-token/CONCEPT.md](../../backend/libraries/management-token/CONCEPT.md) |
| Team [Scope] | 让一个作用域内的群体拥有可命名、可终结的稳定身份 | [team/CONCEPT.md](../../backend/libraries/team/CONCEPT.md) |
| Membership [Group, Member] | 控制一个群体的成员构成，加入须经同意 | [membership/CONCEPT.md](../../backend/libraries/membership/CONCEPT.md) |
| Permission [Resource, Principal] | 判定某个主体能否对某个资源执行某种操作 | [permission/CONCEPT.md](../../backend/libraries/permission/CONCEPT.md) |

### Authoring 内容创作（支撑域 · 从简自建）

| 概念 | purpose | 规格 |
| --- | --- | --- |
| Space [Item] | 让一组条目共享同一个家：同属、同迁、同灭 | [space/CONCEPT.md](../../backend/libraries/space/CONCEPT.md) |
| Page [Format] | 让一份多格式内容走完从草稿、进版到删除可反悔的编辑生命周期 | [page/CONCEPT.md](../../backend/libraries/page/CONCEPT.md) |
| Revision [Item, Content] | 让条目的每次内容保存可追溯，并能取回任一历史内容 | [revision/CONCEPT.md](../../backend/libraries/revision/CONCEPT.md) |
| Toc [Target] | 让读者按人工编排的顺序与层次浏览一组内容 | [toc/CONCEPT.md](../../backend/libraries/toc/CONCEPT.md) |
| Collection [Item] | 让条目按嵌套分组组织，位置即分类 | [collection/CONCEPT.md](../../backend/libraries/collection/CONCEPT.md) |
| Tag [Item] | 让条目跨越所在位置被自由词汇横向聚合 | [tag/CONCEPT.md](../../backend/libraries/tag/CONCEPT.md) |

### Releases 发版（核心域）

| 概念 | purpose | 规格 |
| --- | --- | --- |
| Release [Scope, Bundle] | 让一个范围的对外内容以可预览、可整体原子切换、可回滚的不可变版本演进 | [release/CONCEPT.md](../../backend/libraries/release/CONCEPT.md) |

### Hosting 托管（核心域 · 读侧）

| 概念 | purpose | 规格 |
| --- | --- | --- |
| Site [Target] | 把选定的一组目标编成一个对外站点，并守护站内地址名 | [site/CONCEPT.md](../../backend/libraries/site/CONCEPT.md) |
| CustomDomain [Target] | 让访问者用自有域名直达指定目标 | [custom-domain/CONCEPT.md](../../backend/libraries/custom-domain/CONCEPT.md) |
| Redirect [Scope, Target] | 让旧地址在内容重组后仍能到达目标 | [redirect/CONCEPT.md](../../backend/libraries/redirect/CONCEPT.md) |
| Search [Scope] | 让运营者为每个范围确定检索字段的优先顺序，并以版本标识触发重新构建 | [search/CONCEPT.md](../../backend/libraries/search/CONCEPT.md) |

### Platform 平台能力（通用概念）

平台概念提供独立的技术与运维行为，不拥有其他概念的业务状态；外部身份在规格中是不透明值，跨概念组合只由 `syncs` 完成。`platform` 是 Java 包分组，叶包与产品概念一样是零跨概念依赖的 Modulith 模块。

| 概念 | purpose | 规格 |
| --- | --- | --- |
| Analytics | 让运营者从独立读侧事件中看到有缺口标记的访问与活动趋势 | [analytics/CONCEPT.md](../../backend/libraries/analytics/CONCEPT.md) |
| Audit | 让授权查询者追溯操作事实，同时使已抹除主体不能被迟到事件重新识别 | [audit/CONCEPT.md](../../backend/libraries/audit/CONCEPT.md) |
| BundleExport | 让已捕获的内容快照能够可靠地导出为完整的 Bundle v1 ZIP | [bundle-export/CONCEPT.md](../../backend/libraries/bundle-export/CONCEPT.md) |
| CertificateInspection | 让调用方知道指定主机 443 端口实际呈现的证书状态 | [certificate-inspection/CONCEPT.md](../../backend/libraries/certificate-inspection/CONCEPT.md) |
| DnsLookup | 让调用方可靠地区分 TXT 无记录与 DNS 查询故障 | [dns-lookup/CONCEPT.md](../../backend/libraries/dns-lookup/CONCEPT.md) |
| Idempotency | 让同一请求的重试取得原响应，同时阻止同键异请求重复执行 | [idempotency/CONCEPT.md](../../backend/libraries/idempotency/CONCEPT.md) |
| ImportFormat | 让已知来源的文档包被确定地识别并适配成 Bundle v1 输入 | [import-format/CONCEPT.md](../../backend/libraries/import-format/CONCEPT.md) |
| ImportJob | 让发起者能观察并恢复一次异步导入，同时保留其有限的进度与问题报告 | [import-job/CONCEPT.md](../../backend/libraries/import-job/CONCEPT.md) |
| MailOutbox | 让一次性邮件意图在业务提交后可恢复投递，且重试不改变已发送内容 | [mail-outbox/CONCEPT.md](../../backend/libraries/mail-outbox/CONCEPT.md) |
| ObjectStore | 让内容寻址对象可安全写入、读取与回收，且依赖故障不伪装成对象缺失 | [object-store/CONCEPT.md](../../backend/libraries/object-store/CONCEPT.md) |
| DeletionRecovery | 让业务资源终结后的回收过程可追踪、可重试，且重复触发不产生第二条记录 | [deletion-recovery/CONCEPT.md](../../backend/libraries/deletion-recovery/CONCEPT.md) |
| ReaderSecurity | 让读侧身份与访问策略的投递具有可恢复的安全屏障，并在注销时清除读侧个人状态 | [reader-security/CONCEPT.md](../../backend/libraries/reader-security/CONCEPT.md) |
| ServiceHealth | 让平台运营者看到进程、交付与数据库的当前运行状态，而不泄露租户载荷 | [service-health/CONCEPT.md](../../backend/libraries/service-health/CONCEPT.md) |
| TenantRegistry | 让平台能登记租户身份及其管理操作是否被冻结 | [tenant-registry/CONCEPT.md](../../backend/libraries/tenant-registry/CONCEPT.md) |
| ContentType | 让租户以明确、不可变的版本定义内容的解释、Schema约束和可信编辑/呈现绑定 | [content-type/CONCEPT.md](../../backend/libraries/content-type/CONCEPT.md) |
| PluginDevelopment | 让插件源码可按基线编辑并形成可复现的不可变候选 | [plugin-development/CONCEPT.md](../../backend/libraries/plugin-development/CONCEPT.md) |
| PluginVerification | 让候选的验证证据绑定构件、样例及环境并可追溯 | [plugin-verification/CONCEPT.md](../../backend/libraries/plugin-verification/CONCEPT.md) |
| Webhook | 让外部订阅者可靠收到选定范围的完成事件，并能追踪投递结果 | [webhook/CONCEPT.md](../../backend/libraries/webhook/CONCEPT.md) |

类型参数的实例化只发生在组合层，见[组合根 SYNCS.md 的 app 块](../../backend/apps/control/src/main/java/io/space/control/compositions/SYNCS.md)。

## 依赖图与交付口径

下图是组合层的类型依赖，不是概念内部代码依赖；由仓库检查与 app 实例化共同校验。

```text
Password / Session / ApiToken / ManagementToken / Membership ──► User
Permission ──► Site, Space, Page（消费其稳定 id 作为资源链）
Space ──► Page          Revision / Toc / Tag ──► Page
Collection ──► Space    Release ──► Space（快照其内容）
Site ──► Space          Search / CustomDomain ──► Site        Redirect ──► Site, Space, Page（目标实例化）
```

域级依赖（无环）：`Authoring → IAM`；`Releases → Authoring + IAM`；`Hosting → Releases + IAM`。

19 个产品概念、19 个平台概念及 Membership 的租户/用户组实例化构成完整交付范围。六个核心场景按 flow 垂直贯通；范围内能力不以 MVP 或后续批次替代验收。

<a id="syncs"></a>

## 跨概念流程导航

| 位置 | 内容 |
| --- | --- |
| [组合根 SYNCS.md](../../backend/apps/control/src/main/java/io/space/control/compositions/SYNCS.md) | app 组合（类型参数实例化）、guard 模板、管理杂项模板、全局排除动作、分包索引 |
| [syncs/iam](../../backend/apps/control/src/main/java/io/space/control/compositions/iam/SYNCS.md) | 注册与激活、登录与会话、账户安全联动、用户注销、成员与邀请、API 令牌生命周期 |
| [syncs/authoring](../../backend/apps/control/src/main/java/io/space/control/compositions/authoring/SYNCS.md) | 页面创作、目录编排、标签、删除与恢复 |
| [syncs/releases](../../backend/apps/control/src/main/java/io/space/control/compositions/releases/SYNCS.md) | 发版组索引 |
| [syncs/releases/release](../../backend/apps/control/src/main/java/io/space/control/compositions/releases/release/SYNCS.md) | 发布、共享发版流水线 |
| [syncs/releases/bundleimport](../../backend/apps/control/src/main/java/io/space/control/compositions/releases/bundleimport/SYNCS.md) | 持续导入（票 20） |
| [syncs/hosting](../../backend/apps/control/src/main/java/io/space/control/compositions/hosting/SYNCS.md) | 站点与域名配置、重组重定向、内容和权限投影 |
| [space-content SYNCS](../../backend/apps/content/src/main/java/io/space/contentapp/SYNCS.md) | 独立阅读进程：页面/导航/搜索/快照文件 |
| [syncs/hosting/customdomain](../../backend/apps/control/src/main/java/io/space/control/compositions/hosting/customdomain/SYNCS.md) | 域名管理（票 22） |
| [syncs/platform](../../backend/apps/control/src/main/java/io/space/control/compositions/platform/SYNCS.md) | 租户开通与冻结、服务状态（进程心跳与 `/admin/health`）、邮件投递与管理、Webhook、运维证据 |

内容类型的登记、默认切换与启停见 [contenttype](../../backend/apps/control/src/main/java/io/space/control/compositions/platform/contenttype/SYNCS.md)；可信实现查询及插件开发验证见 [pluginmanagement](../../backend/apps/control/src/main/java/io/space/control/compositions/platform/pluginmanagement/SYNCS.md)；空间附件查询见 [attachmentbrowsing](../../backend/apps/control/src/main/java/io/space/control/compositions/authoring/attachmentbrowsing/SYNCS.md)。组合根维护 app 类型实例化、guard 和全局排除动作，各 flow 只有一份共置规格。

<a id="content-types"></a>

## 内容类型与插件

ContentType 拥有租户内类型身份、启用状态、默认版本、并发基线和不可变定义版本。管理员登记/启停/切换，作者发现与选择；首次登记启用并选择版本，已物化类型的后续登记不自动切换默认。可信可执行贡献来自构建内 registry，在线定义只引用已登记的编辑与呈现实现。定义与实现独立版本化：两个业务类型可以共用 renderer，停用一个类型不影响另一个。

内容值固定类型、versionRef 和有界 JSON interpretation；默认版本变化不重解释已有正文。停用阻止新建、复制、导入产生的新绑定及显式变更绑定，已有固定版本仍可编辑、发版、阅读与回滚；原样保留的导入绑定继续可用。取回正文修订若改变绑定须检查启用资格，并保留历史解释原值。

发版冻结定义、Schema 资源、摘要和呈现引用；Reader 使用冻结值和本地可信实现，不回查 Control。外部 Bundle 只匹配目标租户已登记的可信类型及摘要，不能自动安装声明或代码。GET 不物化默认状态，停用记录也不回落为内置默认值。

校验输入统一为 `{content, interpretation}`，支持 text/json encoding、固定 Schema 和可选 instanceSchemaPointer；动态 Schema 只验证 content。资源闭包本地解析并限制大小、深度、节点和错误数量，不取网或读取任意文件。普通 JSON 无 Schema 时保留原文；实例 Schema 支持对象、布尔和既有字符串格式，false 拒绝，只有 missing/null 表示未启用。Schema 正文内的 `$ref` 不因被阅读而联网执行。

服务端保证声明的结构约束与权限/资源安全；A2UI 消息顺序、引用和环等专业语义由前端实现诊断。语义失败明确展示并保留源码，不能把结构通过描述为完整语义通过。PluginDevelopment 管开发稿与不可变候选，PluginVerification 管绑定构件、样例和环境摘要的证据；候选验证不授予生产安装资格。

| 必验结果 | 验收要求 |
| --- | --- |
| 在线扩展 | 登记 demo-card 等 JSON 类型只新增定义/Schema/可信贡献引用，不新增 Java 类型分支、数据库枚举或 Reader 格式分支 |
| 生命周期 | 真实界面完成登记 v1、登记 v2、切换、停用和重启；验证作者只读、租户隔离、ETag 冲突与幂等重放；首次登记设置默认，后续登记不自动替换默认 |
| 固定解释 | 对象/数组/数字/布尔/null 在保存重开、冲突、修订、Bundle 和 Reader 中不丢失；配置变化产生 dirty，固定旧版本不受新默认影响 |
| 准入边界 | 绕过前端的 API、导入与热修仍执行声明的 Schema；验证资源限制、false/missing 差异、未知执行引用拒绝和源码兜底 |
| 历史与停用 | 停用不阻塞已有绑定及同空间其他类型发版；新绑定检查资格，历史发布可读可回滚，既有不可变快照不被追写 |
| 界面与开发工具 | 卡片展示图标、名称、来源/启停状态及筛选恢复；窄屏无溢出。工作台可选在线类型，固定样例记录定义引用与摘要，停用类型不丢稿 |
| 回归 | 七个内置类型、多个编辑/呈现实现、原开发验证工具、生成契约、真实 PostgreSQL 和独立 Reader 交付验收通过 |

工程契约与贡献协议见 [CONTENT-PLUGINS](../tech/CONTENT-PLUGINS.md)，决定及保证边界见 [ADR-0029 / ADR-0030](../adr/README.md#adr-0030)。

## 排除与建模裁决

| 项目 | 当前结论及重开边界 |
| --- | --- |
| 通用容器树、页面 frontmatter 自声明归属 | 不采用；Collection 管分类、Space 管生命周期、Toc 管阅读编排，挂载方守护地址 |
| Publication / Metadata / Trash / Asset 独立概念 | 分别由 Page.status、properties、trashedAt、attachments 承担；模板治理、跨类型恢复或跨页资产需求成立后再评估 |
| Tenant / PluginCatalog 全能概念 | Tenant 保留身份类型，开通冻结归 TenantRegistry；在线类型归 ContentType，技术 registry 只提供可信能力 |
| 页面级增权、路径判权 | 排除；页面只收窄，保密范围优先拆空间；父级管理员保留 ACL 救援路径 |
| 双向同步、记忆来源后重拉 | 排除；外部包只单向导入，紧急热修与漂移确认提供受控例外 |
| 并行 v1/v2 文档站、独立模板、评论、实时协同、同页多语 | 当前排除；有明确需求后分别评估多 live、Template、Comment、协作机制及实例化维度 |
| SSO/OIDC、2FA、SCIM、租户密码策略 | 当前排除；密码全局固定 ≥8 位并使用弱密码黑名单；外部身份和第二因素需另行建模 |
| 计费/Quota、人订阅通知、PDF 导出 | 当前排除；租户冻结属于运维，机器通知走 Webhook，离线交换走 Bundle |
| 通用 headless 管理事实查询 | 排除；提供界定范围的只读快照资源与机器阅读入口 |
| 专属后端插件引擎、规则 DSL、在线执行任意代码或远程依赖市场 | 排除；可执行实现只经可信构建进入生产 |
| JWT/哈希算法、锁与导入队列、CDN/搜索引擎 | 工程机制，不新增产品概念；适配器成为租户可管理状态时再评估升格 |
| seoKeywords | 保留字段，标记为低价值，不承诺搜索排名效果 |

<a id="plugin-roadmap"></a>

## 后续方向

以下尚未实现，不属于 1.0.1 已交付能力：

- **独立插件工程**：SDK/插件脱离平台源码构建，拥有各自锁文件、Manifest、Schema、fixture、测试和摘要；仅依赖公共契约，编辑、呈现、宿主适配分离。
- **跨构建兼容**：保留旧工作稿引用的内置定义与可信实现，支持多实现版本共存；发布快照冻结不能替代这项能力。
- **MCP Apps**：HTML 资源提供编辑预览，工具接收生成结果并触发诊断，经用户授权后保存至平台工作稿；复用 Page 权限与冲突规则，技能不拥有第二份内容状态。

后续验收须覆盖独立构建与版本兼容、同一构件在控制台/Reader/目标 MCP Apps 宿主的编辑预览诊断保存、拒绝与冲突、旧版呈现和跨构建恢复。候选仍隔离执行且不得接触管理凭据。

## 验收与运行边界

下列条目定义验收要求，不代表仅凭文档已完成验收。关键实现入口、已核对的机制与现状例外见 [ADR 实现核对](../adr/README.md#implementation-evidence)，执行结果以对应测试报告为准。

产品版本以仓库根 `VERSION` 为准，当前是 1.7.0。1.0.1 是已发布数据库迁移基线；此后迁移只追加，不改已发布脚本。

- 概念正向验收来自 `CONCEPT.md` 的 operational principle；应用负向验收覆盖每个 flow 的错误输出及恢复行动。
- 六个核心场景落在 `features/acceptance/<context>/<flow>.feature`，以 flow 和前端状态矩阵核对；完整标准见 [TESTING](../tech/TESTING.md)，阅读入口见 [BDD 导航](../../features/README.md)。
- 使用真实 PostgreSQL 验证 RLS、事务、并发、租约与迁移；真实浏览器和跨进程故障验证登录、撤权、上线、搜索、无 JS 与窄屏。
- Control、Content、Index 独立运行。Control 是业务事实的唯一写入方；Content 提供已发布内容；Index 只重建搜索索引。Control 离线时，已发布且无屏障的内容仍可由 Content 读取，新的管理写入失败。
- 管理会话不替代读者会话；`published`、主版本、站点线上版本、搜索版本、异步作业和物理清理分别核验。新基线不提供旧混合进程或旧开发数据库原地升级模式。
