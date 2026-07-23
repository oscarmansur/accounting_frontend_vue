// @ts-check
import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for the Accounting Admin Panel.
 *
 * - Runs Vite dev server automatically via `webServer`
 * - Tests use a real backend at localhost:8000
 * - Chromium only for speed during development
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,         // Sequential — tests share state (login context)
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,                   // Single worker — avoids DB race conditions
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],
    timeout: 30_000,
    expect: {
        timeout: 10_000,
    },

    use: {
        baseURL: 'http://localhost:5174',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10_000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Start the Vite dev server before tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5174',
        reuseExistingServer: true,
        timeout: 30_000,
    },
})
