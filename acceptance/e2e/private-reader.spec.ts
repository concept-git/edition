import { expect, test } from '@playwright/test';
import { prepareIndependentDelivery } from './support/delivery/prepare';

test('revoking anonymous access hides a previously readable page', async ({ request }) => {
  test.setTimeout(120_000);
  const site = await prepareIndependentDelivery(request);
  const page = '/docs/start';
  expect((await site.read(page)).status()).toBe(200);
  await site.revokeAnonymous();
  await expect.poll(async () => (await site.read(page)).status()).toBe(403);
});
