# syncs: Releases flow 索引

Releases 组合按入口 flow 浅分包；每条 sync 的唯一真相源与 `*Syncs` 实现在同一包。
共享约定沿用 [syncs/SYNCS.md](../SYNCS.md)。组目录只组织流程，不承载 sync。

| 流程 | 唯一规则来源 |
| --- | --- |
| 发布（wiki 自动发版 / 发布制手动构建）与共享发版流水线 | [release](release/SYNCS.md) |
| 持续导入（synced 空间 live 作业） | [bundleimport](bundleimport/SYNCS.md) |
| 便携导出 | [bundleexport](bundleexport/SYNCS.md) |
