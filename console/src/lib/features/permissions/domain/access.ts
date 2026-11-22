export const permissionRoles = ['admin', 'maintainer', 'author', 'reader'] as const;

export type PermissionRole = (typeof permissionRoles)[number] | 'none';

const operationOrder = ['read', 'write', 'publish', 'admin'] as const;

const operationsByRole: Record<PermissionRole, readonly string[]> = {
  admin: ['read', 'write', 'publish', 'admin'],
  maintainer: ['read', 'write', 'publish'],
  author: ['read', 'write'],
  reader: ['read'],
  none: []
};

export type Principal = {
  key: string;
  name: string;
};

export type Grant = {
  principal: Principal;
  role: PermissionRole;
  operations: readonly string[];
};

export type PermissionPage = {
  id: string;
  title: string;
};

export type PagePermission = {
  pageId: string;
  active: boolean;
  revision: number;
  principals: Principal[];
};

export type ResourceKind = 'sites' | 'spaces';

type FailureLike = {
  status: number;
  code: string | null;
  traceId: string | null;
  retryAfter: number | null;
};

export type RestrictionIntent =
  | { outcome: 'same' }
  | { outcome: 'narrow' }
  | { outcome: 'widen'; reason: 'parent' | 'page' };

export function isPermissionRole(value: string): value is PermissionRole {
  return value === 'admin' || value === 'maintainer' || value === 'author' || value === 'reader' || value === 'none';
}

export function operationsFor(role: PermissionRole): readonly string[] {
  return operationsByRole[role];
}

/** If-Match for putPageRestriction. The token is the restriction revision. */
export function restrictionMatch(revision: number): string {
  return `"permission-${revision}"`;
}

export function visibleOperations(grants: readonly Grant[], keys: readonly string[]): string[] {
  const allowed = new Set(keys);
  const present = new Set<string>();
  for (const grant of grants) {
    if (!allowed.has(grant.principal.key)) continue;
    for (const operation of grant.operations) present.add(operation);
  }
  return operationOrder.filter((operation) => present.has(operation));
}

/** A page may only keep a subset of the principals the space already granted. */
export function restrictionIntent(
  parentKeys: readonly string[],
  savedKeys: readonly string[],
  draftKeys: readonly string[]
): RestrictionIntent {
  const parent = new Set(parentKeys);
  if (draftKeys.some((key) => !parent.has(key))) return { outcome: 'widen', reason: 'parent' };
  const saved = new Set(savedKeys);
  if (draftKeys.some((key) => !saved.has(key))) return { outcome: 'widen', reason: 'page' };
  if (draftKeys.length < savedKeys.length && draftKeys.every((key) => saved.has(key))) return { outcome: 'narrow' };
  return { outcome: 'same' };
}

export function widenMessage(reason: 'parent' | 'page'): string {
  return reason === 'parent' ? '不能把父级没有的操作授出去。' : '不能在页面上放宽。';
}

export function queryFailure(failure: FailureLike): string {
  if (failure.status === 429) return retryMessage(failure.retryAfter);
  if (failure.status === 0) return '网络失败。';
  return failure.traceId ? `查询没有完成。追踪号 ${failure.traceId}。` : '查询没有完成。';
}

export function writeFailure(failure: FailureLike): string {
  switch (failure.code) {
    case 'permission_role_invalid':
      return '这个角色不能授予。';
    case 'permission_principal_not_found':
      return '找不到这个主体。';
    case 'permission_principal_inactive':
      return '这个主体已停用。';
    case 'permission_principal_type_unsupported':
      return '这个主体不能出现在这里。';
    case 'permission_version_conflict':
      return '页面收窄已经变化，请重新打开后再保存。';
    case 'precondition_required':
    case 'invalid_precondition':
      return '缺少页面收窄的基线。';
    case 'permission_restriction_too_large':
      return '收窄名单太长。';
    case 'space_archived':
      return '空间已归档，不能放宽。';
    default:
      break;
  }
  if (failure.status === 429) return retryMessage(failure.retryAfter);
  if (failure.status === 0) return '网络失败。已填写的内容仍保留。';
  if (failure.status >= 500) return failure.traceId ? `服务没有完成。追踪号 ${failure.traceId}。` : '服务没有完成。';
  return failure.traceId ? `没有完成。追踪号 ${failure.traceId}。` : '没有完成。';
}

function retryMessage(retryAfter: number | null): string {
  return retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${retryAfter} 秒后再试。`;
}
