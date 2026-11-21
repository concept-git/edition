import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BookOpen,
  Layers,
  Globe,
  Users,
  KeyRound,
  Blocks,
  Activity,
  History,
  Webhook,
  Tags,
  Settings,
  LogOut,
  SunMoon,
  Shield,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { createApi } from '@/shared/api/generated/sdk';
import type { components } from '@/shared/api/generated/types';
import { SessionTransport } from '@/shared/api/session';
import { retryDelay, shouldRetryQuery } from '@/shared/api/problem';
import { ServicesContext, type ResourceScope } from '@/shared/api/context';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { Button } from '@/shared/ui/button';
import { AppLink } from '@/shared/ui/navigation';
import { Failure, Pending } from '@/shared/ui/feedback';
import { useResource } from '@/shared/ui/resource';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/shared/ui/sidebar';
import { AuthPage } from '@/features/session';

const session = new SessionTransport();
const api = createApi(session.fetch);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15000, retry: shouldRetryQuery, retryDelay },
    mutations: { retry: false },
  },
});
const Workspace = lazy(() => import('./workspace'));

function parseScope(pathname: string): ResourceScope {
  const parts = pathname
    .replace(/^\/console(?=\/|$)/, '')
    .replace(/^\/+/, '')
    .split('/')
    .map(decodeURIComponent);
  return {
    tenantId: parts[0] === 't' ? (parts[1] ?? '') : '',
    spaceId: parts[2] === 'spaces' ? (parts[3] ?? '') : '',
    pageId:
      parts[2] === 'spaces' && parts[4] === 'pages' ? (parts[5] ?? '') : '',
    siteId: parts[2] === 'sites' ? (parts[3] ?? '') : '',
    teamId: parts[2] === 'teams' ? (parts[3] ?? '') : '',
    resourceId:
      parts[0] === 'invitations' ? (parts[1] ?? '') : (parts[3] ?? ''),
    panel: parts[4] ?? '',
  };
}
export function ConsoleApp() {
  const location = useLocation();
  const routeNavigate = useNavigate();
  const snapshot = useSyncExternalStore(session.subscribe, session.snapshot);
  const [profile, setProfile] = useState<
    components['schemas']['Profile'] | null
  >(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<unknown>();
  const scope = useMemo(
    () => parseScope(location.pathname),
    [location.pathname],
  );
  const navigate = (target: string) => {
    void routeNavigate({ to: '/$', params: { _splat: target } });
  };
  const loadProfile = async () => {
    const { data } = await api.getCurrentUser({});
    setProfile(data);
    setError(undefined);
  };
  const restore = async () => {
    setBooting(true);
    setError(undefined);
    try {
      const response = await session.restore(window.location.origin);
      if (response.ok) await loadProfile();
      else if (response.status !== 401) throw new Error('会话恢复暂时不可用');
    } catch (failure) {
      setError(failure);
    } finally {
      setBooting(false);
    }
  };
  useEffect(() => {
    void restore();
  }, []);
  useEffect(() => {
    if (snapshot.expired) {
      setProfile(null);
      queryClient.clear();
    }
  }, [snapshot.expired]);
  const services = {
    api,
    session,
    scope,
    actorKey: profile?.id ?? 'anonymous',
    navigate,
  };
  const main = booting ? (
    <Pending />
  ) : error && !profile ? (
    <main className="mx-auto max-w-xl p-8">
      <Failure
        error={error}
        retry={() => {
          void restore();
        }}
      />
    </main>
  ) : !profile ? (
    <AuthPage signedIn={loadProfile} />
  ) : (
    <ConsoleLayout
      profile={profile}
      pathname={location.pathname}
      onLogout={async () => {
        await api.logout({});
        session.clear();
      }}
    >
      <Suspense fallback={<Pending />}>
        <Workspace profile={profile} />
      </Suspense>
    </ConsoleLayout>
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ServicesContext.Provider value={services}>
        <TooltipProvider>
          {main}
          <Toaster richColors position="bottom-right" closeButton />
        </TooltipProvider>
      </ServicesContext.Provider>
    </QueryClientProvider>
  );
}

function ConsoleLayout({
  profile,
  pathname,
  children,
  onLogout,
}: {
  profile: components['schemas']['Profile'];
  pathname: string;
  children: ReactNode;
  onLogout: () => Promise<void>;
}) {
  const [logoutError, setLogoutError] = useState<unknown>();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('edition.theme') ?? 'system',
  );
  const tenantId = parseScope(pathname).tenantId;
  const capabilities = useResource(
    ['capabilities'],
    (signal) =>
      api.operationsCapabilities({ signal, params: { path: { tenantId } } }),
    Boolean(tenantId),
  );
  const operationFlags: Record<string, boolean | undefined> = {
    audit: capabilities.data?.data.audit,
    webhooks: capabilities.data?.data.webhooks,
    stats: capabilities.data?.data.tenantStats,
  };
  const base = `t/${tenantId}`;
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () =>
      document.documentElement.classList.toggle(
        'dark',
        theme === 'dark' || (theme === 'system' && media.matches),
      );
    apply();
    media.addEventListener('change', apply);
    localStorage.setItem('edition.theme', theme);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  const nav = [
    {
      title: '内容',
      items: [
        ['spaces', '空间', BookOpen],
        ['collections', '分组', Layers],
        ['tags', '标签', Tags],
        ['content-types', '内容类型', Blocks],
        ['plugins', '插件开发', Blocks],
      ],
    },
    {
      title: '交付',
      items: [
        ['sites', '站点', Globe],
        ['domains', '域名', Globe],
        ['releases', '全部发版', History],
      ],
    },
    {
      title: '管理与运营',
      items: [
        ['members', '成员与邀请', Users],
        ['teams', '用户组', Users],
        ['tokens', 'API 令牌', KeyRound],
        ['audit', '审计', History],
        ['webhooks', 'Webhook', Webhook],
        ['stats', '统计', Activity],
        ['deletions', '清理状态', History],
      ],
    },
  ] as const;
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-50 -translate-y-24 rounded-md bg-primary p-3 text-primary-foreground focus:translate-y-0"
      >
        跳过导航
      </a>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-5">
          <AppLink
            to=""
            className="flex items-center gap-2 text-lg font-semibold text-foreground hover:no-underline"
          >
            <BookOpen className="size-6 text-primary" />
            Edition{' '}
            <span className="text-xs font-normal text-muted-foreground">
              控制台
            </span>
          </AppLink>
          <TenantSelect profile={profile} tenantId={tenantId} />
        </SidebarHeader>
        <SidebarContent>
          {tenantId &&
            nav.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarMenu>
                  {group.items
                    .filter(
                      ([id]) =>
                        !Object.hasOwn(operationFlags, id) ||
                        operationFlags[id] === true,
                    )
                    .map(([id, label, Icon]) => (
                      <SidebarMenuItem key={id}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.includes(`/${id}`)}
                        >
                          <AppLink
                            to={`${base}/${id}`}
                            className="text-sidebar-foreground hover:no-underline"
                          >
                            <Icon />
                            <span>{label}</span>
                          </AppLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          {profile.platformOperator && (
            <SidebarGroup>
              <SidebarGroupLabel>平台运营</SidebarGroupLabel>
              <SidebarMenu>
                {[
                  ['tenants', '租户'],
                  ['users', '用户'],
                  ['operations', '运行诊断'],
                ].map(([id, label]) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild>
                      <AppLink
                        to={`platform/${id}`}
                        className="text-sidebar-foreground hover:no-underline"
                      >
                        <Shield />
                        <span>{label}</span>
                      </AppLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="border-t p-3">
          <AppLink
            to="account"
            className="flex items-center gap-2 rounded-md p-2 text-sm text-foreground"
          >
            <Settings className="size-4" />
            {profile.name ?? profile.email}
          </AppLink>
          <div className="flex items-center gap-2">
            <SunMoon className="ml-2 size-4" />
            <select
              aria-label="主题"
              className="h-8 flex-1 rounded-md border bg-background px-2 text-xs"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="退出登录"
              onClick={() => {
                void onLogout().catch(setLogoutError);
              }}
            >
              <LogOut />
            </Button>
          </div>
          {logoutError !== undefined && <Failure error={logoutError} />}
          {capabilities.isError && (
            <Failure
              error={capabilities.error}
              retry={() => {
                void capabilities.refetch();
              }}
            />
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <span className="text-xs text-muted-foreground">
            内容 / 管理控制台
          </span>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1500px] min-w-0 p-4 md:p-7"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
function TenantSelect({
  profile,
  tenantId,
}: {
  profile: components['schemas']['Profile'];
  tenantId: string;
}) {
  const tenants = profile.tenants ?? [];
  return (
    <select
      aria-label="切换租户"
      className="mt-3 w-full rounded-md border bg-background p-2 text-sm"
      value={tenantId}
      onChange={(event) => {
        queryClient.cancelQueries();
        queryClient.clear();
        window.location.assign(
          `/console/t/${encodeURIComponent(event.target.value)}/spaces`,
        );
      }}
    >
      <option value="">选择租户</option>
      {tenants.map((tenant) => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name} · {tenant.role}
        </option>
      ))}
    </select>
  );
}
