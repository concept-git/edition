# CLAUDE.md

树外只读的 Python SpaceVFS。不持有内容真相，不进入后端概念库。

## Project map

- `SpaceVFS` — 只实现 `readdir` / `stat` / `read_bytes`。写回 Page 或发版不走本包
- 一个 mount 对应一个站点 host、一个空间 slug、一个可选 Bearer。禁止连接管理库
- 不要把本包加入 `backend/` Gradle 或浏览器验收工程

<important if="you are changing the VFS client or delivery contract consumption">
- `space_vfs.client` 只消费已提交的 `contracts/delivery-openapi.json`。
</important>

<important if="you are handling tokens, workspace YAML, or client state">
- 令牌用 `SecretStr`。`get_state()` 不写明文。workspace YAML 用 `${SPACE_TOKEN}`。
</important>

<important if="you are changing paths, cache, or failure behavior">
- 以 `docs/tech/READER-RESOURCES.md` 为准。
</important>
