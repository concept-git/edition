import { expect, test } from '@playwright/test';
import { prepareIndependentDelivery } from './support/delivery/prepare';

test('published search results lead readers to the matching space', async ({ request }) => {
  test.setTimeout(120_000);
  const site = await prepareIndependentDelivery(request);
  await expect.poll(async () => {
    const response = await site.read('/api/content/search?q=检索');
    if (!response.ok()) return [];
    return (await response.json()).hits.map((hit: { path: string }) => hit.path);
  }, { timeout: 30_000 }).toContain('/docs/start');
  const page = await site.read('/docs/start');
  expect(page.status()).toBe(200);
  expect(await page.text()).toContain('Edition 使用指南');
});
