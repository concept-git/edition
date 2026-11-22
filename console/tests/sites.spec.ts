import { expect, test } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Site, mount, and search-field behavior against the local auth stub.
 * A full Control stack is not started. The stub speaks the site contract.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetStub();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await signIn(page);
});

test('an admin creates a site, mounts a space, and keeps the search field order', async ({ page }) => {
  await page.getByRole('navigation', { name: '管理' }).getByRole('link', { name: '站点', exact: true }).click();
  await expect(page).toHaveURL('/sites');

  await page.getByLabel('名称').fill('文档站');
  await page.getByRole('button', { name: '创建站点' }).click();
  await page.getByRole('link', { name: '文档站' }).click();
  await expect(page.getByRole('heading', { level: 2, name: '挂载' })).toBeVisible();

  await page.getByRole('radiogroup', { name: '空间' }).getByRole('button', { name: '手册', exact: true }).click();
  await page.getByLabel('slug').fill('guide');
  await page.getByRole('button', { name: '挂载', exact: true }).click();
  const docsMounts = page.getByRole('list', { name: '已挂载' });
  await expect(docsMounts.getByRole('listitem')).toContainText('手册');
  await expect(docsMounts.getByRole('listitem')).toContainText('guide');

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '站点列表' }).click();
  await page.getByLabel('名称').fill('帮助站');
  await page.getByRole('button', { name: '创建站点' }).click();
  await page.getByRole('link', { name: '帮助站' }).click();

  await page.getByRole('radiogroup', { name: '空间' }).getByRole('button', { name: '手册', exact: true }).click();
  await page.getByLabel('slug').fill('manual');
  await page.getByRole('button', { name: '挂载', exact: true }).click();
  const helpMounts = page.getByRole('list', { name: '已挂载' });
  await expect(helpMounts.getByRole('listitem')).toContainText('手册');
  await expect(helpMounts.getByRole('listitem')).toContainText('manual');

  const mountForm = page.getByRole('form', { name: '挂载' });
  await mountForm.getByRole('button', { name: '指南', exact: true }).click();
  await mountForm.getByLabel('slug').fill('manual');
  await mountForm.getByRole('button', { name: '挂载', exact: true }).click();
  await expect(mountForm.getByRole('alert')).toHaveText('路径冲突');
  await expect(mountForm.getByLabel('slug')).toHaveValue('manual');
  await expect(helpMounts.getByRole('listitem')).toContainText('手册');
  await expect(helpMounts.getByRole('listitem')).not.toContainText('指南');

  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '搜索', exact: true }).click();
  await page.getByRole('button', { name: '上移正文' }).click();
  await page.getByRole('button', { name: '上移正文' }).click();
  await page.getByRole('button', { name: '保存顺序' }).click();
  await expect(page.getByRole('status')).toHaveText('已保存');
  const order = page.getByRole('list', { name: '搜索字段顺序' }).getByRole('listitem');
  await expect(order.nth(0).getByText('正文', { exact: true })).toBeVisible();
  await expect(order.nth(1).getByText('标题', { exact: true })).toBeVisible();
  await expect(order.nth(2).getByText('标题层级', { exact: true })).toBeVisible();

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '站点列表' }).click();
  await page.getByRole('link', { name: '帮助站' }).click();
  await expect(page.getByRole('list', { name: '已挂载' }).getByRole('listitem')).toContainText('manual');
  await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: '搜索', exact: true }).click();
  const reopened = page.getByRole('list', { name: '搜索字段顺序' }).getByRole('listitem');
  await expect(reopened.nth(0).getByText('正文', { exact: true })).toBeVisible();
  await expect(reopened.nth(1).getByText('标题', { exact: true })).toBeVisible();
  await expect(reopened.nth(2).getByText('标题层级', { exact: true })).toBeVisible();

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '站点列表' }).click();
  await page.getByRole('link', { name: '文档站' }).click();
  const stillThere = page.getByRole('list', { name: '已挂载' }).getByRole('listitem');
  await expect(stillThere).toContainText('手册');
  await expect(stillThere).toContainText('guide');
});
