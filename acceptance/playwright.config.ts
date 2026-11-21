import { defineConfig } from '@playwright/test';

export default defineConfig({
  forbidOnly: true,
  workers: 1,
  testDir: './e2e',
  projects: [
    { name: 'delivery', testMatch: 'delivery.spec.ts' },
    { name: 'private', testMatch: 'private-reader.spec.ts' },
    { name: 'vfs', testMatch: 'mounted-read.spec.ts' },
    { name: 'console', testMatch: 'control-console.spec.ts', use: { ignoreHTTPSErrors: true, launchOptions: { args: ['--host-resolver-rules=MAP *.acme.test 127.0.0.1', '--no-proxy-server'], executablePath: process.env.EDITION_CHROMIUM_EXECUTABLE } } },
  ],
});
