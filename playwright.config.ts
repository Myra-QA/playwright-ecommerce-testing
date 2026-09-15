import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    timeout: 30_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'html',
    webServer: {
        command: 'node mock-api/server.mjs',
        url: 'http://localhost:3100/health',
        reuseExistingServer: false

    },
    use: {
        baseURL: 'https://www.saucedemo.com/',
        testIdAttribute: 'data-test',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',

    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testMatch: '**/ui/**/*.spec.ts'
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: '**/ui/**/*.spec.ts'
        },

        ...(process.env.CI ? [{
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testMatch: '**/ui/**/*.spec.ts'
        }] : [] ),
        
        {
            name: 'api',
            testMatch: '**/api/**/*.spec.ts',
            use: {
                baseURL: 'http://localhost:3100',
            },
        },
    ]
})