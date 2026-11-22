import { expect, test } from '@playwright/test';
import { maintainer } from './account';
import { resetStub } from './stub';

/**
 * Account behavior against the local auth stub and the account handler.
 * A full Control stack is not started.
 */

const nextPassword = 'new-password-1';

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetStub();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
});

test('a user changes password and then signs in with the new one', async ({ page }) => {
  await signIn(page);
  await page.goto('/account/password');
  await page.getByLabel('当前密码').fill('wrong-password');
  await page.getByLabel('新密码').fill(nextPassword);
  await page.getByRole('button', { name: '修改密码' }).click();
  await expect(page).toHaveURL('/account/password');
  await expect(page.getByText('当前密码不正确。')).toBeVisible();
  await expect(page.getByLabel('当前密码')).toHaveValue('wrong-password');
  await expect(page.getByLabel('新密码')).toHaveValue(nextPassword);

  await page.getByLabel('当前密码').fill(maintainer.password);
  await page.getByRole('button', { name: '修改密码' }).click();
  await expect(page).toHaveURL('/login');

  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(nextPassword);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: '概览' })).toBeVisible();

  await page.getByRole('button', { name: '退出' }).click();
  await expect(page).toHaveURL('/login');
  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(maintainer.password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('alert')).toHaveText('邮箱或密码不正确。');
});

test('ending the current management session blocks refresh', async ({ page }) => {
  await signIn(page);
  await page.goto('/account/sessions');
  await expect(page.getByText('这台设备', { exact: true })).toBeVisible();
  await expect(page.getByText('另一台设备', { exact: true })).toBeVisible();
  await expect(page.getByText('当前', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '结束另一台设备' }).click();
  await expect(page.getByText('另一台设备', { exact: true })).toHaveCount(0);
  await expect(page).toHaveURL('/account/sessions');

  await page.getByRole('button', { name: '结束这台设备' }).click();
  await expect(page).toHaveURL('/login');

  const refresh = page.waitForResponse((response) => response.url().endsWith('/auth/refresh'));
  await page.goto('/');
  expect((await refresh).status()).toBe(401);
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
});

test('cancelling erasure keeps the account able to sign in', async ({ page }) => {
  await signIn(page);
  await page.goto('/account/erase');
  await expect(page.getByText('不可逆')).toBeVisible();

  let erased = false;
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/me:erase')) erased = true;
  });
  await page.getByRole('button', { name: '继续注销' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('不可逆')).toBeVisible();
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(dialog).toHaveCount(0);
  expect(erased).toBe(false);

  await page.getByRole('button', { name: '退出' }).click();
  await signInWith(page, maintainer.password);
});

test('confirming erasure requires irreversible wording and then the account cannot sign in', async ({ page }) => {
  await signIn(page);
  await page.goto('/account/erase');
  await expect(page.getByRole('button', { name: '确认注销' })).toHaveCount(0);

  await page.getByRole('button', { name: '继续注销' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('不可逆')).toBeVisible();
  await dialog.getByLabel('确认邮箱').fill(maintainer.email);
  await dialog.getByLabel('当前密码').fill(maintainer.password);
  const erase = page.waitForRequest((request) => request.method() === 'POST' && request.url().includes('/api/v1/me:erase'));
  await dialog.getByRole('button', { name: '确认注销' }).click();
  const request = await erase;
  expect(request.headers()['idempotency-key']).toMatch(/^[a-zA-Z0-9._:-]+$/);
  await expect(page).toHaveURL('/login');

  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(maintainer.password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('alert')).toHaveText('邮箱或密码不正确。');
  const visible = await page.locator('body').innerText();
  expect(visible).not.toContain('已注销');
});

test('self-service deactivation is unavailable', async ({ page }) => {
  const blocked: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'POST') return;
    const path = new URL(request.url()).pathname;
    if (path === '/api/v1/me:deactivate' || path === '/api/v1/me:reactivate') blocked.push(path);
  });

  await signIn(page);
  await page.goto('/account/deactivate');
  const explanation = await page.locator('[data-region="canvas"]').innerText();
  expect(explanation).toContain('自助停用暂不可用');
  expect(explanation).not.toContain('账号已停用');
  expect(explanation).not.toContain('账号已恢复');
  expect(explanation).not.toContain('不可逆');
  await expect(page.getByRole('button', { name: '停用账号' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '恢复账号' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '确认注销' })).toHaveCount(0);
  await expect(page.getByLabel('当前密码')).toHaveCount(0);
  expect(blocked).toEqual([]);

  for (const path of ['/api/v1/me:deactivate', '/api/v1/me:reactivate']) {
    const response = await page.request.post(`http://127.0.0.1:4188${path}`, {
      data: { confirmationEmail: maintainer.email, currentPassword: maintainer.password },
      headers: {
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'idempotency-key': 'account-lock'
      }
    });
    expect(response.ok()).toBe(false);
    expect(response.status()).not.toBe(204);
  }
});

async function signIn(page: import('@playwright/test').Page) {
  await signInWith(page, maintainer.password);
}

async function signInWith(page: import('@playwright/test').Page, password: string) {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: '概览' })).toBeVisible();
}
