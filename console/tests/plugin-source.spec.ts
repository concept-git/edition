import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Plugin source against the local auth stub. A full Control stack is not
 * started. The browser seam against a real Control remains for when that
 * stack is the session under test.
 */

let accessToken = '';

test.afterEach(async () => {
  await clearPlugins();
});

test.beforeEach(async ({ page }) => {
  accessToken = '';
  page.on('response', async (response) => {
    const path = new URL(response.url()).pathname;
    if ((path !== '/auth/login' && path !== '/auth/refresh') || !response.ok()) return;
    const body = (await response.json().catch(() => null)) as { accessToken?: unknown } | null;
    if (typeof body?.accessToken === 'string') accessToken = body.accessToken;
  });
  await resetStub();
  await resetPlugins();
  await signIn(page);
});

test('saving plugin source keeps it, a baseline conflict keeps the local source, and a candidate leaves the enabled content type', async ({
  page
}) => {
  await page.goto('/settings/plugins');
  await expect(page.getByRole('heading', { level: 1, name: '插件' })).toBeVisible();
  const editor = page.getByRole('textbox', { name: '插件源码' });
  await expect(editor).toContainText('hello');
  await expect(page.getByText('启用版本 article@1')).toBeVisible();

  await replaceSource(page, 'export const greeting = "saved-line";\n');
  const saved = page.waitForRequest(
    (request) => request.method() === 'PUT' && request.url().includes('/plugin-developments/')
  );
  await page.getByRole('button', { name: '保存' }).click();
  const saveRequest = await saved;
  expect(idempotencyKey(saveRequest)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const saveBody = saveRequest.postDataJSON() as {
    baseRevision?: unknown;
    name?: unknown;
    contentType?: unknown;
    source?: { files?: Record<string, string>; manifest?: string };
  };
  expect(saveBody.baseRevision).toBe(1);
  expect(saveBody.name).toBe('问候插件');
  expect(saveBody.contentType).toBe('article');
  expect(saveBody.source?.files?.['src/index.js']).toContain('saved-line');
  expect(saveBody.source?.manifest).toContain('greeting');
  await expect(page.getByText('已保存')).toBeVisible();

  await page.goto('/');
  await page.goto('/settings/plugins');
  await expect(page.getByRole('textbox', { name: '插件源码' })).toContainText('saved-line');
  await expect(page.getByText('启用版本 article@1')).toBeVisible();

  const formed = page.waitForRequest(
    (request) => request.method() === 'POST' && /\/plugin-developments\/[^/]+\/candidates$/.test(new URL(request.url()).pathname)
  );
  await page.getByRole('button', { name: '形成候选' }).click();
  const formRequest = await formed;
  expect(idempotencyKey(formRequest)).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const formBody = formRequest.postDataJSON() as {
    baseRevision?: unknown;
    sourceDigest?: unknown;
    entryPoint?: unknown;
    bundle?: unknown;
    environment?: unknown;
  };
  expect(formBody.baseRevision).toBe(2);
  expect(formBody.sourceDigest).toEqual(expect.any(String));
  expect(String(formBody.sourceDigest).length).toBeGreaterThan(0);
  expect(formBody.entryPoint).toBe('src/index.js');
  expect(formBody.environment).toBe('browser-es2022-v1');
  expect(formBody.bundle).toContain('saved-line');
  await expect(page.getByText('已形成候选')).toBeVisible();
  await expect(page.getByText('启用版本 article@1')).toBeVisible();
  await expect(page.getByText('article@changed')).toHaveCount(0);

  await replaceSource(page, 'export const greeting = "local-only-line";\n');
  await advanceBaseline();
  const conflicted = page.waitForResponse(
    (response) => response.request().method() === 'PUT' && response.url().includes('/plugin-developments/')
  );
  await page.getByRole('button', { name: '保存' }).click();
  expect((await conflicted).status()).toBe(409);
  await expect(page.getByRole('alert')).toContainText('基线冲突');
  await expect(page.getByRole('textbox', { name: '插件源码' })).toContainText('local-only-line');
  await expect(page.getByText('启用版本 article@1')).toBeVisible();

  const cookies = await page.context().cookies();
  const refresh = cookies.find((cookie) => cookie.name === 'refresh_token')?.value ?? '';
  expect(accessToken.length).toBeGreaterThan(10);
  expect(refresh.length).toBeGreaterThan(10);
  const visible = await page.locator('body').innerText();
  const markup = await page.content();
  expect(visible).not.toContain(accessToken);
  expect(visible).not.toContain(refresh);
  expect(visible).not.toContain('refresh_token');
  expect(markup).not.toContain(accessToken);
  expect(markup).not.toContain(refresh);
});

async function replaceSource(page: Page, source: string) {
  const editor = page.getByRole('textbox', { name: '插件源码' });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(source);
  await expect(editor).toContainText(source.includes('saved-line') ? 'saved-line' : 'local-only-line');
}

function idempotencyKey(request: Request) {
  return request.headers()['idempotency-key'] ?? '';
}

async function resetPlugins() {
  const response = await fetch('http://127.0.0.1:4188/__stub/plugins/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`plugin reset ${response.status}`);
}

async function clearPlugins() {
  const response = await fetch('http://127.0.0.1:4188/__stub/plugins/clear', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`plugin clear ${response.status}`);
}

async function advanceBaseline() {
  const response = await fetch('http://127.0.0.1:4188/__stub/plugins/advance', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`plugin advance ${response.status}`);
}
