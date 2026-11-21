import { lazy } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useServices } from '@/shared/api/context';
import type { components } from '@/shared/api/generated/types';
import { PageHeading } from '@/shared/ui/resource';
import { AppLink } from '@/shared/ui/navigation';
import { Empty } from '@/shared/ui/feedback';

const Spaces = lazy(() =>
  import('@/features/spaces').then((m) => ({ default: m.SpacesPage })),
);
const SpaceWorkspace = lazy(() =>
  import('@/features/spaces').then((m) => ({ default: m.SpaceWorkspace })),
);
const SpaceSettings = lazy(() =>
  import('@/features/spaces').then((m) => ({ default: m.SpaceSettingsPage })),
);
const Collections = lazy(() =>
  import('@/features/spaces').then((m) => ({ default: m.CollectionsPage })),
);
const Account = lazy(() =>
  import('@/features/session').then((m) => ({ default: m.AccountPage })),
);
const Invitation = lazy(() =>
  import('@/features/session').then((m) => ({ default: m.InvitationPage })),
);
const Pages = lazy(() =>
  import('@/features/page-authoring').then((m) => ({ default: m.PagesPage })),
);
const Editor = lazy(() =>
  import('@/features/page-authoring').then((m) => ({ default: m.PageEditor })),
);
const Toc = lazy(() =>
  import('@/features/toc').then((m) => ({ default: m.TocPage })),
);
const Releases = lazy(() =>
  import('@/features/releases').then((m) => ({ default: m.ReleasesPage })),
);
const Assets = lazy(() =>
  import('@/features/assets').then((m) => ({ default: m.AssetsPage })),
);
const Bundles = lazy(() =>
  import('@/features/bundles').then((m) => ({ default: m.BundlesPage })),
);
const Termination = lazy(() =>
  import('@/features/termination').then((m) => ({
    default: m.TerminationPage,
  })),
);
const Deletions = lazy(() =>
  import('@/features/termination').then((m) => ({ default: m.DeletionsPage })),
);
const Sites = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.SitesPage })),
);
const SiteWorkspace = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.SiteWorkspace })),
);
const SiteMounts = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.SiteMounts })),
);
const SiteSettings = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.SiteSettings })),
);
const Domains = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.DomainsPage })),
);
const Redirects = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.RedirectsPage })),
);
const Search = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.SearchSettingsPage })),
);
const Delivery = lazy(() =>
  import('@/features/sites').then((m) => ({ default: m.DeliveryPage })),
);
const Members = lazy(() =>
  import('@/features/access').then((m) => ({ default: m.MembersPage })),
);
const Teams = lazy(() =>
  import('@/features/access').then((m) => ({ default: m.TeamsPage })),
);
const Tokens = lazy(() =>
  import('@/features/access').then((m) => ({ default: m.TokensPage })),
);
const Permissions = lazy(() =>
  import('@/features/access').then((m) => ({ default: m.PermissionsPage })),
);
const Audit = lazy(() =>
  import('@/features/operations').then((m) => ({ default: m.AuditPage })),
);
const Webhooks = lazy(() =>
  import('@/features/operations').then((m) => ({ default: m.WebhooksPage })),
);
const Stats = lazy(() =>
  import('@/features/operations').then((m) => ({ default: m.StatsPage })),
);
const Capabilities = lazy(() =>
  import('@/features/operations').then((m) => ({
    default: m.OperationsCapabilities,
  })),
);
const Tags = lazy(() =>
  import('@/features/tags').then((m) => ({ default: m.TagsPage })),
);
const ContentTypes = lazy(() =>
  import('@/features/content-platform').then((m) => ({
    default: m.ContentTypesPage,
  })),
);
const Plugins = lazy(() =>
  import('@/features/content-platform').then((m) => ({
    default: m.PluginsPage,
  })),
);
const Workbench = lazy(() =>
  import('@/features/content-platform').then((m) => ({
    default: m.PluginWorkbench,
  })),
);
const PlatformTenants = lazy(() =>
  import('@/features/platform').then((m) => ({ default: m.TenantsPage })),
);
const PlatformUsers = lazy(() =>
  import('@/features/platform').then((m) => ({ default: m.UsersPage })),
);
const PlatformOperations = lazy(() =>
  import('@/features/platform').then((m) => ({
    default: m.PlatformOperations,
  })),
);

export default function Workspace({
  profile,
}: {
  profile: components['schemas']['Profile'];
}) {
  const { scope } = useServices();
  const { pathname } = useLocation();
  const parts = pathname
    .replace(/^\/console(?=\/|$)/, '')
    .replace(/^\/+/, '')
    .split('/');
  if (parts[0] === 'account') return <Account />;
  if (parts[0] === 'invitations') return <Invitation />;
  if (parts[0] === 'platform') {
    if (!profile.platformOperator)
      return (
        <Empty
          title="无平台运营权限"
          description="当前身份没有平台运营资格。"
        />
      );
    return (
      {
        tenants: <PlatformTenants />,
        users: <PlatformUsers />,
        operations: <PlatformOperations />,
      }[parts[1]] ?? <NotFound />
    );
  }
  if (!scope.tenantId)
    return (
      <>
        <PageHeading
          title="选择租户"
          description="进入你所属租户的内容与交付工作区。"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {profile.tenants?.map((tenant) => (
            <AppLink
              key={tenant.id}
              className="rounded-lg border p-5 font-medium"
              to={`t/${tenant.id}/spaces`}
            >
              {tenant.name}
              <span className="mt-2 block text-xs text-muted-foreground">
                {tenant.role} · {tenant.status}
              </span>
            </AppLink>
          ))}
        </div>
        {!profile.tenants?.length && (
          <Empty
            title="暂无租户成员关系"
            description="接受邀请或由平台运营员开通租户后可进入。"
          />
        )}
      </>
    );
  if (scope.spaceId)
    return (
      <SpaceWorkspace>
        {scope.pageId ? (
          <Editor key={scope.pageId} />
        ) : (
          ({
            pages: <Pages />,
            toc: <Toc />,
            releases: <Releases />,
            attachments: <Assets />,
            bundles: <Bundles />,
            trash: <Pages trash />,
            permissions: <Permissions />,
            settings: <SpaceSettings />,
            termination: <Termination />,
          }[scope.panel || 'pages'] ?? <NotFound />)
        )}
      </SpaceWorkspace>
    );
  if (scope.siteId)
    return (
      <SiteWorkspace>
        {{
          mounts: <SiteMounts />,
          domains: <Domains />,
          delivery: <Delivery />,
          redirects: <Redirects />,
          search: <Search />,
          permissions: <Permissions />,
          settings: <SiteSettings />,
          termination: <Termination />,
        }[scope.panel || 'mounts'] ?? <NotFound />}
      </SiteWorkspace>
    );
  if (parts[2] === 'teams' && scope.teamId) return <Members />;
  if (parts[2] === 'plugins' && scope.resourceId) return <Workbench />;
  return (
    {
      spaces: <Spaces />,
      collections: <Collections />,
      tags: <Tags />,
      sites: <Sites />,
      domains: <Domains />,
      releases: <Releases />,
      members: <Members />,
      teams: <Teams />,
      tokens: <Tokens />,
      audit: <Audit />,
      webhooks: <Webhooks />,
      stats: <Stats />,
      deletions: <Deletions />,
      'content-types': <ContentTypes />,
      plugins: <Plugins />,
      capabilities: <Capabilities />,
    }[parts[2]] ?? <NotFound />
  );
}
function NotFound() {
  return (
    <Empty
      title="页面不存在"
      description="请通过左侧导航选择功能，或检查资源链接。"
    />
  );
}
