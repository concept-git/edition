# 文档导航

总体说明集中在两份文档：[产品需求](prd/README.md)定义范围、验收与规格索引，[架构决策](adr/README.md)解释边界、取舍及替代关系。接口、交换格式与界面状态按任务进入技术参考。

| 目的 | 权威入口 |
| --- | --- |
| 产品与版本 | [产品介绍](../PRODUCT.md)、[1.0.1 版本说明](../CHANGELOG.md) |
| 需求与验收 | [PRD](prd/README.md)、源码共置 CONCEPT.md 与 SYNCS.md |
| 统一术语 | [CONTEXT](../CONTEXT.md) |
| 架构取舍 | [ADR](adr/README.md) |
| HTTP 与交换包 | [接口映射](tech/API.md)、[Bundle v1](tech/BUNDLE.md) |
| 工程与部署 | [技术栈](tech/STACK.md)、[部署](tech/DELIVERY.md)、[脚本](../infra/README.md) |
| 测试 | [TESTING](tech/TESTING.md) |
| 内容类型与插件 | [需求](prd/README.md#content-types)、[工程契约](tech/CONTENT-PLUGINS.md)、[后续范围](prd/README.md#plugin-roadmap) |
| 管理 CLI | [使用指南](../clients/control/USAGE.md)、[规格](../clients/control/SPECS.md) |
| 阅读与消费 | [Reader 资源](tech/READER-RESOURCES.md)（含机器阅读）、[SpaceVFS](../clients/space/README.md) |
| 代码阅读 | [规格记法](tech/CONCEPT-NOTATION.md)、[BDD 场景](../features/README.md) |

行为维护在共置规格，PRD 维护范围与验收，ADR 维护决策理由，技术文档维护工程操作。导入测试依赖的外部格式样例保留在 reference；任务记录、研究、截图和执行报告不入库。

修改目录或文档后运行 `node infra/space.ts repository`。
