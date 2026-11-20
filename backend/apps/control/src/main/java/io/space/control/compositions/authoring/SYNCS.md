# syncs: Authoring flow 索引

Authoring 组合按入口 flow 浅分包；每条 sync 的唯一真相源与 `*Syncs` 实现在同一包。
共享约定（app 组合、guard 模板、租户准入）沿用 [syncs/SYNCS.md](../SYNCS.md)；全局视图 = PRD 依赖图（docs/prd/README.md）。

- [空间管理](space/SYNCS.md)：显式租户作用域的 create/list/view/update/archive/restore；列表先取 tenant 候选集，再以 `Permission.filter([tenant, space], read)` 收窄
- [页面创作与修订](pageediting/SYNCS.md)：Page + Space + Revision 的事务接力、预览、修订历史与取回
- [目录编排](tocediting/SYNCS.md)：空间目录 add/move/relabel/remove；[tenant, space] / write；synced 只读
- [标签](tagging/SYNCS.md)：打标/摘除/改名（合并）与跨空间聚合；tag/untag 为 [tenant, space, page] / write，rename 为 [tenant] / admin
- [空间分组](collection/SYNCS.md)：租户分组树 create/patch/move/remove 与空间 place/unplace；写为 [tenant] / admin，GET 为租户准入
- [权限管理](permission/SYNCS.md)：Space grant、Page restriction、主体搜索与单主体 read 判定解释；ACL 父级救援且归档只可单调收紧
- [删除与恢复](deletion/SYNCS.md)：trash/restore/listTrash 与 authored 同步摘目录
- [终结与受保护清除](termination/SYNCS.md)：空间/站点终结、受保护 purge、删除记录与重试；决定性级联在同一管理事务内
- [空间附件浏览](attachmentbrowsing/SYNCS.md)：工作集附件的可读过滤与有界游标扫描

跨组 flow 按入口 Requesting 动作的归属组落位；sync 可引用任意组的概念（组合层特权）。
