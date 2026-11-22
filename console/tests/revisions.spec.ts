import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Revision journey against the local auth stub. A full Control stack is not
 * started. The stub keeps each saved body and answers list, diff, and revert.
 * A browser pass against a running Control process stays out of this file.
 */

test.beforeEach(async () => {
  await resetPages();
});

test.afterEach(async () => {
  await resetPages();
});

test('an author compares a revision with the current body and restores it as a new edit', async ({ page }) => {
  test.setTimeout(90_000);
  const edits: Array<{ ifMatch: string; key: string }> = [];
  const reverts: Array<{ ifMatch: string; key: string; n: number }> = [];
  page.on('request', (request) => {
    if (isEdit(request)) {
      edits.push({
        ifMatch: request.headers()['if-match'] ?? '',
        key: request.headers()['idempotency-key'] ?? ''
      });
    }
    if (isRevert(request)) {
      reverts.push({
        ifMatch: request.headers()['if-match'] ?? '',
        key: request.headers()['idempotency-key'] ?? '',
        n: request.postDataJSON().n
      });
    }
  });

  await openFreshSpace(page);
  await createPage(page, 'txt', '笔记');
  await openPage(page, '笔记');
  await replaceSource(page, '第一版正文');
  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => edits.length).toBe(1);
  await replaceSource(page, '第二版正文');
  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => edits.length).toBe(2);

  await page.getByRole('button', { name: '查看修订', exact: true }).click();
  const list = page.getByRole('list', { name: '修订' });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  const times = list.locator('time');
  await expect(times).toHaveCount(2);
  await expect(times.nth(0)).toBeVisible();
  await expect(times.nth(1)).toBeVisible();
  const stamps = await times.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('datetime') ?? ''));
  expect(Date.parse(stamps[0])).toBeGreaterThan(Date.parse(stamps[1]));
  await expect(list.getByRole('listitem').nth(0).getByRole('button')).toHaveText('修订 2');
  await expect(list.getByRole('listitem').nth(1).getByRole('button')).toHaveText('修订 1');

  await list.getByRole('button', { name: '修订 1', exact: true }).click();
  const diff = page.getByRole('region', { name: '修订差异' });
  await expect(diff).toContainText('第一版正文');
  await expect(diff).toContainText('第二版正文');
  await expect(page.getByRole('textbox', { name: '修订正文', exact: true })).toHaveText('第一版正文');

  await page.getByRole('button', { name: '取回', exact: true }).click();
  await expect.poll(() => reverts.length).toBe(1);
  expect(reverts[0].ifMatch).toBe('"rev-2"');
  expect(reverts[0].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(reverts[0].n).toBe(1);
  await expect(page.getByRole('textbox', { name: '正文', exact: true })).toHaveText('第一版正文');
  await expect(list.getByRole('listitem')).toHaveCount(3);
  await expect(list.getByRole('listitem').nth(0).getByRole('button')).toHaveText('修订 3');

  await list.getByRole('button', { name: '修订 2', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '修订正文', exact: true })).toHaveText('第二版正文');
  await list.getByRole('button', { name: '修订 1', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '修订正文', exact: true })).toHaveText('第一版正文');

  await replaceSource(page, '取回后的新正文');
  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => edits.length).toBe(3);
  expect(edits[2].ifMatch).toBe('"rev-3"');
  expect(edits[2].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(edits[2].key).not.toBe(reverts[0].key);
});

async function openFreshSpace(page: Page) {
  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
}

async function createPage(page: Page, format: string, title: string) {
  const form = page.getByRole('form', { name: '按格式创建' });
  await form.getByRole('group', { name: '格式' }).getByRole('button', { name: format, exact: true }).click();
  await form.getByLabel('标题').fill(title);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
}

async function openPage(page: Page, title: string) {
  await page.getByRole('button', { name: title, exact: true }).click();
  await expect(page.getByRole('textbox', { name: '正文', exact: true })).toBeVisible();
}

async function replaceSource(page: Page, text: string) {
  const editor = page.getByRole('textbox', { name: '正文', exact: true });
  await editor.click();
  const inserted = await editor.evaluate((content, next) => {
    const node = content as HTMLElement & {
      cmTile?: { root?: { view?: { dispatch: (change: unknown) => void; state: { doc: { length: number; toString: () => string } } } } };
    };
    const view = node.cmTile?.root?.view;
    if (!view) return false;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
    return view.state.doc.toString() === next;
  }, text);
  if (!inserted) throw new Error('source editor did not accept the draft');
}

async function resetPages() {
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

function isEdit(request: Request) {
  return request.method() === 'PUT' && /\/pages\/[^/]+\/content$/.test(new URL(request.url()).pathname);
}

function isRevert(request: Request) {
  return request.method() === 'POST' && /\/pages\/[^/]+:revert$/.test(new URL(request.url()).pathname);
}
