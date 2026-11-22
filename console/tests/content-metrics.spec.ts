import { expect, test, type Locator } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Content home against the local auth stub. A real Control browser pass stays
 * out of this file until the console can reach a running Control process.
 * The stub only supplies the list shapes from the management contract.
 */

test.beforeEach(async ({ page }) => {
  await resetStub();
  await arm('data');
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await signIn(page);
});

test.afterEach(async () => {
  await arm('data');
});

test('content home shows member, page, and ready-to-release counts with yesterday', async ({ page }) => {
  await page.goto('/content');
  const region = page.getByRole('region', { name: '内容使用情况' });
  await expect(region).toBeVisible();
  await expect(figure(region, '成员').locator('strong')).toHaveText('2');
  await expect(figure(region, '成员')).toContainText('昨日 1');
  await expect(figure(region, '页面').locator('strong')).toHaveText('5');
  await expect(figure(region, '页面')).toContainText('昨日 —');
  await expect(figure(region, '已进版页面').locator('strong')).toHaveText('3');
  await expect(figure(region, '已进版页面')).toContainText('昨日 1');
  const text = await page.locator('[data-region="canvas"]').innerText();
  for (const word of ['席位', '套餐', 'Credit', '协作文档']) {
    expect(text).not.toContain(word);
  }
});

test('a measured zero stays zero and a missing page-creation series stays a gap', async ({ page }) => {
  await arm('zeros');
  await page.goto('/content');
  const region = page.getByRole('region', { name: '内容使用情况' });
  await expect(page.getByText('没有数据', { exact: true })).toHaveCount(0);
  await expect(figure(region, '成员').locator('strong')).toHaveText('0');
  await expect(figure(region, '成员')).toContainText('昨日 0');
  await expect(figure(region, '页面').locator('strong')).toHaveText('0');
  await expect(figure(region, '页面')).toContainText('昨日 —');
  await expect(figure(region, '已进版页面').locator('strong')).toHaveText('0');
  await expect(figure(region, '已进版页面')).toContainText('昨日 0');
});

test('a missing count is a gap and an absent payload is an empty state', async ({ page }) => {
  await arm('gap');
  await page.goto('/content');
  const region = page.getByRole('region', { name: '内容使用情况' });
  await expect(figure(region, '页面').locator('strong')).toHaveText('—');
  await expect(figure(region, '页面')).toContainText('昨日 —');
  await expect(figure(region, '已进版页面').locator('strong')).toHaveText('2');
  await expect(figure(region, '已进版页面')).toContainText('昨日 —');
  await expect(figure(region, '已进版页面')).not.toContainText('昨日 0');

  await arm('empty');
  await page.goto('/content');
  await expect(page.getByText('没有数据', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: '内容使用情况' })).toHaveCount(0);
  await expect(page.locator('[data-region="canvas"] strong')).toHaveCount(0);
});

test('a failed query shows the trace id instead of an empty state or zeros', async ({ page }) => {
  await arm('error');
  await page.goto('/content');
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('trace-content-04');
  await expect(page.getByText('没有数据', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: '内容使用情况' })).toHaveCount(0);
  await expect(page.locator('[data-region="canvas"] strong')).toHaveCount(0);

  await arm('data');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('region', { name: '内容使用情况' })).toBeVisible();
  await expect(figure(page.getByRole('region', { name: '内容使用情况' }), '成员').locator('strong')).toHaveText('2');
});

async function arm(mode: string) {
  const response = await fetch('http://127.0.0.1:4188/__stub/content-metrics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!response.ok && response.status !== 204) throw new Error(`content metrics ${response.status}`);
}

function figure(region: Locator, label: string) {
  return region.getByText(label, { exact: true }).locator('xpath=..');
}
