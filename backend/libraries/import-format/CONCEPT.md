# concept ImportFormat

## purpose

让已知来源的文档包被确定地识别并适配成 Bundle v1 输入。

## state

adapters: ordered seq ImportFormatAdapter
适配器按 order 选择，初态为注册实现集。同一包只由首个命中适配器处理，Invalid 或系统故障不回退到另一格式。此概念不拥有导入作业状态。

## actions

adapt [index: PackIndex; source: PackSource; sink: AdaptSink] => [result: Adapted | Invalid | UnknownFormat]
  ensures 零命中为 UnknownFormat；命中格式验证失败为 Invalid；成功输出 externalId 唯一的适配包

## operational principle

after sniff [index: i; source: s] => [adapterId: a]
then adapt [index: i; source: s; sink: k] => [result: Adapted(a, pack)]；
a 拒绝时不会暗中改选其他适配器；调用方只收到匹配格式的适配结果或明确拒绝。

## queries

sniff [index: PackIndex] => [adapterId: optional String]
sniff [index: PackIndex; source: PackSource] => [adapterId: optional String]
  returns 按 order 首个命中；零命中 empty

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

把 CI / 文档站点导出的 zip 识别为一种已知包格式，并流式适配成 Bundle v1 形状（页、Toc、附件
checksum）。这是平台类概念：不拥有租户业务状态，也不提供 HTTP。gateway 与产品概念模块不可见；
只有 sync 经 `ImportFormatApi` 调用，再交给 `Release.load`。

导入作业由独立的 [ImportJob 概念](../import-job/CONCEPT.md) 拥有；此概念只返回格式 id、适配包与问题列表，组合层负责将结果记录到作业。

### SPI

实现类按**来源形态**命名，并分别位于独立包 `formats/ipd`、`formats/okf`、`formats/filetree`、`formats/bundle`：`ManifestBundleAdapter`（bundle-v1，有 manifest）、
`IpdExportAdapter`（hwcloud-docs，IPD 文档导出包）、`OkfRepoAdapter`（okf-v0.1，带 OKF 标记的仓库）、
`PlainTreeAdapter`（file-tree，裸目录树）。适配器 id 是契约值，不随类名改。

- `contract.ImportFormatAdapter`：`id()`、`order()`、`metadataEntry(name)`、`sniff(PackIndex)`及带`PackSource`的有界内容确认重载、`adapt(PackSource, AdaptSink)`。
- `routing.ImportFormatRegistry`：统一按 order 取第一个 sniff 命中；零命中 → `UnknownFormat`（不是异常）。单个适配器只判断自己的特征，不读取其他格式标记。命中后返回 Invalid 或系统故障时均不尝试兜底格式。
- sniff 以 ZIP 中央目录为入口，丢弃的系统条目不参与任何格式选择。`bundle-v1`（order 0）见有效条目中的 `manifest.json` 即命中，且永远优先。
- `hwcloud-docs`：`**/ALL_META.TXT.json` 与 `**/CLASS.TXT.json` 同时存在。
- `okf-v0.1`：有效 `.okfignore`，或 `**/index.md` 路由优先级低于 v1/华为；带 PackSource 的 sniff 可打开
  `index.md`，只读前 2KiB 确认含 `okf_version`，以免抢走普通 markdown zip。
  GitHub zipball 若全部条目同属一个包装目录，`ZipPackSource` 剥掉该前缀后再 sniff
  （平台不 clone、不存 PAT）。
- `file-tree`（order 30，兜底）：未被前三者命中，且索引里至少有一个可成页文件
  （`.md/.markdown/.html/.htm/.txt/.json/.xml`，不在跳过清单）。目录即 Toc group、文件即页；不需要任何标记。
  于是"未知格式"= **包内没有任何可成页文件**。

### IPD 映射

`IpdManifest` 校验并解析清单：页面按 URI 命中的完整包内路径识别，CLASS code/p_code 只建树；
ALL_META 无 uri 的业务元数据过滤，des/kw 非字符串忽略，扩展字段在属性容量内保留。
正文缺失、路径歧义、冲突 META、空/重复 code、缺父节点、循环、过深目录或超长标题在适配阶段阻断。
CLASS 无 uri 为分组；两份清单的页面并集可缺 SEO 或不入目录，同页可多次出现在目录。
全新系统不提供旧 code 身份迁移。

### file-tree 映射

- externalId = frontmatter `id`（非空字符串）→ 否则相对包根去扩展名的路径；有 `id` 的页搬目录只换 slug，
  无 `id` 的搬家 = 旧页回收 + 新页。slug = 路径各段 kebab、剥段首数字序号（`01-`）后以 `-` 连接，
  `index`/`README` 基名代表所在目录（根级则为 `readme`/`index`），≤80 截断，冲突经 `SlugBook.unique` 追加序号并 `info`。
- title：frontmatter `title` → 首个 `# ` / `<h1>` → `<title>` → 文件名去序号转空格。TXT/JSON/XML 直接使用文件名回退，不解析其正文。
  frontmatter `description` → `seo.description`；其余键字符串化进 `properties.*`
  （≤32 键、单值≤1024个Java字符，超出 `info` 不拦截）。
- 目录内 `index.md` / `README.md`：其 title 作该目录 group label，文件本身也是一页且排第一；
  其余同目录文件按文件名字典序。`DirectoryToc` 与 `okf-v0.1` 共用同一份目录→Toc 实现。
- 跳过 + `info`：点目录（`.github/` 等）、`LICENSE*`、`CHANGELOG*`、`CONTRIBUTING*`、
  `CODE_OF_CONDUCT*`、`SECURITY.md`。候选文件 > 5000 → `Invalid(too_many_files)`。

### 混包

- 页面：v1 只信 `manifest.pages[]`；华为信 `ALL_META[].uri` 与 `CLASS[].uri` 并集；OKF 只信带 YAML `type:` 的 `.md`。
  无 `type` 的 `index.md` 只当 Toc group。file-tree 信全部未被跳过的 md/html/txt/json/xml。
- 附件：文件头属于 png/jpeg/gif/webp/pdf（与 Page.attach 同一嗅探，代码复制在本模块，不依赖 Page）。
  未引用附件也只窥读前 16 字节识别类型；完整附件在存储时按 10MiB 限制验证，窥读长度不是文件大小上限。
- 丢弃：`__MACOSX/`、`._*`、`.DS_Store`、华为 META/CLASS JSON、v1 `manifest.json`。
- 其余后缀（css/js/svg/…）：跳过并 `info`，不判整包非法。
- 不抓取 `http(s):`。单附件 ≤10 MiB、单页 ≤50 附件、正文 ≤2 MiB、Toc 深 >7、zip-slip → `Invalid`。

### 出口

`AdaptedPack` 含 generator、pages（无 pageId）、toc、checksums、info。pageId 由 sync 后赋。
任何适配来源的externalId必须唯一；重复时在分配Page身份前返回Invalid(duplicate_external_id)，不让重复身份进入数据库装载。
`AdaptSink` 由调用方实现；本模块测试用内存 sink，生产 sync 再包 ObjectStore。


### IPD 完整性与适配问题

过滤后零有效页面拒绝，不能用空 IPD 包清空工作区。页面 slug 根据规范包内路径确定，
不依赖 META 顺序；非规范文件名、嵌套路径和长文件名使用路径摘要后缀，始终不超过 80 字符。
HTML 原文检查本地 href/src：页面链接无法解析、歧义或指向未导入正文时阻断；缺失/不支持图片只记 info 并保留原始 src；
外部链接不抓取；脚本、事件属性与格式均原样存储。扩展忽略、SEO 忽略与标题回退同样记 info。

HTML 上传（IPD、目录树、Bundle）原文保留，包括 doctype、head、空白、脚本和事件属性。导入侧 HtmlRewriter 已删除；阅读展示层与导入存储职责独立。

### 目录与依赖边界

| 包 | 唯一职责 |
| --- | --- |
| 根包 | `ImportFormatApi` 对外入口、模块规格 |
| `contract` | 来源接口、统一结果和处理预算 `ImportLimits`；不引用实现 |
| `routing` | 选择适配器、聚合元数据归属、检查输出身份唯一性 |
| `formats/ipd` | IPD 清单、目录与 HTML 完整性 |
| `formats/okf` | OKF 标记、frontmatter 字段语义与仓库映射 |
| `formats/filetree` | 普通目录的选页、排序与标题回退 |
| `formats/bundle` | Bundle v1 清单、版本与校验和 |
| `archive` | 包内安全路径、索引查询、ZIP 与有界读取 |
| `attachments` | 附件魔数、哈希、收集与 HTML 引用提取 |
| `markdown` | frontmatter 语法、Markdown 引用处理 |
| `directory` | 目录树构建与名称分配机制 |

格式之间零互引；共享能力不依赖格式或路由；契约不反向依赖实现。

每个格式声明自己的元数据文件名，路由层以 `FormatMetadataSource` 聚合全部已注册格式的声明。
这保留混包中已知元数据不进入附件扫描的行为；公共扫描器只调用 `PackSource.metadataEntry`，不硬编码来源名称。
包装源仅借用底层流，ZIP 生命周期仍由调用方管理。只读索引 sniff 可粗识别 OKF；实际导入使用有界内容确认重载。

生产适配器通过 Spring 注册；`StandardImportFormats` 仅是测试装配工厂，已移到测试源码。
外部调用方只使用根入口及明确导出的 `contract`、`archive`、`attachments`，不能依赖具体格式实现。

资源路径与导航分工：适配包的页级 slug 承载完整相对文件路径。Bundle v1 可显式提供路径，UTF-8 原文保真；普通目录保留文件名、扩展名和层级。目录可生成初始 Toc，但 Toc 编排不决定文件路径。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ImportFormatApi.adapt` | `index: PackIndex, source: PackSource, sink: AdaptSink` | `ImportFormatApi.Result` |
| `ImportFormatApi.sniff` | `index: PackIndex, source: PackSource` | `Optional<String>` |
| `ImportFormatApi.sniff` | `index: PackIndex` | `Optional<String>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ImportFormatApi.Result.Adapted` | `adapterId: String, pack: AdaptedPack` |
| `ImportFormatApi.Result.Invalid` | `adapterId: String, issues: List<AdaptedPack.Issue>` |
| `ImportFormatApi.Result.UnknownFormat` | `[]` |
| `ImportFormatApi.Result` | `ImportFormatApi.Result.Adapted / ImportFormatApi.Result.Invalid / ImportFormatApi.Result.UnknownFormat` |

<!-- interface-contract:end -->
