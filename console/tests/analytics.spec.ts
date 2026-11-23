import { expect, test, type Page } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Visit trend and search ranking against the local auth stub.
 * A real Control browser pass stays out until the console can reach Control.
 * Nulls, pre-retention zeros, and buckets after a stale update are gaps.
 * no_data is an empty state even when the payload is a flat zero series.
 */

test.beforeEach(async ({ page }) => {
  await resetStub();
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await signIn(page);
  await ensureSite(page);
});

test.afterEach(async () => {
  await arm('no_data');
});

test('the visit chart shows returned buckets and rankings show returned entries', async ({ page }) => {
  await arm('series');
  await openVisits(page);

  const chart = page.getByRole('figure', { name: '访问趋势' });
  await expect(chart).toBeVisible();
  const buckets = chart.getByRole('list', { name: '时间桶' });
  await expect(buckets.getByRole('listitem')).toHaveText(['11月20日 12', '11月21日 —', '11月22日 8']);
  await expect(buckets).not.toContainText('11月21日 0');
  const marks = chart.locator('svg [data-pv]');
  await expect(marks).toHaveCount(2);
  await expect(marks.nth(0)).toHaveAttribute('data-pv', '12');
  await expect(marks.nth(1)).toHaveAttribute('data-pv', '8');

  const pages = page.getByRole('list', { name: '页面排行' });
  await expect(pages.getByRole('listitem')).toHaveText(['/guide 9', '/start 4']);

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '搜索统计', exact: true }).click();
  await expect(page).toHaveURL('/analytics/search');
  const ranking = page.getByRole('list', { name: '搜索统计' });
  await expect(ranking.getByRole('listitem')).toHaveText(['安装 6', '域名 2']);
});

test('no_data, partial, and delayed stay distinct, and no events is an empty state', async ({ page }) => {
  await arm('partial');
  await openVisits(page);
  await expect(page.getByRole('status')).toHaveText('部分采集');
  const partial = page.getByRole('figure', { name: '访问趋势' });
  await expect(partial.getByRole('list', { name: '时间桶' }).getByRole('listitem')).toHaveText(['11月21日 12', '11月22日 8']);
  await expect(partial).not.toContainText('11月20日');
  await expect(partial.locator('svg [data-pv="0"]')).toHaveCount(0);
  await expect(page.getByText('无采集', { exact: true })).toHaveCount(0);
  await expect(page.getByText('采集延迟', { exact: true })).toHaveCount(0);

  await arm('delayed');
  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '搜索统计', exact: true }).click();
  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '访问趋势', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('采集延迟');
  const delayed = page.getByRole('figure', { name: '访问趋势' });
  await expect(delayed.getByRole('list', { name: '时间桶' }).getByRole('listitem')).toHaveText(['11月20日 5', '11月21日 7']);
  await expect(delayed).not.toContainText('11月22日');
  await expect(delayed.locator('svg [data-pv="0"]')).toHaveCount(0);
  await expect(page.getByText('部分采集', { exact: true })).toHaveCount(0);
  await expect(page.getByText('无采集', { exact: true })).toHaveCount(0);

  await arm('no_data');
  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '搜索统计', exact: true }).click();
  await expect(page).toHaveURL('/analytics/search');
  await expect(page.getByRole('status')).toHaveText('无采集');
  await expect(page.getByText('没有数据', { exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: '搜索统计' })).toHaveCount(0);

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '访问趋势', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('无采集');
  await expect(page.getByText('没有数据', { exact: true })).toBeVisible();
  await expect(page.getByRole('figure', { name: '访问趋势' })).toHaveCount(0);
  await expect(page.locator('[data-region="canvas"] svg')).toHaveCount(0);
  await expect(page.getByText('部分采集', { exact: true })).toHaveCount(0);
  await expect(page.getByText('采集延迟', { exact: true })).toHaveCount(0);
});

test('a failed stats query keeps the error instead of an empty chart', async ({ page }) => {
  await arm('error');
  await openVisits(page);
  await expect(page.getByRole('alert')).toContainText('trace-analytics-24');
  await expect(page.getByText('没有数据', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('figure', { name: '访问趋势' })).toHaveCount(0);
  await expect(page.locator('[data-region="canvas"] svg')).toHaveCount(0);
});

async function openVisits(page: Page) {
  await page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '访问统计', exact: true }).click();
  await expect(page).toHaveURL('/analytics/visits');
}

async function ensureSite(page: Page) {
  await page.goto('/sites');
  if ((await page.getByRole('link', { name: '统计站', exact: true }).count()) > 0) return;
  await page.getByLabel('名称').fill('统计站');
  await page.getByRole('button', { name: '创建站点' }).click();
  await expect(page.getByRole('link', { name: '统计站', exact: true }).first()).toBeVisible();
}

async function arm(mode: string) {
  const response = await fetch('http://127.0.0.1:4188/__stub/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok && response.status !== 204) throw new Error(`analytics stub ${response.status}`);
}
