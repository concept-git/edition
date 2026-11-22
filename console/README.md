# 管理控制台

作者、站点管理员和平台运营员使用的界面。它只消费管理契约。业务拒绝、权限和并发仍由 Control 判定。

这一版提供两套壳、登录和规格里的入口占位。概览壳用宽侧栏。从内容或站点进入后，使用图标轨和二级菜单。access token 只留在内存里，刷新令牌留在 HttpOnly cookie。真实计数和写入留在后续工单。对真实 Control 的浏览器验收仍不在这里；导航和会话检查使用本地 auth stub，不启动平台。

在仓库根使用 Node 24 与 pnpm 11.10.0：

```sh
corepack pnpm@11.10.0 --dir console install --frozen-lockfile
corepack pnpm@11.10.0 --dir console test
corepack pnpm@11.10.0 --dir console check
```

开发服务器：

```sh
corepack pnpm@11.10.0 --dir console dev --host 127.0.0.1 --port 4177
```
