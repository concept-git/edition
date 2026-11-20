# Space Control CLI 1.0

独立 Java 25 / Gradle Wrapper 项目，通过 Control HTTP 接口管理内容。默认无交互。
接口覆盖与排除理由见[生成清单](../../docs/design/control-cli-api-inventory.csv)；生成检查保证每个接口恰好映射为一个 CLI 方法或一个明确排除项。

## 构建与开始使用

```sh
./gradlew generateContract
./gradlew check installDist distZip
build/install/spacectl/bin/spacectl --help
```

运行需要 Java 25。凭据由秘密管理器或 OS 凭据库提供；配置只保存引用。

```sh
spacectl configure --base-url https://control.example.com --token-env SPACE_PAT
spacectl schema control --brief
spacectl schema control.spaces.pages --brief
spacectl schema control.spaces.pages.edit --brief
spacectl schema control.PageDetail
```

命令采用 control resource method。params/json 保留原生 API 名称与嵌套结构，接受内联 JSON、文件或单一 stdin；秘密仅通过文件/stdin 提供。
成功默认输出 API JSON；format 选择 json/table/yaml/csv，output 指定二进制文件。错误 JSON 在 stdout，诊断在 stderr。
预演无业务请求、凭据读取或 journal 写入。执行仍由服务端检查当前权限和并发条件。异步受理须另行核验业务完成。

## 按任务阅读

| 任务 | 唯一入口 |
| --- | --- |
| 配置、读取、编辑、发布、批量与 MCP | [操作指南](USAGE.md)，包含经典案例、输出与错误处理 |
| 版本检查、发布源、自动安装与回滚 | [更新指南](UPDATING.md) |
| 范围、契约与验收要求 | [规格](SPECS.md) |
| 模块、状态所有权与扩展方式 | [架构](ARCHITECTURE.md) |
| 完整接口映射与排除原因 | [生成清单](../../docs/design/control-cli-api-inventory.csv) |
| 真实 Pi 技能行为与 token 对照 | [评估协议与脚本](evals/README.md) |

API 参数和类型以当前 help/schema 为准。schema 来自发行物内的 OpenAPI 快照；服务端当前状态通过实际读取观察。
1.0 使用原生命令与结果协议；当前语法以 help/schema 为准。跨 CLI 主版本不会自动安装。

发行包包含 [space-ops 主技能](skills/space-ops/SKILL.md)。运行 `python3 scripts/install_skill.py` 安装受管技能，`--check` 只读核对完整性。技能正文只有一个 SKILL.md，按原则、概念和 CLI 工程入口说明操作；同一受管技能升级会清理旧版附属文件，保留本地自定义文件；`schema GROUP --brief` 是由实际命令树生成的逐层地图，具体字段以方法 schema 为准。

本地参数错误通过 `error.violations[{field,code}]` 指出需要修正的字段，不回显输入值或动态键。CLI 的执行与恢复步骤见[操作指南](USAGE.md)。
