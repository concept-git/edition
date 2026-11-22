// @ts-nocheck
import { createHash, randomUUID } from 'node:crypto';

/**
 * Stand-in for content-type registration and the page binding that reads it.
 * Versions are immutable. baseRevision lives in the body. Enabling, switching
 * the default, and deactivating do not rewrite an existing page.
 * The catalog starts empty so the settings page still says 没有数据.
 */

const tenantId = '6f1e0c2a-6b4d-4e3a-9c11-0a1b2c3d4e5f';
const formats = new Set(['markdown', 'html', 'txt', 'json', 'xml']);
const hosts = new Set(['server', 'browser']);
const trusted = new Set([
  'builtin.markdown@1.0.0/source',
  'builtin.markdown@1.0.0/render',
  'builtin.html@1.0.0/source',
  'builtin.html@1.0.0/render',
  'builtin.txt@1.0.0/source',
  'builtin.txt@1.0.0/render',
  'builtin.json@1.0.0/source',
  'builtin.json@1.0.0/render',
  'builtin.xml@1.0.0/source',
  'builtin.xml@1.0.0/render'
]);

const catalog = {
  items: [
    descriptor('builtin.markdown', 'Markdown', ['markdown']),
    descriptor('builtin.html', 'HTML', ['html']),
    descriptor('builtin.txt', 'TXT', ['txt']),
    descriptor('builtin.json', 'JSON', ['json']),
    descriptor('builtin.xml', 'XML', ['xml'])
  ],
  productionLoading: 'build',
  canDevelop: false
};

let types = new Map();
let versions = new Map();
let pages = new Map();
let replays = new Map();

reset();

export async function handle(req, res, ctx) {
  const url = ctx.url;
  if (req.method === 'POST' && url.pathname === '/__stub/content-types/reset') {
    reset();
    res.writeHead(204);
    res.end();
    return true;
  }

  const route = match(url.pathname);
  if (!route || route.tenant !== tenantId) return false;
  if (!authorized(req)) {
    ctx.problem(res, 401, 'unauthorized', 'Authentication rejected', 'Bearer token is required.', 'trace-content-type-auth');
    return true;
  }

  if (route.kind === 'plugins' && req.method === 'GET') {
    ctx.send(res, 200, catalog);
    return true;
  }
  if (route.kind === 'types' && req.method === 'GET') {
    // An untouched catalog belongs to the plugin stub, which publishes the enabled article type.
    if (types.size === 0) return false;
    ctx.send(res, 200, { items: [...types.values()].sort((left, right) => left.contentType.localeCompare(right.contentType)), canManage: true });
    return true;
  }
  if (route.kind === 'versions' && req.method === 'GET') {
    const contentType = url.searchParams.get('contentType') ?? '';
    ctx.send(res, 200, { items: summaries(contentType) });
    return true;
  }
  if (route.kind === 'version' && req.method === 'GET') {
    const found = versions.get(route.versionRef);
    if (!found) {
      ctx.problem(res, 404, 'content_type_version_not_found', 'Not Found', 'The version does not exist.', 'trace-content-type-version');
      return true;
    }
    ctx.send(res, 200, publicVersion(found));
    return true;
  }
  if (route.kind === 'pages' && req.method === 'GET') {
    ctx.send(res, 200, { items: spacePages(route.spaceId).map(publicPage), nextCursor: null, total: spacePages(route.spaceId).length, allowedActions: ['create', 'read'] });
    return true;
  }
  if (route.kind === 'page' && req.method === 'GET') {
    const found = spacePages(route.spaceId).find((item) => item.id === route.pageId);
    if (!found) {
      ctx.problem(res, 404, 'page_not_found', 'Not Found', 'The page does not exist.', 'trace-page');
      return true;
    }
    ctx.send(res, 200, publicPage(found));
    return true;
  }

  if (req.method !== 'POST') return false;
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-content-type-key');
    return true;
  }
  let body;
  try {
    body = await ctx.readJson(req);
  } catch {
    ctx.problem(res, 400, 'malformed_json', 'Bad Request', 'The request body is not JSON.', 'trace-content-type-json');
    return true;
  }
  const fingerprint = `${req.method} ${url.pathname} ${JSON.stringify(body)}`;
  const prior = replays.get(key);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This key was used for a different request.', 'trace-content-type-key');
      return true;
    }
    deliver(res, ctx, prior);
    return true;
  }
  const outcome = perform(route, body);
  const stored = { fingerprint, ...outcome };
  replays.set(key, stored);
  deliver(res, ctx, stored);
  return true;
}

function perform(route, body) {
  if (route.kind === 'versions') return register(body);
  if (route.kind === 'activate') return activate(body);
  if (route.kind === 'deactivate') return deactivate(body);
  if (route.kind === 'pages') return createPage(route.spaceId, body);
  return problemOutcome(404, 'not_found', 'Not Found', 'This write is not supported.', 'trace-content-type');
}

function register(body) {
  const contentType = typeof body.contentType === 'string' ? body.contentType.trim() : '';
  const definition = body.definition;
  const invalid = validateDefinition(contentType, definition);
  if (invalid) return invalid;
  const base = baseline(body.baseRevision, contentType);
  if (base.problem) return base;
  if ([...versions.values()].some((item) => item.contentType === contentType && item.definition.version === definition.version)) {
    return problemOutcome(422, 'version_exists', 'Unprocessable Content', 'That version is already registered.', 'trace-content-type-version');
  }
  const versionRef = randomUUID();
  const createdAt = new Date().toISOString();
  const stored = {
    versionRef,
    digest: createHash('sha256').update(JSON.stringify(definition)).digest('hex'),
    definition,
    createdAt,
    contentType
  };
  versions.set(versionRef, stored);
  const previous = types.get(contentType);
  if (!previous || previous.revision === 0) {
    types.set(contentType, {
      contentType,
      enabled: true,
      revision: base.revision + 1,
      activeVersionRef: versionRef,
      label: definition.label,
      format: definition.format,
      mediaType: definition.mediaType,
      builtin: false
    });
  } else {
    types.set(contentType, { ...previous, revision: base.revision + 1, builtin: false });
  }
  return { status: 201, body: publicVersion(stored) };
}

function activate(body) {
  const contentType = typeof body.contentType === 'string' ? body.contentType.trim() : '';
  const versionRef = typeof body.versionRef === 'string' ? body.versionRef : '';
  const state = types.get(contentType);
  if (!state) return problemOutcome(404, 'content_type_not_found', 'Not Found', 'The content type does not exist.', 'trace-content-type');
  const base = baseline(body.baseRevision, contentType);
  if (base.problem) return base;
  const version = versions.get(versionRef);
  if (!version || version.contentType !== contentType) {
    return problemOutcome(422, 'content_type_mismatch', 'Unprocessable Content', 'The version does not belong to this content type.', 'trace-content-type-version');
  }
  const next = {
    contentType,
    enabled: true,
    revision: base.revision + 1,
    activeVersionRef: versionRef,
    label: version.definition.label,
    format: version.definition.format,
    mediaType: version.definition.mediaType,
    builtin: false
  };
  types.set(contentType, next);
  return { status: 200, body: next };
}

function deactivate(body) {
  const contentType = typeof body.contentType === 'string' ? body.contentType.trim() : '';
  const state = types.get(contentType);
  if (!state) return problemOutcome(404, 'content_type_not_found', 'Not Found', 'The content type does not exist.', 'trace-content-type');
  const base = baseline(body.baseRevision, contentType);
  if (base.problem) return base;
  const next = { ...state, enabled: false, revision: base.revision + 1, builtin: false };
  types.set(contentType, next);
  return { status: 200, body: next };
}

function createPage(spaceId, body) {
  const contentType = typeof body.contentType === 'string' ? body.contentType : '';
  const state = types.get(contentType);
  if (!state || !state.enabled) {
    return problemOutcome(409, 'content_type_disabled', 'Conflict', 'Disabled content types cannot be selected for a new page.', 'trace-page-type');
  }
  const versionRef = typeof body.versionRef === 'string' && body.versionRef.length > 0 ? body.versionRef : state.activeVersionRef;
  const version = versions.get(versionRef);
  if (!version || version.contentType !== contentType) {
    return problemOutcome(422, 'content_type_mismatch', 'Unprocessable Content', 'The version does not belong to this content type.', 'trace-page-type');
  }
  if (version.definition.format !== body.format) {
    return problemOutcome(422, 'content_format_mismatch', 'Unprocessable Content', 'The page format does not match the content type.', 'trace-page-type');
  }
  const title = typeof body.title === 'string' ? body.title : '';
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const interpretation =
    body.interpretation && typeof body.interpretation === 'object' && !Array.isArray(body.interpretation)
      ? structuredClone(body.interpretation)
      : structuredClone(version.definition.defaultInterpretation ?? {});
  const page = {
    id: randomUUID(),
    title,
    slug,
    format: body.format,
    contentType,
    versionRef,
    interpretation,
    updatedAt: new Date().toISOString()
  };
  spacePages(spaceId).push(page);
  return { status: 201, body: publicPage(page) };
}

function baseline(value, contentType) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return problemOutcome(422, 'validation_failed', 'Unprocessable Content', 'baseRevision must be a non-negative integer.', 'trace-content-type-revision');
  }
  const current = types.get(contentType)?.revision ?? 0;
  if (value !== current) {
    return problemOutcome(409, 'edit_conflict', 'Conflict', `current_revision_${current}`, 'trace-content-type-revision');
  }
  return { revision: current };
}

function validateDefinition(contentType, definition) {
  if (!definition || typeof definition !== 'object' || definition.id !== contentType || contentType.length === 0 || contentType.length > 128) {
    return problemOutcome(422, 'invalid_type', 'Unprocessable Content', 'The content type id is invalid.', 'trace-content-type');
  }
  for (const field of [definition.version, definition.label, definition.mediaType, definition.language]) {
    if (typeof field !== 'string' || field.trim().length === 0 || field.length > 200) {
      return problemOutcome(422, 'invalid_metadata', 'Unprocessable Content', 'Definition metadata is invalid.', 'trace-content-type');
    }
  }
  if (!formats.has(definition.format) || !hosts.has(definition.renderHost)) {
    return problemOutcome(422, 'invalid_format_or_host', 'Unprocessable Content', 'Format or render host is invalid.', 'trace-content-type');
  }
  if (!Array.isArray(definition.editors) || definition.editors.length === 0 || !Array.isArray(definition.renderers) || definition.renderers.length === 0) {
    return problemOutcome(422, 'invalid_contributions', 'Unprocessable Content', 'Editors and renderers are required.', 'trace-content-type');
  }
  const bound = [...definition.editors, ...definition.renderers];
  if (bound.some((item) => !trusted.has(`${item?.pluginId}@${item?.pluginVersion}/${item?.contributionId}`))) {
    return problemOutcome(422, 'untrusted_contribution', 'Unprocessable Content', 'A contribution is not build-registered.', 'trace-content-type');
  }
  if (!definition.defaultInterpretation || typeof definition.defaultInterpretation !== 'object' || Array.isArray(definition.defaultInterpretation)) {
    return problemOutcome(422, 'invalid_metadata', 'Unprocessable Content', 'Default interpretation must be an object.', 'trace-content-type');
  }
  return null;
}

function summaries(contentType) {
  return [...versions.values()]
    .filter((item) => item.contentType === contentType)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((item) => ({
      versionRef: item.versionRef,
      contentType: item.contentType,
      version: item.definition.version,
      digest: item.digest,
      createdAt: item.createdAt
    }));
}

function publicVersion(item) {
  return { versionRef: item.versionRef, digest: item.digest, definition: item.definition, createdAt: item.createdAt };
}

function publicPage(page) {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: 'draft',
    format: page.format,
    icon: null,
    tags: [],
    driftFlag: false,
    updatedAt: page.updatedAt,
    updatedBy: '8d2c1b0a-9e8f-4a7b-8c6d-5e4f3a2b1c0d',
    publishedAt: null,
    allowedActions: ['read', 'edit'],
    content: '',
    revision: 1,
    contentType: page.contentType,
    versionRef: page.versionRef,
    interpretation: page.interpretation
  };
}

function spacePages(spaceId) {
  const found = pages.get(spaceId);
  if (found) return found;
  const created = [];
  pages.set(spaceId, created);
  return created;
}

function match(pathname) {
  const patterns = [
    [/^\/api\/v1\/tenants\/([^/]+)\/content-plugins$/, 'plugins'],
    [/^\/api\/v1\/tenants\/([^/]+)\/content-types\/versions\/([^/]+)$/, 'version'],
    [/^\/api\/v1\/tenants\/([^/]+)\/content-types\/versions$/, 'versions'],
    [/^\/api\/v1\/tenants\/([^/]+)\/content-types\/activate$/, 'activate'],
    [/^\/api\/v1\/tenants\/([^/]+)\/content-types\/deactivate$/, 'deactivate'],
    [/^\/api\/v1\/tenants\/([^/]+)\/content-types$/, 'types'],
    [/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+)$/, 'page'],
    [/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages$/, 'pages']
  ];
  for (const [pattern, kind] of patterns) {
    const found = pathname.match(pattern);
    if (!found) continue;
    return {
      tenant: found[1],
      kind,
      versionRef: kind === 'version' ? decodeURIComponent(found[2]) : undefined,
      spaceId: kind === 'page' || kind === 'pages' ? found[2] : undefined,
      pageId: kind === 'page' ? found[3] : undefined
    };
  }
  return null;
}

function descriptor(id, name, contentTypes) {
  return {
    id,
    name,
    version: '1.0.0',
    contentTypes,
    formats: contentTypes,
    capabilities: ['source-edit', 'preview', 'validate', 'export'],
    trusted: true
  };
}

function authorized(req) {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') && header.slice('Bearer '.length).trim().length > 0;
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  return typeof value === 'string' ? value.trim() : '';
}

function deliver(res, ctx, outcome) {
  if (outcome.problem) {
    ctx.problem(res, outcome.status, outcome.code, outcome.title, outcome.detail, outcome.traceId);
    return;
  }
  ctx.send(res, outcome.status, outcome.body);
}

function problemOutcome(status, code, title, detail, traceId) {
  return { problem: true, status, code, title, detail, traceId };
}

function reset() {
  types = new Map();
  versions = new Map();
  pages = new Map();
  replays = new Map();
}
