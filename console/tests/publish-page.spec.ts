import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Publish journey against the local auth stub. A full Control stack is not
 * started. The stub records the ready-for-release mark. A browser pass against
 * a running Control process stays out of this file.
 */

test.beforeEach(async () => {
  await resetPages();
});

test.afterEach(async () => {
  await resetPages();
});

test('an author marks a page ready for the next release and clears that mark', async ({ page }) => {
  test.setTimeout(60_000);
  const writes: Array<{ path: string; key: string }> = [];
  page.on('request', (request) => {
    if (!isMark(request)) return;
    writes.push({
      path: new URL(request.url()).pathname,
      key: request.headers()['idempotency-key'] ?? ''
    });
  });

  await openFreshSpace(page);
  await createPage(page, '说明');
  await openPage(page, '说明');

  const panel = page.getByRole('region', { name: '进版' });
  await expect(panel.getByRole('button', { name: '进版', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: '发布', exact: true })).toHaveCount(0);
  await expect(panel.getByText('可发版', { exact: true })).toHaveCount(0);
  await expect(panel.getByText('这还不是读者可见。')).toBeVisible();

  await panel.getByRole('button', { name: '进版', exact: true }).click();
  await expect(panel.getByText('可发版', { exact: true })).toBeVisible();
  await expect(panel.getByText('这还不是读者可见。')).toBeVisible();
  await expect(panel.getByRole('button', { name: '发布', exact: true })).toHaveCount(0);
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].path).toMatch(/:publish$/);
  expect(writes[0].key).toMatch(/^[a-zA-Z0-9._:-]+$/);

  await closeEditor(page);
  const row = page.getByRole('list', { name: '源码页面' }).getByRole('listitem').filter({ hasText: '说明' });
  await expect(row.getByText('可发版', { exact: true })).toBeVisible();

  await openPage(page, '说明');
  await panel.getByRole('button', { name: '取消进版', exact: true }).click();
  await expect(panel.getByText('可发版', { exact: true })).toHaveCount(0);
  await expect(panel.getByText('这还不是读者可见。')).toBeVisible();
  await expect.poll(() => writes.length).toBe(2);
  expect(writes[1].path).toMatch(/:unpublish$/);
  expect(writes[1].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(writes[1].key).not.toBe(writes[0].key);

  await closeEditor(page);
  await expect(row.getByText('可发版', { exact: true })).toHaveCount(0);
});

async function openFreshSpace(page: Page) {
  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
  await expect(page.getByRole('heading', { level: 1, name: '手册' })).toBeVisible();
}

async function createPage(page: Page, title: string) {
  const form = page.getByRole('form', { name: '按格式创建' });
  await form.getByRole('group', { name: '格式' }).getByRole('button', { name: 'markdown', exact: true }).click();
  await form.getByLabel('标题').fill(title);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
}

async function openPage(page: Page, title: string) {
  await page.getByRole('button', { name: title, exact: true }).click();
  await expect(page.getByRole('textbox', { name: '正文' })).toBeVisible();
}

async function closeEditor(page: Page) {
  await page.getByRole('button', { name: '返回' }).click();
  await expect(page.getByRole('form', { name: '按格式创建' })).toBeVisible();
}

async function resetPages() {
  await resetStub();
  const pages = await fetch('http://127.0.0.1:4188/__stub/pages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!pages.ok) throw new Error(`page stub reset ${pages.status}`);
  const spaces = await fetch('http://127.0.0.1:4188/__stub/spaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!spaces.ok) throw new Error(`space stub reset ${spaces.status}`);
}

function isMark(request: Request) {
  return request.method() === 'POST' && /\/pages\/[^/]+:(publish|unpublish)$/.test(new URL(request.url()).pathname);
}
