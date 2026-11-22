import { expect, test } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Platform admin against the local auth stub. A full Control stack is not
 * started. Heartbeat ages are fixed against checkedAt: 60s stays normal,
 * 60.001s and 180s are lagging, 180.001s is lost.
 */

test.beforeEach(async () => {
  await resetStub();
  await armPlatform({ operator: true, scenario: 'empty' });
});

test.afterEach(async () => {
  await armPlatform({ operator: true, scenario: 'empty' });
});

test('a platform operator opens tenants, users, health, and mail without document bodies', async ({ page }) => {
  await armPlatform({ operator: true, scenario: 'open' });
  await signIn(page);
  await page.goto('/content', { waitUntil: 'networkidle' });
  await page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '平台', exact: true }).click();
  await expect(page).toHaveURL('/platform/tenants');
  await expect(page.getByRole('heading', { level: 1, name: '租户' })).toBeVisible();
  await expect(page.getByText('北岸租户')).toBeVisible();

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '用户', exact: true }).click();
  await expect(page).toHaveURL('/platform/users');
  await page.getByLabel('查找用户').fill('ada');
  await page.getByRole('button', { name: '查找' }).click();
  await expect(page.getByText('ada@edition.test')).toBeVisible();

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '进程健康', exact: true }).click();
  await expect(page).toHaveURL('/platform/health');
  const row = (service: string) => page.getByRole('listitem').filter({ hasText: service });
  await expect(row('edition-management')).toContainText('normal');
  await expect(row('edition-index')).toContainText('lagging');
  await expect(row('edition-boundary')).toContainText('lagging');
  await expect(row('edition-worker')).toContainText('lost');
  await expect(page.locator('body')).not.toContainText('SECRET_PAGE_BODY');

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '邮件作业', exact: true }).click();
  await expect(page).toHaveURL('/platform/mail');
  await expect(page.getByRole('heading', { level: 1, name: '邮件作业' })).toBeVisible();
  await expect(page.getByText('mail-job@edition.test')).toBeVisible();
});

test('a normal member does not see the platform entry and a direct route is rejected', async ({ page }) => {
  await armPlatform({ operator: false, scenario: 'open' });
  await signIn(page);
  await page.goto('/content', { waitUntil: 'networkidle' });
  await expect(page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '平台', exact: true })).toHaveCount(0);
  await page.goto('/platform/tenants', { waitUntil: 'networkidle' });
  await expect(page.getByRole('alert')).toContainText('直接访问被拒绝');
  await expect(page.getByText('北岸租户')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('SECRET_PAGE_BODY');
});

async function armPlatform(body: { operator: boolean; scenario: 'empty' | 'open' }) {
  const response = await fetch('http://127.0.0.1:4188/__stub/platform', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok && response.status !== 204) throw new Error(`platform stub ${response.status}`);
}
