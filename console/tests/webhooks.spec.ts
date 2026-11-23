import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Webhook registration against the local auth stub.
 * The signing secret is read from the page only after create or rotate.
 * A full Control stack is not started.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetStub();
  await resetWebhooks();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await signIn(page);
});

test('a site admin registers, edits, and disables a webhook and can tell a failed delivery from a successful one', async ({
  page
}) => {
  const siteId = await openSiteWebhooks(page, '通知站');
  const form = page.getByRole('form', { name: '登记' });
  await form.getByLabel('地址').fill('https://hooks.example.test/edition');
  await form.getByRole('checkbox', { name: '页面进版' }).check();

  const created = page.waitForRequest(
    (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/webhooks'
  );
  await form.getByRole('button', { name: '登记' }).click();
  const createRequest = await created;
  expect(idempotencyKey(createRequest)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(new URL(createRequest.url()).searchParams.get('tenantId')).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  );
  expect(createRequest.postDataJSON()).toEqual({
    url: 'https://hooks.example.test/edition',
    scopeType: 'site',
    scopeId: siteId,
    events: ['page.published'],
    active: true
  });

  const secret = await readSecret(page);
  expect(secret.startsWith('whsec_')).toBe(true);
  const row = page.getByRole('list', { name: '订阅' }).getByRole('listitem').filter({ hasText: 'https://hooks.example.test/edition' });
  await expect(row.getByText('启用', { exact: true })).toBeVisible();
  await expect(row).not.toContainText(secret);

  await row.getByRole('button', { name: '修改', exact: true }).click();
  const edit = page.getByRole('form', { name: '修改' });
  await edit.getByLabel('地址').fill('https://hooks.example.test/changed');
  const updated = page.waitForRequest(
    (request) => request.method() === 'PUT' && /\/webhooks\/[^/]+$/.test(new URL(request.url()).pathname)
  );
  await edit.getByRole('button', { name: '保存', exact: true }).click();
  const updateRequest = await updated;
  expect(idempotencyKey(updateRequest)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(updateRequest.postDataJSON()).toMatchObject({
    url: 'https://hooks.example.test/changed',
    scopeType: 'site',
    scopeId: siteId,
    active: true
  });
  const edited = page.getByRole('list', { name: '订阅' }).getByRole('listitem').filter({ hasText: 'https://hooks.example.test/changed' });
  await expect(edited).toBeVisible();
  await expect(edited).not.toContainText(secret);
  await expect(page.getByText('https://hooks.example.test/edition', { exact: true })).toHaveCount(0);

  const disabled = page.waitForRequest(
    (request) => request.method() === 'PUT' && /\/webhooks\/[^/]+$/.test(new URL(request.url()).pathname)
  );
  await edited.getByRole('button', { name: '停用', exact: true }).click();
  const disableRequest = await disabled;
  expect(idempotencyKey(disableRequest)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(disableRequest.postDataJSON()).toMatchObject({ active: false, url: 'https://hooks.example.test/changed' });
  await expect(edited.getByText('已停用', { exact: true })).toBeVisible();
  await expect(edited.getByText('启用', { exact: true })).toHaveCount(0);

  await edited.getByRole('button', { name: '投递', exact: true }).click();
  const deliveries = page.getByRole('list', { name: '投递' });
  await expect(deliveries.getByRole('listitem').filter({ hasText: '成功' })).toBeVisible();
  await expect(deliveries.getByRole('listitem').filter({ hasText: '失败' })).toBeVisible();
  await expect(deliveries).not.toContainText(secret);

  const rotated = page.waitForRequest((request) => request.method() === 'POST' && request.url().includes(':rotate'));
  await edited.getByRole('button', { name: '轮换密钥', exact: true }).click();
  expect(idempotencyKey(await rotated)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect
    .poll(async () => (await page.getByRole('region', { name: '密钥' }).locator('code').innerText()).trim())
    .not.toBe(secret);
  const nextSecret = await readSecret(page);
  expect(nextSecret.startsWith('whsec_')).toBe(true);
  expect(nextSecret).not.toBe(secret);
  await expect(edited).not.toContainText(nextSecret);

  await page.goto('/');
  await page.goto(`/sites/${siteId}/webhooks`);
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
  await expect(page.getByText(nextSecret, { exact: true })).toHaveCount(0);
  const returned = page.getByRole('list', { name: '订阅' }).getByRole('listitem');
  await expect(returned).toContainText('https://hooks.example.test/changed');
  await expect(returned.getByText('已停用', { exact: true })).toBeVisible();
  await expect(returned.getByText('启用', { exact: true })).toHaveCount(0);

  await openSiteWebhooks(page, '另一站点');
  await expect(page.getByText('没有数据')).toBeVisible();
  await expect(page.getByText('https://hooks.example.test/changed')).toHaveCount(0);
  await expect(page.getByText(secret, { exact: true })).toHaveCount(0);
  await expect(page.getByText(nextSecret, { exact: true })).toHaveCount(0);
});

async function openSiteWebhooks(page: Page, name: string) {
  await page.goto('/sites');
  await page.getByLabel('名称').fill(name);
  await page.getByRole('button', { name: '创建站点' }).click();
  await page.getByRole('link', { name, exact: true }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/mounts$/);
  const siteId = new URL(page.url()).pathname.split('/')[2] ?? '';
  expect(siteId).toMatch(/^[0-9a-f-]{36}$/i);
  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '投递结果', exact: true }).click();
  await expect(page).toHaveURL(`/sites/${siteId}/webhooks`);
  await expect(page.getByRole('heading', { level: 2, name: '投递结果' })).toBeVisible();
  return siteId;
}

async function resetWebhooks() {
  const response = await fetch('http://127.0.0.1:4188/__stub/webhooks/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`webhook reset ${response.status}`);
}

function idempotencyKey(request: Request) {
  return request.headers()['idempotency-key'] ?? '';
}

async function readSecret(page: Page) {
  const revealed = page.getByRole('region', { name: '密钥' });
  await expect(revealed).toBeVisible();
  await expect(revealed).toContainText('只显示这一次');
  const secret = (await revealed.locator('code').innerText()).trim();
  expect(secret.length).toBeGreaterThan(10);
  return secret;
}
