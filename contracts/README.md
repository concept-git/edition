# contracts — OpenAPI 契约（组合层资产）

- `openapi.json`：管理面契约。**后端生成、提交入库、供客户端消费**，手改无效；读者认证接口属于独立 reader 契约。
- 更新流程：后端改动 HTTP 适配器后在 Java 25 运行 `cd backend && ./gradlew :control:generateOpenApiDocs`，
  产物直接写入本目录，与实现同一提交。
- `delivery-openapi.json`：阅读入口契约。运行 `node infra/edition.ts verify private --update-contract` 合并 Reader 的 `/api-docs` 与 Control 的 `/api-docs/reader-commands`，默认检测漂移。
- 契约随应用版本演进，与概念版本无关（概念可复用于多应用）。

## Problem-code catalog

- `backend/apps/control/src/main/java/io/edition/control/compositions/flow/ProblemCode.java` 是顶层 RFC 9457 `code` 的
  唯一机器可读 catalog；springdoc 由它生成 OpenAPI enum。`violations[].code` 是独立字段校验词汇，不进顶层 catalog。
- 尚未开放的错误码在 enum 中显式标为 reserved。

当前为全新平台契约基线，不保留旧版本迁移豁免；CI 校验 OpenAPI 结构、服务产物生成漂移与前端类型消费一致性。首次正式发布后再固定受支持的发布基线。

## 内容插件登记

`content-plugins.json` 是构建内可信实现及内置类型模板的描述源。`types` 声明格式、默认解释和通用验证参数；`plugins` 独立登记编辑/呈现贡献及构建入口。`content-schemas/manifest.json` 映射内置定义需要的离线 Schema 资源；构建只收集其闭包，不依赖运行时取网。

租户可通过 ContentType 在线登记业务类型定义及不可变版本，复用已构建的可信贡献。定义声明 encoding、固定 envelope Schema 引用及可选动态实例 Schema 指针，后端执行通用校验，不追加具体类型准入分支。可执行实现的新增或升级仍需可信构建；工作台候选不会修改生产登记。发版冻结完整定义及摘要，Reader 使用冻结引用和本地实现；外部 Bundle 不能自动安装类型或代码。决策见 [ADR-0030](../docs/adr/README.md#adr-0030)。
