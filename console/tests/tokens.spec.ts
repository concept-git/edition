import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Token issuance against the local auth stub. The secret is asserted from the
 * page, not from a stored credential. A full Control stack is not started.
 */

test.beforeEach(async ({ page }) => {
  await resetStub();
  await resetTokens();
  await signIn(page);
});

test('issuing an API token shows the secret once and revoking marks it unusable', async ({ page }) => {
  await page.goto('/integrations/api-tokens');
  await expect(page.getByRole('heading', { level: 1, name: '机器令牌' })).toBeVisible();

  const issued = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().includes('/api/v1/tenants/') && request.url().endsWith('/tokens')
  );
  await page.getByLabel('名称').fill('构建调用方');
  await page.getByLabel('空间').selectOption({ label: '手册' });
  await page.getByLabel('角色').selectOption({ label: '读者' });
  await page.getByRole('checkbox', { name: '读取' }).check();
  await page.getByLabel('有效天数').fill('30');
  await page.getByRole('button', { name: '签发' }).click();

  const request = await issued;
  expect(idempotencyKey(request)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const body = request.postDataJSON() as Record<string, unknown>;
  expect(body.name).toBe('构建调用方');
  expect(body.role).toBe('reader');
  expect(body.scopes).toEqual(['read']);
  expect(body.spaceId).toEqual(expect.any(String));
  expect(body.expiry).toEqual(expect.any(String));

  const secret = await readSecret(page);
  expect(secret.startsWith('spc_')).toBe(true);
  const row = page.getByRole('listitem').filter({ hasText: '构建调用方' });
  await expect(row.getByText('可用', { exact: true })).toBeVisible();
  await expect(row).not.toContainText(secret);

  await page.goto('/');
  await page.goto('/integrations/api-tokens');
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
  await row.getByRole('button', { name: '详情', exact: true }).click();
  await expect(page.getByRole('region', { name: '详情' })).toBeVisible();
  await expect(page.getByRole('region', { name: '详情' })).not.toContainText(secret);
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);

  const revoked = page.waitForRequest(
    (candidate) => candidate.method() === 'DELETE' && candidate.url().includes('/api/v1/tenants/') && candidate.url().includes('/tokens/')
  );
  await row.getByRole('button', { name: '吊销', exact: true }).click();
  await row.getByRole('button', { name: '确认吊销', exact: true }).click();
  expect(idempotencyKey(await revoked)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect(row.getByText('不可用', { exact: true })).toBeVisible();
  await expect(row.getByText('可用', { exact: true })).toHaveCount(0);
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
});

test('issuing a management token shows the secret once and revoking marks it unusable', async ({ page }) => {
  await page.goto('/integrations/management-tokens');
  await expect(page.getByRole('heading', { level: 1, name: '管理令牌' })).toBeVisible();

  const issued = page.waitForRequest(
    (request) => request.method() === 'POST' && request.url().endsWith('/api/v1/me/access-tokens')
  );
  await page.getByLabel('名称').fill('发布脚本');
  await page.getByRole('checkbox', { name: '内容读取' }).check();
  await page.getByLabel('有效天数').fill('30');
  await page.getByRole('button', { name: '签发' }).click();

  const request = await issued;
  expect(idempotencyKey(request)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const body = request.postDataJSON() as Record<string, unknown>;
  expect(body).toEqual({
    name: '发布脚本',
    scopes: ['content:read'],
    expiry: expect.any(String)
  });

  const secret = await readSecret(page);
  expect(secret.startsWith('spm_')).toBe(true);
  const row = page.getByRole('listitem').filter({ hasText: '发布脚本' });
  await expect(row.getByText('可用', { exact: true })).toBeVisible();
  await expect(row).not.toContainText(secret);

  await page.goto('/');
  await page.goto('/integrations/management-tokens');
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
  await row.getByRole('button', { name: '详情', exact: true }).click();
  await expect(page.getByRole('region', { name: '详情' })).not.toContainText(secret);

  const revoked = page.waitForRequest(
    (candidate) => candidate.method() === 'DELETE' && /\/api\/v1\/me\/access-tokens\/[^/]+$/.test(new URL(candidate.url()).pathname)
  );
  await row.getByRole('button', { name: '吊销', exact: true }).click();
  await row.getByRole('button', { name: '确认吊销', exact: true }).click();
  expect(idempotencyKey(await revoked)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect(row.getByText('不可用', { exact: true })).toBeVisible();
  await expect(row.getByText('可用', { exact: true })).toHaveCount(0);
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
});

async function resetTokens() {
  const response = await fetch('http://127.0.0.1:4188/__stub/tokens/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`token reset ${response.status}`);
}

function idempotencyKey(request: Request) {
  return request.headers()['idempotency-key'] ?? '';
}

async function readSecret(page: Page) {
  const issued = page.getByRole('region', { name: '签发结果' });
  await expect(issued).toBeVisible();
  await expect(issued).toContainText('只显示这一次');
  const secret = (await issued.locator('code').innerText()).trim();
  expect(secret.length).toBeGreaterThan(10);
  return secret;
}
