import { Badge } from './badge';
import { isRecord } from '@/shared/api/session';
const states: Record<string, string> = {
  draft: '工作稿',
  published: '可发版',
  active: '活跃',
  archived: '已归档',
  authored: '站内创作',
  synced: '外部同步',
  queued: '排队中',
  running: '运行中',
  retrying: '等待重试',
  held: '需要处理',
  failed: '失败',
  completed: '已完成',
  promoted: '主版本',
  pending: '等待中',
  owner: '所有者',
  member: '成员',
};
export function StateBadge({ value }: { value?: string | null }) {
  return (
    <Badge
      variant={
        ['failed', 'held'].includes(value ?? '') ? 'destructive' : 'secondary'
      }
    >
      {value ? (states[value] ?? value) : '未提供'}
    </Badge>
  );
}
export function dateText(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN');
}
const fieldLabels: Record<string, string> = {
  id: '标识',
  name: '名称',
  title: '标题',
  description: '说明',
  slug: '路径',
  status: '状态',
  mode: '来源模式',
  role: '角色',
  format: '格式',
  label: '显示名称',
  tenantId: '租户',
  spaceId: '空间',
  siteId: '站点',
  pageId: '页面',
  teamId: '用户组',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  createdBy: '创建者',
  updatedBy: '修改者',
  expiresAt: '到期时间',
  expiry: '到期时间',
  joinedAt: '加入时间',
  promotedAt: '主版本选择时间',
  lastReleaseAt: '最近发版',
  pageCount: '页面数',
  revision: '修订基线',
  versionRef: '定义版本',
  contentType: '内容类型',
  interpretation: '解释上下文',
  content: '正文',
  autoRelease: '自动发版',
  retention: '发版保留数',
  driftFlag: '存在漂移',
  driftCount: '漂移数',
  mounts: '挂载',
  domains: '域名',
  host: '域名',
  verified: '已核验',
  primary: '主域名',
  txtName: 'TXT 记录名称',
  txtValue: 'TXT 记录值',
  allowedActions: '可用操作',
  items: '记录',
  entries: '条目',
  nextCursor: '下一页游标',
  total: '总数',
  source: '来源',
  target: '目标',
  sourceDigest: '源码摘要',
  bundleDigest: '构件摘要',
  fixtureDigest: '样例摘要',
  files: '源码文件',
  manifest: '贡献声明',
  configuration: '配置',
  fixtures: '固定样例',
  dependencyLock: '依赖锁',
  baselineRef: '构建基准',
  checks: '检查项',
  passed: '通过',
  message: '说明',
  browserEvidence: '浏览器证据',
  serverValidation: '服务端校验',
  productionEligible: '生产安装资格',
  environment: '运行环境',
  resourceId: '资源标识',
  resourceType: '资源类型',
  validationLevel: '核验等级',
  observedAt: '观察时间',
  counts: '影响数量',
  effects: '影响',
  unknowns: '未能确认的影响',
  phase: '阶段',
  progress: '进度',
  attempt: '尝试次数',
  attempts: '尝试次数',
  nextRunAt: '下次执行时间',
  terminal: '已结束',
  successful: '成功',
  outcome: '结果',
  report: '报告',
  error: '错误',
  traceId: '追踪编号',
  email: '邮箱',
  locale: '语言',
  secret: '一次性秘密',
  token: '令牌信息',
  scopes: '权限范围',
  credentialType: '凭据类型',
  principal: '授权主体',
  principals: '授权主体',
  restriction: '页面限制',
  tags: '标签',
  seo: 'SEO',
  properties: '属性',
  collectionPath: '分组路径',
  pv: '访问量',
  uv: '访客数',
  health: '采集健康',
  lossDetected: '存在采集缺口',
  staleSources: '过期采集源数',
  retainedFrom: '数据保留起点',
  computedAt: '计算时间',
  workingPages: '工作区页面',
  trashedPages: '回收页面',
  publishedPages: '可发版页面',
  workingTextBytes: '工作区正文大小',
  trashedTextBytes: '回收正文大小',
  attachmentCount: '附件数',
  attachmentBytes: '附件大小',
  releases: '发版数',
  snapshotPages: '快照页面',
  snapshotTextBytes: '快照正文大小',
  promotions: '晋升次数',
  activeAuthors: '活跃作者',
  imports: '导入',
  sourceObjects: '存储对象数',
  sourceBytes: '对象大小',
  databaseBytes: '数据库大小',
  measuredAt: '测量时间',
  failedSourceObjects: '失败对象数',
};
export function Facts({ value }: { value: unknown }) {
  if (!isRecord(value)) return <FieldValue value={value} />;
  return (
    <dl className="grid gap-3 text-sm">
      {Object.entries(value).map(([key, field]) => (
        <div
          key={key}
          className="grid gap-1 border-b pb-3 last:border-0 sm:grid-cols-[10rem_1fr]"
        >
          <dt className="break-all text-muted-foreground">
            {fieldLabels[key] ?? key}
          </dt>
          <dd className="min-w-0 whitespace-pre-wrap break-words">
            <FieldValue value={field} name={key} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
function FieldValue({ value, name = '' }: { value: unknown; name?: string }) {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'boolean') return <span>{value ? '是' : '否'}</span>;
  if (Array.isArray(value))
    return value.length ? (
      <details>
        <summary className="cursor-pointer text-primary">
          {value.length} 项，展开查看
        </summary>
        <ul className="mt-3 grid max-h-96 gap-3 overflow-auto">
          {value.map((item, index) => (
            <li key={index} className="rounded-md border p-3">
              <FieldValue value={item} />
            </li>
          ))}
        </ul>
      </details>
    ) : (
      <span className="text-muted-foreground">无</span>
    );
  if (isRecord(value))
    return Object.keys(value).length ? (
      <details>
        <summary className="cursor-pointer text-primary">展开详情</summary>
        <div className="mt-3 max-h-96 overflow-auto rounded-md border p-3">
          <Facts value={value} />
        </div>
      </details>
    ) : (
      <span className="text-muted-foreground">无</span>
    );
  if (typeof value === 'string' && ['status', 'mode', 'role'].includes(name))
    return <StateBadge value={value} />;
  if (typeof value === 'string' && /(?:At|expiry)$/.test(name))
    return <span>{dateText(value)}</span>;
  return (
    <span
      className={
        name === 'secret' || /(?:Id|Digest|Ref)$/.test(name)
          ? 'break-all font-mono text-xs'
          : undefined
      }
    >
      {String(value)}
    </span>
  );
}
