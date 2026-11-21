# 架构决策 — Edition

本文按主题保存现行决策、选择理由与代价。产品范围和验收见 [PRD](../prd/README.md)，动作与错误以源码共置 `CONCEPT.md` / `SYNCS.md` 为准，运行参数以构建、配置和[部署文档](../../infra/README.md)为准。

## 阅读与维护

| 主题 | 决策编号 |
| --- | --- |
| 内容组织、地址、附件、修订 | [0001 / 0004 / 0012 / 0013](#adr-0001) |
| 不可变发版与单向导入 | [0002 / 0005 / 0008 / 0020](#adr-0002) |
| 身份、权限、会话与注销 | [0003 / 0010 / 0011 / 0014 / 0019](#adr-0003) |
| 模块、前端、包与工程布局 | [0006 / 0007 / 0018 / 0026 / 0027](#adr-0006) |
| 数据完整性与迁移生命周期 | [0009 / 0025](#adr-0009) |
| 失败、幂等、持久意图与清理 | [0015 / 0016 / 0017 / 0023](#adr-0015) |
| 独立交付、安全屏障与搜索 | [0022](#adr-0022) |
| 私有阅读、独立身份与个人状态 | [0024 / 0028](#adr-0028) |
| 共享主库、单一写入归属与只读扩容 | [0034](#adr-0034) |
| 阅读前后端分离：Reader 只出数据，阅读页由 Web 渲染 | [0035](#adr-0035) |
| 可信插件与在线类型版本 | [0029 / 0030](#adr-0030) |

各节为已接受决策的整合，保留旧编号锚点。替代关系如下：ADR-0022 替代 ADR-0021 的共享管理存储运行模式；ADR-0028 修订 ADR-0024 的读者认证与历史归属；ADR-0030 部分替代 ADR-0029 的构建只读类型目录及服务端专属准入。被替代条款不作为当前兼容路径。

新决策从 ADR-0031 起编号，追加到本文对应主题，记录背景、决定、被放弃的方案与实际代价；修订旧决定时写明替代范围，保留旧锚点与状态。历史全文通过 Git 追溯。

<a id="adr-0001"></a>

## 内容组织与稳定地址

**决定与理由。** 空间是内容生命周期、来源模式、发版和授权的锚点；分组在租户内分类空间，目录在空间内编排阅读。分组最多三级、目录最多七级，均不决定页面地址或权限。同一空间可被多个站点挂载。用一棵通用容器树同时表达所有权、URL、权限与展示顺序，会让重排产生断链或授权漂移，因此不采用。

<a id="adr-0004"></a>

站点守护单段 `slug→Space`，空间守护完整 `RelativePath→Page`；网页与 VFS 共用规范地址，页面与附件共同检查路径唯一和前缀冲突。权限、目录引用与重定向目标使用稳定 ID。改挂载、改地址和迁移由组合层登记旧路径到稳定目标的 Redirect；目录重排不改变 URL，转移页面须协调旧目录引用与发版。

<a id="adr-0012"></a>

附件随页继承权限与生命周期，二进制按内容哈希寻址。工作区 detach 只解除引用；Release 保存自己的路径和 storageKey，阅读与导出按快照取字节。当前需求不建立共享 Asset 库；只有跨页资产治理需求成立才重开。

<a id="adr-0013"></a>

Revision 只提供历史与差异；取回修订由组合层读取历史后调用 Page.edit，使用当前并发基线并产生新修订，记录取回来源。它与回收页面的 restore 是两种动作。

**代价。** 地址、导航与身份可独立演进，但组合层须保证挂载、重定向、发版和删除一致；清理对象必须检查快照及在途引用，不能由页面删除直接推导。

<a id="adr-0002"></a>

## 不可变发版与单向导入

**决定与理由。** Release 加载后内容只读，按 `draft→validated→live→archived` 演进；覆盖热修进入 flagged，批准后才能继续。promote 在管理库事务内归档旧 live 并选择新 live，部分唯一索引守护每空间至多一个主版本；回滚重新 promote 归档版本。逐页改线上内容会产生半新半旧版本，因此采用完整快照切换。

页面 published 只表示可被构建收录。authored 默认自动发版，可关闭；自动与手动共用同一流水线。默认保留最近七份归档版本，按数量配置，导出 pin 等引用保护可延后裁剪。管理提交与各站实际上线分别确认，见 [ADR-0022](#adr-0022)。

<a id="adr-0008"></a>

快照存在管理 PostgreSQL：release_pages 以 release/page 标识页，release_contents 按租户与正文哈希去重，release_toc 保存快照目录；数据库触发器阻止内容表 UPDATE，可变标签/状态不属内容不可变约束。构建收录未回收的 published 页、元信息和附件，目录剔除未收录 target 并提升其子节点。权限、域名、品牌和挂载使用当前配置，不冻结为内容 Release。对象存储保存附件、导入原件与导出产物。

<a id="adr-0009-bundle"></a>

Bundle v1 是版本化交换语言，不是线上存储格式。导入先转换校验，导出从 live/archived 快照生成包含清单及附件的 ZIP，避免查询、diff 和切版必须解包或跨存储事务。正文导出还须检查逐页当前归属的 read 权限。详细格式见 [Bundle 契约](../../backend/libraries/import-format/CONCEPT.md)。

<a id="adr-0005"></a>

一个空间只有一种可写来源：authored 接受界面创作、拒绝整体导入；synced 由外部导入驱动，只允许既有页面紧急热修。热修保存即发版并留下漂移，下次导入覆盖前列出影响并等待批准；选为主版本后回写工作区基线并留修订。模式转换遵守既定前置条件，不建立双向同步。

<a id="adr-0020"></a>

ImportFormat 是进程内适配概念，通过公开 SPI 依次识别、转换 Bundle、华为云、OKF 和普通目录树，按 order/id 选择首个命中项。识别以目录索引为主，OKF 可有界读取 index.md 前 2048 字节；正文和附件有界读取或流式写入。公开 HTTPS ZIP 仅一次性拉取，与上传进入同一接缝；平台不保存上游 PAT、不 clone、不建立可重拉的来源配置或定时同步；作业 payload 仍保存 sourceUrl 供回显。适配器成为租户可管理状态时才重开边界。

draft 保留可检查的重复地址交给 validate 阻断，重复外部身份在适配出口拒绝。入站先取得请求/空间锁再保留对象，批准前捕获原导入删除集；详情及校验报告要求 publish，列表摘要要求 read。

**代价。** 工作区与快照重复部分元数据，正文去重降低成本；导出需要再生成。内容、当前配置、权限和搜索版本必须分别管理，导入不能作为第二个可写事实源。

<a id="adr-0003"></a>
<a id="adr-0008-tenant"></a>

## 身份、授权与账户终结

**决定与理由。** User 是跨租户稳定身份；Tenant 是归属与隔离身份，开通/冻结由 TenantRegistry 拥有，成员由 Membership 拥有。群体 owner 管成员并经组合层取得根资源授权；租户管理员只能移除本租户成员，平台运营员不隐式获得客户正文权限。

<a id="adr-0011"></a>
<a id="adr-0019"></a>

站点/空间接受内容 grant，页面仅收窄，默认拒绝；公开站点显式给 anonymous reader。管理入口还使用 tenant/team 根资源。User 主体闭包包含本人和当前租户所属 Team；资源链从内向外取首个匹配层，同层 User 规则优先，否则合并 Team operations；每层 restriction 与完整主体集合相交。直接 none 不被 Team allow 抵消，撤销本层规则恢复继承。分别判断 User/Team 再 OR 会破坏这些规则，因此不采用。

tenant-root admin 或目标 Space/Site admin 管理相应 ACL；页面 restriction 不阻断父级救援。角色目录由迁移提供，restriction 整集变更使用 ETag；归档空间只接受规定的单调收紧动作。站点入口可管 anonymous，空间常规入口管理 User/Team，机器令牌通过专用生命周期维护。

<a id="adr-0014"></a>

管理会话采用默认十分钟 RS256 access、轮换 refresh 和在线会话撤销检查，拒绝 reader audience 且不缓存正向会话判定。refresh 只存哈希，通过 Secure/HttpOnly/SameSite=Lax、Path=/auth Cookie 运输，不进入响应 JSON。会话绝对期限三十天；旧 refresh 十秒内并发重用仅拒绝该次请求，超过宽限视为重放并结束会话。登录/续期/退出检查 Origin，缺少时检查 Referer；RSA 密钥缺失默认启动失败，本地临时密钥须显式启用。进程内限流不提供跨副本合并保证，账号失败锁定持久化。

<a id="adr-0010"></a>

停用可逆，注销不可逆。本人注销在事务内先停用再抹除，运营注销要求目标已停用；两者都检查所有 Tenant/Team 的最后 owner，清理个人信息、会话、邀请、成员和授权，撤销并匿名化令牌及审计个人数据。保留稳定 ID 墓碑、Revision authorId 和历史事实，展示为已注销用户，邮箱释放。远端密码和读者状态的清除按 [ADR-0028](#adr-0028) 恢复，不能在源提交前销毁远端凭据。

**代价。** 权限可解释、ACL 可救援、历史可追溯；管理鉴权依赖会话存储，跨租户注销需要锁与事务编排。存储故障返回系统错误，不能当作无效凭据。

<a id="adr-0006"></a>

## 模块、前端与运行构件

**决定与理由。** Control 采用 Java/Spring Boot、Modulith、MyBatis 与 PostgreSQL 的模块化单体。一个概念对应一个包级模块，domain 纯 Java，SQL/适配器封装在模块内；概念只依赖共享内核，syncs 通过公开接口跨概念组合，可在事务内调用或接收事件。全部拆成微服务会扩大部署与事务成本；显式 SQL 和约束优先于隐式 ORM 关系。

Meilisearch 承担全文检索，MinIO 承担对象存储，Caddy 承担路由/TLS，不引入 Redis。缓存机制不自动获得授权允许判定的资格。依赖版本以构建与锁文件为准，见 [STACK](../../README.md)。

<a id="adr-0007"></a>

旧管理界面已退役。阅读站点由独立 Astro 服务渲染，见 [ADR-0035](#adr-0035)。

<a id="adr-0018"></a>
<a id="adr-0026"></a>

工程布局由 [ADR-0031](#adr-0031) 替代本节原来的包级构建边界；目录与规则类名由 [ADR-0033](#adr-0033) 替代 [ADR-0032](#adr-0032)。当前为三应用、38 个独立概念工程及五个技术库（ADR-0034）。Control 产物及应用身份保留 space；运行包、心跳身份和 Gradle 工程名分别服从各自契约。规则身份是 `SYNCS.md` 的 `sync` 名与 `claim` 字符串。Reader 不依赖管理或 Worker 生产构件，测试夹具依赖不构成生产许可。

<a id="adr-0027"></a>

四个管理上下文名固定为 IAM / Authoring / Releases / Hosting，与包和 schema 对齐；它们表达领域依赖，不推导进程或 Gradle 项目数量。Releases 区分页面进版动作，Hosting 区分交付面 delivery，避免 Publishing/Delivery 的语义重载。HTTP 的五类入口同样不代表五个进程。

**代价。** 单体内保留事务与清晰模块缝，跨进程可用性通过独立构件和凭据实现；需要持续检查模块、契约与运行依赖，各工程按实际职责组织，不复制空目录层。

<a id="adr-0009"></a>

## 数据完整性与迁移生命周期

**决定与理由。** 同上下文及 shared 外键允许存在，其余管理跨 schema 外键逐条登记；当前仅有下列四条跨上下文边。authoring 不反向依赖 releases/hosting，独立 serving 不通过外键连接管理库。

| 子表 | 父表 |
| --- | --- |
| releases.releases | authoring.spaces |
| releases.release_retention | authoring.spaces |
| hosting.sites | authoring.spaces（同租户首页空间） |
| hosting.site_mounts | authoring.spaces |

已撤销 ApiToken 须保留空间历史绑定，故移除其永久空间外键；活跃绑定仍由 iam.check_active_token_binding()、签发/认证和 RLS 检查。全部取消 FK 会失去有价值的单事务完整性；所有稳定 ID 都加 FK 又会阻碍终结、墓碑和拆库，因此均不采用。

<a id="adr-0025"></a>

首次正式发布前可整合基线，但重写须比较规范化 catalog、ACL、角色与种子；迁移成功本身不足以证明等价。**1.0.1 是正式基线，从此已发布迁移只读，变更只追加并验证前向升级。** 管理、Identity、serving/reader-state 分别维护自己的迁移，当前清单以各构件为准。

任何迁移/校验失败都停止启动，开发模式也不自动 clean。旧开发基线不承诺原地升级，使用新隔离卷并保留旧数据。应用回滚不倒迁数据库，不兼容变更通过前向修复或备份恢复处理。这一规则覆盖早期 ADR-0027 中“dev 校验失败自动重建”的表述。

**代价。** 已登记边仍要求有序迁移；未来拆出发版或源侧托管时须显式承接约束。正式基线保护已有库，不以丢弃数据换取启动成功。

<a id="adr-0015"></a>

## 失败、幂等与可恢复效果

**决定与理由。** 失败按调用方行动分类：业务拒绝使用有限 ProblemCode 和 violations；依赖故障/超时为 503/504；程序不变量失败为 500 unexpected_error 并告警。顶层边界分类，局部仅捕获可恢复或可精确翻译的故障；空集合、false 或 Optional.empty 不代表依赖不可用。查询仅重试已分类瞬态故障，变更必须沿用原幂等 key。

<a id="adr-0016"></a>

幂等记录与业务事实同事务，按 principal type/id + operation + key 定位，并绑定规范请求指纹；唯一约束处理并发首写，同请求重放完整 HTTP 结果，异请求返回 idempotency_key_reused，处理中使用专门冲突。保留期二十四小时。按契约要求接入，不把登录/续期等所有 POST 一概纳入执行器。含一次性 secret 的结果使用独立密钥的 AES-256-GCM envelope、随机 96-bit nonce，AAD 绑定主体/operation/key/fingerprint；认证失败不能重执行业务或伪造空响应。

<a id="adr-0017"></a>

事务成立所需校验在提交前完成；邮件、Webhook、交付复制和索引换代先持久化意图，再领取、续租、记录尝试和终态。至少一次投递依靠稳定意图 ID 幂等，不承诺 SMTP/第三方恰好一次。重试按任务区分：邮件与阅读安全投影有八次预算和抖动退避，内容/搜索交付有八次预算及有上限的指数退避；账号事实投影持续重试，等待时间线性增加至六十秒，未实现相同的失败终态或抖动。已进入失败终态的任务按对应授权入口恢复。统一运维视图不要求底层共用一张表。

<a id="adr-0023"></a>

资源业务终结与物理清理分开确认：删空间要求已归档并确认名称，同事务处理挂载、作业、令牌、权限与内容归属；删站要求无挂载并自动解绑域名。回收三十天只是默认最早 purge 时间，工作区、Release、导入/导出、交付及在途保留仍可阻止删除；管理与交付桶分别 GC。管理附件下载重新鉴权。

成功审计与业务同事务，拒绝/失败单独记录；注销清历史个人信息。统计可有界丢缓冲，但必须报告缺口；清理二十四小时、统计六十秒属于健康条件下的验收目标，调度间隔不能独自证明达标。安全收窄还须提交前确认屏障，见[独立交付](#adr-0022)。

**代价。** 避免内存异步丢失意图、超时换 key 导致重复及无界重试；需要管理加密密钥、持久记录、租约和恢复权限。受理、提交、上线、搜索可用和清理完成分别表达。

<a id="adr-0022"></a>

## 独立交付、安全屏障与搜索

**决定与理由。** Control、Identity、Worker、Reader 同仓独立部署，共享版本化被动协议。Reader 只读 serving、对象与搜索，不访问管理表、概念或凭据；Worker 用源 outbox 窄接口和目标写身份单向构建可重建投影。管理业务事实与交付意图同事务持久化，Worker 先复制对象，再按单调 epoch 原子选择每站完整版本，多站独立完成。

普通交付失败继续服务旧完整版本，首次未上线不伪装成已有站点。回滚产生更高序号的新意图，只回内容/快照目录，当前权限、域名、挂载与品牌沿用当前事实。权限收窄、卸载、域名移除等在确认成功前设置安全屏障，投影完成解除；源事务回滚可能留下远端屏障，须按当前事实对账，不宣称分布式原子事务。已开始响应与已下载字节不能追回。

搜索 generation 由不可变分段清单组成，稳定页 ID 分桶、复用未变段，所有新段成功后切换并由 federation 排序。候选逐页检查当前交付的内容身份与权限，持续扫描直到填满或穷尽，每页最多二十条，不暴露过滤前总数；超过扫描预算明确返回 search_limit_exceeded，不把截断伪装为完整结果。游标绑定站点、查询、交付/搜索版本和权限集合，变化返回 search_changed 并重搜。候选缓存只存不可变引擎输出（当前六十秒/32 MiB），每次仍检查依赖健康和安全状态，不缓存允许判定。

<a id="adr-0021"></a>

**已替代方案：ADR-0021。** 同构件、共享管理表的只读运行角色仍耦合管理生命周期，已由 ADR-0022 替代；同步回查 IAM 或只等 JWT 到期也分别破坏独立可用性和即时撤权。当前不保留这些部署替代路径。

**代价。** 独立阅读增加复制、跨库凭据、协议兼容和屏障对账成本；内容大任务与身份/权限安全投影必须隔离，依赖不明时明确拒绝。

<a id="adr-0024"></a>
<a id="adr-0028"></a>

## 独立身份源与读者个人状态

**决定与理由。** 保留同一自然人的稳定 User ID。Control 拥有账号管理事实，经持久意图单向投影到 Identity；Identity 独占密码写入和登录校验。Control Password 是窄接口适配，管理库不存密码哈希。Control 与 Reader 使用不同受限身份接口，并各自拥有会话、Cookie 与密钥。

Reader 拥有读者会话和历史，使用 reader-state 的受限写身份，serving 仍只读；管理端不处理 /_auth/*。当前读者 access/refresh 是 rs1_ 前缀的随机不透明凭据，只存 SHA-256 哈希；会话记录绑定 session/user/site/host 与账号 epoch，不使用 JWT audience 或签名私钥。Cookie 为 host-only/Secure/HttpOnly/SameSite=Lax，仅在主域通过 HTTPS 同源 POST 登录，密码不跨 host 转发。默认十分钟 access、三十天绝对期限，refresh 原子轮换后旧 access/refresh 均失效；不沿用管理会话的旧 refresh 十秒宽限。JS 续期后只重试一次，无 JS 走同域 POST，未确认上线保留恢复凭据。

账号与权限使用独立轻量意图、单调 epoch 和提交前屏障，不等待正文/搜索队列；重放和乱序不能恢复旧状态。Reader 一致读取身份、安全头、policy 与屏障后过滤正文、目录、上下页、附件和搜索，sitemap 只含匿名集合。直接 none、restriction 不满足或无法确认的凭据均不回落为 anonymous；主体屏障不应关闭无关匿名阅读。protocol 2 携最低安全 policy epoch，拒绝旧 protocol 1。阅读安全策略投影最多八次；耗尽后仅显式继续阅读或授权恢复可重排，自动续期/对账不重置预算。

Control 离线且 Identity/serving 可用时，Reader 可新登录、续期、退出、读取和保存历史；Identity 离线时，已有且无屏障的有效会话可继续读，新登录/续期明确失败。两种应用会话互不终止。密码哈希与锁定沿用现有 Argon2 语义，避免引入通用身份平台及动态域名客户端注册成本。

注销凭据清除只消费已提交的注销快照；读者个人状态由持久清除意图和受限函数清理。历史写入在同一事务检查会话与账号安全头，并与屏障/清除串行化；墓碑阻止迟到请求重建个人信息。注册、改密和远端结果未知时的持久补偿由[运行契约](../../infra/README.md)约束。

**替代与代价。** ADR-0028 替代 ADR-0024 将读者认证与历史归管理进程/库的条款，保留 ADR-0022 的内容投影和屏障。新平台不导入旧密码/历史、不保留混合运行或协议过渡模式。独立状态需要跨进程故障和真实 PostgreSQL 验收。

<a id="adr-0029"></a>

## 可信插件与可复现验证

**决定与理由。** Page、Revision、Release、Site 保留各自生命周期，正文与固定解释作为同一内容值保存、修订和冻结。编辑与呈现贡献独立，通过 Web Components 属性/事件连接宿主；PluginMount 管挂载清理，编辑会话管保存。复用 CodeMirror、Tiptap、JSON Viewer、Hyperjump 和官方 A2UI 实现，平台负责协议、装配、诊断、隔离和构建。

PluginDevelopment 拥有工作稿与不可变候选，PluginVerification 拥有绑定构件/样例/环境摘要的证据；Worker 编译、隔离 iframe 执行，验证成功不授予生产安装资格。生产只执行可信构建登记的贡献，Reader 仅打包呈现入口并使用冻结定义。本决定的候选隔离、可信构建和编辑/呈现分离继续有效；构建只读目录和专属服务端准入由 ADR-0030 修订。

**代价。** 需要固定快照解释、依赖锁、前端/可信端样例与第三方接口适配。Hyperjump 的实例字面值兼容收敛在前端适配层，升级时重验，保留原元模式及 const/enum 语义。

<a id="adr-0030"></a>

## 在线内容类型与通用 Schema 准入

**决定与理由。** 类型定义与可执行实现有不同生命周期：修改 invoice 必填字段应登记定义版本，不必升级 JSON renderer；invoice 与 profile 共用实现时，停用前者不影响后者。因此 ContentType 专门拥有租户类型身份、启用状态、默认版本、并发基线和不可变定义，替换有状态 PluginCatalog，不保留两套可写目录。技术 registry 只提供可信能力。

在线定义引用固定 pluginId/pluginVersion/contributionId，不接受 tag、import URL 或可执行源码。页面固定 versionRef 和 interpretation；首次登记（包括内置模板的首次物化）启用并选择该版本；已物化类型登记后续版本不改变默认，切默认不改既有解释，停用只阻止建立/改变绑定。已有绑定仍可编辑、发版、回滚，避免一个停用类型阻断整个空间更新；取回修订改变绑定时检查资格，但保留历史解释。查询不惰性写，停用记录不回退内置默认。

发版组合层解析并冻结定义、资源、摘要和呈现引用，Release 只消费冻结值，不直接依赖 ContentType；Reader 不查 Control 或当前默认版本。Bundle 声明只匹配目标租户可信登记，不自动安装类型/代码。新导入绑定检查启用资格，原样既有绑定和旧发布回滚沿用固定版本。

服务端对 `{content, interpretation}` 执行声明的 text/json、固定 Schema 和可选 instanceSchemaPointer，动态 Schema 仅验证 content；资源闭包本地且有界，不引入脚本/表达式/规则 DSL。实例 false 正常拒绝，missing/null 才为未启用，普通 JSON 无约束仍保留原文。Schema 正文内的 $ref 仅是内容，不自动触发联网/编译。

结构准入不宣称覆盖 A2UI 消息顺序、组件引用与环等专业语义；专业诊断由前端实现承担，失败保留源码。独立 SDK/插件工程、MCP Apps 与跨构建旧实现共存属于[后续方向](../prd/README.md#plugin-roadmap)，不能用发布冻结代替跨构建兼容验收。

**代价。** 新增类型与解释无需增加 Page/Release/Reader 类型分支，但须管理不可变定义引用、旧平铺配置兼容读取和历史解释；既有不可变发布不追写。完整范围、界面要求与验收统一见[内容类型与插件](../prd/README.md#content-types)。

<a id="implementation-evidence"></a>

## 实现核对入口

2026-11-03 按以下源码与已执行检查核对现状。决策理由由本文维护，实现细节回到代码；测试文件说明覆盖范围，不能代替实际执行结果。

| 事实 | 实现与检查依据 |
| --- | --- |
| 四个应用、五个技术库及 Reader 隔离 | [Gradle 工程清单](../../backend/settings.gradle.kts)、[Reader 依赖与 verifyIsolation](../../backend/apps/content/build.gradle.kts) |
| 概念及依赖边界 | [组合根](../../backend/apps/control/src/main/java/io/edition/control/compositions/SYNCS.md) |
| 主体闭包、直接规则优先与逐层收窄 | [管理判定器](../../backend/libraries/permission/src/main/java/io/edition/concepts/permission/domain/PermissionPolicy.java)、[读侧判定器](../../backend/apps/control/src/main/resources/db/migration/V8__publication_read_view.sql) |
| 管理 JWT 与读者不透明会话分别实现 | [管理会话](../../backend/libraries/session/src/main/java/io/edition/concepts/session/application/SessionService.java)、[读者会话](../../backend/libraries/reader-security/src/main/java/io/edition/concepts/readersecurity/adapters/persistence/JdbcReaderState.java) |
| 迁移清单、外键、不可变快照与校验失败即停 | [管理迁移](../../backend/apps/control/src/main/resources/db/migration)、[DevelopmentFlywayConfiguration](../../backend/apps/control/src/main/java/io/edition/control/bootstrap/dev/DevelopmentFlywayConfiguration.java) |
| 安全投影与账号事实投影的不同重试策略 | [shared 函数](../../backend/apps/control/src/main/resources/db/migration/V1__shared.sql)、[账号事实投影函数](../../backend/apps/control/src/main/resources/db/migration/V2__iam.sql) |
| 搜索当前权限核验、游标与扫描预算 | [ContentSearch](../../backend/apps/content/src/main/java/io/edition/contentapp/compositions/search/ContentSearch.java) |
| 类型首次物化、后续版本登记与固定绑定 | [ContentTypeService](../../backend/libraries/content-type/src/main/java/io/edition/concepts/contenttype/application/ContentTypeService.java)、[绑定与导入](../../backend/apps/control/src/main/java/io/edition/control/compositions/resource/ContentTypes.java) |
| Schema 声明、资源闭包及禁用远端解析 | [ContentValidation](../../backend/libraries/release/src/main/java/io/edition/concepts/release/validation/ContentValidation.java) |
| 一次性拉取仍保留作业 sourceUrl 元数据 | [ImportJobApi](../../backend/libraries/import-job/src/main/java/io/edition/concepts/importjob/api/ImportJobApi.java)、[ImportJobMapper](../../backend/libraries/import-job/src/main/java/io/edition/concepts/importjob/adapters/persistence/ImportJobMapper.java) |

<a id="adr-0031"></a>

## 独立概念构建与应用组合

**状态。** 2026-11-02 用户确认目标架构并授权重构与验证；2026-11-03 完成 C 版工程迁移、架构门禁和四组端到端验收。完整后端检查共 966 例，零失败、5 例可选参考包测试跳过。独立覆盖率门禁仍有 43 个生产工程未达 90% 要求，不能据此宣称全部 CI 通过；阈值未放宽。物理目录、组合包名与规则类后缀由 [ADR-0032](#adr-0032) 替代。下文保留 2026-11-03 的决定原文。

**命名补充。** 用户随后选择 C（概念直达）：应用目录和 Gradle 工程名为 `control`、`identity`、`worker`、`reader`；概念位于 `backend/src/concepts/<context>/<concept>`，Gradle 工程名直接使用概念叶名；技术库位于 `backend/src/libs/<capability>`。移除工程名中的重复产品和角色前缀。Java 包、运行服务身份、HTTP 契约及已发布迁移身份分别按原契约维护。

**决定。** 保留 Control、Identity、Worker、Reader 四个独立运行应用。将 19 个产品概念和 20 个平台概念提取为 `backend/src/concepts/<context>/<concept>` 下独立构建、测试的 Gradle Java library；平台目录只是工程分组。每个模块根维护一份权威 `CONCEPT.md`，业务导出与装配入口分开，模块独占自己的状态和内部端口。概念之间不建立源码或构建依赖，也不直接读取其他概念状态。

应用拥有 `bootstrap`、`adapters`、`compositions`。协议适配仅转换输入输出；组合通过公开动作和查询实现具名同步规则，按业务职责共置 `SYNCS.md`；规则身份在搬迁中保持稳定。新规则默认一规则一文件，小型相关规则允许共置但各有身份，规则不直接调用其他规则。Facade 仅为可选稳定入口。生产构造通过 bootstrap 使用概念导出的装配入口；测试可使用限定范围的装配。

共享技术构件位于 `backend/src/libs`，不依赖概念或组合。复用值类型须明确其含义与所有权，不通过技术库传播概念实现。Password 只维护一份概念契约，完整状态行为由 Identity 装配；Control 通过远程动作端口接入。Reader 和 Worker 不依赖管理概念实现。

**兼容与一致性。** 本次为工程结构重构，保留业务动作、错误、稳定业务/规则身份、HTTP 契约、数据库 schema 和已发布迁移、事务、RLS、幂等、outbox、屏障及重试恢复语义。Control 内的跨概念动作继续使用原同库事务；跨进程继续使用持久协议，不引入分布式事务。目录移动本身不要求数据库迁移，须用原有真实数据库和故障验收证明。

**替代关系。** 替代 ADR-0006 的“一个概念只对应 Control 内包级构建边界”及 ADR-0018/0026 的 `concepts/syncs/gateway/platform/shared`、`apps/libs` 固定物理布局。Modulith 仍验证应用装配后的叶模块和依赖，Gradle 另行验证独立构建边界。同步方法与规格的旧映射迁移为具名规则实现映射。保留 ADR-0022/0028 的运行隔离与数据所有权、ADR-0025 的已发布迁移只读政策。

**取舍。** 沿用包级构建可降低一次迁移成本，但无法单独编译概念；将概念部署为进程会增加跨进程协调成本，当前没有该需求。选择独立 library 构建并由四应用按职责装配，承担构建清单与测试设施维护成本。

**验收。** 完整发现 39 个模块；各自可编译和测试；架构门禁覆盖真实源码、构建和装配，隔离植入的违规必须使门禁失败；规格、组合、协议、事务及故障场景验收通过。静态结构通过不能替代运行正确性。任务分解及执行证据在 `.scratch/backend-concept-modules/` 维护。


ADR-0031 边界审查补充：ServiceHealth 原实现直接读取发版投递状态的聚合函数，违反概念独立的状态读取约束。
此次将该只读查询归入 DeliveryOutbox 的 DeliveryHealthApi，再由 platformHealth 组合合并心跳和投递健康。
这是明确的内部职责纠正；既有 HTTP 响应、数据库函数、运行角色与发布迁移均保持兼容。

ReaderSecurity 原有的 requeueUser / revokeUser 通过 SQL 函数读取并投影 User 事实，也属于此次明确发现的边界缺陷。
它们现归入 User 的 requeueIdentity / revokeIdentitySessions 系统动作，组合仍保持先提交源撤销版本、再安装读侧屏障的既有事务和恢复协议。

<a id="adr-0032"></a>

## 概念目录与组合命名

**状态。** 2026-11-16 用户确认按概念设计的工程形状重命名目录与规则类，并授权改写 ADR-0031 的布局条款。四进程边界不在本次范围。

**决定。** 保留 Control、Identity、Worker、Reader 四个独立进程，以及 Gradle 叶名（`:control`、`:page`、`:contract`）。概念 Java 包继续使用 `io.edition.concepts.<context>.<concept>` 与 `io.edition.platform.<concept>`。物理目录改为：

```text
backend/apps/{control,identity,worker,reader}/
backend/modules/<context>/concepts/<concept>/
backend/libraries/{contract,read-model,values,request-context,testing}/
```

应用内的组合目录与 Java 包由 `compositions` 改为 `composition`。Reader 的被动结果类型放在 `io.edition.contentapp.composition.shared`。具名规则的实现类后缀由 `Sync` 改为 `Mediator`；`@SyncRule` 的值保持原规则身份，类名不写入持久记录。`SYNCS.md` 仍是组合规格。Modulith 模块身份 `syncs` 保持不变。

**替代关系。** 替代 ADR-0031 的物理目录、组合包名和规则类后缀。不替代 ADR-0031 的四应用装配、概念独立构建、技术库边界、远程 Password 适配，以及 ADR-0022/0028 的运行隔离与数据所有权。

**兼容。** 不改变业务动作、错误、HTTP 契约、数据库 schema、已发布迁移、事务、RLS、幂等、outbox、屏障和重试恢复。目录移动不要求数据库迁移。

**代价。** 源码路径、组合包和规则类名一次性改变；规则身份、工程坐标和概念包名继续维持原契约，避免把目录命名扩散成运行身份。目录与规则类名的后续替代见 [ADR-0033](#adr-0033)。

<a id="adr-0033"></a>

## 入口规则与概念分层

**状态。** 2026-11-16 用户确认迁到概念设计契约的最终形状，并删除 `@SyncRule`。

**决定。** 四个进程保持独立。每个应用源码根为 `entry/`、`compositions/`、`bootstrap/`。入站适配器只调用公开 `<Action>UseCase`。一条 `Requesting` 或 HTTP 入口规则对应一个 UseCase。监听完成事件、可独立调度或恢复的后续规则命名为 `<Action>On<Event>`。同一事务内的后续步骤留在所属 UseCase 的内部方法。只转发的 Facade 取消。

概念位于 `backend/libraries/<concept>/`，内部分 `api/`、`application/`、`domain/`、`adapters/`。装配类是 `adapters/<Concept>Configuration`。`api` 与 `domain` 不依赖 application、adapters、entry、compositions 或 bootstrap。概念之间仍然零依赖。技术库仍在 `backend/libraries/`。

删除 `@SyncRule`。规则身份是 `SYNCS.md` 的 `sync` 名，以及 `RuleCompletion.claim` 使用的同名字符串。类名不写入持久记录。

**替代关系。** 替代 ADR-0032 的 `composition`、`Mediator`、`Facade`、`@SyncRule` 和 `backend/modules/<context>/concepts` 布局。不替代四进程、Gradle 叶名、技术库边界、远程 Password 适配，以及 ADR-0022/0028 的运行隔离与数据所有权。

**兼容。** 不改变业务动作、错误、HTTP 契约、数据库 schema、已发布迁移、事务、RLS、幂等、outbox 和恢复语义。`claim` 字符串保持原规则名。

<a id="adr-0034"></a>

## 共享主库的单写多读

2026-11-18 用户确认应用零依赖、弹性扩展、共享安全视图与唯一写入所有者，并接受共享主库故障域。
同时要求先消除复杂度，在质量和性能提升的前提下精炼约 20% 的代码。

应用独立构建和运行。每类业务事实归唯一命令所有者写入。
阅读实例使用数据库只读身份，通过版本化视图和受限函数读取规范 Release、当前权限和当前会话。
权限与内容在同一个 PostgreSQL 快照中判定。API token 的撤销、有效期、空间范围，以及浏览器会话的站点和账号状态在读取时验证。
请求级授权结果仅供本次读取，正文与发版仍可按不可变身份缓存。读实例通过共享数据库协调，新增读实例使用相同读契约。

当前工程为 Control、Reader、Worker 三个应用与 38 个概念。IdentityProvisioning 随跨进程注册补偿协议退役；Password 由 Control 本地装配并唯一写入独立凭据状态。注册、改密、重设和擦除与 User、Session 在同一数据库事务完成；不再依赖 Identity 进程、账户投影或远程密码补偿。迁移既有部署时必须先受控导入现有凭据，再切换命令所有者，不允许静默清空密码。

User 当前状态与 readerEpoch 现在直接参与安全视图授权；密码及全量会话撤销在原事务推进版本，账号生命周期在 User 内推进版本。身份复制 Worker、身份 outbox 与用户屏障对账已退役，回滚不需要远端修复。

后台索引与外部效果按实际所有权运行。切换消费方后删除只为应用间复制事实服务的序列化、领取续租、回执和对账。
已发布迁移保持原样，通过追加迁移和真实旧数据验证升级。
主库可用性、连接容量和迁移窗口由写入与阅读共同承担。

当前实施覆盖 Markdown、HTML、首页、TOC、sitemap、robots 与路径重定向的主库读取。
配置和阶段验证见 [DELIVERY](../../infra/README.md)。
默认拓扑、文件资源接口、搜索、身份命令与旧投影清理仍在迁移。
整体切换完成后，以此替代 ADR-0022/0028 的独立阅读库、事实投影和跨库安全屏障要求。

<a id="adr-0035"></a>

## 阅读前后端分离

**状态。** 2026-11-19 用户确认方向，同日完成切换。Reader 只提供 JSON 与机器可读资源；阅读页、登录、退出和搜索由 reading 渲染。边缘按本节把 `/api/content/*`、`/sitemap.xml`、`/robots.txt`、`/llms.txt`、`/{space}/llms.txt`、`?view=markdown|source` 与 `/healthz` 交给 Reader，`/_auth/*` 交给 Control，其余交给阅读前端。Control 的读者命令只保留 `/_auth/session`、`/_auth/session/refresh`（含无脚本表单分支）和 `/_auth/history`。下文背景写的是切换前的 Reader，决定条文保持不变。

**背景。** Reader 目前把「决定」和「呈现」放在同一组 HTML 路由里：`read_document` 给出 `ok`、`redirect`、`path_redirect`、`home_redirect`、`attachment`、`forbidden`、`page_not_found`，Reader 直接把它们变成 301/302、403 登录页、404 页和正文 HTML，并由此产生浏览与未命中统计。`reading` 只读单个固定空间做静态构建，不处理 Host、重定向、登录和统计。

**决定。**

- Reader 只返回 JSON 与机器可读资源，不再渲染 HTML。判定权威仍在主库读契约。
- 接口遵循 HTTP 语义：状态码就是结果，重定向是真正的 3xx 加 `Location`，错误是 RFC 9457 `problem+json`。不把 301、403、404 包进 200 响应体。
- 页面是资源：`GET /api/content/pages/{path}`。200 返回页面 JSON；301/302 返回目标；303 指向附件字节地址；403、404、401、503 为 `problem+json`。站点是资源：`GET /api/content/site`。
- 响应带验证器与缓存指令。站点与页面以响应体 SHA-256 作强 `ETag`，支持 `If-None-Match`，授权通过后才可回 304；匿名为 `public, no-cache`，带凭据为 `private, no-cache`，均带 `Vary: Cookie, Authorization`。授权判定本身不缓存。
- 读者会话是 Control 提供的一个资源：`/_auth/session`（GET 查询，无有效会话为 401；POST 以 JSON 登录，成功 201；DELETE 退出，204）与 `/_auth/session/refresh`（POST 续期，204）。成功设置 Cookie，失败为 `problem+json`，不再输出 HTML 表单。`returnTo` 由前端只接受站内相对路径。登录页是前端路由。
- Cookie 保持 `__Host-space_reader`、`Secure`、`HttpOnly`、`SameSite=Lax`。会话写操作校验 `Origin`，缺失时以 `Sec-Fetch-Site` 兜底，跨站拒绝。
- 浏览统计为 `POST /api/content/events`，成功返回 202。种类为 `pv` 与 `notfound`。由前端服务端在渲染响应后发出，请求带站点 `Origin` 与可信转发的客户端地址，无脚本读者同样计入；Reader 重新判定路径，前端不能自行断言。搜索与点击沿用 `search-events`。
- 正文由前端渲染并净化。Reader 只给原文、格式、属性、SEO 与内容哈希。渲染配置以 `contracts/markdown-rendering.md` 与共享黄金样例为准，前端与 Control 预览用同一组样例守门。Reader 内的渲染器只保留给 `llms.txt` 与 `?view=markdown`。
- 通用阅读前端用 Astro 服务端渲染，转发站点 Host，沿用 Reader 现有的可信代理规则，登录、搜索以岛屿实现。现有博客静态构建作为独立部署档位保留。
- 边缘路由：`/api/content/*`、`/sitemap.xml`、`/robots.txt`、`/llms.txt`、`/{space}/llms.txt` 与 `?view=markdown|source` 交给 Reader，`/_auth/*` 交给 Control，其余交给阅读前端。契约不另加版本路径，仍随应用版本演进。
- 无脚本读者的同域表单路由由阅读前端提供：`GET /_login?returnTo=`（登录页）、`POST /_login`、`POST /_logout`（`form-urlencoded`）；无脚本续期不经前端，见下一条。前端服务端代调 Control 的 `/_auth/session` 资源（JSON），带站点 `Origin`、`Host`、`X-Forwarded-Proto/Host` 与可信转发的客户端地址，把 Control 的 `Set-Cookie` 原样转给浏览器，成功后 303 到已校验的站内 `returnTo`（退出回 `/_login`），失败按上游状态码渲染并显示 `traceId`；`returnTo` 为站外地址返回 422。前端自身也拒绝跨站表单 POST（`Origin`，缺失时 `Sec-Fetch-Site: same-origin`）。边缘路由中 `/_login`、`/_logout` 归阅读前端，`/_auth/*` 归 Control；有脚本时登录页可直接调用 JSON 资源。
- 无脚本续期由 Control 直接接受表单。刷新 Cookie `__Secure-space_reader_refresh` 的 Path 保持 `/_auth`，浏览器不会把它发给前端的 `/_refresh`，因此前端不再提供该路由，「继续阅读」表单直接 `POST /_auth/session/refresh`（`application/x-www-form-urlencoded`，字段 `returnTo`；边缘已把 `/_auth/*` 交给 Control）。该端点按 `Content-Type` 分支：JSON 分支不变（204 / `problem+json`）；表单分支仍校验 `Origin`（缺失时 `Sec-Fetch-Site: same-origin`），成功 303 加新 Cookie，`Location` 是校验后的站内相对路径（单个 `/` 开头，非 `//`，无反斜杠与控制字符，含解码后复核，长度不超过 2048，不合法回落 `/`，不开放重定向）。续期令牌失效时清 Cookie 并 303 到 `/_login?returnTo=`；共享主库等依赖故障返回 503/504 的 HTML 页，带 `Retry-After` 与 `X-Request-Id`（正文显示同一请求号）、保留凭据，并提供回 `returnTo` 重试的链接。表单分支的跨站拒绝仍是 403 `problem+json`。
- 附件字节地址为 `/api/content/spaces/{slug}/content`（边缘归 Reader），页面资源以 303 指向它，前端不代理字节。

**迁移顺序。** 先加接口并与现有 HTML 并存，重新生成 `delivery-openapi.json`；再让阅读前端接管，把 `serve`、`private-reader`、`site-search` 验收场景改为跑在前端上；最后切换边缘路由，删除 Reader 的模板、静态资源与 HTML 路由，以及 Control 的表单和旧的 `/_auth/login`、`/_auth/refresh`、`/_auth/logout`。任何一步都不得让站点停止可读。

**被放弃的方案。** 直接删除 Reader HTML：会同时丢失重定向、拒绝、统计和私有登录入口。把判定结果放进 200 响应体：CDN、监控与重试都会误判成功，也无法按状态码缓存。JSON:API 与 GraphQL：前者要重写现有错误与分页外形，后者脱离 OpenAPI 契约流水线，也不能被 CDN 与命令行直接使用。前端只靠静态构建：无法按 Host 选站点，也无法实时判定私有阅读与撤权。

**代价。**

- 浏览信标可被伪造。服务端校验 Origin 与站点绑定，`pv` 必须解析到当前可读页面，`notfound` 必须解析为缺失，并限流；访客估算仍用 站点+UTC 日 的 HMAC，不保存原始 IP。统计保持估算口径，不作审计依据。
- 出现两套渲染实现（前端与 Reader 机器表示），靠共享黄金样例防漂移。
- 页面与目录各一次请求，比聚合接口多一次往返；换来可缓存、可观测和与现有契约流水线一致。
- 多一个运行单元。阅读前端无状态，按内容哈希缓存。
- 切换期间 Reader 与前端并存，验收需覆盖两条路径。

**替代关系。** 修订 ADR-0028 中读者页面与登录表单由 Reader 提供的部分，其余读者认证、会话与历史归属不变。不改变 ADR-0034 的共享主库读契约、权限判定与撤权语义。

<a id="adr-0036"></a>

## 三进程命名

2026-11-20 确认三个进程按唯一职责命名：Control 是业务事实的唯一写入方，Content 提供已发布内容，Index 只重建搜索索引并上报心跳。邮件、导入、导出和回收调度仍留在 Control。概念工程保持平铺，不并入应用。

Index 的目录、Gradle 工程、包、产物和运行角色都使用 `index`。心跳身份是 `edition-index`。Content 的包是 `io.edition.contentapp`，因为 `io.edition.content` 已是契约值类型。表示该进程的类型使用 `Content` 前缀。读者概念 `ReaderSecurity`、权限角色 `reader`、已发布数据库角色和 HTTP 路径保持原名。
