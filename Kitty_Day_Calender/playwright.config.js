import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const isRemote = BASE_URL !== 'http://localhost:5173'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: BASE_URL,
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Only spin up the dev server when testing locally
  ...(isRemote ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30000,
    },
  }),
})
