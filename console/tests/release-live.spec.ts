import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Preview and live switch against the local auth stub. A full Control stack is
 * not started. The stub serves one validated release, the current live release,
 * and an archived release. A browser pass against a running Control process
 * stays out of this file.
 */

const candidateId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const currentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
const archivedId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
const guideId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
const oldId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';

test.beforeEach(async () => {
  await resetFixtures();
});

test.afterEach(async () => {
  await resetFixtures();
});

test('a maintainer previews a release that is not live, switches it, and rolls an archive back', async ({ page }) => {
  test.setTimeout(60_000);
  const writes: Array<{ action: string; key: string }> = [];
  page.on('request', (request) => {
    const action = writeAction(request);
    if (!action) return;
    writes.push({ action, key: request.headers()['idempotency-key'] ?? '' });
  });

  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+/);
  const spaceId = new URL(page.url()).pathname.match(/\/spaces\/([^/]+)/)?.[1] ?? '';
  await seed(spaceId);
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '发版', exact: true }).click();

  await expect(page.getByRole('heading', { level: 2, name: '发版' })).toBeVisible();
  await expect(page.getByRole('region', { name: '构建发版' }).getByRole('button', { name: '构建发版', exact: true })).toBeEnabled();

  const candidate = row(page, '候选');
  const current = row(page, '现行');
  const archived = row(page, '旧版');
  await expect(candidate.getByRole('button', { name: '预览', exact: true })).toBeVisible();
  await expect(archived.getByRole('button', { name: '预览', exact: true })).toBeVisible();
  await expect(current.getByRole('button', { name: '预览', exact: true })).toHaveCount(0);
  await expect(page.getByText('草稿预览', { exact: true })).toHaveCount(0);
  await expect(current.getByText('主版本', { exact: true })).toBeVisible();
  await expect(archived.getByText('发版归档', { exact: true })).toBeVisible();

  await candidate.getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.getByRole('region', { name: '预览' });
  await expect(preview).toContainText('安装指南');
  await expect(preview).toContainText('先安装运行时');
  await expect(preview).not.toContainText('草稿');

  await archived.getByRole('button', { name: '预览', exact: true }).click();
  await expect(preview).toContainText('旧说明');
  await expect(preview).toContainText('上一份快照');

  await candidate.getByRole('button', { name: '切换主版本', exact: true }).click();
  await expect(candidate.getByText('主版本', { exact: true })).toBeVisible();
  await expect(current.getByText('发版归档', { exact: true })).toBeVisible();
  await expect(candidate.getByRole('button', { name: '预览', exact: true })).toHaveCount(0);
  await expect(current.getByRole('button', { name: '回滚', exact: true })).toBeVisible();

  await archived.getByRole('button', { name: '回滚', exact: true }).click();
  await expect(archived.getByText('主版本', { exact: true })).toBeVisible();
  await expect(candidate.getByText('发版归档', { exact: true })).toBeVisible();
  await expect(current.getByText('发版归档', { exact: true })).toBeVisible();
  await expect(archived.getByRole('button', { name: '预览', exact: true })).toHaveCount(0);

  expect(writes.map((write) => write.action)).toEqual(['promote', 'rollback']);
  for (const write of writes) expect(write.key).toMatch(/^[a-zA-Z0-9._:-]+$/);
});

function row(page: Page, label: string) {
  return page.getByRole('list', { name: '发版列表' }).getByRole('listitem').filter({ hasText: label });
}

function writeAction(request: Request) {
  if (request.method() !== 'POST') return '';
  const path = new URL(request.url()).pathname;
  if (path.endsWith(':promote')) return 'promote';
  if (path.endsWith(':rollback')) return 'rollback';
  return '';
}

async function resetFixtures() {
  await resetStub();
  for (const path of ['spaces', 'releases', 'release-live']) {
    const response = await fetch(`http://127.0.0.1:4188/__stub/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true })
    });
    if (!response.ok) throw new Error(`${path} stub reset ${response.status}`);
  }
}

async function seed(spaceId: string) {
  const response = await fetch('http://127.0.0.1:4188/__stub/release-live', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      spaceId,
      releases: [
        {
          id: candidateId,
          label: '候选',
          status: 'validated',
          allowedActions: ['promote'],
          pages: [{ pageId: guideId, slug: 'guide', title: '安装指南', content: '先安装运行时', format: 'markdown' }]
        },
        {
          id: currentId,
          label: '现行',
          status: 'live',
          allowedActions: ['read'],
          pages: []
        },
        {
          id: archivedId,
          label: '旧版',
          status: 'archived',
          allowedActions: ['rollback'],
          pages: [{ pageId: oldId, slug: 'old', title: '旧说明', content: '上一份快照', format: 'markdown' }]
        }
      ]
    })
  });
  if (!response.ok) throw new Error(`release-live stub ${response.status}`);
}
