import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Tenant root admin registers an immutable content-type version, enables it,
 * switches the default, and deactivates it. Page interpretation stays on the
 * version captured at creation. The stub stands in for Control.
 */

test.beforeEach(async () => {
  await resetStub();
  await resetSpaces();
  await resetContentTypes();
});

test.afterEach(async () => {
  await resetSpaces();
  await resetContentTypes();
});

test('a root admin registers an immutable version, enables it, and leaves existing pages unchanged', async ({ page }) => {
  test.setTimeout(60_000);
  const writes: Write[] = [];
  page.on('request', (request) => {
    const write = readWrite(request);
    if (write) writes.push(write);
  });

  await signIn(page);
  await page.goto('/settings/content-types');
  const canvas = page.locator('[data-region="canvas"]');
  const register = canvas.getByRole('form', { name: '登记版本' });
  await register.getByLabel('类型', { exact: true }).fill('recipe');
  await register.getByLabel('版本').fill('1.0.0');
  await register.getByLabel('名称').fill('食谱');
  await register.getByLabel('格式').selectOption('json');
  await register.getByLabel('媒体类型').fill('application/json');
  await register.getByLabel('语言').fill('json');
  await register.getByLabel('呈现宿主').selectOption('browser');
  await register.getByLabel('默认解释').fill('{"schema":"recipe-v1"}');
  await register.getByRole('button', { name: '登记版本' }).click();

  const versions = canvas.getByRole('list', { name: '版本' });
  const first = versions.getByRole('listitem').filter({ hasText: '1.0.0' });
  await expect(first).toBeVisible();
  await first.getByRole('button', { name: '查看' }).click();
  const definition = canvas.getByRole('region', { name: '版本定义' });
  await expect(definition).toContainText('recipe-v1');
  await expect(definition).toContainText('不能改写');
  await expect(definition.locator('input, textarea, [contenteditable="true"]')).toHaveCount(0);
  await expect(register.getByLabel('默认解释')).toHaveValue('');

  const typeRow = canvas.getByRole('list', { name: '内容类型' }).getByRole('listitem').filter({ hasText: '食谱' });
  await expect(typeRow).toContainText('已启用');
  await expect(first).toContainText('当前默认');
  await typeRow.getByRole('button', { name: '停用' }).click();
  await expect(typeRow).toContainText('已停用');

  const spaceUrl = await openAuthoredSpace(page);
  let create = page.locator('[data-region="canvas"]').getByRole('form', { name: '创建页面' });
  await expect(create.getByLabel('内容类型')).not.toContainText('食谱');

  await page.goto('/settings/content-types');
  await typeRow.getByRole('button', { name: '启用' }).click();
  await expect(typeRow).toContainText('已启用');

  await page.goto(spaceUrl);
  create = page.locator('[data-region="canvas"]').getByRole('form', { name: '创建页面' });
  await expect(create.getByLabel('内容类型')).toContainText('食谱');
  await create.getByLabel('标题').fill('红烧肉');
  await create.getByLabel('路径').fill('hong-shao');
  await create.getByLabel('内容类型').selectOption({ label: '食谱' });
  await create.getByRole('button', { name: '创建页面' }).click();
  const pages = page.locator('[data-region="canvas"]').getByRole('list', { name: '页面' });
  await pages.getByRole('listitem').filter({ hasText: '红烧肉' }).getByRole('button', { name: '打开' }).click();
  const interpretation = page.locator('[data-region="canvas"]').getByRole('region', { name: '页面解释' });
  await expect(interpretation).toContainText('recipe-v1');
  const boundVersion = (await interpretation.innerText()).match(/版本\s+(\S+)/)?.[1] ?? '';
  expect(boundVersion.length).toBeGreaterThan(8);

  await page.goto('/settings/content-types');
  await register.getByLabel('类型', { exact: true }).fill('recipe');
  await register.getByLabel('版本').fill('2.0.0');
  await register.getByLabel('名称').fill('食谱');
  await register.getByLabel('格式').selectOption('json');
  await register.getByLabel('媒体类型').fill('application/json');
  await register.getByLabel('语言').fill('json');
  await register.getByLabel('呈现宿主').selectOption('browser');
  await register.getByLabel('默认解释').fill('{"schema":"recipe-v2"}');
  await register.getByRole('button', { name: '登记版本' }).click();
  const second = versions.getByRole('listitem').filter({ hasText: '2.0.0' });
  await expect(second).toBeVisible();
  await expect(first).toContainText('当前默认');
  await second.getByRole('button', { name: '设为默认' }).click();
  await expect(second).toContainText('当前默认');
  await expect(first).not.toContainText('当前默认');

  await page.goto(spaceUrl);
  await page.locator('[data-region="canvas"]').getByRole('list', { name: '页面' }).getByRole('button', { name: '打开' }).click();
  const opened = page.locator('[data-region="canvas"]').getByRole('region', { name: '页面解释' });
  await expect(opened).toContainText('recipe-v1');
  await expect(opened).toContainText(boundVersion);
  await expect(opened).not.toContainText('recipe-v2');

  await page.goto('/settings/content-types');
  await typeRow.getByRole('button', { name: '停用' }).click();
  await expect(typeRow).toContainText('已停用');
  await page.goto(spaceUrl);
  await page.locator('[data-region="canvas"]').getByRole('list', { name: '页面' }).getByRole('button', { name: '打开' }).click();
  await expect(page.locator('[data-region="canvas"]').getByRole('region', { name: '页面解释' })).toContainText('recipe-v1');
  await expect(page.locator('[data-region="canvas"]').getByRole('form', { name: '创建页面' }).getByLabel('内容类型')).not.toContainText('食谱');

  const contentWrites = writes.filter((write) => write.path.includes('/content-types/'));
  expect(contentWrites.length).toBeGreaterThanOrEqual(4);
  for (const write of contentWrites) {
    expect(write.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
    expect(write.match).toBe('');
    expect(typeof write.body.baseRevision).toBe('number');
  }
  expect(contentWrites.filter((write) => write.path.endsWith('/versions')).map((write) => write.key)).toEqual(
    expect.arrayContaining([expect.any(String)])
  );
  const keys = contentWrites.map((write) => write.key);
  expect(new Set(keys).size).toBe(keys.length);
  const pageCreate = writes.find((write) => write.path.endsWith('/pages'));
  expect(pageCreate?.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(pageCreate?.match).toBe('');
  expect(pageCreate?.body).toMatchObject({
    contentType: 'recipe',
    interpretation: { schema: 'recipe-v1' }
  });
  expect(pageCreate?.body.versionRef).toBe(boundVersion);
});

async function openAuthoredSpace(page: Page) {
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
  await expect(page.getByRole('heading', { level: 1, name: '手册' })).toBeVisible();
  return page.url();
}

async function resetSpaces() {
  const response = await fetch('http://127.0.0.1:4188/__stub/spaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!response.ok) throw new Error(`space stub reset ${response.status}`);
}

async function resetContentTypes() {
  const response = await fetch('http://127.0.0.1:4188/__stub/content-types/reset', { method: 'POST' });
  if (!response.ok && response.status !== 204) throw new Error(`content type stub reset ${response.status}`);
}

type Write = { path: string; key: string; match: string; body: Record<string, unknown> };

function readWrite(request: Request): Write | null {
  if (request.method() !== 'POST') return null;
  const url = new URL(request.url());
  const path = url.pathname;
  if (!path.includes('/content-types/') && !/\/pages$/.test(path)) return null;
  return {
    path,
    key: request.headers()['idempotency-key'] ?? '',
    match: request.headers()['if-match'] ?? '',
    body: request.postDataJSON() as Record<string, unknown>
  };
}
