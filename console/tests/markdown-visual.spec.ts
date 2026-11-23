import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Markdown visual journey against the local auth stub. A full Control stack is
 * not started. The stub stores the page text. The browser checks that visual
 * editing and the source editor share one markdown string, and that save
 * sends that markdown.
 */

const revised = '# 改过的标题\n\n- 另一项\n\n仍有*强调*\n';

test.beforeEach(async () => {
  await resetPages();
});

test.afterEach(async () => {
  await resetPages();
});

test('a markdown page keeps heading, list, and emphasis as markdown across visual and source', async ({ page }) => {
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
  await createPage(page, 'Markdown', '章节');
  await openPage(page, '章节');

  const modes = page.getByRole('group', { name: '编辑模式' });
  await showVisual(page, modes);
  const visual = page.getByRole('textbox', { name: '正文' });
  await visual.click();
  await page.keyboard.type('# ');
  await expect(visual.getByRole('heading')).toBeVisible();
  await page.keyboard.type('章节标题', { delay: 20 });
  await expect(visual.getByRole('heading', { name: '章节标题' })).toBeVisible();
  await page.keyboard.press('Enter');
  await page.keyboard.type('- ');
  await expect(visual.getByRole('listitem')).toBeVisible();
  await page.keyboard.type('列表一项', { delay: 20 });
  await expect(visual.getByRole('listitem').filter({ hasText: '列表一项' })).toBeVisible();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.type('这里有', { delay: 20 });
  await page.keyboard.type('*强调*', { delay: 40 });
  await expect(page.locator('em').filter({ hasText: '强调' })).toBeVisible();
  await page.keyboard.type('。');

  await modes.getByRole('button', { name: '源码', exact: true }).click();
  const produced = await sourceText(page);
  expect(produced).toMatch(/^#{1,6} 章节标题\s*$/m);
  expect(produced).toMatch(/^([-*+]|\d+\.) 列表一项\s*$/m);
  expect(produced).toMatch(/(\*|_)强调\1/);
  expect(produced).not.toMatch(/<\s*\/?\s*(h1|ul|ol|li|em|strong|p|br)\b/i);

  await replaceSource(page, revised);
  await modes.getByRole('button', { name: '可视化', exact: true }).click();
  await expect(page.getByRole('heading', { name: '改过的标题' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: '另一项' })).toBeVisible();
  await expect(page.locator('em').filter({ hasText: '强调' })).toBeVisible();

  await modes.getByRole('button', { name: '源码', exact: true }).click();
  expect(await sourceText(page)).toBe(revised);

  await page.getByRole('button', { name: '保存' }).click();
  await expect.poll(() => saves.length).toBe(1);
  expect(saves[0].content).toBe(revised);
  expect(saves[0].ifMatch).toBe('"rev-0"');
  expect(saves[0].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  expect(saves[0].content).not.toMatch(/<\s*\/?\s*(h1|ul|ol|li|em|strong|p|br)\b/i);

  await closeEditor(page);
  await openPage(page, '章节');
  expect(await sourceText(page)).toBe(revised);
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
  await form.getByRole('group', { name: '格式' }).getByRole('button', { name: format, exact: true }).click();
  await form.getByLabel('标题').fill(title);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
}

async function showVisual(page: Page, modes: ReturnType<Page['getByRole']>) {
  const visualButton = modes.getByRole('button', { name: '可视化', exact: true });
  await visualButton.click();
  const editor = page.getByRole('textbox', { name: '正文' });
  const opened = await editor.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
  if (opened) return;
  // The dev server reloads once when it first optimizes Milkdown, which drops the open editor.
  await openPage(page, '章节');
  await page.getByRole('group', { name: '编辑模式' }).getByRole('button', { name: '可视化', exact: true }).click();
  await editor.waitFor({ state: 'visible' });
}

async function openPage(page: Page, title: string) {
  await page.getByRole('button', { name: title, exact: true }).click();
  await expect(page.getByRole('textbox', { name: '正文' })).toBeVisible();
}

async function closeEditor(page: Page) {
  await page.getByRole('button', { name: '返回' }).click();
  await expect(page.getByRole('form', { name: '按格式创建' })).toBeVisible();
}

async function sourceText(page: Page) {
  return page.getByRole('textbox', { name: '正文' }).evaluate((content) => {
    const node = content as HTMLElement & {
      cmTile?: { root?: { view?: { state: { doc: { toString: () => string } } } } };
    };
    return node.cmTile?.root?.view?.state.doc.toString() ?? '';
  });
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
