import { expect, test, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Redirects against the local auth stub. A slug or page-address change leaves
 * the old address aimed at a stable target. A full Control stack is not started.
 */

const spaceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const pageId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetStub();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await signIn(page);
});

test('an admin sees stable redirect targets after address changes and can delete a manual one', async ({ page }) => {
  await page.getByRole('navigation', { name: '管理' }).getByRole('link', { name: '站点', exact: true }).click();
  await page.getByLabel('名称').fill('阅读站');
  await page.getByRole('button', { name: '创建站点' }).click();
  await page.getByRole('link', { name: '阅读站' }).click();

  await page.getByRole('radiogroup', { name: '空间' }).getByRole('button', { name: '手册', exact: true }).click();
  await page.getByLabel('slug').fill('guide');
  await page.getByRole('button', { name: '挂载', exact: true }).click();
  await expect(page.getByRole('list', { name: '已挂载' })).toContainText('guide');

  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '重定向', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: '重定向' })).toBeVisible();

  const redirects = page.getByRole('list', { name: '重定向' });
  const manual = redirects.getByRole('listitem').filter({ hasText: '/legacy' });
  const manualTarget = manual.getByRole('group', { name: '目标' });
  await expect(manualTarget).toContainText('手册');
  await expect(manualTarget).toContainText(spaceId);
  await expect(manualTarget).not.toContainText('/legacy');

  const pageRow = page.getByRole('list', { name: '页面地址' }).getByRole('listitem').filter({ hasText: '入门' });
  await expect(pageRow).toContainText('start');
  const reslug = page.waitForRequest((request) => request.method() === 'POST' && request.url().includes(':reslug'));
  await pageRow.getByLabel('新地址').fill('intro');
  await pageRow.getByRole('button', { name: '更改地址' }).click();
  expect(idempotencyKey(await reslug)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect(pageRow).toContainText('intro');
  await expect(pageRow).not.toContainText('start');

  const pageRule = redirects.getByRole('listitem').filter({ hasText: '/guide/start/*' });
  const pageTarget = pageRule.getByRole('group', { name: '目标' });
  await expect(pageTarget).toContainText('入门');
  await expect(pageTarget).toContainText(pageId);
  await expect(pageTarget).not.toContainText('start');
  await expect(pageRule).toContainText('/guide/intro');

  const mountRow = page.getByRole('list', { name: '挂载地址' }).getByRole('listitem').filter({ hasText: '手册' });
  const remount = page.waitForRequest((request) => request.method() === 'POST' && request.url().includes(':remount'));
  await mountRow.getByLabel('新 slug').fill('manual');
  await mountRow.getByRole('button', { name: '更改 slug' }).click();
  expect(idempotencyKey(await remount)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect(mountRow).toContainText('manual');
  await expect(mountRow).not.toContainText('guide');

  const slugRule = redirects.getByRole('listitem').filter({ hasText: '/guide/*' });
  const slugTarget = slugRule.getByRole('group', { name: '目标' });
  await expect(slugTarget).toContainText('手册');
  await expect(slugTarget).toContainText(spaceId);
  await expect(slugTarget).not.toContainText('guide');
  await expect(slugRule).toContainText('/manual');
  await expect(pageRule).toContainText('/manual/intro');

  const removed = page.waitForRequest((request) => request.method() === 'DELETE' && request.url().includes('/redirects'));
  await manual.getByRole('button', { name: '删除' }).click();
  await manual.getByRole('button', { name: '确认删除' }).click();
  expect(idempotencyKey(await removed)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect(redirects.getByRole('listitem').filter({ hasText: '/legacy' })).toHaveCount(0);
  await expect(slugRule).toBeVisible();
  await expect(pageRule).toBeVisible();
});

function idempotencyKey(request: Request) {
  return request.headers()['idempotency-key'] ?? '';
}
