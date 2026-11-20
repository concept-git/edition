# Space 消费适配

把已上线空间挂成只读文件树，让应用智能体用 `ls` / `cat` / `grep` 读到与 `/api/content` 同权、同版、同字节的原文。

人对站点看阅读前端渲染的页面；机器读本包，走 `/api/content`。规格见 [READER-RESOURCES.md](../../docs/tech/READER-RESOURCES.md)。

```text
/space   SpaceVFS  READ  →  https://<site>/api/content/*
/tmp     RAM       WRITE →  仅本地草稿
```

## 安装

```bash
cd clients/space/python
python3 -m pip install -e ".[mirage]"
```

## 挂载

```python
import os
from mirage import ConsistencyPolicy, MountMode, Workspace
from space_vfs import SpaceConfig, SpaceVFS

vfs = SpaceVFS(SpaceConfig(
    origin="https://docs.example.com",
    host="docs.example.com",
    space="docs",
    token=os.environ.get("SPACE_TOKEN"),
))
ws = Workspace({"/space": vfs}, mode=MountMode.READ, consistency=ConsistencyPolicy.ALWAYS)
await ws.execute("ls /space")
await ws.execute("cat /space/intro.md")
```

公开空间可省略 Token。私有空间使用管理面签发的空间 ApiToken（`reader` + `read`）。错 Token 不会变成匿名读取。

正式站点使用 HTTPS。仅本机验收允许 HTTP 或 `tls_insecure=True`；挂载必须使用 `ALWAYS` 一致性，以便每次读取都重新检查权限。

每次请求自报 `User-Agent: space-vfs/<version> python/<x.y>` 与 `X-Space-Client: family=space-vfs; ver=...; runtime=python`。

YAML 示例见 [examples/workspace.yaml](examples/workspace.yaml)。

## Agent 命令

安装 `[mirage]` 后可直接读取站点，无需启动本仓库的演示平台。连接选项放在命令前；
`--host` 是站点 Host，`--space` 是空间 slug。私有空间默认读取 `SPACE_TOKEN`，也可用
`--token-env NAME` 选择另一环境变量；凭据不放在命令参数中。

```bash
space-vfs --help
space-vfs cat --help
space-vfs --origin https://docs.example.com --host docs.example.com --space docs ls -1 /space
space-vfs --origin https://docs.example.com --host docs.example.com --space docs cat "/space/file name.md"
space-vfs --origin https://docs.example.com --host docs.example.com --space docs grep -n "hello world" /space/intro
space-vfs --origin https://docs.example.com --host docs.example.com --space docs cat /space/manual.pdf > manual.pdf
printf 'hello\n' | space-vfs --origin https://docs.example.com --host docs.example.com --space docs --stdin grep hello
space-vfs --origin https://docs.example.com --host docs.example.com --space docs --command 'cat /space/intro | grep hello'
```

普通命令保留每个参数的边界，含空格路径和 `$()` 字面内容不会被再次解释。内部管道、重定向、
命令替换必须使用 `--command`；外部 shell 的管道、重定向照常使用。`--stdin` 只接受管道输入，
不等待终端交互。stdout/stderr 保留原始字节，退出码沿用 Mirage 命令（例如 grep 无匹配为 1）。
`ls` / `cat` / `grep` 帮助不依赖平台或 Mirage；其它命令帮助只依赖已安装的客户端运行环境。

本地演示可用 `node infra/space.ts vfs ...`，共用同一命令实现。显式指定上述三个连接选项时，
也可独立读取其它站点；`--python PATH` 可指定已安装 `[mirage]` 的 Python。

### 命令结果报告

需要机器读取的执行结果时，将 `--metadata-file PATH` 放在命令前。原文字节继续输出到 stdout，
JSON 写到独立文件，支持二进制附件直接保存：

```bash
space-vfs --origin https://docs.example.com --host docs.example.com --space docs \
  --metadata-file result.json cat /space/manual.pdf > manual.pdf
node infra/space.ts vfs --metadata-file result.json grep -n "hello world" /space/intro
node infra/space.ts vfs --metadata-file result.json --command 'cat /space/intro | grep hello'
```

报告包含 `schema_version: 1`、每调用的新 `run_id`、命令模式/名称、`outcome`、原始
`command_exit_code` 和最终 `exit_code`、耗时、输出字节数/摘要、资源路径/快照/大小/Reader 摘要，
以及有限的错误列表。错误提供 `code`、实际 `http_status`、`trace_id`、`retryable`、
`retry_after_seconds` 和下一步 `action`；未取得的值为 null。网络错误不伪造 HTTP 状态。
不会保存完整参数、搜索词、shell 表达式、stdin、正文、Token 或环境变量值。

| outcome | 含义 |
| --- | --- |
| success | 命令退出0且没有终态资源错误 |
| no_match | 直接 grep 无匹配，退出1且没有资源错误或 stderr |
| error | 参数、命令、资源或输出失败 |
| completed_with_errors | shell 退出0，但存在资源失败，例如 `cat missing \| head` |

stdout 的 `produced_sha256` 是命令输出摘要，资源的 `reader_sha256` 是原文件摘要，两者在
`cat -n`、grep 或管道中可能不同。`delivery_complete` 仅说明本进程完成 stdout 写入，不代表下游已消费。
资源最多1024项、错误最多128项，超限分别标记截断。成功恢复的中间重试不会记为终态失败。

报告父目录必须存在；拒绝 `-`、目录、符号链接，以及与标准流文件冲突的目标。文件以私有临时文件
原子替换，重复运行更新 run_id。参数错误退出2，中断退出130；报告预检/写出失败退出74并保留旧报告。
只有本次报告写出成功时才使用它，不能读取失败调用遗留的旧结果。帮助和版本查询不会创建报告。

## 本机系统目录

Mirage 的 `/space` 是工作区虚拟路径。系统挂载需要 macOS 已获准运行的 macFUSE，或 Linux 的 libfuse，以及可选依赖：

```bash
python3 -m pip install -e 'clients/space/python[fuse]'
mkdir -p /tmp/space-skills
space-vfs-mount --mountpoint /tmp/space-skills --origin https://docs.example.com --host docs.example.com --space skills --dry-run
space-vfs-mount /tmp/space-skills --origin https://docs.example.com --host docs.example.com --space skills
```

命令前台运行，Ctrl+C 结束；macOS 也可使用 `umount /tmp/space-skills`，Linux 使用 `fusermount -u /tmp/space-skills`。私有空间从环境变量 `SPACE_TOKEN` 读取令牌。

`--mountpoint PATH` 与位置参数二选一。`--dry-run` 校验空目录、连接配置及 Reader 当前读取权限，
向 stdout 输出 JSON 计划，不加载 FUSE 或挂载。真实挂载在根目录在线校验和 FUSE init 成功后向
stderr 输出 `{"status":"ready", ...}`；进程仍在前台运行。重复挂载明确报错，使用现有挂载或先卸载。

文件树直接使用已上线规范路径。例如地址 `/skills/quality/SKILL.md` 对应挂载中的 `quality/SKILL.md`，没有额外扩展名或消费侧路径映射。原文可从相同地址的 `?view=source` 表示读取，`?view=markdown` 提供安全 Markdown 阅读表示。Toc 是独立导航，不决定完整文件清单。

系统挂载只读且禁用内核正文、属性及目录缓存。每次查询在线鉴权；文件句柄固定打开时的 snapshot，切版报 `ESTALE`，重新打开取得新版本。权限或依赖失败不返回缓存。文件没有执行位。

Codex 测试工作区可将 `.agents/skills/<name>` 符号链接到挂载中的技能目录。技能发现、读取与实际执行分别验收；仅目录可读并不能证明技能已经被发现。
