import { expect, test } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Overview counts against the local list stub. A full Control stack is not
 * started; the browser seam here locks the visible counts, the empty result,
 * and a failed query. The three setup steps stay on invite, create space, and mount.
 */

test.beforeEach(async ({ page }) => {
  await resetStub();
  await armOverview('counts');
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
});

test.afterEach(async () => {
  await armOverview('counts');
});

test('signed-in overview shows the current tenant counts and the three steps', async ({ page }) => {
  const paths: string[] = [];
  let tenantId = '';
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) paths.push(url.pathname);
  });
  page.on('response', (response) => {
    if (new URL(response.url()).pathname !== '/api/v1/me' || !response.ok()) return;
    void response.json().then((body: { tenants?: Array<{ id?: string }> }) => {
      tenantId = body.tenants?.[0]?.id ?? '';
    });
  });

  await signIn(page);
  const counts = page.getByRole('region', { name: '数量' });
  await expect(counts.locator('strong')).toHaveText(['4', '6', '5']);
  await expect(counts.getByText('成员', { exact: true })).toBeVisible();
  await expect(counts.getByText('空间', { exact: true })).toBeVisible();
  await expect(counts.getByText('站点', { exact: true })).toBeVisible();
  await expect.poll(() => tenantId).not.toBe('');
  expect(paths).toContain(`/api/v1/tenants/${tenantId}/members`);
  expect(paths).toContain(`/api/v1/tenants/${tenantId}/spaces`);
  expect(paths).toContain(`/api/v1/tenants/${tenantId}/sites`);

  const body = await page.locator('body').innerText();
  for (const word of ['席位', '套餐', 'Credit']) expect(body).not.toContain(word);

  await page.getByRole('link', { name: '邀请成员', exact: true }).click();
  await expect(page).toHaveURL('/members');
  await expect(page.getByRole('heading', { level: 1, name: '成员' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: '创建空间', exact: true }).click();
  await expect(page).toHaveURL('/content/spaces');
  await expect(page.getByRole('heading', { level: 1, name: '空间' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: '挂载站点', exact: true }).click();
  await expect(page).toHaveURL('/sites');
  await expect(page.getByRole('heading', { level: 1, name: '站点' })).toBeVisible();
});

test('an empty tenant shows an empty overview instead of zeros', async ({ page }) => {
  await armOverview('empty');
  await signIn(page);
  const counts = page.getByRole('region', { name: '数量' });
  await expect(counts).toContainText('当前租户还没有成员、空间和站点。');
  await expect(counts.locator('strong')).toHaveCount(0);
});

test('a failed count query shows the error and trace id, not a zero', async ({ page }) => {
  await armOverview('error');
  await signIn(page);
  const counts = page.getByRole('region', { name: '数量' });
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('unexpected_error');
  await expect(alert).toContainText('trace-overview');
  await expect(counts.locator('strong')).toHaveCount(0);
});

test('a dropped count query shows a network failure, not a zero', async ({ page }) => {
  await armOverview('drop');
  await signIn(page);
  const counts = page.getByRole('region', { name: '数量' });
  await expect(page.getByRole('alert')).toContainText('网络失败');
  await expect(counts.locator('strong')).toHaveCount(0);
});

async function armOverview(mode: 'counts' | 'empty' | 'error' | 'drop') {
  const response = await fetch('http://127.0.0.1:4188/__stub/overview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok && response.status !== 204) throw new Error(`overview stub ${response.status}`);
}
