# 同步规则：独立阅读进程

Reader 使用共享主库的 `publication_v1` 读契约。每个读取在同一 PostgreSQL 快照解析 Host、已验证主域、当前授权与 live Release。页面内容、路径、属性和目录取自同一版本。站点、域名、挂载和权限使用当前已提交事实。

Reader 只返回 JSON 与机器可读资源，不渲染 HTML。阅读页、登录页、退出与搜索页由阅读前端渲染。边缘路由与会话资源见 [ADR-0035](../../../../../../../../../docs/adr/README.md#adr-0035)。

## 凭据与域名

- `ContentIdentity.publicationCredential` 接受匿名、站点 access Cookie 或空间机器令牌。发送 Authorization 时以该 header 为准。重复、畸形、失效或撤销的凭据返回 401。
- 数据库校验会话的 Host、站点、期限和 User 的当前 readerEpoch。机器令牌仅可访问其绑定空间和准许的 scope。
- 未绑定 Host 返回 404。验证过的非主域按路由重定向。代理发送的 Host 和协议仅在请求来自已配置代理地址时采纳。
- Reader 拒绝 `/_auth/**`。读者会话由 Control 提供，见 [读者会话同步规则](../../../../../../../control/src/main/java/io/edition/control/compositions/hosting/readersecurity/SYNCS.md)。

## 正文、导航和文件

| 路由 | 读契约 | 响应 |
| --- | --- | --- |
| `GET /api/content/site` | `read_document`（站点根） | 200 品牌、主域、当前主体可见的空间与导航、首页空间；无可见空间时 `spaces` 为空 |
| `GET /api/content/pages`、`GET /api/content/pages/{path}` | `read_document`、`read_mount`（仅附件） | 200 页面 JSON；301、302 带 `Location`；303 指向附件字节地址；403、404 为 `problem+json` |
| `POST /api/content/events` | `read_document` | 记录 `pv` 或 `notfound`，202 |
| `GET /api/content/toc/{space}` | `read_navigation` | 当前主体可见的 Toc JSON |
| `GET /sitemap.xml`、`GET /robots.txt` | `read_navigation` | sitemap 为匿名可见集的 XML；robots 为 `text/plain` |
| `GET /llms.txt`、`GET /{space}/llms.txt` | `read_machine` | 从匿名可见 TOC 选择目标，遵守站点及页面 noindex；`text/markdown` |
| `?view=markdown` | `read_page` | 原格式或清洗转换后的 Markdown，沿用正文授权 |
| `?view=source` | `read_files` | 同一规范地址的原文字节 |
| `/api/content/spaces/{slug}` 的快照与文件 | `read_mount`、`read_files`、`read_page` | 先复核主体与快照，再返回元数据、字节或 304 |
| `GET /healthz` | — | `{"status":"UP"}` |

`read_document` 与页面资源的对应关系：

| `read_document` 结果 | 响应 |
| --- | --- |
| `ok` | 200，页面 JSON，强 `ETag` 取响应体 SHA-256 |
| `redirect`、`path_redirect` | 301，`Location` 为目标绝对地址 |
| `home_redirect` | 302 |
| `attachment` | 303，`Location` 指向 `/api/content/spaces/{slug}/content` 的快照绑定地址 |
| `forbidden` | 403 `problem+json` |
| `page_not_found`、`space_not_found` | 404 `problem+json` |

授权证明与主域规则沿用上文；凭据非法返回 401，共享主库不可用返回 503。`Location` 按可信代理给出的协议与主机组成。`If-None-Match` 命中时，授权通过后才返回 304。匿名响应为 `public, no-cache`，带凭据为 `private, no-cache`，均带 `Vary: Cookie, Authorization`。错误一律是 `problem+json`，包括 sitemap、robots、llms、markdown 与 source。

`events` 验证 Origin 等于当前站点 Origin，`pv` 的路径必须解析为当前主体可读页面，`notfound` 的路径必须解析为缺失，否则 422；超限返回 429。访客估算沿用站点加 UTC 日的 HMAC，客户端地址仅取可信代理转发值。事件进入现有有界非阻塞日志队列，不写数据库。

正文缺失时检查匹配的重定向，权限拒绝返回 403。目录树过滤无权目标并保留可见后代。附件字节只从 `/api/content/spaces/{slug}/content` 读取，使用授权返回的对象键。对象大小和内容摘要验证见 [资源接口](../../../../../../../../../clients/edition/README.md)。

文件游标绑定当前主体及快照版本。游标损坏返回 422，版本或主体变化返回 409。

`llms.txt` 与 `?view=markdown` 仍使用阅读端清洗规则把 Markdown/HTML 收成安全表示后再转回 Markdown。正文原文、插件呈现和页面 HTML 由阅读前端负责。

## 搜索

`ContentSearch.search` 取得站点与搜索代信息，再查询 Meilisearch 候选。查询候选缓存按索引代、查询及偏移标识。对每批候选通过 `read_search_pages` 复核当前访问权、页 ID 和内容摘要，旧代的过期内容不得作为结果。响应前重新检查搜索上下文。带空间快照查询时，资料代尚未就绪返回 503。失效搜索游标要求重新查询。

`GET /api/content/search` 返回 JSON。同源 `POST /api/content/search-events` 验证 Origin 和签名，只产生可签名的追踪。无脚本搜索页由阅读前端渲染。

## 故障与部署

共享主库中断时，阅读返回 503，恢复后可继续使用仍有效的会话。搜索引擎故障只影响搜索请求。应用副本共用签名密钥和数据库读契约，部署和角色权限见 [部署手册](../../../../../../../../../infra/README.md)。
