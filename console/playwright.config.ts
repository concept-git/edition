import { defineConfig, devices } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const consolePort = process.env.EDITION_CONSOLE_PORT ?? '4177';
const stubPort = process.env.AUTH_STUB_PORT ?? '4188';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${consolePort}`,
    ...devices['Desktop Chrome']
  },
  webServer: [
    {
      command: 'node tests/auth-stub.mjs',
      url: `http://127.0.0.1:${stubPort}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: { ...process.env, AUTH_STUB_PORT: stubPort }
    },
    {
      command: `corepack pnpm@11.10.0 dev --host 127.0.0.1 --port ${consolePort} --strictPort`,
      url: `http://127.0.0.1:${consolePort}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        EDITION_CONTROL_ORIGIN: `http://127.0.0.1:${stubPort}`
      }
    }
  ]
});
