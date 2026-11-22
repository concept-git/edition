import { expect, test, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Collection and tag journey against the local auth stub.
 * A full Control stack is not started. The stub keeps the collection forest,
 * one placeable space, and one page.
 */

test.beforeEach(async () => {
  await resetStub();
  const response = await fetch('http://127.0.0.1:4188/__stub/collections', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true, spaceName: '手册空间', pageTitle: '入门' })
  });
  if (!response.ok) throw new Error(`collection stub reset ${response.status}`);
});

test.afterEach(async () => {
  const response = await fetch('http://127.0.0.1:4188/__stub/collections', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!response.ok) throw new Error(`collection stub clear ${response.status}`);
});

test('an author nests three collections, places a space, and is refused a fourth level', async ({ page }) => {
  test.setTimeout(45_000);
  const createKeys: string[] = [];
  const placeKeys: string[] = [];
  page.on('request', (request) => {
    if (isCreate(request)) createKeys.push(request.headers()['idempotency-key'] ?? '');
    if (isPlace(request)) placeKeys.push(request.headers()['idempotency-key'] ?? '');
  });

  await signIn(page);
  await page.goto('/content/collections');
  await expect(page.getByRole('heading', { level: 1, name: '分组' })).toBeVisible();
  await expect(page.getByText('没有数据')).toBeVisible();

  const form = page.getByRole('form', { name: '创建分组' });
  await expect(form).toBeVisible();
  await createCollection(form, '根', '产品');
  await expect(page.getByRole('article', { name: '产品', exact: true })).toBeVisible();
  await createCollection(form, '产品', '手册');
  await expect(page.getByRole('article', { name: '手册', exact: true })).toBeVisible();
  await createCollection(form, '产品 / 手册', '章节');
  await expect(page.getByRole('article', { name: '章节', exact: true })).toBeVisible();

  await createCollection(form, '产品 / 手册 / 章节', '过深');
  await expect(form.getByRole('alert')).toHaveText('分组最多 3 级。');
  await createCollection(form, '产品 / 手册 / 章节', '过深');
  await expect.poll(() => createKeys.length).toBe(5);
  expect(createKeys.every((key) => key.length > 0)).toBe(true);
  expect(new Set(createKeys.slice(0, 4)).size).toBe(4);
  expect(createKeys[4]).toBe(createKeys[3]);
  await expect(page.getByRole('article', { name: '过深', exact: true })).toHaveCount(0);

  const place = page.getByRole('form', { name: '放入分组' });
  await place.getByLabel('空间').selectOption({ label: '手册空间' });
  await place.getByLabel('分组').selectOption({ label: '产品 / 手册 / 章节' });
  await place.getByRole('button', { name: '放入' }).click();
  await expect(page.getByRole('list', { name: '章节中的空间' }).getByText('手册空间', { exact: true })).toBeVisible();
  expect(placeKeys).toHaveLength(1);
  expect(placeKeys[0]).toBeTruthy();
});

test('an author tags a page and finds that page by the tag', async ({ page }) => {
  test.setTimeout(45_000);
  const tagKeys: string[] = [];
  page.on('request', (request) => {
    if (isTag(request)) tagKeys.push(request.headers()['idempotency-key'] ?? '');
  });

  await signIn(page);
  await page.goto('/content/spaces/example/tags');
  await expect(page.getByRole('heading', { level: 2, name: '标签' })).toBeVisible();
  await expect(page.getByRole('list', { name: '页面' }).getByText('入门', { exact: true })).toBeVisible();

  const form = page.getByRole('form', { name: '标记页面' });
  await form.getByLabel('页面').selectOption({ label: '入门' });
  await form.getByLabel('标签').fill('指南');
  await form.getByRole('button', { name: '标记' }).click();
  await expect(page.getByRole('list', { name: '页面' }).getByText('指南', { exact: true })).toBeVisible();
  expect(tagKeys).toHaveLength(1);
  expect(tagKeys[0]).toBeTruthy();

  const find = page.getByRole('form', { name: '按标签查找' });
  await find.getByLabel('标签').fill('指南');
  await find.getByRole('button', { name: '查找' }).click();
  await expect(page.getByRole('list', { name: '指南' }).getByText('入门', { exact: true })).toBeVisible();
});

async function createCollection(form: ReturnType<import('@playwright/test').Page['getByRole']>, parent: string, name: string) {
  await form.getByLabel('上级').selectOption({ label: parent });
  await form.getByLabel('名称').fill(name);
  await form.getByRole('button', { name: '创建', exact: true }).click();
}

function isCreate(request: Request) {
  return request.method() === 'POST' && /\/collections$/.test(new URL(request.url()).pathname);
}

function isPlace(request: Request) {
  return request.method() === 'PUT' && /\/collections\/[^/]+\/spaces\/[^/]+$/.test(new URL(request.url()).pathname);
}

function isTag(request: Request) {
  return request.method() === 'PUT' && /\/pages\/[^/]+\/tags\/[^/]+$/.test(new URL(request.url()).pathname);
}
