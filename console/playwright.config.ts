import { defineConfig, devices } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4177',
    ...devices['Desktop Chrome']
  },
  webServer: [
    {
      command: 'node tests/auth-stub.mjs',
      url: 'http://127.0.0.1:4188/health',
      reuseExistingServer: false,
      timeout: 30_000
    },
    {
      command: 'corepack pnpm@11.10.0 dev --host 127.0.0.1 --port 4177 --strictPort',
      url: 'http://127.0.0.1:4177',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        EDITION_CONTROL_ORIGIN: 'http://127.0.0.1:4188'
      }
    }
  ]
});
