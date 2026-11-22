import { expect, test, type Locator, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Directory journey against the local auth stub. A full Control stack is not
 * started. The stub stores the space tree and rejects depth, cycles, and
 * illegal positions. A browser pass against a running Control process stays
 * out of this file.
 */

test.beforeEach(async () => {
  await resetDirectory();
});

test('an author arranges targets, groups, and links with the keyboard and by dragging', async ({ page }) => {
  test.setTimeout(90_000);
  const keys: string[] = [];
  page.on('request', (request) => {
    if (!isTocWrite(request)) return;
    keys.push(request.headers()['idempotency-key'] ?? '');
  });

  await openDirectory(page);
  await createPage(page, '快速开始');
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '目录' }).click();
  await expect(page).toHaveURL(/\/toc$/);

  await addEntry(page, { kind: '分组', label: '指南', parent: '根' });
  await addEntry(page, { kind: '目标', label: '快速开始', parent: '指南', pageTitle: '快速开始' });
  await addEntry(page, { kind: '外链', label: '官网', parent: '根', url: 'https://edition.example' });

  const tree = page.getByRole('tree', { name: '目录' });
  await expect(tree.getByRole('treeitem', { name: '指南' }).getByText('分组', { exact: true })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: '指南' }).getByRole('treeitem', { name: '快速开始' })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: '快速开始' }).getByText('目标', { exact: true })).toBeVisible();
  const link = tree.getByRole('treeitem', { name: '官网' });
  await expect(link.getByText('外链', { exact: true })).toBeVisible();
  await expect(link.getByText('https://edition.example')).toBeVisible();
  await expect(tree.getByRole('treeitem').nth(0)).toHaveAttribute('aria-label', '指南');

  await link.getByRole('button', { name: '上移' }).focus();
  await page.keyboard.press('Enter');
  await expect(tree.getByRole('treeitem').nth(0)).toHaveAttribute('aria-label', '官网');
  await expect(tree.getByRole('treeitem').nth(1)).toHaveAttribute('aria-label', '指南');

  await dragEntry(page, '官网', '快速开始');
  await expect(tree.getByRole('treeitem').nth(0)).toHaveAttribute('aria-label', '指南');
  await expect(tree.getByRole('treeitem', { name: '指南' }).getByRole('treeitem', { name: '官网' })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: '指南' }).getByRole('treeitem', { name: '快速开始' })).toBeVisible();

  expect(keys.length).toBeGreaterThanOrEqual(4);
  for (const key of keys) expect(key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(new Set(keys).size).toBe(keys.length);
});

test('depth 8, a cycle, and an illegal position are rejected beside the tree', async ({ page }) => {
  test.setTimeout(90_000);
  await openDirectory(page);
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '目录' }).click();

  const levels = ['一层', '二层', '三层', '四层', '五层', '六层', '七层'];
  let parent = '根';
  for (const label of levels) {
    await addEntry(page, { kind: '分组', label, parent });
    parent = label;
  }

  const directory = page.getByRole('region', { name: '目录' });
  const tree = directory.getByRole('tree', { name: '目录' });
  await addEntry(page, { kind: '分组', label: '八层', parent: '七层', shown: false });
  await expect(directory.getByRole('alert')).toContainText('最多 7 级');
  await expect(tree.getByRole('treeitem', { name: '八层' })).toHaveCount(0);
  await expect(tree.getByRole('treeitem', { name: '六层' }).getByRole('treeitem', { name: '七层' })).toBeVisible();

  await moveEntry(page, { entry: '一层', parent: '二层', position: '0' });
  await expect(directory.getByRole('alert')).toContainText('成环');
  await expect(tree.getByRole('treeitem').nth(0)).toHaveAttribute('aria-label', '一层');
  await expect(tree.getByRole('treeitem', { name: '一层' }).getByRole('treeitem', { name: '二层' })).toBeVisible();

  await moveEntry(page, { entry: '七层', parent: '六层', position: '99' });
  await expect(directory.getByRole('alert')).toContainText('位置不合法');
  await expect(tree.getByRole('treeitem', { name: '六层' }).getByRole('treeitem', { name: '七层' })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: '八层' })).toHaveCount(0);
});

async function openDirectory(page: Page) {
  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
  await expect(page.getByRole('heading', { level: 1, name: '手册' })).toBeVisible();
}

async function createPage(page: Page, title: string) {
  const form = page.getByRole('form', { name: '按格式创建' });
  await form.getByRole('group', { name: '格式' }).getByRole('button', { name: 'markdown', exact: true }).click();
  await form.getByLabel('标题').fill(title);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
}

async function addEntry(
  page: Page,
  input: { kind: string; label: string; parent: string; pageTitle?: string; url?: string; shown?: boolean }
) {
  const form = page.getByRole('form', { name: '加入目录' });
  await form.getByLabel('种类').selectOption({ label: input.kind });
  await form.getByLabel('标签').fill(input.label);
  if (input.pageTitle) {
    await expect(form.getByRole('option', { name: input.pageTitle })).toBeAttached();
    await form.getByLabel('页面').selectOption({ label: input.pageTitle });
  }
  if (input.url) await form.getByLabel('地址').fill(input.url);
  await form.getByLabel('上级').selectOption({ label: input.parent });
  await form.getByRole('button', { name: '加入' }).click();
  if (input.shown !== false) await expect(page.getByRole('treeitem', { name: input.label })).toBeVisible();
}

async function moveEntry(page: Page, input: { entry: string; parent: string; position: string }) {
  const form = page.getByRole('form', { name: '移动目录项' });
  await form.getByLabel('条目').selectOption({ label: input.entry });
  await form.getByLabel('新的上级').selectOption({ label: input.parent });
  await form.getByLabel('位置').fill(input.position);
  await form.getByRole('button', { name: '移动' }).click();
}

async function dragEntry(page: Page, sourceLabel: string, targetLabel: string) {
  const tree = page.getByRole('tree', { name: '目录' });
  const source = tree.getByRole('treeitem', { name: sourceLabel }).getByText(sourceLabel, { exact: true });
  const target = tree.getByRole('treeitem', { name: targetLabel }).getByText(targetLabel, { exact: true });
  await dragOnto(page, source, target);
}

async function dragOnto(page: Page, source: Locator, target: Locator) {
  const from = await source.boundingBox();
  if (!from) throw new Error('directory row is not visible');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 24, from.y + from.height / 2, { steps: 6 });
  await page.waitForTimeout(300);
  const to = await target.boundingBox();
  if (!to) throw new Error('drop target is not visible');
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.waitForTimeout(500);
  await page.mouse.up();
}

async function resetDirectory() {
  await resetStub();
  const pages = await fetch('http://127.0.0.1:4188/__stub/pages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!pages.ok) throw new Error(`page stub reset ${pages.status}`);
  const spaces = await fetch('http://127.0.0.1:4188/__stub/spaces', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset: true })
  });
  if (!spaces.ok) throw new Error(`space stub reset ${spaces.status}`);
}

function isTocWrite(request: Request) {
  if (request.method() === 'GET') return false;
  return /\/toc\/entries(?:\/|$)/.test(new URL(request.url()).pathname);
}
