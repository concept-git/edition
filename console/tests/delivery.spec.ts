import { expect, test, type Page } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Per-site rollout against the local auth stub. A full Control stack is not
 * started. Choosing the live release reveals each mounted site's own delivery
 * status. A browser pass against a running Control process stays out of this file.
 */

const releaseId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa16';
const previousReleaseId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa15';
const runningSiteId = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
const failedSiteId = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2';
const onlineSiteId = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3';

test.beforeEach(async () => {
  await resetFixtures();
});

test.afterEach(async () => {
  await resetFixtures();
});

test('after a live release is chosen each mounted site shows its own rollout', async ({ page }) => {
  test.setTimeout(60_000);
  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await expect(page).toHaveURL(/\/content\/spaces\/[^/]+/);
  const spaceId = new URL(page.url()).pathname.match(/\/spaces\/([^/]+)/)?.[1] ?? '';
  await seedRelease(spaceId);
  await seedDelivery(spaceId);
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '发版', exact: true }).click();

  await expect(page.getByRole('heading', { level: 2, name: '发版' })).toBeVisible();
  await expect(page.getByRole('region', { name: '逐站交付' })).toHaveCount(0);

  const candidate = page.getByRole('list', { name: '发版列表' }).getByRole('listitem').filter({ hasText: '候选' });
  await candidate.getByRole('button', { name: '切换主版本', exact: true }).click();
  await expect(candidate.getByText('主版本', { exact: true })).toBeVisible();

  const progress = page.getByRole('list', { name: '上线进度' });
  await expect(progress.getByRole('listitem')).toHaveCount(3);

  const running = row(page, '手册站');
  await expect(running).toContainText('正在上线');
  await expect(running.getByText('已上线', { exact: true })).toHaveCount(0);

  const failed = row(page, '文档站');
  await expect(failed).toContainText('旧的完整版本仍在服务');
  await expect(failed.getByText('已上线', { exact: true })).toHaveCount(0);

  await expect(row(page, '帮助站').getByText('已上线', { exact: true })).toBeVisible();
});

function row(page: Page, name: string) {
  return page.getByRole('list', { name: '上线进度' }).getByRole('listitem').filter({ hasText: name });
}

async function resetFixtures() {
  await resetStub();
  for (const path of ['spaces', 'releases', 'release-live', 'delivery']) {
    const response = await fetch(`http://127.0.0.1:4188/__stub/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true })
    });
    if (!response.ok) throw new Error(`${path} stub reset ${response.status}`);
  }
}

async function seedRelease(spaceId: string) {
  const response = await fetch('http://127.0.0.1:4188/__stub/release-live', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      spaceId,
      releases: [
        {
          id: releaseId,
          label: '候选',
          status: 'validated',
          allowedActions: ['promote'],
          pages: []
        }
      ]
    })
  });
  if (!response.ok) throw new Error(`release-live stub ${response.status}`);
}

async function seedDelivery(spaceId: string) {
  const response = await fetch('http://127.0.0.1:4188/__stub/delivery', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      spaceId,
      sites: [
        site(runningSiteId, '手册站', 'guide', 'running', false, false, previousReleaseId),
        site(failedSiteId, '文档站', 'docs', 'failed', false, true, previousReleaseId),
        site(onlineSiteId, '帮助站', 'help', 'completed', true, true, releaseId)
      ]
    })
  });
  if (!response.ok) throw new Error(`delivery stub ${response.status}`);
}

function site(siteId: string, name: string, slug: string, status: string, successful: boolean, terminal: boolean, currentReleaseId: string) {
  return {
    siteId,
    name,
    slug,
    delivery: {
      status,
      successful,
      terminal,
      targetEpoch: 4,
      onlineEpoch: successful ? 4 : 3,
      nextPollAfterSeconds: terminal ? 0 : 30,
      desiredReleaseId: releaseId,
      currentReleaseId
    }
  };
}
