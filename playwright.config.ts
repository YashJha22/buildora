import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Mobile Automation Configuration for Buildora
 * Simulates real iOS Safari (iPhone 14) and Android Chrome (Pixel 7) mobile environments.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    /* 1. iOS Safari Emulation — iPhone 14 */
    {
      name: 'Mobile Safari (iPhone 14)',
      use: {
        ...devices['iPhone 14'],
        // Viewport: 390 x 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true
        browserName: 'webkit',
      },
    },

    /* 2. Android Chrome Emulation — Pixel 7 */
    {
      name: 'Mobile Chrome (Pixel 7)',
      use: {
        ...devices['Pixel 7'],
        // Viewport: 412 x 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true
        channel: 'chrome',
      },
    },
  ],

  /* Automatically boot local production preview server if not already running */
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --host 0.0.0.0',
    port: 4173,
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});
