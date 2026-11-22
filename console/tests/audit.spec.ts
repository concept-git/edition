import { expect, test } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Audit queries against the local auth stub. The stub holds the fact Control
 * would have appended for a completed management action. This file does not
 * boot Docker or a real Control server.
 */

const formerEmail = 'erased-reader@edition.test';
const formerName = '陈予安';

test.beforeEach(async ({ page }) => {
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await resetStub();
  await armAudit('ok');
  await signIn(page);
});

test('an authorized reader finds the audit record for a completed management action', async ({ page }) => {
  await page.goto('/audit');
  await page.getByLabel('操作').fill('Space.create');
  await page.getByRole('button', { name: '查询' }).click();

  const records = page.getByRole('list', { name: '审计记录' });
  await expect(records.getByText('创建空间')).toBeVisible();
  await expect(records.getByText('Space.create')).toBeVisible();
  await expect(records.getByText('维护者')).toBeVisible();
  await expect(records.getByText('Page.create')).toHaveCount(0);
  await expect(records.getByText('已注销用户')).toHaveCount(0);
});

test('a failed audit query shows an error instead of an empty table', async ({ page }) => {
  await armAudit('error');
  await page.goto('/audit');
  await page.getByRole('button', { name: '查询' }).click();

  await expect(page.getByRole('heading', { level: 1, name: '审计' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('trace-audit');
  await expect(page.getByText('没有数据')).toHaveCount(0);
  await expect(page.getByRole('list', { name: '审计记录' })).toHaveCount(0);
});

test('an erased subject is not shown with the former email or name', async ({ page }) => {
  await page.goto('/audit');
  await page.getByLabel('操作').fill('Page.create');
  await page.getByRole('button', { name: '查询' }).click();

  const records = page.getByRole('list', { name: '审计记录' });
  await expect(records.getByText('已注销用户')).toBeVisible();
  await expect(records.getByText('创建页面')).toBeVisible();
  const visible = await page.locator('[data-region="canvas"]').innerText();
  expect(visible).not.toContain(formerEmail);
  expect(visible).not.toContain(formerName);
});

async function armAudit(mode: 'ok' | 'error') {
  const response = await fetch('http://127.0.0.1:4188/__stub/audit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok && response.status !== 204) throw new Error(`audit stub ${response.status}`);
}
