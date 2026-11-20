# syncs: Platform 平台运营（flow 索引）

Platform 组合按入口 flow 浅分包；每条 sync 的唯一真相源与 `*Syncs` 实现在同一包。
app 组合与 guard 模板见 [../SYNCS.md](../SYNCS.md)；全局视图 = PRD 依赖图（docs/prd/README.md）。

- [租户开通与冻结](tenant/SYNCS.md)：平台运维面（`/admin`）入口
- [运维证据与恢复](operations/SYNCS.md)：审计、作业、导出与存储
- [统计与只读采集](statistics/SYNCS.md)：遥测、活动、用量与流量
- [检索配置与重建](search/SYNCS.md)：字段顺序与重建请求
- [边缘证书探查](certificatecheck/SYNCS.md)：TLS 证书只读证据
- [服务状态](servicehealth/SYNCS.md)：平台 · 服务状态（`/admin/health`）与进程心跳
- [邮件投递](maildelivery/SYNCS.md) / [邮件管理](mailadmin/SYNCS.md)
- [Webhook](webhook/SYNCS.md)：租户机器订阅与投递
- [内容插件开发与验证](pluginmanagement/SYNCS.md)：可信构建目录、开发稿、固定候选与验证证据

## 记法声明：TenantRegistry 与 Tenant

`platform.tenantregistry` 是 [TenantRegistry 平台概念](../../../../../../../../../../libraries/tenant-registry/CONCEPT.md)。`Tenant` 本身仍是
**身份类型**（Tenant 不作为产品概念）；flow 规格里的
登记处动作使用 `TenantRegistry/provision`、`TenantRegistry/suspend`、`TenantRegistry/resume`；
旧规格中的 `Tenant.provision` 是这些动作的历史别名，不代表 Tenant 身份本身拥有生命周期。
隔离依旧由成员（Membership）+ 授权（Permission）+ 空间 + 域名达成。

## 通用前置：platformOperator 模板

平台运维面不走资源链判定——它在任何租户之外，无链可判。改用**主体属性**判定，
各 flow 以 `platformOperator(credential)` 速记：

```text
where credential经管理鉴权解析sid；Session._principal(sid):(p)
      User._isPlatformOperator (p) : (true)
```

- 落地为组合根的 `PlatformOperatorGuard`，判定失败统一 403 `platform_operator_required`。
- **最小特权**：运营员身份只解锁平台运维面，对租户内资源零隐式权限——要读客户内容
  必须被正常授权或入租，于是"运营员看过客户内容"必然留下一条授权痕迹。
- 平台运维面**豁免**租户冻结检查（否则 suspend 之后无法 resume）。
