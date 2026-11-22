import { expect, test, type Page } from '@playwright/test';
import { maintainer } from './account';
import { arm, resetStub } from './stub';

/**
 * Session behavior against the local auth stub. A full Control stack is not
 * started; the stub speaks the login, refresh, and logout contract.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await resetStub();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
});

test('wrong credentials stay on the login page with one reason', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill('nobody@edition.test');
  await page.getByLabel('密码').fill('wrong-password');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('alert')).toHaveText('邮箱或密码不正确。');
  await expect(page.getByLabel('邮箱')).toHaveValue('nobody@edition.test');
  await expect(page.getByLabel('密码')).toHaveValue('wrong-password');

  await page.getByLabel('邮箱').fill('locked@edition.test');
  await page.getByLabel('密码').fill('also-wrong');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.getByRole('alert')).toHaveText('邮箱或密码不正确。');
  await expect(page.getByLabel('邮箱')).toHaveValue('locked@edition.test');

  await page.getByLabel('邮箱').fill('deactivated@edition.test');
  await page.getByLabel('密码').fill('still-wrong');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.getByRole('alert')).toHaveText('邮箱或密码不正确。');
  const visible = await page.locator('body').innerText();
  for (const word of ['锁定', '已停用', '已注销', 'locked', 'deactivated', 'unknown account']) {
    expect(visible).not.toContain(word);
  }
});

test('login failures other than a bad password keep the draft', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(maintainer.password);
  for (const [mode, text] of [
    ['forbidden', '请求被拒绝。'],
    ['rate_limited', '请在 60 秒后再试'],
    ['server', 'trace-server'],
    ['drop', '网络失败']
  ] as const) {
    await arm('login', mode);
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('alert')).toContainText(text);
    await expect(page.getByLabel('邮箱')).toHaveValue(maintainer.email);
    await expect(page.getByLabel('密码')).toHaveValue(maintainer.password);
  }
});

test('a maintainer signs in, stays signed in after refresh, and can sign out', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');

  const loginResponse = page.waitForResponse((response) => response.url().endsWith('/auth/login') && response.status() === 200);
  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(maintainer.password);
  await page.getByRole('button', { name: '登录' }).click();
  const body = await (await loginResponse).json();
  expect(body.refreshToken).toBeUndefined();
  expect(body.tokenType).toBe('Bearer');
  const accessToken = body.accessToken as string;
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: '概览' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '管理' })).toBeVisible();
  await expect(page.getByRole('region', { name: '上手' })).toBeVisible();

  const refreshOnReload = page.waitForRequest((request) => request.method() === 'POST' && request.url().endsWith('/auth/refresh'));
  await page.reload();
  const refresh = await refreshOnReload;
  expect(new URL(refresh.url()).origin).toBe('http://127.0.0.1:4177');
  expect(refresh.postData()).toBeNull();
  const headers = await refresh.allHeaders();
  expect(headers.cookie ?? '').toContain('refresh_token=');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: '概览' })).toBeVisible();

  const stored = await page.context().cookies();
  const cookie = stored.find((item) => item.name === 'refresh_token');
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.secure).toBe(true);
  expect(cookie?.path).toBe('/auth');
  expect(cookie?.sameSite).toBe('Lax');
  const leaked = await page.evaluate((secrets) => {
    const local = Object.values(localStorage).join('\n');
    const session = Object.values(sessionStorage).join('\n');
    const bag = `${document.cookie}\n${local}\n${session}\n${document.body.innerText}`;
    return secrets.some((secret) => secret && bag.includes(secret));
  }, [cookie?.value ?? '', accessToken]);
  expect(leaked).toBe(false);
  expect(await page.evaluate(() => document.cookie.includes('refresh_token'))).toBe(false);

  await page.getByRole('button', { name: '退出' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/content');
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '管理' })).toHaveCount(0);
});

test('only invalid_refresh clears the session; other refresh failures keep the page and the draft', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('邮箱').fill(maintainer.email);
  await page.getByLabel('密码').fill(maintainer.password);

  for (const [mode, text] of [
    ['forbidden', '请求被拒绝'],
    ['rate_limited', '60'],
    ['server', 'trace-server'],
    ['drop', '网络失败']
  ] as const) {
    await arm('refresh', mode);
    await focus(page);
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('alert')).toContainText(text);
    await expect(page.getByLabel('邮箱')).toHaveValue(maintainer.email);
    await expect(page.getByLabel('密码')).toHaveValue(maintainer.password);
  }

  await arm('refresh', 'ok');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: '概览' })).toBeVisible();

  await page.goto('/account/password');
  const draft = page.getByLabel('当前密码');
  await draft.fill('still-typed');

  for (const [mode, text] of [
    ['forbidden', '请求被拒绝'],
    ['rate_limited', '60'],
    ['server', 'trace-server'],
    ['drop', '网络失败']
  ] as const) {
    await arm('refresh', mode);
    await focus(page);
    await expect(page).toHaveURL('/account/password');
    await expect(page.getByRole('heading', { name: '密码' })).toBeVisible();
    await expect(draft).toHaveValue('still-typed');
    await expect(page.getByRole('alert')).toContainText(text);
    await expect(page.getByRole('heading', { name: '登录' })).toHaveCount(0);
  }

  await arm('refresh', 'invalid_refresh');
  await page.reload();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: '登录' })).toBeVisible();
});

async function focus(page: Page) {
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
}
