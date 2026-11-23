import { expect, type Page } from '@playwright/test';
import { maintainer } from './account';

export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(maintainer.password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: '当前租户' })).toBeVisible();
}
