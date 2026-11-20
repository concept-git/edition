# flow: reader security delivery

ADR-0034 共享主库的身份判定直接读取当前 User 状态与 readerEpoch。
Cookie 的站点、host、期限和签发版本必须在读取正文的同一快照中验证；旧的 user_security 安全头、应用进度和用户屏障不参与主库读取。

ReaderSessionRevocation 接收 PasswordSet、PasswordChanged、PasswordReset 与 Session.HolderChanged，在原事务提交前按账号合并递增版本。
失败回滚版本，不留下需要远端对账的状态；User 自身在停用、恢复、擦除的实际状态转换中推进版本，恢复不会激活旧会话。
凭据命令统一采用 User→Password→Session 的锁顺序。reset 的非消费定位只用于先锁 User，消费挑战时必须复核其有效性。

读者命令由 Control 处理，Reader 只持有读取凭据。阅读协议见 [Reader SYNCS](../../../../../../../../../../content/src/main/java/io/space/contentapp/SYNCS.md)。共享主库故障域已被用户接受，不再保留独立身份库离线登录的验收。

Control 的 ReaderCommands 在同一主库事务内解析已验证的主域，锁定 User 并验证凭据后签发站点会话。续期与历史在锁内复核当前会话与账号版本，退出按站点和 refresh 证明结束会话。历史写入与账号擦除共用 User 锁。

读者会话是一个资源（[ADR-0035](../../../../../../../../../../../../docs/adr/README.md#adr-0035)）。`GET /_auth/session` 会话有效为 200 `{authenticated:true}`，否则 401；`POST /_auth/session` 以 JSON `{email,password}` 登录，成功 201 并设置 Cookie，响应体只含 `expiresAt`；`POST /_auth/session/refresh` 续期，成功 204；`DELETE /_auth/session` 退出，204。失败返回 `problem+json`（`invalid_credentials`、`reader_session_invalid`、`cross_site_request_rejected`、`validation_failed`、`rate_limited`），限流给出 `Retry-After: 60`。`returnTo` 由阅读前端只接受站内相对路径。Cookie 保持 `__Host-space_reader`、`Secure`、`HttpOnly`、`SameSite=Lax`；写操作要求 https，校验 `Origin`，缺失时仅接受 `Sec-Fetch-Site: same-origin`。登录页由阅读前端提供。Control 不提供 `/_auth/login`、`/_auth/refresh`、`/_auth/logout`。

无脚本续期（[ADR-0035](../../../../../../../../../../../../docs/adr/README.md#adr-0035)）：刷新 Cookie 的 Path 保持 `/_auth`，「继续阅读」表单直接 `POST /_auth/session/refresh`（`application/x-www-form-urlencoded`，字段 `returnTo`）。表单分支同样校验 `Origin`/`Sec-Fetch-Site`；成功 303 到校验后的站内 `returnTo`（非单个 `/` 开头、`//`、含反斜杠或控制字符、超长均回落 `/`）并设置新 Cookie；续期令牌失效时清 Cookie 并 303 到 `/_login?returnTo=`；依赖故障返回 503/504 的 HTML（`Retry-After`、`X-Request-Id`，凭据不动，链接回原页重试）。JSON 分支行为不变。
