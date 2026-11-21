# Edition Control CLI 操作指南

面向管理人员、运维人员和 AI Agent。适用于 editionctl 1.0 原生 `control` 入口。旧协议已删除。
采用约 80% ASD-STE100 风格：短句、统一术语、明确条件和单步动作。中文说明不表示通过英语词典合规认证。

## 操作约定

明确目标。读取事实。预演变更。按已有授权执行。核验当前结果。结果未知时保留原意图。
示例使用 Bash 和 jq。示例 UUID 仅供预演；真实执行前替换为已核对的资源 ID。

```sh
set -euo pipefail
umask 077
PROFILE='example'
TENANT_ID='00000000-0000-0000-0000-000000000001'
SPACE_ID='00000000-0000-0000-0000-000000000002'
PAGE_ID='00000000-0000-0000-0000-000000000003'
TENANT=$(jq -cn --arg tenant "$TENANT_ID" '{tenantId:$tenant}')
SPACE=$(jq -cn --arg tenant "$TENANT_ID" --arg space "$SPACE_ID" '{tenantId:$tenant,spaceId:$space}')
PAGE=$(jq -cn --arg tenant "$TENANT_ID" --arg space "$SPACE_ID" --arg page "$PAGE_ID" '{tenantId:$tenant,spaceId:$space,pageId:$page}')
```

profile 固定服务地址与凭据来源。PAT 限制任务范围，服务端仍检查用户的当前权限。ETag 是并发修改基线。回执标识原始操作意图。

## 案例一：初始化与按需发现

由秘密管理器注入 `EDITION_PAT`。只把变量名传给配置命令。

```sh
editionctl configure --profile "$PROFILE" --base-url https://control.example.com --token-env EDITION_PAT
editionctl --profile "$PROFILE" config get
editionctl --profile "$PROFILE" config inspect
editionctl --profile "$PROFILE" control auth status
editionctl --help
editionctl schema control --brief
editionctl schema control.spaces.pages --brief
editionctl schema control.spaces.pages.edit --brief
editionctl schema control.PageDetail
```

若使用系统凭据库，配置时省略 token-env，再通过 `config credential set --stdin` 导入。不要将秘密写入聊天、命令参数或日志。
Schema 描述当前发行物接受的契约快照。`--brief` 输出单行 JSON，保留方法约束并省略公共选项说明；公共选项查该命令 `--help`，省略 `--brief` 可取完整说明。description 解释含义，不证明当前资源状态。仅在需要时用 `--resolve-refs` 展开类型。
config inspect 只报告指定来源的本地状态，不读取凭据库、不枚举其他来源，也不证明远程认证。助手也可机器查询，例如 `schema control.spaces.pages.+inspect`、`schema control.+receipt`；CLI options 与 native API parameters 分开描述。
完成条件：认证上下文中的主体、租户上限、scopes 与有效期符合任务要求。

命令地图只返回直属 `subcommands`，沿其 `schema` 字段逐层查询；组用途与叶子操作均来自当前命令模型。无须把所有接口或类型载入上下文。本地校验失败时，`error.violations` 返回有界字段路径和约束码，例如 `body.mode / pattern`；动态键显示为 `*`，不会输出输入值。修正本地拒绝后可重新预演；发送后的未知写入仍须按恢复步骤处理。

## 案例二：定位空间并控制读取体积

```sh
QUERY=$(jq -cn --arg tenant "$TENANT_ID" '{tenantId:$tenant,fields:"items(id,name,status),nextCursor",limit:50}')
editionctl --profile "$PROFILE" control spaces list --params "$QUERY" --page-all --page-limit 10 --page-delay 100
editionctl --profile "$PROFILE" control spaces get --params "$SPACE"
```

每行是一个 API 页。最后一页的 nextCursor 非空时，保存游标并用同一查询续读；达到页数上限不代表读取完整。
fields 由服务端执行。只选择需要的字段。动态 map 应整体选择。自动分页必须保留 nextCursor。
完成条件：目标 ID、归属和状态符合意图。多个候选或效果分歧未解决时，先对齐目标。

## 案例三：创建空间和页面，组合 JSON 管道

```sh
editionctl --profile "$PROFILE" control spaces create --params "$TENANT" --json '{"name":"研发知识库","mode":"authored"}' --dry-run
SPACE_ID=$(editionctl --profile "$PROFILE" control spaces create --params "$TENANT" --json '{"name":"研发知识库","mode":"authored"}' --invocation-id guide-space-01 | jq -er '.id')
SPACE=$(jq -cn --arg tenant "$TENANT_ID" --arg space "$SPACE_ID" '{tenantId:$tenant,spaceId:$space}')
editionctl --profile "$PROFILE" control spaces pages create --params "$SPACE" --json '{"title":"接口规范","slug":"api-spec","format":"markdown"}' --dry-run
PAGE_ID=$(editionctl --profile "$PROFILE" control spaces pages create --params "$SPACE" --json '{"title":"接口规范","slug":"api-spec","format":"markdown"}' --invocation-id guide-page-01 | jq -er '.id')
PAGE=$(jq -cn --arg tenant "$TENANT_ID" --arg space "$SPACE_ID" --arg page "$PAGE_ID" '{tenantId:$tenant,spaceId:$space,pageId:$page}')
```

set -o pipefail 保留 CLI 的失败状态。上一步失败时，不使用提取结果。
重复相同意图使用同一 invocation-id。不同业务意图使用新的 ID。完成条件：重新读取确认空间模式、页面内容与归属。

## 案例四：基于 ETag 编辑正文

```sh
editionctl --profile "$PROFILE" control spaces pages +inspect --params "$PAGE" > page-before.json
ETAG=$(jq -er '.headers.etag' page-before.json)
EDIT=$(jq -cn --argjson target "$PAGE" --arg etag "$ETAG" '$target + {"If-Match":$etag,"Idempotency-Key":"guide-edit-key-01"}')
cat > content.json <<'CONTENT'
{"content":"# 接口契约\n\n管理请求使用 HTTPS。","intent":"draft_only"}
CONTENT
editionctl --profile "$PROFILE" control spaces pages edit --params "$EDIT" --json @content.json --dry-run
cat content.json | editionctl --profile "$PROFILE" control spaces pages edit --params "$EDIT" --json - --invocation-id guide-edit-01 --yes
editionctl --profile "$PROFILE" control spaces pages get --params "$PAGE"
```

pages +inspect 读取 content 快照及同次正文强 ETag。摘要与完整详情不作为新编辑基线。保留 ETag 自带引号。强 ETag 与 Idempotency-Key 通过原生 params 发送为 header。一次请求只有一个 stdin 来源。
预演不读取凭据，不发送业务请求，不创建 journal。它不保留服务端权限或版本。并发基线冲突时重读并协调修改；409 idempotency_request_in_progress 按案例八恢复原意图。
完成条件：当前正文和 revision 符合目标。显式 intent=draft_only 仅保存 authored 工作稿并抑制自动发版；intent=hotfix 仅用于 synced 热修 live 快照、晋升新 Release 并应用保留策略，须额外核验 live。服务器拒绝模式与意图不符的请求。草稿授权不适用于 synced 热修；编辑统一要求 --yes，预演仍完全离线，站点交付另行检查。

## 案例五：发布与客户交付

先核对空间的模式、autoRelease、当前在线版本和站点挂载。发布可能影响所有挂载该空间的站点。

```sh
editionctl --profile "$PROFILE" control spaces pages publish --params "$PAGE" --dry-run
editionctl --profile "$PROFILE" control spaces pages publish --params "$PAGE" --invocation-id guide-publish-01 --yes
editionctl schema control.spaces.releases.build
```

仅在手动发版模式且已对齐完整发布范围时执行 release build；它使用全部已发布工作页面，不只包含当前页面。

```sh
editionctl --profile "$PROFILE" control spaces releases build --params "$SPACE" --dry-run
editionctl --profile "$PROFILE" control spaces releases build --params "$SPACE" --invocation-id guide-release-01 --yes
SITE_ID='00000000-0000-0000-0000-000000000004'
SITE=$(jq -cn --arg tenant "$TENANT_ID" --arg site "$SITE_ID" '{tenantId:$tenant,siteId:$site}')
editionctl --profile "$PROFILE" control sites deliveries get --params "$SITE"
```

完成条件：核对在线 release、交付终态与 onlineEpoch ≥ targetEpoch，再使用预期读者身份核验客户 URL。管理权限不替代阅读权限。

## 案例六：导入与二进制输出

先将 SPACE_ID 指向已授权的 active/synced 空间，并重建 SPACE 参数。

```sh
editionctl schema control.spaces.imports.create
editionctl --profile "$PROFILE" control spaces imports create --params "$SPACE" --upload reviewed-bundle.zip --upload-content-type application/zip --dry-run
editionctl --profile "$PROFILE" control spaces imports create --params "$SPACE" --upload reviewed-bundle.zip --upload-content-type application/zip --invocation-id guide-import-01 --yes > import-result.json
IMPORT_JOB_ID=$(jq -er '.job.id // .id' import-result.json)
IMPORT_JOB=$(jq -cn --argjson target "$SPACE" --arg job "$IMPORT_JOB_ID" '$target + {jobId:$job}')
editionctl --profile "$PROFILE" control spaces imports get --params "$IMPORT_JOB"
```

受理不表示作业完成；根据返回状态继续读取同一作业。held/flagged 需要审查报告并对齐后果。不要把 job ID 当作 release ID。
下载前，将 EXPORT_JOB_ID 设置为已经完成的导出作业 ID。导入与导出作业不共用 ID。使用唯一的新文件路径：

```sh
: "${EXPORT_JOB_ID:?Set the verified completed export job ID}"
EXPORT_JOB=$(jq -cn --argjson target "$SPACE" --arg job "$EXPORT_JOB_ID" '$target + {jobId:$job}')
editionctl schema control.spaces.exports.download
editionctl --profile "$PROFILE" control spaces exports download --params "$EXPORT_JOB" --output release-bundle.zip
python3 -m zipfile -t release-bundle.zip
```

文件默认位于当前目录；通过 --file-root 显式选择其他根。根内符号链接、父路径穿越和覆盖已有输出均被拒绝。上传支持声明的文件 MIME；native --upload 使用现有文件。

## 案例七：批量归档

固定已对齐的目标集。依赖项分阶段，只有独立项并发。以下 UUID 仅供预演。

```sh
cat > batch.json <<'BATCH'
{"id":"archive-approved-01","items":[{"id":"space-a","method":"control.spaces.archive","params":{"tenantId":"00000000-0000-0000-0000-000000000001","spaceId":"00000000-0000-0000-0000-000000000002"}}]}
BATCH
editionctl schema control.BatchRequest
editionctl --profile "$PROFILE" control +batch --json @batch.json --dry-run
editionctl --profile "$PROFILE" control +batch --json @batch.json --parallel 2 --yes
```

全部输入先校验；并发上限为 4。默认首错停止新增项，已提交项继续完成。输出包含逐项结果和最后汇总。
汇总 completedRequests 仅统计请求调用，backgroundCompletionVerified=false；202 的 state=accepted 不证明后台完成。已知页面集合可用 pages.batchGet（summary/content）；同空间原子进版/撤版用 pages.batchPublish/batchUnpublish，最多一次自动发版，区别于通用 +batch 的独立调用。
恢复沿用批次 ID、记录 ID 和原输入。完成条件：没有 failed/remaining 项，且重新读取每个目标确认状态。

imports get 与 sites deliveries get 可显式使用 --wait、--wait-timeout、--wait-attempts、--wait-interval；只轮询原目标，不重提业务。返回 wait 与 observation；terminal 与 successful 分开，budget_exhausted 保留最后观察。delivery 的 --target-epoch 或首读目标一经固定便不追新目标，superseded 必须报告目标已替换。MCP 与 +batch 的 wait 对象共享同一预算与执行约束。

## 案例八：恢复未知结果

```sh
editionctl --profile "$PROFILE" control +receipt --id guide-edit-01
editionctl --profile "$PROFILE" control +resume --id guide-edit-01
```

保留原凭据、文件、请求和幂等键。已成功意图返回保存结果；当前事实仍需重读。
未知无键写入拒绝自动重放。未知结果不得通过更换 key 或 --new-invocation 猜测重试。恢复窗口为 24 小时。
HTTP 408/429 或 409 idempotency_request_in_progress 保留未决意图。先查询当前状态；有键操作可在恢复窗口内沿用原请求和原键恢复。同键异请求的 409 冲突属于明确拒绝，不能按“处理中”重试。

## 案例九：MCP 与更新

以下命令是 MCP 客户端启动的长驻服务；由客户端管理 stdin/stdout 与退出。

```sh
editionctl mcp --resources control.spaces.pages --profile "$PROFILE"
```

该进程通过 stdin/stdout 提供 MCP。默认只读；启动 --allow-write 才注册选中的写方法。每次高影响调用仍需确认，服务端仍判权。
启动固定 profile 和文件根；工具参数不能切换身份。写工具必须提供 invocationId：新任务使用新 ID，恢复使用原 ID 与原请求。MCP _meta 和批量项的 state/replayed 区分受理、调用完成与历史回执；replayed=true 不证明当前资源状态。普通 CLI 重放会在 stderr 明示。使用官方 SDK 连接，不将普通 CLI 文本发送给 MCP stdin。

```sh
editionctl update status
editionctl update check
editionctl update apply --dry-run
editionctl update apply
editionctl update status
editionctl --version
```

沿用已配置的 HTTPS 签名源与部署策略。未配置源不表示已是最新版。scheduled 不等于安装完成；核对 applied/rolled_back、operationId 与实际版本。
更新请求不携带 Control 凭据；MCP 长驻进程不会在调用中自动替换自身。更新配置与恢复步骤见 [更新指南](UPDATING.md)。

## 错误与版本边界

错误的 error.retryAfter 保留服务端等待秒数或 HTTP 日期；先等待，再查询原回执与当前事实。error.violations 保留输入契约中的字段路径和有限错误码，未知码归一为 invalid，遗漏或超量项由 violationsTruncated 标识。未知写入返回 state=unknown。
原生成功输出为 API JSON；错误 JSON 在 stdout，诊断在 stderr。退出 0 只证明当前命令成功、预演成功或请求受理；业务完成须另外核验。
无参数或只指定资源组时返回退出码 3。发现命令须显式使用 --help。invocation-id 在预演和凭据访问前校验。
CLI、批量与 MCP 共享错误 reason。response_invalid_json 表示服务端成功响应的 JSON 损坏；io_failed 和 request_timeout 表示传输故障。写操作收到这些错误时，效果仍可能未知；保留原意图并查询结果。
credential_missing 的 hint 指明该 profile 使用的环境变量或 OS 凭据库；management_scope_required 指明方法要求的 scope，仍需主体当前权限。cross_site_request_rejected 提示检查 Session profile 的 auth-origin。import_source_unreachable 只说明服务端获取来源失败；本机认证下载成功不证明匿名远程获取可用，可改用已授权的本机 ZIP 上传。

| 原生退出码 | 处理 |
| --- | --- |
| 1 | 检查 error.code 中的 HTTP 状态和 hint；批量检查逐项结果 |
| 2 | 核对预配置凭据类型和来源 |
| 3 | 按提示修正输入；查询当前方法 schema |
| 4 / 5 | 检查契约或本地运行问题；写入结果未知时保留回执 |
| 130 | 进程等待中断，不代表服务端作业取消 |

1.0 删除旧命令和结果协议。脚本应使用 control 命令、点分 schema 和原生 JSON，例如 `.id`。
新入口以 --format json 选择格式，以 --output PATH 下载二进制。分页每行一页，不输出旧 item/summary 帧。

发行包的技能正文仅有 `edition-ops/SKILL.md`，不依赖参考文件；安装按所有权清单清理同一技能的过期受管文件，保留本地自定义文件；使用 `python3 scripts/install_skill.py` 安装，或加 `--check` 只读核对。完整参数通过当前 CLI help/schema 查询。
