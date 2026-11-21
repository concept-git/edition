import { lazy, Suspense, useState } from 'react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Facts } from '@/shared/ui/facts';
import { Input } from '@/shared/ui/input';
import { Pending } from '@/shared/ui/feedback';
const TrafficChart = lazy(() => import('./traffic-chart'));
export function StatsPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const [spaceId, setSpaceId] = useState('');
  const [siteId, setSiteId] = useState('');
  const tenant = useResource(['tenant-usage'], (signal) =>
    api.tenantUsage({ signal, params: { path: { id: tenantId } } }),
  );
  const space = useResource(
    ['space-usage', spaceId],
    (signal) =>
      api.spaceUsage({
        signal,
        params: { path: { id: spaceId }, query: { tenantId } },
      }),
    Boolean(spaceId),
  );
  return (
    <>
      <PageHeading
        title="统计与使用量"
        description="显示后台采集的结果；无数据与采集缺口分别核验。"
      />
      <Section title="租户使用量">
        <Resource query={tenant}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
      <Section title="空间使用量">
        <label className="text-sm">
          空间 ID
          <Input
            className="my-3 max-w-md"
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
          />
        </label>
        {spaceId && (
          <Resource query={space}>
            {({ data }) => <Facts value={data} />}
          </Resource>
        )}
      </Section>
      <Section title="站点流量与搜索">
        <label className="text-sm">
          站点 ID
          <Input
            className="my-3 max-w-md"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          />
        </label>
        {siteId && <SiteStats key={siteId} siteId={siteId} />}
      </Section>
    </>
  );
}
function SiteStats({ siteId }: { siteId: string }) {
  const { api, scope } = useServices();
  const path = { id: siteId };
  const query = { tenantId: scope.tenantId };
  const traffic = useResource(['traffic', siteId], (signal) =>
    api.siteTraffic({ signal, params: { path, query } }),
  );
  const search = useResource(['search-stats', siteId], (signal) =>
    api.siteSearchStats({ signal, params: { path, query } }),
  );
  return (
    <>
      <Resource query={traffic}>
        {({ data }) => (
          <>
            <Facts value={{ pv: data.pv, health: data.health }} />
            <Suspense fallback={<Pending />}>
              <TrafficChart series={data.series ?? []} />
            </Suspense>
            <details className="mt-3 text-sm">
              <summary>查看流量明细</summary>
              <Facts value={data} />
            </details>
          </>
        )}
      </Resource>
      <Resource query={search}>{({ data }) => <Facts value={data} />}</Resource>
    </>
  );
}
