// @ts-nocheck
/**
 * Stand-in for Control site grants, space grants, and page restrictions.
 * Grants have no idempotency key. Page restriction requires If-Match
 * "permission-<revision>" taken from restriction.revision, and only narrows.
 */

const pageId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const users = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    key: 'user:11111111-1111-4111-8111-111111111101',
    name: '读者甲',
    email: 'reader.jia@edition.test'
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    key: 'user:11111111-1111-4111-8111-111111111102',
    name: '作者乙',
    email: 'author.yi@edition.test'
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    key: 'user:11111111-1111-4111-8111-111111111103',
    name: '访客丙',
    email: 'guest.bing@edition.test'
  }
];
const operations = {
  admin: ['read', 'write', 'publish', 'admin'],
  maintainer: ['read', 'write', 'publish'],
  author: ['read', 'write'],
  reader: ['read'],
  none: []
};
const roles = new Set(Object.keys(operations));

/** @type {Map<string, Map<string, { key: string, role: string }>>} */
const grants = new Map();
/** @type {Map<string, { active: boolean, principals: string[], revision: number }>} */
const restrictions = new Map();

export async function handle(req, res, ctx) {
  const path = ctx.url.pathname;

  const siteUsers = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/permissions\/principals\/users$/);
  if (siteUsers) return principals(req, res, ctx);

  const siteGrant = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/permissions\/grants\/([^/]+)$/);
  if (siteGrant) return mutateGrant(req, res, ctx, 'site', decodeURIComponent(siteGrant[2]), decodeURIComponent(siteGrant[3]));

  const siteList = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/permissions$/);
  if (siteList) return listGrants(req, res, ctx, 'site', decodeURIComponent(siteList[2]));

  const restriction = path.match(
    /^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+)\/permissions\/restriction$/
  );
  if (restriction) {
    return putRestriction(req, res, ctx, decodeURIComponent(restriction[2]), decodeURIComponent(restriction[3]));
  }

  const pagePermission = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+)\/permissions$/);
  if (pagePermission) return readRestriction(req, res, ctx, decodeURIComponent(pagePermission[2]), decodeURIComponent(pagePermission[3]));

  const spaceUsers = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/permissions\/principals\/users$/);
  if (spaceUsers) return principals(req, res, ctx);

  const spacePages = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/permissions\/pages$/);
  if (spacePages) return pages(req, res, ctx, decodeURIComponent(spacePages[2]));

  const spaceGrant = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/permissions\/grants\/([^/]+)$/);
  if (spaceGrant) return mutateGrant(req, res, ctx, 'space', decodeURIComponent(spaceGrant[2]), decodeURIComponent(spaceGrant[3]));

  const spaceList = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/permissions$/);
  if (spaceList) return listGrants(req, res, ctx, 'space', decodeURIComponent(spaceList[2]));

  return false;
}

function principals(req, res, ctx) {
  if (req.method !== 'GET') return false;
  const query = ctx.url.searchParams.get('q') ?? '';
  if ([...query].length < 2) {
    ctx.problem(res, 422, 'validation_failed', 'Request rejected', 'Query must contain at least 2 characters.', 'trace-principal');
    return true;
  }
  const needle = query.toLowerCase();
  const items = users
    .filter((user) => user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle))
    .map(principalView);
  ctx.send(res, 200, { items, nextCursor: null });
  return true;
}

function listGrants(req, res, ctx, type, resourceId) {
  if (req.method !== 'GET') return false;
  const items = [...bucket(type, resourceId).values()].map((grant) => grantView(type, resourceId, grant));
  ctx.send(res, 200, { items, nextCursor: null, allowedActions: ['grant', 'revoke', 'change_role'] });
  return true;
}

async function mutateGrant(req, res, ctx, type, resourceId, principalKey) {
  if (req.method !== 'PUT') return false;
  const body = await ctx.readJson(req);
  const role = typeof body.role === 'string' ? body.role : '';
  const user = users.find((item) => item.key === principalKey);
  if (!user) {
    ctx.problem(res, 404, 'permission_principal_not_found', 'Not found', 'Principal was not found.', 'trace-grant');
    return true;
  }
  if (!roles.has(role)) {
    ctx.problem(res, 422, 'permission_role_invalid', 'Request rejected', 'Role is not in the catalog.', 'trace-grant');
    return true;
  }
  const grant = { key: principalKey, role };
  bucket(type, resourceId).set(principalKey, grant);
  ctx.send(res, 200, grantView(type, resourceId, grant));
  return true;
}

function pages(req, res, ctx, spaceId) {
  if (req.method !== 'GET') return false;
  const restriction = restrictionFor(spaceId, pageId);
  ctx.send(res, 200, {
    items: [
      {
        id: pageId,
        title: '入门',
        slug: 'intro',
        restrictionActive: restriction.active,
        restrictionCount: restriction.principals.length,
        allowedActions: ['restrict', 'narrow_restriction']
      }
    ],
    nextCursor: null
  });
  return true;
}

function readRestriction(req, res, ctx, spaceId, id) {
  if (req.method !== 'GET') return false;
  if (id !== pageId) {
    ctx.problem(res, 404, 'page_not_found', 'Not found', 'Page was not found.', 'trace-page');
    return true;
  }
  sendRestriction(res, ctx, spaceId, id);
  return true;
}

async function putRestriction(req, res, ctx, spaceId, id) {
  if (req.method !== 'PUT') return false;
  if (id !== pageId) {
    ctx.problem(res, 404, 'page_not_found', 'Not found', 'Page was not found.', 'trace-page');
    return true;
  }
  const revision = revisionOf(req.headers['if-match']);
  if (revision === null) {
    ctx.problem(res, 428, 'precondition_required', 'Precondition required', 'If-Match must carry restriction.revision.', 'trace-restrict');
    return true;
  }
  const current = restrictionFor(spaceId, id);
  if (revision !== current.revision) {
    ctx.problem(res, 412, 'permission_version_conflict', 'Conflict', 'The restriction revision does not match.', 'trace-restrict');
    return true;
  }
  const body = await ctx.readJson(req);
  const keys = Array.isArray(body.principals) ? body.principals : null;
  if (!keys || keys.some((item) => typeof item !== 'string')) {
    ctx.problem(res, 422, 'validation_failed', 'Request rejected', 'Principals are invalid.', 'trace-restrict');
    return true;
  }
  const parent = new Set([...bucket('space', spaceId).keys()]);
  if (keys.some((key) => !parent.has(key))) {
    ctx.problem(res, 422, 'validation_failed', 'Request rejected', 'A page cannot grant an operation the parent does not have.', 'trace-restrict');
    return true;
  }
  const effective = current.active ? new Set(current.principals) : parent;
  if (keys.some((key) => !effective.has(key))) {
    ctx.problem(res, 409, 'permission_denied', 'Conflict', 'A page restriction cannot widen access.', 'trace-restrict');
    return true;
  }
  current.active = true;
  current.principals = [...new Set(keys)];
  current.revision += 1;
  sendRestriction(res, ctx, spaceId, id);
  return true;
}

function sendRestriction(res, ctx, spaceId, id) {
  const current = restrictionFor(spaceId, id);
  ctx.send(
    res,
    200,
    {
      pageId: id,
      restriction: {
        active: current.active,
        principals: current.principals.map((key) => principalView(users.find((user) => user.key === key) ?? { key, id: null, name: key, email: null })),
        revision: current.revision
      },
      allowedActions: ['restrict', 'narrow_restriction', 'replace_restriction']
    },
    { etag: `"permission-${current.revision}"` }
  );
}

function bucket(type, resourceId) {
  const id = `${type}:${resourceId}`;
  let found = grants.get(id);
  if (!found) {
    found = new Map();
    grants.set(id, found);
  }
  return found;
}

function restrictionFor(spaceId, id) {
  const key = `${spaceId}:${id}`;
  let found = restrictions.get(key);
  if (!found) {
    found = { active: false, principals: [], revision: 0 };
    restrictions.set(key, found);
  }
  return found;
}

function grantView(type, resourceId, grant) {
  const user = users.find((item) => item.key === grant.key);
  return {
    resource: { type, id: resourceId, source: 'local' },
    principal: principalView(user),
    role: grant.role,
    operations: operations[grant.role] ?? [],
    editable: true,
    allowedActions: ['change_role', 'revoke']
  };
}

function principalView(user) {
  return {
    key: user.key,
    type: 'user',
    id: user.id,
    name: user.name,
    status: 'active',
    email: user.email,
    avatar: null,
    memberCount: null
  };
}

function revisionOf(header) {
  if (typeof header !== 'string') return null;
  const match = /^"permission-(\d+)"$/.exec(header.trim());
  return match ? Number(match[1]) : null;
}
