# 测试与质量看护

覆盖率门槛和语言工具配置与本文放在 `infra` 根下。命令入口是 [edition.ts](edition.ts)。应用、共享库与客户端目录保持原位。单元测试与实现共置，跨应用浏览器验收由 `verify` 命令编排。

## 第一次运行

使用 Node 24、Java 25、Python 3.11 以上版本和可用的 Docker。依赖安装方式见[工程工具](README.md)。不要使用 Node 26 替代 Node 24。

在仓库根目录创建独立 Python 环境并安装测试依赖。

```bash
python3 -m venv .scratch/dw-v1/runtime/quality/venv
.scratch/dw-v1/runtime/quality/venv/bin/python -m pip install -r infra/requirements.txt -e 'clients/edition/python[mirage,fuse]'
export EDITION_QUALITY_PYTHON="$PWD/.scratch/dw-v1/runtime/quality/venv/bin/python"
```

Windows 使用虚拟环境的 `Scripts/python.exe`，并将其绝对路径设为 `EDITION_QUALITY_PYTHON`。该变量只选择测试解释器，不修改系统 Python。

## 按目的执行

所有命令从仓库根目录执行。

| 命令 | 目的 |
| --- | --- |
| `node infra/edition.ts quality doctor` | 检查工具是否可调用、Docker 是否可访问 |
| `node infra/edition.ts quality static` | 检查导航、类型、格式、架构和契约，执行工程原有 check |
| `node infra/edition.ts quality coverage --measure` | 执行测试并生成覆盖率差距报告，不代表验收通过 |
| `node infra/edition.ts quality coverage` | 执行测试，要求各工程的覆盖率指标均达到 90% |
| `node infra/edition.ts quality acceptance` | 顺序执行 delivery、private、vfs 真实验收 |
| `node infra/edition.ts quality all` | 顺序执行上述正式检查，任何错误或告警均使结果失败 |

用 `--scope infra`、`backend`、`cli`、`vfs` 或 `compiler` 定位一个工程。默认检查全部工程。`--scope` 不缩减跨应用 acceptance 的三组范围。正式验收使用 `all`，局部通过不能替代全量通过。

`doctor` 是前置工具检查，不能证明应用已启动。`static --scope backend` 与完整 `all` 会构建四个后端 JAR。单独运行浏览器验收前须先构建这些产物并安装 Chromium；浏览器驱动会构建前端。步骤见[测试标准](../contracts/delivery-openapi.json)。

验收默认使用 `dw-quality` 项目、同名存储命名空间和 2000 端口偏移。可用现有 `EDITION_COMPOSE_PROJECT`、`E2E_STORAGE_NAMESPACE`、`E2E_PORT_OFFSET`、`E2E_RUNTIME_DIR` 覆盖。三组必须使用相同配置，不并行运行，不清理原有数据卷。

## 覆盖率口径

| 工程 | 指标 | 测量工具 |
| --- | --- | --- |
| 六个后端工程、独立 Control CLI | 行、分支、方法，各 ≥90% | JaCoCo |
| 工程工具 | 行、分支、函数、语句，各 ≥90% | c8 |
| EditionVFS、CLI 契约编译器 | 行、分支，各 ≥90% | coverage.py |

按工程分别检查。后端共享库合并其消费者测试产生的执行记录，但分母仍为各自源码。Python CLI 测试会启动子进程，配置通过 `patch = subprocess` 收集执行，再 combine 后统计。不能只统计父测试进程。

未执行的自有源码计入分母。配置声明在 [c8 配置](c8.json)、[Java 配置](java.gradle)与 [Python 配置](python.coveragerc)。不得通过排除薄弱业务模块达标。

报告比较原始计数，不用四舍五入后的百分比判断。空行覆盖报告、缺失指标、缺失报告和失败命令都不能通过。没有分支的模块可以是零分支，不能把它等同于没有可执行代码。

## 如何读结果

结果写入 Git 忽略的 `.scratch/dw-v1/runtime/quality/`。`logs/` 保留完整输出。`coverage/` 保存 JavaScript 与 Python 明细。Java HTML/XML 位于各工程的 `build/reports/jacoco/test/`。

每种执行模式生成 `<mode>-<scope>.json`，包含命令退出码、告警、日志位置、各工程指标和缺口。`measurementOnly: true` 表示测量模式，不能作为正式验收证据。覆盖不足时 `passed` 为 false，即使命令允许测量过程完成。

正式检查要求所有被选命令退出码为零、没有告警、覆盖率达标。独立检查会继续执行，以便一次报告多个问题。不要只看最后一个进程是否退出成功。

## 面向初学者的测试约定

1. 测试名称写清触发条件与可观察结果。
2. 按准备、操作、断言组织步骤。注释说明约束和原因，不复述每行代码。
3. 每个成功路径配套重要拒绝路径，优先验证权限、租户隔离、幂等、冲突和恢复。
4. 时间、随机和外部命令通过明确接口注入。不要增加只为绕过业务约束的后门。
5. 数据库约束测试使用真实 PostgreSQL。单元测试可以替换外部命令，不把替换结果当成真实部署验收。
6. 清理本测试拥有的临时资源。故障注入后恢复依赖，不删除共享开发数据卷。


JaCoCo 的 Java 25 支持见[官方变更记录](https://www.jacoco.org/jacoco/trunk/doc/changes.html)。Python 子进程测量依据[官方配置说明](https://coverage.readthedocs.io/en/7.13.5/config.html#run-patch)。
