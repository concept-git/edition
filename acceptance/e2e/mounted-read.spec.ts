import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';
import { prepareIndependentDelivery } from './support/delivery/prepare';
import { deliveryOrigin } from './support/environment';

test('the Python file client reads the released page as original UTF-8 bytes', async ({ request }) => {
  test.setTimeout(120_000);
  const site = await prepareIndependentDelivery(request);
  const script = fileURLToPath(new URL('./support/read-release.py', import.meta.url));
  const { stdout } = await promisify(execFile)(process.env.EDITION_VFS_PYTHON!, [script, deliveryOrigin, site.host]);
  expect(stdout).toBe('检索正文：Edition 使用指南。');
});
