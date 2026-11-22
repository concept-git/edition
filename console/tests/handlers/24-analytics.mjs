// @ts-nocheck
/**
 * Traffic and search fixtures for the local auth stub.
 * A null count, a bucket before retainedFrom, or a bucket after a stale
 * update is a collection gap. no_data still carries a zero series so the
 * page cannot treat that payload as a flat zero line.
 */

let mode = 'no_data';

const pages = [
  { label: '/guide', count: 9 },
  { label: '/start', count: 4 }
];

const popular = [
  { label: '安装', count: 6 },
  { label: '域名', count: 2 }
];

export async function handle(req, res, ctx) {
  const url = ctx.url;
  if (req.method === 'POST' && url.pathname === '/__stub/analytics') {
    const body = await ctx.readJson(req);
    mode = typeof body.mode === 'string' ? body.mode : 'no_data';
    res.writeHead(204);
    res.end();
    return true;
  }
  const traffic = url.pathname.match(/^\/stats\/sites\/([^/]+)\/traffic$/);
  if (traffic && req.method === 'GET') return stats(res, ctx, 'traffic');
  const search = url.pathname.match(/^\/stats\/sites\/([^/]+)\/search$/);
  if (search && req.method === 'GET') return stats(res, ctx, 'search');
  return false;
}

function stats(res, ctx, kind) {
  if (!ctx.url.searchParams.get('tenantId')) {
    ctx.problem(res, 400, 'validation_failed', 'Request rejected', 'tenantId is required.', 'trace-analytics-24');
    return true;
  }
  if (mode === 'error') {
    ctx.problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', 'trace-analytics-24');
    return true;
  }
  ctx.send(res, 200, kind === 'traffic' ? trafficBody() : searchBody());
  return true;
}

function trafficBody() {
  if (mode === 'partial') {
    return {
      pv: 20,
      series: [bucket('2026-11-20T00:00:00.000Z', 0, 0), bucket('2026-11-21T00:00:00.000Z', 12, 4), bucket('2026-11-22T00:00:00.000Z', 8, 3)],
      pages,
      notFound: [],
      referrers: [],
      health: health('partial', '2026-11-22T00:00:00.000Z', '2026-11-21T00:00:00.000Z')
    };
  }
  if (mode === 'delayed') {
    return {
      pv: 12,
      series: [bucket('2026-11-20T00:00:00.000Z', 5, 2), bucket('2026-11-21T00:00:00.000Z', 7, 3), bucket('2026-11-22T00:00:00.000Z', 0, 0)],
      pages,
      notFound: [],
      referrers: [],
      health: health('delayed', '2026-11-21T12:00:00.000Z', '2026-10-01T00:00:00.000Z')
    };
  }
  if (mode === 'no_data') {
    return {
      pv: 0,
      series: [bucket('2026-11-20T00:00:00.000Z', 0, 0), bucket('2026-11-21T00:00:00.000Z', 0, 0), bucket('2026-11-22T00:00:00.000Z', 0, 0)],
      pages: [],
      notFound: [],
      referrers: [],
      health: health('no_data', null, '2026-10-01T00:00:00.000Z')
    };
  }
  return {
    pv: 20,
    series: [bucket('2026-11-20T00:00:00.000Z', 12, 4), bucket('2026-11-21T00:00:00.000Z', null, null), bucket('2026-11-22T00:00:00.000Z', 8, 3)],
    pages,
    notFound: [],
    referrers: [],
    health: health('ready', '2026-11-22T00:00:00.000Z', '2026-10-01T00:00:00.000Z')
  };
}

function searchBody() {
  const status = mode === 'partial' || mode === 'delayed' || mode === 'no_data' ? mode : 'ready';
  const updatedAt = mode === 'delayed' ? '2026-11-21T12:00:00.000Z' : mode === 'no_data' ? null : '2026-11-22T00:00:00.000Z';
  const retainedFrom = mode === 'partial' ? '2026-11-21T00:00:00.000Z' : '2026-10-01T00:00:00.000Z';
  const empty = mode === 'no_data';
  return {
    searches: empty ? 0 : 8,
    observable: empty ? 0 : 4,
    clicked: empty ? 0 : 2,
    clickRate: empty ? null : 0.5,
    popular: empty ? [] : popular,
    zeroResults: [],
    health: health(status, updatedAt, retainedFrom)
  };
}

function bucket(time, pv, uv) {
  return { time, pv, uv };
}

function health(status, updatedAt, retainedFrom) {
  return {
    status,
    updatedAt,
    lossDetected: status === 'partial',
    staleSources: status === 'delayed' ? 1 : 0,
    retainedFrom
  };
}
