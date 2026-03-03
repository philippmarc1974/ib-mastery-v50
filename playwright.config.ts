import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  workers: 1,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'local',
      testMatch: 'full-app.spec.ts',
      use: { baseURL: 'http://localhost:3000' },
    },
    {
      name: 'live',
      testMatch: 'build-c-live.spec.ts',
    },
  ],
  webServer: {
    command: 'bash scripts/start-test-server.sh',
    port: 3000,
    timeout: 30000,
    reuseExistingServer: true,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'tests/results/test-results.json' }],
  ],
});
