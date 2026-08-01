import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "on",
  },
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
  ],
  webServer: {
    command: "pnpm --dir ../.. --filter @my-learning/web dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      API_HOST: "127.0.0.1",
      API_PORT: "3001",
      DATABASE_URL: "file:./data/my-learning.db",
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
    },
  },
});
