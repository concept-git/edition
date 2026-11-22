import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Trash restore, space deletion, and site deletion against the local auth stub.
 * A full Control stack is not started. The stub answers the recovery contract.
 */

test.beforeEach(async () => {
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
});

test('an author restores a trashed page, and deletion honors the name and mounts', async ({ page }) => {
  test.setTimeout(90_000);
  const writes: Array<{ url: string; key: string }> = [];
  page.on('request', (request) => {
    if (!isRecoveryWrite(request)) return;
    writes.push({ url: request.url(), key: request.headers()['idempotency-key'] ?? '' });
  });

  await signIn(page);
  await page.goto('/content/spaces');
  const createSpace = page.getByRole('form', { name: '创建空间' });
  await createSpace.getByLabel('名称').fill('手册');
  await createSpace.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册', exact: true }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);

  const createPage = page.getByRole('form', { name: '按格式创建' });
  await createPage.getByLabel('标题').fill('旧稿');
  await createPage.getByRole('button', { name: '创建', exact: true }).click();
  const source = page.getByRole('list', { name: '源码页面' });
  const draft = source.getByRole('listitem').filter({ hasText: '旧稿' });
  await expect(draft).toBeVisible();
  await draft.getByRole('button', { name: '回收' }).click();
  await expect(source.getByRole('listitem').filter({ hasText: '旧稿' })).toHaveCount(0);

  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '回收', exact: true }).click();
  const trash = page.getByRole('list', { name: '回收页' });
  await expect(trash.getByRole('listitem').filter({ hasText: '旧稿' })).toBeVisible();
  await trash.getByRole('button', { name: '恢复' }).click();
  await expect(trash.getByRole('listitem').filter({ hasText: '旧稿' })).toHaveCount(0);

  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '页面', exact: true }).click();
  await expect(page.getByRole('list', { name: '源码页面' }).getByRole('listitem').filter({ hasText: '旧稿' })).toBeVisible();

  await page.goto('/content/spaces');
  const handbook = page.getByRole('list', { name: '空间' }).getByRole('listitem').filter({ hasText: '手册' });
  await handbook.getByRole('button', { name: '删除', exact: true }).click();
  const spaceDialog = page.getByRole('dialog', { name: '确认删除空间' });
  await spaceDialog.getByLabel('空间名称').fill('手册副本');
  await spaceDialog.getByRole('button', { name: '删除空间' }).click();
  await expect(spaceDialog.getByRole('alert')).toHaveText('名称不符，空间还在。');
  await spaceDialog.getByRole('button', { name: '取消' }).click();
  await expect(handbook).toBeVisible();

  await handbook.getByRole('button', { name: '删除', exact: true }).click();
  const activeDialog = page.getByRole('dialog', { name: '确认删除空间' });
  await activeDialog.getByLabel('空间名称').fill('手册');
  await activeDialog.getByRole('button', { name: '删除空间' }).click();
  await expect(activeDialog.getByRole('alert')).toHaveText('空间还没归档，仍然留在列表里。');
  await activeDialog.getByRole('button', { name: '取消' }).click();
  await expect(handbook).toBeVisible();

  await handbook.getByRole('button', { name: '归档' }).click();
  await expect(handbook.getByText('已归档', { exact: true })).toBeVisible();
  await handbook.getByRole('button', { name: '删除', exact: true }).click();
  const archivedDialog = page.getByRole('dialog', { name: '确认删除空间' });
  await archivedDialog.getByLabel('空间名称').fill('手册');
  await archivedDialog.getByRole('button', { name: '删除空间' }).click();
  await expect(page.getByRole('link', { name: '手册', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: '空间' })).toBeVisible();
  await expect(page.getByText('没有数据')).toBeVisible();
  await expect(page.getByRole('link', { name: '手册', exact: true })).toHaveCount(0);

  await page.goto('/sites');
  await page.getByLabel('名称').fill('有挂载');
  await page.getByRole('button', { name: '创建站点' }).click();
  await page.getByRole('link', { name: '有挂载', exact: true }).click();
  await page.getByRole('radiogroup', { name: '空间' }).getByRole('button', { name: '手册', exact: true }).click();
  await page.getByLabel('slug').fill('guide');
  await page.getByRole('button', { name: '挂载', exact: true }).click();
  await expect(page.getByRole('list', { name: '已挂载' })).toContainText('guide');

  await page.goto('/sites');
  const mounted = page.getByRole('list', { name: '站点' }).getByRole('listitem').filter({ hasText: '有挂载' });
  await mounted.getByRole('button', { name: '删除', exact: true }).click();
  const mountedDialog = page.getByRole('dialog', { name: '确认删除站点' });
  await mountedDialog.getByLabel('站点名称').fill('有挂载');
  await mountedDialog.getByRole('button', { name: '删除站点' }).click();
  await expect(mountedDialog.getByRole('alert')).toHaveText('站点仍有挂载，没有删除。');
  await mountedDialog.getByRole('button', { name: '取消' }).click();
  await expect(mounted).toBeVisible();

  await page.getByLabel('名称').fill('空站点');
  await page.getByRole('button', { name: '创建站点' }).click();
  const empty = page.getByRole('list', { name: '站点' }).getByRole('listitem').filter({ hasText: '空站点' });
  await empty.getByRole('button', { name: '删除', exact: true }).click();
  const emptyDialog = page.getByRole('dialog', { name: '确认删除站点' });
  await emptyDialog.getByLabel('站点名称').fill('空站点');
  await emptyDialog.getByRole('button', { name: '删除站点' }).click();
  await expect(page.getByRole('link', { name: '空站点', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '有挂载', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: '站点' })).toBeVisible();
  await expect(page.getByRole('link', { name: '有挂载', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '空站点', exact: true })).toHaveCount(0);

  const restore = writes.find((write) => write.url.includes(':restore'));
  const removeSpace = writes.find((write) => write.url.includes('/spaces/') && !write.url.includes('/pages') && !write.url.includes(':archive'));
  const removeSite = writes.find((write) => /\/sites\/[^/]+$/.test(new URL(write.url).pathname));
  expect(restore?.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(removeSpace?.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(removeSite?.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
});

function isRecoveryWrite(request: Request) {
  if (request.method() !== 'POST' && request.method() !== 'DELETE') return false;
  const path = new URL(request.url()).pathname;
  return path.includes(':trash') || path.includes(':restore') || path.includes(':archive') || request.method() === 'DELETE';
}
