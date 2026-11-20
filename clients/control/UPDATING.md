# spacectl 更新与恢复


发布源独立配置；未配置不联网。配置需要用户信任的 Ed25519 公钥与 HTTPS 源，同 origin 提供 ZIP。清单形态为 `{"release":{"version":"1.0.1","apiMajor":1,"url":"https://releases.example.com/package.zip","bytes":123,"sha256":"..."},"signature":"base64"}`；签名覆盖 UTF-8 release JSON 的按键排序紧凑规范化结果。公钥用 X509 PEM 或 Base64 DER。

```sh
spacectl update configure --manifest-url https://releases.example.com/stable.json --public-key-file publisher.pem --install-dir /opt/spacectl --auto check
spacectl update check
spacectl update apply --dry-run
spacectl update apply --help
spacectl update configure --help
spacectl update --help
spacectl update apply
spacectl update status
spacectl update rollback --dry-run
```

`--auto off/check/apply` 控制策略，默认 check；`--interval-hours` 默认 24。自动检查由短独立进程限频执行，缓存的新版本提示只写 stderr；帮助和知识探索离线。显式 apply 与已配置的自动 apply 共用签名、大小、SHA256、ZIP 越界检查。自动安装仅处理同 CLI 主版本且 apiMajor=1 的稳定版本。受管分发目录含 release.json；使用缓存的独立 worker 等当前业务及检查进程结束，再原子交换并探测新版本，失败恢复旧目录。配置、凭据和 journal 保留；上次安装可显式回滚。worker 不继承 Control 秘密环境变量，不带 Bearer/Cookie，不跟随重定向。

更新命令使用离线分层 --help 和 Examples。`apply --dry-run` 验证签名清单并生成计划，不下载整个包；执行安装时再验证包。返回 scheduled 只代表调度成功，须用 `update status` 核验 applied/rolled_back、operationId 和版本。清单与包读取有大小和时间上限。

本仓库提供检查/安装机制及签名协议，尚未配置或发布公共更新源；不会声称已经在线发布新版。源不可达或签名无效不改变业务命令结果；`update status` 显示缓存与安装结果。实验仅显式允许 loopback HTTP。

安装目录与 SPACECTL_HOME 必须分开，避免更新覆盖凭据和恢复材料。检查、改配置与暂存安装共用进程锁；已有任务时先读取 status。改发布配置或运行版本会使旧检查缓存失效。没有更高版本时 apply 返回 unchanged，不创建安装任务。

发行时可用 `./gradlew -PreleaseVersion=1.0.1 check distZip`；默认版本为 1.0.0。版本必须为 MAJOR.MINOR.PATCH，同一构建值写入 jar 与分发标记。发布流水线保存 ZIP 的 SHA256/大小，并以组织持有的 Ed25519 密钥签名 release 清单；客户端预配置公钥和 HTTPS 源。测试签名密钥不可用于正式发布。

若进程被正常报错中断，worker 自动恢复并记录结果。若宿主断电或强杀发生在目录交换中间，不能把 pending 当成完成：从单独保留的发行包运行 status，核对操作记录、安装目录和 `.spacectl-rollback-目录名`；确认相关更新进程已退出后恢复完整旧目录并验证 --version。保存 pending.json、result.json 和相关暂存路径作为故障记录，确认恢复及进程退出后才将该 pending.json 移出活动状态目录；不能让仍在运行的 worker 失去任务材料。文件系统断电恢复与原生包签名未纳入本轮物理验收。
