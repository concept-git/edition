import { expect, test, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Import job journey against the local auth stub. A full Control stack is not
 * started. The stub accepts a bundle, then fails once with a problem report
 * before a retry completes and the page shows up in the space.
 */

test.beforeEach(async () => {
  await resetFixtures();
});

test.afterEach(async () => {
  await resetFixtures();
});

async function resetFixtures() {
  await resetStub();
  for (const path of ['spaces', 'imports']) {
    const response = await fetch(`http://127.0.0.1:4188/__stub/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true })
    });
    if (!response.ok) throw new Error(`${path} stub reset ${response.status}`);
  }
}

test('a maintainer watches an import leave acceptance and finds the imported page', async ({ page }) => {
  test.setTimeout(45_000);
  const importKeys: string[] = [];
  const retryKeys: string[] = [];
  const jobReads: number[] = [];
  page.on('request', (request) => {
    if (isImportStart(request)) importKeys.push(request.headers()['idempotency-key'] ?? '');
    if (isRetry(request)) retryKeys.push(request.headers()['idempotency-key'] ?? '');
    if (isJobRead(request)) jobReads.push(Date.now());
  });

  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByRole('group', { name: '来源模式' }).getByRole('button', { name: '同步' }).click();
  await form.getByLabel('名称').fill('镜像');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '镜像' }).click();
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '导入', exact: true }).click();

  const upload = page.getByRole('form', { name: '导入发版包' });
  await upload.getByLabel('发版包', { exact: true }).setInputFiles('tests/fixtures/guide.zip');
  await upload.getByRole('button', { name: '导入', exact: true }).click();

  const status = page.getByRole('status');
  await expect(status).toHaveText('已受理');
  expect(jobReads).toHaveLength(0);
  expect(importKeys).toHaveLength(1);
  expect(importKeys[0]).toMatch(/^[0-9a-f-]{36}$/i);

  const report = page.getByRole('list', { name: '问题报告' });
  await expect(report).toContainText('对象存储暂时不可用');
  expect(jobReads.length).toBeGreaterThanOrEqual(2);
  expect(jobReads[1] - jobReads[0]).toBeGreaterThanOrEqual(900);
  await expect(status).toHaveText('失败');

  await page.getByRole('button', { name: '再次执行' }).click();
  await expect(status).toHaveText('已受理');
  expect(retryKeys).toHaveLength(1);
  expect(retryKeys[0]).toMatch(/^[0-9a-f-]{36}$/i);
  expect(retryKeys[0]).not.toBe(importKeys[0]);

  await expect(status).toHaveText('已完成');
  await expect(page.getByRole('list', { name: '导入产生的内容' })).toContainText('入门指南');
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '页面', exact: true }).click();
  await expect(page.getByRole('list', { name: '页面' })).toContainText('入门指南');
});

function isImportStart(request: Request) {
  return request.method() === 'POST' && /\/releases:import$/.test(new URL(request.url()).pathname);
}

function isRetry(request: Request) {
  return request.method() === 'POST' && /\/ops\/jobs\/[^/]+:retry$/.test(new URL(request.url()).pathname);
}

function isJobRead(request: Request) {
  return request.method() === 'GET' && /\/import-jobs\/[^/]+$/.test(new URL(request.url()).pathname);
}
