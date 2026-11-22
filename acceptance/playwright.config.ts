import { defineConfig } from '@playwright/test';

export default defineConfig({
  forbidOnly: true,
  workers: 1,
  testDir: './e2e',
  projects: [
    { name: 'delivery', testMatch: 'delivery.spec.ts' },
    { name: 'private', testMatch: 'private-reader.spec.ts' },
    { name: 'vfs', testMatch: 'mounted-read.spec.ts' },
  ],
});
