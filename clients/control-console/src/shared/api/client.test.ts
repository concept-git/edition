import { expect, it } from 'vitest';
import { createApi } from './generated/sdk';
import { ApiFailure } from './problem';
import { ContractFailure, parseContract } from './validation';

const tenantId = '8ad68f2f-4fe2-42a9-812d-70470d00fb71';
const spaceId = '6bac10e7-c3af-4ea8-8b95-724e0e793828';
const pageId = '78153a1a-94ae-468a-a4ce-839b086325d3';
it('rejects a missing required full response field and preserves required nullable cursors', async () => {
  const params = { path: { tenantId } };
  const incomplete = createApi(
    async () =>
      Response.json({ nextCursor: null, total: 0, allowedActions: [] }),
    'https://edition.test',
  );
  await expect(incomplete.listSpaces({ params })).rejects.toBeInstanceOf(
    ContractFailure,
  );
  const complete = createApi(
    async () =>
      Response.json({
        items: [],
        nextCursor: null,
        total: null,
        allowedActions: [],
      }),
    'https://edition.test',
  );
  expect((await complete.listSpaces({ params })).data).toEqual({
    items: [],
    nextCursor: null,
    total: null,
    allowedActions: [],
  });
});
it('maps an unset optional response field to absence while preserving false and explicit nullable fields', async () => {
  const api = createApi(
    async () =>
      Response.json({
        id: pageId,
        name: 'Editor',
        avatar: null,
        locale: null,
        verified: false,
      }),
    'https://edition.test',
  );
  const result = await api.getCurrentUser({});
  expect(result.data.avatar).toBeUndefined();
  expect(result.data.locale).toBeUndefined();
  expect(result.data.verified).toBe(false);
});
it('rejects an invalid request at the contract boundary before sending it', async () => {
  let sent = false;
  const api = createApi(async () => {
    sent = true;
    return Response.json({});
  }, 'https://edition.test');
  await expect(
    api.login({ body: { email: 'invalid-email', password: 'secret' } }),
  ).rejects.toBeInstanceOf(ContractFailure);
  expect(sent).toBe(false);
});
it('encodes a tag path and preserves the supplied idempotency header', async () => {
  let sent: Request | undefined;
  const api = createApi(async (request) => {
    sent = request;
    return Response.json({});
  }, 'https://edition.test');
  await api.tagPage({
    params: {
      path: { tenantId, spaceId, pageId, label: '文档/alpha?#' },
      header: { 'Idempotency-Key': 'same-intent' },
    },
  });
  expect(sent?.url).toBe(
    `https://edition.test/api/v1/tenants/${tenantId}/spaces/${spaceId}/pages/${pageId}/tags/%E6%96%87%E6%A1%A3%2Falpha%3F%23`,
  );
  expect(sent?.headers.get('Idempotency-Key')).toBe('same-intent');
});
it('returns the server content baseline alongside the validated content', async () => {
  const api = createApi(
    async () =>
      Response.json(
        {
          id: pageId,
          content: 'hello',
          format: 'markdown',
          revision: 2,
          contentType: 'markdown',
          versionRef: null,
          interpretation: {},
        },
        { headers: { ETag: '"rev-2"' } },
      ),
    'https://edition.test',
  );
  const result = await api.viewPageContent({
    params: { path: { tenantId, spaceId, pageId } },
  });
  expect(result.data.content).toBe('hello');
  expect(result.response.headers.get('ETag')).toBe('"rev-2"');
});
it('does not turn a failed request into an empty result', async () => {
  const api = createApi(
    async () =>
      Response.json(
        {
          code: 'permission_denied',
          traceId: 'denied-trace',
          violations: [{ field: 'name', code: 'invalid' }],
        },
        { status: 403, headers: { 'Retry-After': '3' } },
      ),
    'https://edition.test',
  );
  try {
    await api.getCurrentUser({});
    throw new Error('Request should fail');
  } catch (error) {
    expect(error).toBeInstanceOf(ApiFailure);
    if (!(error instanceof ApiFailure)) throw error;
    expect(error.code).toBe('permission_denied');
    expect(error.traceId).toBe('denied-trace');
    expect(error.violations).toEqual([{ field: 'name', code: 'invalid' }]);
    expect(error.retryAfter).toBe(3000);
  }
});
it('validates JSON form values against the generated schema rather than accepting duplicate search fields', async () => {
  await expect(
    parseContract('Fields', { fields: ['body', 'title', 'title'] }),
  ).rejects.toBeInstanceOf(ContractFailure);
  await expect(
    parseContract('Fields', { fields: ['body', 'title', 'headings'] }),
  ).resolves.toEqual({ fields: ['body', 'title', 'headings'] });
});
it('serializes an attachment as a multipart file instead of JSON', async () => {
  let sent: Request | undefined;
  const api = createApi(async (request) => {
    sent = request;
    return Response.json({});
  }, 'https://edition.test');
  await api.attachPageFile({
    params: {
      path: { tenantId, spaceId, pageId },
      header: { 'Idempotency-Key': 'upload-once' },
    },
    body: { file: new File(['hello'], 'guide.txt', { type: 'text/plain' }) },
  });
  expect(sent?.headers.get('Content-Type')).toContain(
    'multipart/form-data; boundary=',
  );
  const data = await sent?.formData();
  const file = data?.get('file');
  expect(file).toBeInstanceOf(File);
  if (file instanceof File) expect(await file.text()).toBe('hello');
});
