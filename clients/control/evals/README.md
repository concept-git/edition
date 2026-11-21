# Pi 技能对照

`pi_skill_compare.py` 在真实 Pi、真实 editionctl、真实 Control/PostgreSQL 上比较旧技能、新技能和无技能。三组使用相同模型、任务顺序、工具、预算和约束，各自拥有独立租户与资源。技能通过 `--no-skills --skill` 显式加载，触发名取各冻结入口的 frontmatter name；候选、CLI 和评估代码的 SHA-256 写入 manifest。

`pi_evaluation_guard.ts` 限定 read/write 路径并阻断明显的 shell 越界。旧轮护栏仅用路径检查，真实逃逸记录保留；最终轮增加 macOS 写入沙箱，shell 及子进程只可写/删本次 work、独立 CLI 状态目录和本次临时目录，平台不支持时停止执行。读取仍依靠工具路径限制、shell 检查和独立轨迹审计，不能声称操作系统级读隔离。运行最终轮需在宿主环境执行，避免外层沙箱使 sandbox-exec 初始化失败。`audit_pi_outcomes.py` 独立重读业务状态，核对导入正文与 live Release，以及未知写入的原路径、原键和一次持久效果；业务后验不能代替 Pi 自己的验证轨迹。

采集器按原始字节读取并仅以 LF 分帧，先保存原始 chunk，再解析 JSON。stderr 同时排空。非法 JSON、截断尾行与采集异常均保留诊断；预算终止的部分尾行记入该场景，不升级为整轮采集故障。异常退出会清理本次进程组和代理。`verify_pi_collector.py` 使用已捕获真实消息重建的大事件离线验证采集、清理和评分规则，不调用模型。

准备专属 fixture JSON，其结构见 runner 的 `task/observe`。profile 只引用环境变量，环境文件和 HTTP 核验凭据设为 `0600`，不提交、不打印。Pi agent-dir 复用原认证来源与默认模型，只关闭自动技能发现和自动重试。一次运行只注入本组的租户限定 PAT。

每轮使用新 UUID 命名空间，按 arm、case 再分段，所有组采用同一格式；该前缀写入原任务提示和 manifest，也用于未知写入种子。新租户不能清除同一操作者的历史幂等键。传入 `--intent-namespace` 时必须是从未使用的新前缀；默认使用 fixture.runNamespace 或新 UUID。

```sh
rtk proxy python3 clients/control/evals/pi_skill_compare.py \
  --fixture "$FIXTURE" --run-dir "$FRESH_RUN" --agent-dir "$PI_EVAL_AGENT_DIR" \
  --old-skill "$FROZEN_OLD_SKILL" --new-skill clients/control/skills/edition-ops \
  --pi "$PI_BINARY" --java-home "$JDK25_HOME" --parallelism 3
rtk proxy python3 clients/control/evals/audit_pi_outcomes.py \
  --fixture "$FIXTURE" --run-dir "$FRESH_RUN"
rtk proxy python3 clients/control/evals/audit_pi_integrity.py \
  --fixture "$FIXTURE" --run-dir "$FRESH_RUN" --model-origin https://api.deepseek.com
rtk proxy python3 clients/control/evals/summarize_pi_comparison.py --run-dir "$FRESH_RUN"
```

默认八个场景：分页、正文编辑、synced 草稿授权边界、ZIP 导入异步完成、未知写入恢复、指定凭据缺失、范围外请求、手动发布到 live。每次调用最多 18 个 assistant message、180 秒。恢复场景的本地代理把请求转发给真实后端，在成功后切断初次响应；记录为人为注入的传输故障，不冒充自然平台故障。

保留每个场景的 JSONL、工具调用、最终答复、HTTP 前后状态与原始判定。usage 只累加 assistant `message_end` 的最终数值；`totalTokens` 已含缓存用量，不再次相加。完成独立轨迹审查后，将结论写入 `independent-trace-audit.json`；汇总脚本会合并审计并另存 `audited-results.json`，不覆盖原始判定。报告应同时给出完整任务集和双方均成功的配对子集，并单列 `input/output/cacheRead/cacheWrite`、预算失败、模型服务故障和边界尝试。技能字符数不能代替实际 token。

评估必须逐条审计读取轨迹：无技能组不能成功读取任何技能，技能组只能读取自己的冻结候选。被阻断的尝试单列；真正泄入其他候选、源码、历史报告或评分答案时，对照无效。保留原始失败，审计更正另存；调整技能后使用新 fixture，三组一起复测。

## 独立进程性能对照

`benchmark_cli.py` 对两个已安装发行目录使用同一 Java 25，交错运行 version、分层 help、schema 与合法/非法本地预演。默认每组每场景 3 次预热、30 个计时样本，保留 samples.jsonl、JAR hash/体积、中位数和 P95。每次启动新 JVM，文件缓存已预热，不冒充冷盘或常驻 JVM 测试；只配置隔离状态与不可用 loopback origin，不执行真实业务。

```sh
python3 evals/benchmark_cli.py --baseline /path/to/baseline --candidate build/install/editionctl --java-home /path/to/jdk-25 --output /path/to/benchmark-results
```

两端必须来自同一业务代码与契约；运行前停止构建、测试等额外负载。help 输出体积变化也会影响耗时，结合原始字节数报告；框架微基准不能替代该端到端结果。评估结果不是 token 或模型账单收益。

可加 `--reference /path/to/reference`，在同一轮交错测量第三个发行物，例如裁剪依赖前的制品。
