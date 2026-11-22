import { installPlatformWatch, platformOperator } from '#lib/features/platform/domain/operator.svelte';

installPlatformWatch();

export type NavLink = {
  href: string;
  label: string;
  exact?: boolean;
};

export type OverviewEntry =
  | { kind: 'link'; id: string; href: string; label: string; icon: string; exact?: boolean }
  | { kind: 'group'; id: string; label: string; icon: string; items: NavLink[] };

export const overviewEntries: OverviewEntry[] = [
  { kind: 'link', id: 'overview', href: '/', label: '概览', icon: 'overview', exact: true },
  {
    kind: 'group',
    id: 'members',
    label: '成员与用户组',
    icon: 'members',
    items: [
      { href: '/members', label: '成员', exact: true },
      { href: '/teams', label: '用户组', exact: true }
    ]
  },
  {
    kind: 'group',
    id: 'integrations',
    label: '开放与集成',
    icon: 'integration',
    items: [
      { href: '/integrations/api-tokens', label: 'API 令牌', exact: true },
      { href: '/integrations/management-tokens', label: '管理令牌', exact: true }
    ]
  },
  {
    kind: 'group',
    id: 'analytics',
    label: '统计',
    icon: 'analytics',
    items: [
      { href: '/analytics/visits', label: '访问趋势', exact: true },
      { href: '/analytics/search', label: '搜索排行', exact: true }
    ]
  },
  { kind: 'link', id: 'audit', href: '/audit', label: '审计', icon: 'audit', exact: true },
  {
    kind: 'group',
    id: 'settings',
    label: '设置',
    icon: 'settings',
    items: [
      { href: '/account/password', label: '密码', exact: true },
      { href: '/account/sessions', label: '管理会话', exact: true },
      { href: '/account/deactivate', label: '停用', exact: true },
      { href: '/account/erase', label: '注销', exact: true },
      { href: '/settings/content-types', label: '内容类型', exact: true },
      { href: '/settings/plugins', label: '插件', exact: true }
    ]
  }
];

export const productEntries: NavLink[] = [
  { href: '/content', label: '内容' },
  { href: '/sites', label: '站点' }
];

const railEntries = [
  { id: 'overview', href: '/', label: '概览', icon: 'overview' },
  { id: 'content', href: '/content', label: '内容', icon: 'content' },
  { id: 'sites', href: '/sites', label: '站点', icon: 'sites' },
  { id: 'analytics', href: '/analytics/visits', label: '统计', icon: 'analytics' },
  { id: 'audit', href: '/audit', label: '审计', icon: 'audit' },
  { id: 'members', href: '/members', label: '成员', icon: 'members' },
  { id: 'platform', href: '/platform/tenants', label: '平台', icon: 'platform' }
] as const;

type RailEntry = (typeof railEntries)[number];

export const rail = {
  map<T>(mapper: (item: RailEntry, index: number) => T): T[] {
    const visible =
      platformOperator.allowed || platformOperator.failure
        ? railEntries
        : railEntries.filter((item) => item.id !== 'platform');
    return visible.map(mapper);
  }
};

export const sections = {
  content: [
    { href: '/content', label: '内容数据', exact: true },
    { href: '/content/spaces', label: '空间' },
    { href: '/content/collections', label: '分组', exact: true }
  ],
  sites: [{ href: '/sites', label: '站点列表' }],
  analytics: [
    { href: '/analytics/visits', label: '访问趋势', exact: true },
    { href: '/analytics/search', label: '搜索排行', exact: true }
  ],
  audit: [{ href: '/audit', label: '审计', exact: true }],
  members: [
    { href: '/members', label: '成员', exact: true },
    { href: '/teams', label: '用户组', exact: true }
  ],
  platform: [
    { href: '/platform/tenants', label: '租户', exact: true },
    { href: '/platform/users', label: '用户', exact: true },
    { href: '/platform/health', label: '进程健康', exact: true },
    { href: '/platform/mail', label: '邮件作业', exact: true }
  ]
} as const;

const modulePrefixes = ['/content', '/sites', '/platform'];
const railPrefixes = ['/content', '/sites', '/platform', '/analytics', '/audit', '/members', '/teams'];

export function pathActive(pathname: string, href: string, exact = false) {
  if (exact || href === '/') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function moduleOf(pathname: string) {
  if (pathname === '/') return 'overview';
  if (pathname.startsWith('/content')) return 'content';
  if (pathname.startsWith('/sites')) return 'sites';
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname === '/audit' || pathname.startsWith('/audit/')) return 'audit';
  if (pathname.startsWith('/members') || pathname.startsWith('/teams')) return 'members';
  if (pathname.startsWith('/platform')) return 'platform';
  return null;
}

export function shellFor(pathname: string, stickToModule: boolean) {
  if (pathname === '/') return 'overview' as const;
  if (modulePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return 'module' as const;
  if (stickToModule && railPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return 'module' as const;
  }
  return 'overview' as const;
}
