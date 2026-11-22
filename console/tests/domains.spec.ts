import { expect, test, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Custom-domain verification against the local auth stub.
 * Sites already exist. A full Control stack is not started.
 * The stub speaks the domain contract, including the TXT record.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetStub();
  await resetDomains();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  let tenantId = '';
  page.on('response', (response) => {
    if (new URL(response.url()).pathname !== '/api/v1/me' || !response.ok()) return;
    void response.json().then((body: { tenants?: Array<{ id?: string }> }) => {
      tenantId = body.tenants?.[0]?.id ?? tenantId;
    });
  });
  await signIn(page);
  await expect.poll(() => tenantId).not.toBe('');
  await ensureSite(tenantId);
});

test('an admin adds an unverified domain, sees its TXT record, and verifies it', async ({ page }) => {
  await page.getByRole('navigation', { name: '管理' }).getByRole('link', { name: '站点', exact: true }).click();
  await page.getByRole('link', { name: '现有站点' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '现有站点' })).toBeVisible();
  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '域名', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: '域名' })).toBeVisible();

  const bound = page.waitForResponse(
    (response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/domains') && response.ok()
  );
  const form = page.getByRole('form', { name: '添加域名' });
  await form.getByLabel('域名', { exact: true }).fill('docs.example.com');
  await form.getByRole('button', { name: '添加域名' }).click();
  const created = await bound;
  expect(idempotencyKey(created.request())).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(created.request().postDataJSON()).toEqual({ host: 'docs.example.com' });
  const detail = (await created.json()) as { txtName: string; txtValue: string; verified: boolean; isPrimary: boolean };
  expect(detail.verified).toBe(false);
  expect(detail.isPrimary).toBe(false);
  expect(detail.txtName.length).toBeGreaterThan(0);
  expect(detail.txtValue.length).toBeGreaterThan(0);

  const added = page.getByRole('list', { name: '域名' }).getByRole('listitem').filter({ hasText: 'docs.example.com' });
  await expect(added.getByText('未核验', { exact: true })).toBeVisible();
  await expect(added.getByText('可用', { exact: true })).toHaveCount(0);
  await expect(added.getByText(detail.txtName, { exact: true })).toBeVisible();
  await expect(added.getByText(detail.txtValue, { exact: true })).toBeVisible();
  await expect(added.getByRole('button', { name: '设为主域名' })).toBeDisabled();
  await expect(added.getByText('主域名', { exact: true })).toHaveCount(0);

  const verified = page.waitForResponse(
    (response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith(':verify') && response.ok()
  );
  await added.getByRole('button', { name: '核验' }).click();
  const proof = await verified;
  expect(idempotencyKey(proof.request())).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const afterProof = (await proof.json()) as { verified: boolean };
  expect(afterProof.verified).toBe(true);
  await expect(added.getByText('已核验', { exact: true })).toBeVisible();
  await expect(added.getByText('未核验', { exact: true })).toHaveCount(0);

  const secondBound = page.waitForResponse(
    (response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/domains') && response.ok()
  );
  await form.getByLabel('域名', { exact: true }).fill('guide.example.com');
  await form.getByRole('button', { name: '添加域名' }).click();
  const second = await secondBound;
  expect(idempotencyKey(second.request())).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const secondDetail = (await second.json()) as { txtName: string; txtValue: string };
  const unverified = page.getByRole('list', { name: '域名' }).getByRole('listitem').filter({ hasText: 'guide.example.com' });
  await expect(unverified.getByText('未核验', { exact: true })).toBeVisible();
  await expect(unverified.getByText('可用', { exact: true })).toHaveCount(0);
  await expect(unverified.getByText(secondDetail.txtName, { exact: true })).toBeVisible();
  await expect(unverified.getByText(secondDetail.txtValue, { exact: true })).toBeVisible();
  await expect(unverified.getByRole('button', { name: '设为主域名' })).toBeDisabled();
  await expect(unverified.getByText('主域名', { exact: true })).toHaveCount(0);

  await page.reload();
  const reopened = page.getByRole('list', { name: '域名' }).getByRole('listitem');
  await expect(reopened.filter({ hasText: 'docs.example.com' }).getByText('已核验', { exact: true })).toBeVisible();
  await expect(reopened.filter({ hasText: 'docs.example.com' }).getByText(detail.txtName, { exact: true })).toBeVisible();
  await expect(reopened.filter({ hasText: 'guide.example.com' }).getByText('未核验', { exact: true })).toBeVisible();
  await expect(reopened.filter({ hasText: 'guide.example.com' }).getByRole('button', { name: '设为主域名' })).toBeDisabled();
});

async function resetDomains() {
  const response = await fetch('http://127.0.0.1:4188/__stub/domains/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`domain reset ${response.status}`);
}

async function ensureSite(tenantId: string) {
  const response = await fetch(`http://127.0.0.1:4188/api/v1/tenants/${tenantId}/sites`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'idempotency-key': 'domains-existing-site'
    },
    body: JSON.stringify({ name: '现有站点' })
  });
  if (!response.ok) throw new Error(`site seed ${response.status}`);
}

function idempotencyKey(request: Request) {
  return request.headers()['idempotency-key'] ?? '';
}
