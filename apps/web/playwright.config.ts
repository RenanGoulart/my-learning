import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "on",
  },
  projects: [
    {
      name: "desktop",
      use: devices["Desktop Chrome"],
    },
    { name: "mobile", use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    {
      command:
        "pnpm --dir ../.. --filter @my-learning/database build && pnpm --dir ../.. --filter @my-learning/api dev",
      url: "http://127.0.0.1:3001/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
      API_HOST: "127.0.0.1",
      API_PORT: "3001",
      DATABASE_URL: "file:./data/e2e.db",
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
      },
    },
    { command: "pnpm --dir ../.. --filter @my-learning/web dev", url: "http://127.0.0.1:3000", reuseExistingServer: !process.env.CI, timeout: 120_000, env: { NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001" } },
  ],
});
