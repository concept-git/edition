import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  forbidOnly: true,
  retries: 0,
  outputDir: './test-results',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4181',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath: process.env.EDITION_CHROMIUM_EXECUTABLE },
  },
  webServer: {
    command: `node node_modules/vite/bin/vite.js ${process.env.EDITION_CONSOLE_PREVIEW === '1' ? 'preview' : ''} --host 127.0.0.1 --port 4181 --strictPort`,
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    url: 'http://127.0.0.1:4181/console/',
    reuseExistingServer: !process.env.CI,
  },
});
