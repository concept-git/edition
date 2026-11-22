// @ts-nocheck
/**
 * Stand-in for listSpaceMounts, viewSite, and siteDeliveryStatus.
 * desired is the durable target. current is the snapshot the Reader still serves.
 * successful is true only when that exact target is online.
 */

/** @type {Map<string, Array<Record<string, unknown>>>} */
let scenarios = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/delivery') {
    const body = await ctx.readJson(req);
    if (body.reset) scenarios = new Map();
    if (typeof body.spaceId === 'string' && Array.isArray(body.sites)) seed(body.spaceId, body.sites);
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const mounts = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/mounts$/);
  if (mounts && req.method === 'GET') {
    const scenario = scenarios.get(decodeURIComponent(mounts[2])) ?? [];
    ctx.send(
      res,
      200,
      scenario.map((site) => ({ siteId: site.siteId, slug: site.slug }))
    );
    return true;
  }

  const delivery = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/delivery$/);
  if (delivery && req.method === 'GET') {
    const found = findSite(decodeURIComponent(delivery[2]));
    if (!found) return false;
    ctx.send(res, 200, statusBody(found));
    return true;
  }

  const site = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)$/);
  if (site && req.method === 'GET') {
    const found = findSite(decodeURIComponent(site[2]));
    if (!found) return false;
    ctx.send(res, 200, siteBody(found));
    return true;
  }

  return false;
}

function seed(spaceId, sites) {
  scenarios.set(
    spaceId,
    sites.map((site) => ({
      siteId: typeof site.siteId === 'string' ? site.siteId : crypto.randomUUID(),
      name: typeof site.name === 'string' ? site.name : '站点',
      slug: typeof site.slug === 'string' ? site.slug : 'docs',
      spaceId,
      delivery: site.delivery && typeof site.delivery === 'object' ? site.delivery : {}
    }))
  );
}

function findSite(siteId) {
  for (const sites of scenarios.values()) {
    const found = sites.find((site) => site.siteId === siteId);
    if (found) return found;
  }
  return null;
}

function siteBody(site) {
  const now = new Date().toISOString();
  return {
    id: site.siteId,
    tenantId: '6f1e0c2a-6b4d-4e3a-9c11-0a1b2c3d4e5f',
    name: site.name,
    rule: '/{slug}/{itemPath}',
    home: null,
    robotsPolicy: 'index',
    titleTemplate: null,
    branding: { logo: null, favicon: null, primaryColor: null },
    locale: null,
    analyticsId: null,
    mounts: [{ spaceId: site.spaceId, slug: site.slug }],
    domains: [],
    createdAt: now,
    createdBy: null,
    updatedAt: now,
    updatedBy: null,
    allowedActions: ['read']
  };
}

function statusBody(site) {
  const delivery = site.delivery;
  const status = typeof delivery.status === 'string' ? delivery.status : 'running';
  const successful = delivery.successful === true;
  const terminal = delivery.terminal === true;
  const targetEpoch = typeof delivery.targetEpoch === 'number' ? delivery.targetEpoch : 1;
  const onlineEpoch = typeof delivery.onlineEpoch === 'number' ? delivery.onlineEpoch : null;
  const desiredReleaseId = typeof delivery.desiredReleaseId === 'string' ? delivery.desiredReleaseId : null;
  const currentReleaseId = typeof delivery.currentReleaseId === 'string' ? delivery.currentReleaseId : null;
  const desiredSpace = onlineSpace(site, desiredReleaseId);
  const currentSpace = onlineSpace(site, currentReleaseId);
  return {
    enabled: true,
    status,
    targetEpoch,
    onlineEpoch,
    primaryHost: 'docs.example',
    spaces: onlineEpoch === null ? [] : [currentSpace],
    error: status === 'failed' ? 'delivery_failed' : null,
    canRetry: status === 'failed',
    searchStatus: null,
    desired: { epoch: targetEpoch, spaces: [desiredSpace] },
    current:
      onlineEpoch === null
        ? null
        : {
            epoch: onlineEpoch,
            primaryHost: 'docs.example',
            readerHref: null,
            spaces: [currentSpace],
            readable: true,
            searchStatus: null
          },
    terminal,
    successful,
    nextPollAfterSeconds: typeof delivery.nextPollAfterSeconds === 'number' ? delivery.nextPollAfterSeconds : 0
  };
}

function onlineSpace(site, releaseId) {
  return {
    spaceId: site.spaceId,
    slug: site.slug,
    releaseId,
    readerHref: null
  };
}
