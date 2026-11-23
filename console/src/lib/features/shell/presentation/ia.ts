export type NavLink = {
  href: string;
  label: string;
  exact?: boolean;
};

export type OverviewEntry =
  | { kind: 'link'; id: string; href: string; label: string; icon: string; exact?: boolean }
  | { kind: 'group'; id: string; label: string; icon: string; items: NavLink[] };

export const overviewEntries: OverviewEntry[] = [
  { kind: 'link', id: 'overview', href: '/', label: '当前租户', icon: 'overview', exact: true },
  {
    kind: 'group',
    id: 'members',
    label: '成员关系',
    icon: 'members',
    items: [
      { href: '/members', label: '成员', exact: true },
      { href: '/teams', label: '用户组', exact: true }
    ]
  },
  {
    kind: 'group',
    id: 'integrations',
    label: '令牌',
    icon: 'integration',
    items: [
      { href: '/integrations/api-tokens', label: '机器令牌', exact: true },
      { href: '/integrations/management-tokens', label: '管理令牌', exact: true }
    ]
  },
  {
    kind: 'group',
    id: 'analytics',
    label: '访问统计',
    icon: 'analytics',
    items: [
      { href: '/analytics/visits', label: '访问趋势', exact: true },
      { href: '/analytics/search', label: '搜索统计', exact: true }
    ]
  },
  { kind: 'link', id: 'audit', href: '/audit', label: '审计日志', icon: 'audit', exact: true },
  {
    kind: 'group',
    id: 'settings',
    label: '用户',
    icon: 'user',
    items: [
      { href: '/account/password', label: '密码', exact: true },
      { href: '/account/sessions', label: '会话', exact: true },
      { href: '/account/deactivate', label: '停用', exact: true },
      { href: '/account/erase', label: '注销', exact: true }
    ]
  },
  { kind: 'link', id: 'content-types', href: '/settings/content-types', label: '内容类型', icon: 'content', exact: true },
  { kind: 'link', id: 'plugins', href: '/settings/plugins', label: '插件开发', icon: 'plugin', exact: true }
];

export const productEntries: NavLink[] = [
  { href: '/content', label: '内容' },
  { href: '/sites', label: '站点' }
];

const railEntries = [
  { id: 'overview', href: '/', label: '当前租户', icon: 'overview' },
  { id: 'content', href: '/content', label: '内容', icon: 'content' },
  { id: 'sites', href: '/sites', label: '站点', icon: 'sites' },
  { id: 'analytics', href: '/analytics/visits', label: '访问统计', icon: 'analytics' },
  { id: 'audit', href: '/audit', label: '审计日志', icon: 'audit' },
  { id: 'members', href: '/members', label: '成员关系', icon: 'members' },
  { id: 'platform', href: '/platform/tenants', label: '平台运营', icon: 'platform' }
] as const;

type RailEntry = (typeof railEntries)[number];

export function visibleRail(showPlatform: boolean): readonly RailEntry[] {
  return showPlatform ? railEntries : railEntries.filter((item) => item.id !== 'platform');
}

export type SectionLink = {
  href: string;
  label: string;
  exact?: boolean;
  group?: string;
  children?: SectionLink[];
};

const spaceSections = [
  ['pages', '页面'],
  ['toc', '目录'],
  ['tags', '标签'],
  ['releases', '发版'],
  ['imports', '导入'],
  ['grants', '授权'],
  ['trash', '回收']
] as const;

const siteSections = [
  ['mounts', '挂载'],
  ['domains', '自有域名'],
  ['redirects', '重定向'],
  ['search', '搜索'],
  ['grants', '授权'],
  ['webhooks', '投递结果']
] as const;

export function sectionTree(pathname: string, module: string | null): SectionLink[] {
  if (module === 'content') {
    const spaceId = pathname.match(/^\/content\/spaces\/([^/]+)/)?.[1];
    return [
      { href: '/content', label: '使用情况', exact: true },
      {
        href: '/content/spaces',
        label: '空间',
        children: spaceId
          ? spaceSections.map(([slug, label]) => ({
              href: `/content/spaces/${spaceId}/${slug}`,
              label,
              exact: true,
              group: '空间'
            }))
          : undefined
      },
      { href: '/content/collections', label: '分组', exact: true }
    ];
  }
  if (module === 'sites') {
    const siteId = pathname.match(/^\/sites\/([^/]+)/)?.[1];
    return [
      {
        href: '/sites',
        label: '站点',
        exact: !siteId,
        children: siteId
          ? siteSections.map(([slug, label]) => ({
              href: `/sites/${siteId}/${slug}`,
              label,
              exact: true,
              group: '站点'
            }))
          : undefined
      }
    ];
  }
  if (module === 'analytics') {
    return [
      { href: '/analytics/visits', label: '访问趋势', exact: true },
      { href: '/analytics/search', label: '搜索统计', exact: true }
    ];
  }
  if (module === 'audit') return [{ href: '/audit', label: '审计日志', exact: true }];
  if (module === 'members') {
    return [
      { href: '/members', label: '成员', exact: true },
      { href: '/teams', label: '用户组', exact: true }
    ];
  }
  if (module === 'platform') {
    return [
      { href: '/platform/tenants', label: '租户', exact: true },
      { href: '/platform/users', label: '用户', exact: true },
      { href: '/platform/health', label: '运行状态', exact: true },
      { href: '/platform/mail', label: '邮件作业', exact: true }
    ];
  }
  return [];
}

const modulePrefixes = ['/content', '/sites', '/platform'];
const railPrefixes = ['/content', '/sites', '/platform', '/analytics', '/audit', '/members', '/teams'];

export function pathActive(pathname: string, href: string, exact = false) {
  if (exact || href === '/') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function sectionTitle(module: string | null): string {
  if (module === 'content') return '内容';
  if (module === 'sites') return '站点';
  if (module === 'analytics') return '访问统计';
  if (module === 'audit') return '审计日志';
  if (module === 'members') return '成员关系';
  if (module === 'platform') return '平台运营';
  return '';
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
