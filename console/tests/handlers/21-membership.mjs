// @ts-nocheck
import { randomBytes, randomUUID } from 'node:crypto';

/**
 * Stand-in for tenant members, invitations, and teams.
 * The invite token is returned only from the create response.
 */

const tenantId = '6f1e0c2a-6b4d-4e3a-9c11-0a1b2c3d4e5f';
const actorId = '8d2c1b0a-9e8f-4a7b-8c6d-5e4f3a2b1c0d';
const ownerId = '11111111-1111-4111-8111-111111111111';
const colleagueId = '22222222-2222-4222-8222-222222222222';

const directory = [
  {
    id: ownerId,
    name: '甲',
    email: 'jia@edition.test',
    role: 'owner',
    joinedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: colleagueId,
    name: '乙',
    email: 'colleague@edition.test',
    role: 'member',
    joinedAt: '2026-02-02T00:00:00.000Z'
  }
];

let members = [];
let invitations = [];
let teams = [];
let teamMembers = new Map();
let teamInvitations = new Map();
let replays = new Map();

reset();

export async function handle(req, res, ctx) {
  const url = ctx.url;
  if (req.method === 'POST' && url.pathname === '/__stub/membership/reset') {
    reset();
    res.writeHead(204);
    res.end();
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/me') {
    if (!authorized(req, res, ctx)) return true;
    ctx.send(res, 200, {
      id: actorId,
      email: 'maintainer@edition.test',
      name: '维护者',
      avatar: null,
      locale: 'zh-CN',
      verified: true,
      status: 'active',
      platformOperator: false,
      tenants: [{ id: tenantId, name: '示例租户', role: 'owner', status: 'active' }]
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/auth/context') {
    if (!authorized(req, res, ctx)) return true;
    ctx.send(res, 200, {
      credentialType: 'session',
      actorId,
      credentialId: actorId,
      scopes: [],
      tenantId,
      expiry: '2026-12-01T00:00:00.000Z'
    });
    return true;
  }

  const membersMatch = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/members$/);
  if (membersMatch && req.method === 'GET') {
    if (!knownTenant(membersMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    ctx.send(res, 200, { items: members.map(summary), nextCursor: null });
    return true;
  }

  const memberMatch = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/members\/([^/]+)$/);
  if (memberMatch && req.method === 'DELETE') {
    if (!knownTenant(memberMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    const key = requireKey(req, res, ctx);
    if (!key) return true;
    const fingerprint = `${req.method} ${url.pathname}`;
    if (replay(req, res, ctx, key, fingerprint)) return true;
    const member = members.find((item) => item.id === memberMatch[2]);
    if (!member) {
      remember(key, fingerprint, 204, null);
      res.writeHead(204);
      res.end();
      return true;
    }
    const owners = members.filter((item) => item.role === 'owner');
    if (member.role === 'owner' && owners.length <= 1) {
      refuse(res, ctx, key, fingerprint, 409, 'last_owner', 'Last owner protected', 'A group must keep at least one owner.', 'trace-last-owner');
      return true;
    }
    const blocksTeam = teams.some((team) => {
      const people = teamMembers.get(team.id) ?? [];
      const teamOwners = people.filter((item) => item.role === 'owner');
      return teamOwners.length <= 1 && teamOwners.some((item) => item.id === member.id);
    });
    if (blocksTeam) {
      refuse(
        res,
        ctx,
        key,
        fingerprint,
        409,
        'team_last_owner',
        'Team ownership transfer required',
        'Transfer ownership of every blocking team before removing this tenant member.',
        'trace-team-last-owner'
      );
      return true;
    }
    members = members.filter((item) => item.id !== member.id);
    remember(key, fingerprint, 204, null);
    res.writeHead(204);
    res.end();
    return true;
  }

  const invitationsMatch = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/invitations$/);
  if (invitationsMatch && req.method === 'GET') {
    if (!knownTenant(invitationsMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    ctx.send(res, 200, { items: invitations.map(inviteSummary), nextCursor: null });
    return true;
  }
  if (invitationsMatch && req.method === 'POST') {
    if (!knownTenant(invitationsMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    await invite(req, res, ctx, invitations, (email) => members.some((item) => item.email === email));
    return true;
  }

  const teamsMatch = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/teams$/);
  if (teamsMatch && req.method === 'GET') {
    if (!knownTenant(teamsMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    ctx.send(res, 200, { items: teams, nextCursor: null });
    return true;
  }
  if (teamsMatch && req.method === 'POST') {
    if (!knownTenant(teamsMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    const body = await ctx.readJson(req);
    const key = requireKey(req, res, ctx);
    if (!key) return true;
    const fingerprint = `${req.method} ${url.pathname} ${JSON.stringify({ name: body.name })}`;
    if (replay(req, res, ctx, key, fingerprint)) return true;
    const name = String(body.name ?? '').trim();
    if (!name || name.length > 120) {
      refuse(res, ctx, key, fingerprint, 422, 'team_name_invalid', 'Team name invalid', 'The team name is empty or too long.', 'trace-team-name');
      return true;
    }
    if (teams.some((team) => team.name === name)) {
      refuse(res, ctx, key, fingerprint, 409, 'team_name_taken', 'Team name taken', 'A team with this name already exists.', 'trace-team-name-taken');
      return true;
    }
    const now = new Date().toISOString();
    const team = {
      id: randomUUID(),
      tenantId,
      name,
      callerRole: 'owner',
      memberCount: 1,
      ownerCount: 1,
      createdAt: now,
      updatedAt: now
    };
    teams.push(team);
    teamMembers.set(team.id, [
      {
        id: actorId,
        name: '维护者',
        avatar: null,
        email: 'maintainer@edition.test',
        role: 'owner',
        joinedAt: now
      }
    ]);
    teamInvitations.set(team.id, []);
    remember(key, fingerprint, 201, team);
    ctx.send(res, 201, team);
    return true;
  }

  const teamMembersMatch = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/teams\/([^/]+)\/members$/);
  if (teamMembersMatch && req.method === 'GET') {
    if (!knownTenant(teamMembersMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    const people = teamMembers.get(teamMembersMatch[2]);
    if (!people) {
      ctx.problem(res, 404, 'team_not_found', 'Team not found', 'This team does not exist.', 'trace-team-missing');
      return true;
    }
    ctx.send(res, 200, { items: people, nextCursor: null });
    return true;
  }

  const teamInvitesMatch = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/teams\/([^/]+)\/invitations$/);
  if (teamInvitesMatch && req.method === 'GET') {
    if (!knownTenant(teamInvitesMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    const invites = teamInvitations.get(teamInvitesMatch[2]);
    if (!invites) {
      ctx.problem(res, 404, 'team_not_found', 'Team not found', 'This team does not exist.', 'trace-team-missing');
      return true;
    }
    ctx.send(res, 200, { items: invites.map(inviteSummary), nextCursor: null });
    return true;
  }
  if (teamInvitesMatch && req.method === 'POST') {
    if (!knownTenant(teamInvitesMatch[1], res, ctx) || !authorized(req, res, ctx)) return true;
    const invites = teamInvitations.get(teamInvitesMatch[2]);
    if (!invites) {
      ctx.problem(res, 404, 'team_not_found', 'Team not found', 'This team does not exist.', 'trace-team-missing');
      return true;
    }
    await invite(req, res, ctx, invites, (email) => !members.some((item) => item.email === email), 'tenant_membership_required');
    return true;
  }

  return false;
}

function reset() {
  members = directory.map((item) => ({ ...item }));
  invitations = [];
  teams = [];
  teamMembers = new Map();
  teamInvitations = new Map();
  replays = new Map();
}

async function invite(req, res, ctx, target, already, blockedCode) {
  const body = await ctx.readJson(req);
  const key = requireKey(req, res, ctx);
  if (!key) return;
  const email = String(body.email ?? '').trim().toLowerCase();
  const role = String(body.role ?? '');
  const fingerprint = `${req.method} ${ctx.url.pathname} ${JSON.stringify({ email, role })}`;
  if (replay(req, res, ctx, key, fingerprint)) return;
  if (role !== 'owner' && role !== 'member') {
    refuse(res, ctx, key, fingerprint, 422, 'member_role_invalid', 'Member role invalid', 'Role must be owner or member.', 'trace-role');
    return;
  }
  if (!email.includes('@')) {
    refuse(res, ctx, key, fingerprint, 422, 'member_role_invalid', 'Member role invalid', 'Email is invalid.', 'trace-email');
    return;
  }
  if (already(email)) {
    const code = blockedCode ?? 'already_member';
    const title = code === 'already_member' ? 'Already a member' : 'Tenant membership required';
    refuse(res, ctx, key, fingerprint, 409, code, title, 'The invitation was not created.', 'trace-invite');
    return;
  }
  const now = new Date();
  const inviteView = {
    id: randomUUID(),
    email,
    role,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString()
  };
  const kept = target.filter((item) => item.email !== email);
  target.length = 0;
  target.push(...kept, inviteView);
  const issued = { invite: inviteSummary(inviteView), token: `inv_${randomBytes(16).toString('hex')}` };
  remember(key, fingerprint, 201, issued);
  ctx.send(res, 201, issued);
}

function summary(member) {
  return { id: member.id, name: member.name, role: member.role, joinedAt: member.joinedAt };
}

function inviteSummary(invite) {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
    createdAt: invite.createdAt
  };
}

function authorized(req, res, ctx) {
  const header = req.headers.authorization ?? '';
  if (header.startsWith('Bearer ') && header.length > 'Bearer '.length) return true;
  ctx.problem(res, 401, 'authentication_required', 'Authentication required', 'Sign in again.', 'trace-membership-auth');
  return false;
}

function knownTenant(id, res, ctx) {
  if (id === tenantId) return true;
  ctx.problem(res, 404, 'tenant_not_found', 'Tenant not found', 'This tenant does not exist.', 'trace-tenant');
  return false;
}

function requireKey(req, res, ctx) {
  const key = req.headers['idempotency-key'];
  if (typeof key === 'string' && /^[A-Za-z0-9._:-]{1,128}$/.test(key)) return key;
  ctx.problem(res, 400, 'invalid_idempotency_key', 'Invalid idempotency key', 'Idempotency-Key is required.', 'trace-membership-idem');
  return null;
}

function replay(req, res, ctx, key, fingerprint) {
  const prior = replays.get(key);
  if (!prior) return false;
  if (prior.fingerprint !== fingerprint) {
    ctx.problem(res, 409, 'idempotency_key_reused', 'Idempotency key reused', 'This key was used for a different request.', 'trace-idem-reuse');
    return true;
  }
  if (prior.status === 204) {
    res.writeHead(204);
    res.end();
    return true;
  }
  if (prior.problem) {
    ctx.problem(res, prior.status, prior.problem.code, prior.problem.title, prior.problem.detail, prior.problem.traceId);
    return true;
  }
  ctx.send(res, prior.status, prior.body);
  return true;
}

function remember(key, fingerprint, status, body) {
  replays.set(key, { fingerprint, status, body, problem: null });
}

function refuse(res, ctx, key, fingerprint, status, code, title, detail, traceId) {
  replays.set(key, { fingerprint, status, body: null, problem: { code, title, detail, traceId } });
  ctx.problem(res, status, code, title, detail, traceId);
}
