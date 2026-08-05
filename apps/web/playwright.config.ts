import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "on",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: [
    {
      command:
        "pnpm --dir ../.. --filter @my-learning/domain build && pnpm --dir ../.. --filter @my-learning/contracts build && pnpm --dir ../.. --filter @my-learning/database build && node e2e/prepare-database.mjs && pnpm --dir ../.. --filter @my-learning/api exec tsx src/server.ts",
      url: "http://127.0.0.1:3001/api/v1/health",
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        API_HOST: "127.0.0.1",
        API_PORT: "3001",
        DATABASE_URL: "file:./data/e2e.db",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
      },
    },
    {
      command: "pnpm --dir ../.. --filter @my-learning/web dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001" },
    },
  ],
});
