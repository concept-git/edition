import { api } from '#lib/shared/api/client';
import type { AuthorPage, CreatePageBody, PageList } from '../domain/author-page';

export function listPages(token: string, tenantId: string, spaceId: string) {
  return api<PageList>(token, `${pagesBase(tenantId, spaceId)}?limit=100`);
}

export function viewPage(token: string, tenantId: string, spaceId: string, pageId: string) {
  return api<AuthorPage>(token, `${pagesBase(tenantId, spaceId)}/${encodeURIComponent(pageId)}`);
}

export function createPage(token: string, tenantId: string, spaceId: string, body: CreatePageBody, idempotencyKey: string) {
  return api<AuthorPage>(token, pagesBase(tenantId, spaceId), { method: 'POST', body, idempotencyKey });
}

function pagesBase(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/pages`;
}
