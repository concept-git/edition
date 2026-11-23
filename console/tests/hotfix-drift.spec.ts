import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Hotfix and drift against the local auth stub. A full Control stack is not
 * started. Saving an existing page in a synced space publishes a release and
 * records drift. A later bundle that would overwrite those pages stays pending
 * until it is confirmed. An authored space rejects a whole-bundle import.
 */

test.beforeEach(async () => {
  await resetFixtures();
});

test.afterEach(async () => {
  await resetFixtures();
});

test('saving a synced page publishes a release, and the next overwrite waits for confirmation', async ({ page }) => {
  test.setTimeout(60_000);
  const saves: Array<{ ifMatch: string; key: string; intent: string | undefined }> = [];
  const approvals: string[] = [];
  page.on('request', (request) => {
    if (isEdit(request)) {
      const body = request.postDataJSON() as { intent?: string };
      saves.push({
        ifMatch: request.headers()['if-match'] ?? '',
        key: request.headers()['idempotency-key'] ?? '',
        intent: body.intent
      });
    }
    if (isApprove(request)) approvals.push(request.headers()['idempotency-key'] ?? '');
  });

  await openSpace(page, 'synced', '镜像');
  await createPage(page, '说明');
  await openPage(page, '说明');
  await replaceSource(page, '紧急改正还在。');
  await page.getByRole('button', { name: '保存' }).click();

  await expect.poll(() => saves.length).toBe(1);
  expect(saves[0].intent).toBe('hotfix');
  expect(saves[0].ifMatch).toBe('"rev-0"');
  expect(saves[0].key).toMatch(/^[a-zA-Z0-9._:-]+$/);
  const editor = page.getByRole('region', { name: '正文编辑' });
  await expect(editor.getByRole('status', { name: '热修结果' })).toContainText('已发版');
  await expect(editor.getByRole('status', { name: '热修结果' })).toContainText('漂移');

  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '发版', exact: true }).click();
  const releases = page.getByRole('list', { name: '发版列表' });
  await expect(releases.getByRole('listitem')).toHaveCount(1);
  await expect(releases.getByRole('listitem')).toContainText('主版本');

  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '导入', exact: true }).click();
  const upload = page.getByRole('form', { name: '导入发版包' });
  await upload.getByLabel('发版包', { exact: true }).setInputFiles('tests/fixtures/guide.zip');
  await upload.getByRole('button', { name: '导入', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('待确认');

  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '发版', exact: true }).click();
  const pending = releases.getByRole('listitem').filter({ hasText: '待确认' });
  await expect(pending).toBeVisible();
  await expect(pending.getByText('主版本', { exact: true })).toHaveCount(0);
  await expect(pending).toContainText('确认前不能成为主版本');
  await expect(pending.getByRole('button', { name: '设为主版本', exact: true })).toBeDisabled();
  const label = pendingLabel(await pending.innerText());
  await pending.getByRole('button', { name: '确认', exact: true }).click();
  await expect.poll(() => approvals.length).toBe(1);
  expect(approvals[0]).toMatch(/^[a-zA-Z0-9._:-]+$/);

  const confirmed = releases.getByRole('listitem').filter({ hasText: label });
  await expect(confirmed).toContainText('主版本');
  await expect(confirmed).not.toContainText('待确认');
  await expect(confirmed.getByRole('button', { name: '设为主版本', exact: true })).toHaveCount(0);
});

test('an authored space rejects a whole-bundle import and says why', async ({ page }) => {
  test.setTimeout(45_000);
  await openSpace(page, 'authored', '手册');
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '导入', exact: true }).click();
  const upload = page.getByRole('form', { name: '导入发版包' });
  await upload.getByLabel('发版包', { exact: true }).setInputFiles('tests/fixtures/guide.zip');
  await upload.getByRole('button', { name: '导入', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('手写空间拒绝整体导入');
  await expect(page.getByRole('alert')).toContainText('界面创作');
  await expect(page.getByRole('status')).toHaveCount(0);
});

async function openSpace(page: Page, mode: 'authored' | 'synced', name: string) {
  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByRole('group', { name: '来源模式' }).getByRole('button', { name: mode, exact: true }).click();
  await form.getByLabel('名称').fill(name);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+\/pages$/);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
}

async function createPage(page: Page, title: string) {
  const form = page.getByRole('form', { name: '按格式创建' });
  await form.getByRole('group', { name: '格式' }).getByRole('button', { name: 'Markdown', exact: true }).click();
  await form.getByLabel('标题').fill(title);
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
}

async function openPage(page: Page, title: string) {
  await page.getByRole('button', { name: title, exact: true }).click();
  await expect(page.getByRole('textbox', { name: '正文' })).toBeVisible();
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

function pendingLabel(text: string) {
  const label = text.match(/第\s*\d+\s*份发版/);
  if (!label) throw new Error(`release label missing from ${text}`);
  return label[0];
}

async function resetFixtures() {
  await resetStub();
  for (const path of ['spaces', 'pages', 'releases', 'imports']) {
    const response = await fetch(`http://127.0.0.1:4188/__stub/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true })
    });
    if (!response.ok) throw new Error(`${path} stub reset ${response.status}`);
  }
}

function isEdit(request: Request) {
  return request.method() === 'PUT' && /\/pages\/[^/]+\/content$/.test(new URL(request.url()).pathname);
}

function isApprove(request: Request) {
  return request.method() === 'POST' && /\/releases\/[^/]+:approve$/.test(new URL(request.url()).pathname);
}
