import { defineConfig, devices } from '@playwright/test';

// Serves the repo root (parent of tests/) as a static site, then runs the specs against it.
// The site is zero-dependency static HTML, so a plain http.server is all we need.
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'python -m http.server 8799 --directory ..',
    port: 8799,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:8799',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
