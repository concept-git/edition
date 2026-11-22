import { expect, test, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Maintainer space journey against the local auth stub. A full Control stack
 * is not started. The stub answers the space list, create, and update calls.
 */

test.beforeEach(async () => {
  await resetStub();
  const response = await fetch('http://127.0.0.1:4188/__stub/spaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!response.ok) throw new Error(`space stub reset ${response.status}`);
});

test('a maintainer lists spaces, creates one, and keeps auto-release as saved', async ({ page }) => {
  test.setTimeout(45_000);
  const createKeys: string[] = [];
  const updateKeys: string[] = [];
  page.on('request', (request) => {
    if (isCreate(request)) createKeys.push(request.headers()['idempotency-key'] ?? '');
    if (isUpdate(request)) updateKeys.push(request.headers()['idempotency-key'] ?? '');
  });

  await signIn(page);
  await page.goto('/content/spaces');
  await expect(page.getByRole('heading', { level: 1, name: '空间' })).toBeVisible();
  await expect(page.getByText('没有数据')).toBeVisible();

  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('   ');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(form.getByRole('alert')).toHaveText('名称长度需要在 1 到 120 个字符之间。');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect.poll(() => createKeys.length).toBe(2);
  expect(createKeys[0]).toBeTruthy();
  expect(createKeys[1]).toBe(createKeys[0]);

  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  const authored = page.getByRole('listitem').filter({ hasText: '手册' });
  await expect(authored.getByText('authored', { exact: true })).toBeVisible();
  expect(createKeys).toHaveLength(3);
  expect(createKeys[2]).not.toBe(createKeys[0]);
  expect(createKeys[2]).toBeTruthy();

  await authored.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
  await expect(page.getByRole('heading', { level: 1, name: '手册' })).toBeVisible();
  const autoRelease = page.getByRole('switch', { name: '自动发版' });
  await expect(autoRelease).toBeChecked();

  const armed = await fetch('http://127.0.0.1:4188/__stub/spaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ failUpdates: 1 })
  });
  if (!armed.ok) throw new Error(`space stub fault ${armed.status}`);
  await autoRelease.click();
  await expect(page.getByRole('alert')).toContainText('trace-space-update');
  await expect(autoRelease).toBeChecked();
  await page.getByRole('button', { name: '重试' }).click();
  await expect(autoRelease).not.toBeChecked();
  expect(updateKeys).toHaveLength(2);
  expect(updateKeys[0]).toBeTruthy();
  expect(updateKeys[1]).toBe(updateKeys[0]);

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '空间', exact: true }).click();
  await expect(page).toHaveURL('/content/spaces');
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page.getByRole('switch', { name: '自动发版' })).not.toBeChecked();

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '空间', exact: true }).click();
  await form.getByRole('group', { name: '来源模式' }).getByRole('button', { name: 'synced' }).click();
  await form.getByLabel('名称').fill('镜像');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  const synced = page.getByRole('listitem').filter({ hasText: '镜像' });
  await expect(synced.getByText('synced', { exact: true })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: '手册' }).getByText('authored', { exact: true })).toBeVisible();
  await synced.getByRole('link', { name: '镜像' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '镜像' })).toBeVisible();
  await expect(page.getByRole('switch', { name: '自动发版' })).toHaveCount(0);
});

function isCreate(request: Request) {
  return request.method() === 'POST' && /\/spaces$/.test(new URL(request.url()).pathname);
}

function isUpdate(request: Request) {
  return request.method() === 'PATCH' && /\/spaces\/[^/]+$/.test(new URL(request.url()).pathname);
}
