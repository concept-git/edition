# sync 组合层导航

每个 flow 以一个用户或系统入口为单位，组合多个概念的公开动作和查询。
业务事实与不变量留在概念中；本层负责授权、顺序、原子边界与结果翻译。

## 命名

概念使用表达对象、关系或能力的名词，名称与 `CONCEPT.md` 标题、Modulith 展示名、
叶包一致；多词名的叶包使用连写小写，例如 `TenantRegistry` → `tenantregistry`。
同步入口使用职责名加 `Syncs`，叶包取职责名的连写小写，例如
`PageEditingFacade` → `pageediting`、`BundleImportFacade` → `bundleimport`。
多入口流程可用对象名，例如 `SpaceFacade`；职责集中的流程用对象与动作命名。
`concepts` / `platform` / `syncs` 路径区分层次，叶包保持简短。协作者按实际职责命名。
仅描述事件投递、没有 `syncs` 规则声明的规格保留 Publisher / Builder / Reconciler 协作者。

## 目录与阅读顺序

`<组>/<flow>/` 共置 `SYNCS.md`、一个 `*Syncs` 入口、`package-info.java` 与专属协作者。
先读规格的 when/where/then，再读同名入口方法，最后按需进入协作者。
独立入口拆为同级 flow；小流程保持浅包，不为分层而增加目录或扩大 Java 可见性。
`SyncFlowBoundariesTest` 检查各 flow 的概念依赖、flow 间依赖无环和 sync 方法零互调；跨 flow 类型逐项登记。
新增复用先确定职责归属，避免把另一 flow 的内部类当作公共工具；完成接力以具名规则表达。

协作者按实际职责命名：`Access` 判权、`Projection`/`Directory` 查询投影、
`Input`/`Patch` 规范化、`Results` 翻译有限结果、`Cascade`/`Pipeline` 编排动作、
`Worker`/`Runner` 执行作业。避免承担任意职责的 `Support`/`Helper`。

所有变更的事务仍由入口定义；协作者加入同一事务，不因拆类而异步化。
持久作业的提交后唤醒、重试、attempt 回执与资源清理分别保持明确责任。

共享协作者按子目标组织：`principal` 解析凭据，`access` 判权与租户准入，
`resource` 查询归属和加写锁，`flow` 执行幂等与翻译公共错误，`auditing` 记录审计。
`dev` 只放开发夹具。根包的跨组事件不承载业务状态。

## 流程索引

各组索引链接到唯一的 flow 规格；具体概念依赖与行为以共置 `SYNCS.md`、代码为准。

- [身份与账号](iam/SYNCS.md)
- [内容创作](authoring/SYNCS.md)
- [发版与导入导出](releases/SYNCS.md)
- [站点托管](hosting/SYNCS.md)
- [平台操作](platform/SYNCS.md)

## 容错约定

- 先授权和检查真实归属，变更在锁内重读资源；多个资源采用固定锁顺序。
- 概念有限结果显式翻译；依赖失败向上传播，不转换为空值或成功。
- 变更幂等指纹、角色与状态文本使用固定 `Locale.ROOT`。
- 作业重试有上限；临时资源释放不覆盖原始失败，后台回执不能覆盖更新的 attempt。
- 规格接口、架构与真实 PostgreSQL 组合测试由 `:control:check` 验证。
