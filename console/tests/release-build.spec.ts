import { expect, test, type Page, type Request } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Release build against the local auth stub. A full Control stack is not
 * started. The stub returns the four build outcomes and can fail the following
 * list read. A browser pass against a running Control process stays out of this file.
 */

const explanations = {
  promoted: '已更新主版本，站点仍需完成上线。',
  unchanged: '内容与主版本一致。',
  skipped: '未生成新发版。已进版内容为空，或与主版本一致。',
  held: '主版本保留。'
} as const;

test.beforeEach(async () => {
  await resetFixtures();
});

test.afterEach(async () => {
  await resetFixtures();
});

test('a maintainer builds a release and keeps the confirmed result when the list refresh fails', async ({ page }) => {
  test.setTimeout(60_000);
  const keys: string[] = [];
  page.on('request', (request) => {
    if (isBuild(request)) keys.push(request.headers()['idempotency-key'] ?? '');
  });

  await signIn(page);
  await page.goto('/content/spaces');
  const form = page.getByRole('form', { name: '创建空间' });
  await form.getByLabel('名称').fill('手册');
  await form.getByRole('button', { name: '创建', exact: true }).click();
  await page.getByRole('link', { name: '手册' }).click();
  await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: '发版', exact: true }).click();

  const panel = page.getByRole('region', { name: '构建发版' });
  const build = panel.getByRole('button', { name: '构建发版', exact: true });
  await expect(page.getByRole('heading', { level: 2, name: '发版' })).toBeVisible();
  await expect(page.getByText('尚无发版', { exact: true })).toBeVisible();
  await expect(build).toBeEnabled();

  await arm({ delayMs: 1200, outcomes: ['promoted'] });
  const started = page.waitForRequest(isBuild);
  await build.click();
  await started;
  await expect(build).toBeDisabled();
  expect(keys).toHaveLength(1);
  expect(keys[0]).toMatch(/^[a-zA-Z0-9._:-]+$/);

  const result = panel.getByRole('status', { name: '构建结果' });
  await expect(build).toBeEnabled();
  await expect(result).toContainText('promoted');
  await expect(result).toContainText(explanations.promoted);
  await expect(panel.getByRole('list', { name: '校验报告' })).toHaveCount(0);
  await expect(page.getByRole('list', { name: '发版列表' })).toContainText('第 1 份发版');
  await expect(page.getByText('尚无发版', { exact: true })).toHaveCount(0);

  const colors = [await background(result)];
  for (const outcome of ['unchanged', 'skipped', 'held'] as const) {
    await arm({ outcomes: [outcome] });
    await build.click();
    await expect(result).toContainText(outcome);
    await expect(result).toContainText(explanations[outcome]);
    colors.push(await background(result));
  }
  expect(new Set(colors).size).toBe(4);
  await expect(panel.getByRole('list', { name: '校验报告' })).toContainText('缺少必填字段 title');
  expect(keys).toHaveLength(4);
  expect(new Set(keys).size).toBe(4);

  await arm({ failLists: 1, outcomes: ['promoted'] });
  await build.click();
  await expect(result).toContainText('promoted');
  await expect(result).toContainText(explanations.promoted);
  await expect(page.getByRole('alert').filter({ hasText: 'trace-release-list' })).toBeVisible();
  await expect(result).toContainText(explanations.promoted);
  await expect(page.getByRole('list', { name: '发版列表' })).toContainText('第 1 份发版');
  await expect(page.getByText('尚无发版', { exact: true })).toHaveCount(0);
  await expect(panel.getByRole('list', { name: '校验报告' })).toHaveCount(0);

  await arm({ failBuilds: 1 });
  await build.click();
  await expect(panel.getByRole('alert')).toContainText('trace-release-build');
  await expect(result).toContainText(explanations.promoted);
  await panel.getByRole('button', { name: '重试', exact: true }).click();
  await expect(result).toContainText('promoted');
  await expect(panel.getByRole('alert')).toHaveCount(0);
  expect(keys).toHaveLength(7);
  expect(keys[5]).toBe(keys[6]);
  expect(keys[6]).not.toBe(keys[4]);
  expect(keys[6]).toMatch(/^[a-zA-Z0-9._:-]+$/);
});

async function background(result: ReturnType<Page['getByRole']>) {
  return result.evaluate((element) => getComputedStyle(element).backgroundColor);
}

async function resetFixtures() {
  await resetStub();
  for (const path of ['spaces', 'releases']) {
    const response = await fetch(`http://127.0.0.1:4188/__stub/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true })
    });
    if (!response.ok) throw new Error(`${path} stub reset ${response.status}`);
  }
}

async function arm(body: Record<string, unknown>) {
  const response = await fetch('http://127.0.0.1:4188/__stub/releases', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`release stub ${response.status}`);
}

function isBuild(request: Request) {
  return request.method() === 'POST' && /\/releases:build$/.test(new URL(request.url()).pathname);
}
