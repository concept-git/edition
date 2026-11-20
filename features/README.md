# BDD：可执行的应用行为规格

BDD 同时承担两项职责：定义应用行为的验收标准，帮助读者通过具体场景理解项目。`.feature` 描述角色、前提、动作、可观察结果与拒绝条件。步骤实现负责把这些要求变成真实断言。

产品范围见 [PRD](../docs/prd/README.md)。概念动作见源码共置 `CONCEPT.md`，跨概念规则见 `SYNCS.md`。BDD 验证这些规则组合后的应用行为。规格与实现冲突时，先定位事实和既有决策，再修正冲突。不得为了让测试变绿而降低规格要求。

## 按业务阅读

```text
features/
├── README.md
└── acceptance/
    ├── catalog.json     # 规格来源、步骤归属和执行套件的唯一清单
    ├── iam/             # 注册、登录、账号安全、成员、用户组与授权
    ├── authoring/       # 空间、页面、修订、目录、标签与回收
    ├── releases/        # 进版、发版、导入与导出
    ├── hosting/         # 站点、域名、地址重组、阅读与搜索
    ├── platform/        # 内容类型、插件开发、邮件、运维与安全契约
    └── journeys/        # 跨上下文的端到端业务旅程
```

| 要理解的行为 | 从这里开始 |
| --- | --- |
| 用户怎样进入平台并获得访问权限 | [注册](acceptance/iam/registration.feature)、[成员邀请](acceptance/iam/tenant-invitations.feature)、[授权](acceptance/iam/permission-management.feature) |
| 编辑怎样保存，冲突怎样处理 | [页面创作与修订](acceptance/authoring/page-authoring.feature) |
| 页面进版、空间主版本与站点上线有什么区别 | [发版](acceptance/releases/publishing.feature)、[独立交付](acceptance/hosting/site-search-independent.feature) |
| 读者访问怎样判权，撤权期间怎样处理 | [私有阅读](acceptance/hosting/private-reader.feature) |
| 内容类型与插件候选怎样工作 | [内容类型管理](acceptance/platform/content-type-management.feature)、[插件工作台](acceptance/platform/plugin-workbench.feature) |
| 完整产品旅程怎样贯穿各模块 | [全链路浏览器旅程](acceptance/journeys/full-browser-journey.feature) |

每个 feature 顶部的 `规格依据` 指向相关规则。`catalog.json` 保存相同来源用于自动校验，不复制场景正文。一个 feature 只属于一个执行套件。

## 按职责定位实现

阅读与交付套件从 `acceptance/e2e/steps/hosting/` 加载步骤，共用 `acceptance/e2e/support/` 的协议与数据准备工具。管理场景保留业务规格，供后续开发使用。

## 写出精确场景

1. 使用 [CONTEXT](../CONTEXT.md) 中的术语。区分工作稿、页面进版、空间主版本和站点线上版本。
2. 说明真实角色、租户范围与授权前提。同一用户从另一个客户端提交，不写成“另一位作者”。
3. 写可观察结果，例如修订号、页面正文、授权范围、稳定错误码或界面状态。不要只断言“请求成功”或“正常显示”。
4. 将一个业务规则的成功与拒绝条件分别列出。复杂全链路旅程保留在 journeys，不替代各流程的边界场景。
5. 查询与拒绝场景可以直接断言公开结果。其他操作写清触发动作。背景承载共同前置，不能隐含授权或共享测试数据。
6. 用场景大纲表达同一规则的输入组合。每个占位符必须在示例表中绑定，表头不能重复，每行宽度必须一致。
7. 异步交付使用有界等待和最终事实断言。不要把过渡期安全屏障 503 当成读取成功，不用固定 sleep 猜测完成时间。
8. 错误场景断言拒绝原因及未发生的副作用，例如“返回冲突且不新增修订”。不要只检查一个失败状态码。

## 稳定编号与执行标签

每个场景或场景大纲有一个独立编号，例如 `@case-page-authoring-001`。编号用于定位规格、筛选执行和关联失败报告。移动文件或修改标题时保留编号。新增场景使用未用过的编号，不给已有场景重新排序编号。

feature 使用 `@area-*` 标明上下文，使用 `@suite-console`、`@suite-delivery` 或 `@suite-private` 标明套件。`@smoke`、`@serial`、`@short-access`、`@short-clock`、`@short-reader` 继续控制运行配置，不代表产品范围或规则优先级。

不得提交 `@skip`、`@fixme`、`@only` 或聚焦执行的 `.only`。定位故障使用命令行 `--grep`，并在报告中标明选择范围。局部通过不能替代完整验收。

```gherkin
# language: zh-CN
@area-authoring @suite-console
功能: 页面创作与修订
  @case-page-authoring-001
  场景: 并发保存保留完整修订历史
    假如 作者已获得该空间的写权限
    当 作者以过期修订基线保存正文
    那么 返回修订冲突且不新增修订
```

上例说明结构与精度，不是新增的可执行步骤。真实业务断言以相应 feature 为准。

## 校验与执行

先检查规格清单与 Gherkin 结构。

```bash
node infra/space.ts bdd
node infra/space.ts repository
```

检查会拒绝未登记的 feature 或步骤文件、重复套件归属、冲突标签、丢失来源、缺失步骤文件、重复场景编号、没有结果断言的场景和不完整示例表。标题、步骤、文档字符串与数据表中的示例占位符都必须绑定。正式 Gherkin 解析器负责语法，`bddgen` 负责步骤匹配。二者不能相互替代。

统一验收驱动也会先执行规格清单检查，再启动应用。结构检查不能证明业务规格完整。审查场景时仍须核对来源规则、角色与范围、成功和拒绝条件，以及步骤实现是否确实断言了这些结果。测试数量和代码覆盖率不能替代这项核对。

真实应用验收仍使用统一驱动。三组按顺序执行，完整准备见[测试标准](../docs/tech/TESTING.md)。

```bash
node infra/space.ts verify delivery
node infra/space.ts verify private
node infra/space.ts verify vfs
```

可用 `--grep '@short-reader'` 定位一个场景。生成成功和发现测试数量一致只证明规格装配正确，不表示业务验收已经通过。实际结果必须来自真实运行报告。
