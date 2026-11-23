import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Page source journey against the local auth stub. A full Control stack is
 * not started. The stub stores page text and answers create, read, and edit.
 * A browser pass against a running Control process stays out of this file.
 */

const samples = [
  { format: 'markdown', title: '说明', body: '# 说明 原文还在。' },
  { format: 'html', title: '片段', body: '<p>原文还在。</p>' },
  { format: 'txt', title: '笔记', body: '纯文本原文还在。' },
  { format: 'json', title: '配置', body: '{ "open": true' },
  { format: 'xml', title: '清单', body: '<list><item' }
] as const;

test.beforeEach(async () => {
  await resetPages();
});

test.afterEach(async () => {
  await resetPages();
});

test('a maintainer creates five page formats and saves the original source', async ({ page }) => {
  test.setTimeout(90_000);
  const saves: Array<{ ifMatch: string; key: string; content: string }> = [];
  page.on('request', (request) => {
    if (!isEdit(request)) return;
    saves.push({
      ifMatch: request.headers()['if-match'] ?? '',
      key: request.headers()['idempotency-key'] ?? '',
      content: request.postDataJSON().content
    });
  });

  await openFreshSpace(page);
  for (const sample of samples) {
    await createPage(page, sample.format, sample.title);
  }
  for (const sample of samples) {
    await expect(page.getByRole('listitem').filter({ hasText: sample.title }).getByText(sample.format, { exact: true })).toBeVisible();
  }

  await openPage(page, '说明');
  await replaceSource(page, samples[0].body);
  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => saves.length).toBe(1);
  expect(saves[0].ifMatch).toBe('"rev-0"');
  expect(saves[0].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(saves[0].content).toBe(samples[0].body);

  await replaceSource(page, `${samples[0].body} 第二段`);
  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => saves.length).toBe(2);
  expect(saves[1].ifMatch).toBe('"rev-1"');
  expect(saves[1].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(saves[1].key).not.toBe(saves[0].key);
  expect(saves[1].content).toBe(`${samples[0].body} 第二段`);
  await closeEditor(page);

  await openPage(page, '说明');
  await expect(page.getByRole('textbox', { name: '正文' })).toHaveText(`${samples[0].body} 第二段`);
  await closeEditor(page);

  for (const sample of samples.slice(1)) {
    await openPage(page, sample.title);
    await replaceSource(page, sample.body);
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByRole('textbox', { name: '正文' })).toHaveText(sample.body);
    await closeEditor(page);
    await openPage(page, sample.title);
    await expect(page.getByRole('textbox', { name: '正文' })).toHaveText(sample.body);
    await closeEditor(page);
  }

  const edited = saves.slice(2);
  expect(edited).toHaveLength(4);
  for (const save of edited) {
    expect(save.ifMatch).toBe('"rev-0"');
    expect(save.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  }
  expect(new Set(edited.map((save) => save.key)).size).toBe(4);
});

test('a baseline conflict keeps the local draft', async ({ page }) => {
  test.setTimeout(60_000);
  const saves: string[] = [];
  page.on('request', (request) => {
    if (isEdit(request)) saves.push(request.headers()['if-match'] ?? '');
  });

  await openFreshSpace(page);
  await createPage(page, 'txt', '笔记');
  await openPage(page, '笔记');
  await replaceSource(page, '纯文本原文还在。');
  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => saves.length).toBe(1);

  await replaceSource(page, '本地草稿还在。');
  const armed = await fetch('http://127.0.0.1:4188/__stub/pages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ conflicts: 1 })
  });
  if (!armed.ok) throw new Error(`page stub conflict ${armed.status}`);
  await page.getByRole('button', { name: '保存' }).click();
  const editor = page.getByRole('region', { name: '正文编辑' });
  await expect(editor.getByRole('alert')).toContainText('冲突');
  await expect(editor.getByRole('textbox', { name: '正文' })).toHaveText('本地草稿还在。');
  expect(saves).toEqual(['"rev-0"', '"rev-1"']);
});

test('content over the limit is rejected next to the editor', async ({ page }) => {
  test.setTimeout(90_000);
  let edits = 0;
  page.on('request', (request) => {
    if (isEdit(request)) edits += 1;
  });

  await openFreshSpace(page);
  await createPage(page, 'txt', '超限');
  await openPage(page, '超限');
  const draft = oversizedDraft();
  await replaceSource(page, draft);
  await page.getByRole('button', { name: '保存' }).click();
  const editor = page.getByRole('region', { name: '正文编辑' });
  await expect(editor.getByRole('alert')).toContainText('2 MiB');
  await expect(editor.getByRole('textbox', { name: '正文' })).toContainText('超限草稿开头');
  expect(edits).toBe(0);

  await closeEditor(page);
  await openPage(page, '超限');
  await expect(page.getByRole('textbox', { name: '正文' })).toHaveText('');
});

async function openFreshSpace(page: Page) {
  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
  await expect(page.getByRole('heading', { level: 1, name: '手册' })).toBeVisible();
}

async function createPage(page: Page, format: string, title: string) {
  const form = page.getByRole('form', { name: '按格式创建' });
  const labels: Record<string, string> = { markdown: 'Markdown', html: 'HTML', txt: 'TXT', json: 'JSON', xml: 'XML' };
  await form.getByRole('group', { name: '格式' }).getByRole('button', { name: labels[format] ?? format, exact: true }).click();
  await form.getByLabel('标题').fill(title);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
}

async function openPage(page: Page, title: string) {
  await page.getByRole('button', { name: title, exact: true }).click();
  await expect(page.getByRole('textbox', { name: '正文' })).toBeVisible();
}

async function closeEditor(page: Page) {
  await page.getByRole('button', { name: '返回' }).click();
  await expect(page.getByRole('form', { name: '按格式创建' })).toBeVisible();
}

async function replaceSource(page: Page, text: string) {
  const editor = page.getByRole('textbox', { name: '正文' });
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

function oversizedDraft() {
  const line = `超限草稿开头${'x'.repeat(1000)}`;
  return Array.from({ length: 2200 }, () => line).join('\n');
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
