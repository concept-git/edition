# editionctl 架构

独立 Java 25 项目，通过 HTTP 使用 Control。管理事实与业务授权归服务端，CLI 保留原生参数和结果。

## 模块与依赖

| 模块 | 职责 | 允许依赖 |
| --- | --- | --- |
| command | CLI 语法、schema 展示、MCP、批量调度与本地命令组合 | execution 的 ControlCall，以及必要公共模块和 update |
| execution | 请求校验、预演、调用、响应、分页及原意图恢复 | contract、state、shared |
| update | 独立签名源、检查、安装与回滚 | shared |
| contract | 发行物契约、按需加载与契约样例 | shared |
| state | 私密配置、凭据引用、加密意图与回执锁 | shared |
| shared | JSON、固定错误、TLS/期限、私密文件和构建版本 | 无项目模块依赖 |

业务执行与更新模块之间零直接依赖。contract/state 是必要公共能力，不反向调用入口或业务执行。
command 是组合层：Aesh/MCP SDK 只在此使用，JSON Schema 校验归 execution，系统凭据库归 state。
公共 HTTP 工具接收 CA Path，不接收业务 profile；PrivateFiles 与 BuildInfo 不归更新或凭据模块所有。

## 调用路径

`Main → CliApplication → CommandTree → ControlCall → ControlOperations → ControlTransport / ResponseReader`

固定命令和动态 API 使用 Aesh 命令模型，动态 API 按生成契约注册。CliCommand 将原始 argv 交给 Aesh，统一类型转换、稳定错误和 help/version；CommandTree 组合命令，CommandSchema 投影实际模型，所有 help 保留 Examples。MCP 与批量直接使用共用执行器。

非交互发行物仅保留 Aesh 与 terminal-api；后者提供解析模型引用的格式化、终端值类型和 Config。Readline、TTY 与终端检测实现不打包；CLI 不创建 Aesh Console/Runtime Runner，MCP stdio 由官方 MCP SDK 管理。

ControlCall 是执行模块唯一公开调用入口。调用者提供原生选项和 IO；已观察 HTTP 状态、回执 ID、输入消费状态及恢复过程由模块持有。批量与 MCP 的各次调用互不共享状态。
`prepare` 返回绑定本次请求与选项快照的 Prepared 调用；批量全部预校验后才调度执行，不再次读取正文或 stdin，发送上传前仍验证文件摘要。批量负责并发和逐项汇总，不重新实现单项语义。
后台更新由 CliApplication 以 Runnable 注入，在校验和确认通过且非预演时触发；执行模块不认识更新配置或实现。更新命令由组合层直接调用 update。

RequestInput 校验原生 params/json、字段用途、输入保真和文件根。CallOutput 统一成功格式、脱敏与稳定失败协议。ResponseReader 拥有响应期限、错误契约分类、下载及响应校验；接收响应头即保存状态，正文损坏也保留实际 HTTP 状态。
MCP 启动时固定身份与文件根，默认只读；参数不能切换身份。不同入口共享校验与执行，不启动 shell 处理业务请求。

## 契约与意图

`contracts/openapi.json` 是 wire、类型、认证、scope 和只读属性的唯一来源；metadata 只补命名、说明和高影响确认。编译器验证唯一映射、排除和引用，生成 index、operations、schemas。扩展 API 走契约生成，不增加逐接口命令类或第二份参数模型。

ControlOperations 保持顺序：校验 → 预演或确认 → 认证 → 保存原意图 → HTTP → 保存结果。预演不读取凭据、不写 journal，也不触发后台更新。
已成功意图返回保存结果；未知有键操作沿用原键，未知无键操作拒绝重放。只有已确认的 4xx 存 rejection；408/429、幂等处理中 409 仍未决。原键、强 ETag、回执锁和 24 小时窗口分别约束执行。

字段投影仍由服务端在授权后执行，ResponseFields 依据真实返回类型检查掩码；分页逐页输出 NDJSON，保留游标和上限。
更新不携 Control 凭据。UpdateProcess 在独立进程完成安装与回滚，使用 CLI 的版本探测协议；这一动态进程交互由更新进程测试覆盖，字节码图不代替运行验证。

## 验证

使用 Gradle Wrapper 的 check、installDist、distZip。契约漂移、Spotless、架构检查、调用快照、实际 CLI/MCP 子进程、HTTP 记录服务及签名更新测试共同约束实现；业务集成继续使用真实 Control/PostgreSQL。代码行数不作为通过标准。
