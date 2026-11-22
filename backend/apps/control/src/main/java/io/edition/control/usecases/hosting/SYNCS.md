# syncs: Hosting 托管索引

组目录只组织流程，不维护规则副本。app实例化与管理guard见[组合根](../SYNCS.md)。

| 流程 | 唯一规则来源 |
| --- | --- |
| 站点管理与挂载 | [site](site/SYNCS.md) |
| 域名绑定与核验 | [domain](customdomain/SYNCS.md) |
| 改址、迁移与重定向 | [reorganization](reorganization/SYNCS.md) |
| 独立交付投影、状态与恢复 | [sitedelivery](sitedelivery/SYNCS.md) |
| 私有阅读身份与策略投影 | [readersecurity](readersecurity/SYNCS.md) |
| 独立阅读进程（生产） | [edition-content SYNCS](../../../../../../../../../content/src/main/java/io/edition/contentapp/SYNCS.md) |

生产交付由独立 Reader、Worker 及 serving 库承担，按 ADR-0028 执行。身份、策略与内容读取以 sitedelivery、readersecurity 及 edition-content SYNCS 的当前契约为准。
