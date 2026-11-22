import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';

/**
 * Site and space grants, and page narrowing, against the local auth stub.
 * A full Control stack is not started. The stub speaks the permission contract.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetSpaces();
  const reset = await fetch('http://127.0.0.1:4188/__stub/reset', { method: 'POST' });
  if (!reset.ok && reset.status !== 204) throw new Error(`stub reset ${reset.status}`);
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await signIn(page);
});

test.afterEach(async () => {
  await resetSpaces();
});

async function resetSpaces() {
  const response = await fetch('http://127.0.0.1:4188/__stub/spaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!response.ok) throw new Error(`space stub reset ${response.status}`);
}

test('an admin grants a site and a space, and a page can only narrow', async ({ page }) => {
  test.setTimeout(60_000);
  const matches: string[] = [];
  page.on('request', (request) => {
    if (isRestriction(request)) matches.push(request.headers()['if-match'] ?? '');
  });

  await page.goto('/sites');
  await page.getByLabel('名称').fill('授权站');
  await page.getByRole('button', { name: '创建站点' }).click();
  await page.getByRole('link', { name: '授权站' }).click();
  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '授权' }).click();
  await grant(page, '读者', '读者甲', 'reader');

  await page.goto('/sites');
  await page.getByRole('link', { name: '授权站' }).click();
  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '授权' }).click();
  const siteGrants = page.getByRole('list', { name: '授权' });
  await expect(siteGrants).toContainText('读者甲');
  await expect(siteGrants).toContainText('reader');
  await expect(siteGrants).toContainText('read');

  await page.goto('/content/spaces');
  const createSpace = page.getByRole('form', { name: '创建空间' });
  await createSpace.getByLabel('名称').fill('手册');
  await createSpace.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '授权' }).click();
  await grant(page, '读者', '读者甲', 'reader');
  await grant(page, '作者', '作者乙', 'author');

  await page.goto('/content/spaces');
  await page.getByRole('link', { name: '手册' }).click();
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '授权' }).click();
  const spaceGrants = page.getByRole('list', { name: '授权' });
  await expect(spaceGrants).toContainText('读者甲');
  await expect(spaceGrants).toContainText('reader');
  await expect(spaceGrants).toContainText('作者乙');
  await expect(spaceGrants).toContainText('author');

  await page.getByRole('link', { name: '入门' }).click();
  const operations = page.getByRole('list', { name: '操作' });
  await expect(operations.getByRole('listitem')).toHaveText(['read', 'write']);
  await expect(page.getByRole('list', { name: '当前可见' })).toContainText('作者乙');

  await page.getByRole('checkbox', { name: '作者乙' }).uncheck();
  await page.getByRole('button', { name: '收窄', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('作者乙');
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(dialog).toHaveCount(0);
  expect(matches).toEqual([]);
  await expect(page.getByRole('checkbox', { name: '作者乙' })).toBeChecked();
  await expect(operations.getByRole('listitem')).toHaveText(['read', 'write']);
  await expect(page.getByRole('list', { name: '当前可见' })).toContainText('作者乙');

  await page.getByRole('checkbox', { name: '作者乙' }).uncheck();
  await page.getByRole('button', { name: '收窄', exact: true }).click();
  await dialog.getByRole('button', { name: '确认收窄' }).click();
  await expect(dialog).toHaveCount(0);
  expect(matches).toEqual(['"permission-0"']);
  await expect(operations.getByRole('listitem')).toHaveText(['read']);
  const narrowed = page.getByRole('list', { name: '当前可见' });
  await expect(narrowed).toContainText('读者甲');
  await expect(narrowed).not.toContainText('作者乙');

  const widen = page.getByRole('form', { name: '添加主体' });
  await widen.getByLabel('查找主体').fill('访客');
  await widen.getByRole('button', { name: '查找' }).click();
  await widen.getByRole('button', { name: '访客丙' }).click();
  await expect(page.getByRole('alert')).toHaveText('不能把父级没有的操作授出去。');
  await expect(operations.getByRole('listitem')).toHaveText(['read']);
  await expect(narrowed).not.toContainText('访客丙');

  await page.getByRole('checkbox', { name: '作者乙' }).check();
  await page.getByRole('button', { name: '收窄', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('不能在页面上放宽。');
  await expect(dialog).toHaveCount(0);
  expect(matches).toEqual(['"permission-0"']);
  await expect(page.getByRole('checkbox', { name: '作者乙' })).not.toBeChecked();
  await expect(operations.getByRole('listitem')).toHaveText(['read']);

  await page.goto('/content/spaces');
  await page.getByRole('link', { name: '手册' }).click();
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '授权' }).click();
  await expect(page.getByRole('list', { name: '授权' })).toContainText('作者乙');
  await page.getByRole('link', { name: '入门' }).click();
  await expect(page.getByRole('list', { name: '操作' }).getByRole('listitem')).toHaveText(['read']);
  await expect(page.getByRole('list', { name: '当前可见' })).toContainText('读者甲');
  await expect(page.getByRole('list', { name: '当前可见' })).not.toContainText('作者乙');

  await page.goto('/sites');
  await page.getByRole('link', { name: '授权站' }).click();
  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '授权' }).click();
  await expect(page.getByRole('list', { name: '授权' })).toContainText('读者甲');
  await expect(page.getByRole('list', { name: '授权' })).toContainText('reader');
});

async function grant(page: Page, query: string, name: string, role: string) {
  const form = page.getByRole('form', { name: '授予' });
  await form.getByLabel('查找主体').fill(query);
  await form.getByRole('button', { name: '查找' }).click();
  await form.getByRole('button', { name }).click();
  await form.getByRole('button', { name: role, exact: true }).click();
  await form.getByRole('button', { name: '授予', exact: true }).click();
  await expect(page.getByRole('list', { name: '授权' })).toContainText(name);
}

function isRestriction(request: Request) {
  return request.method() === 'PUT' && request.url().includes('/permissions/restriction');
}
