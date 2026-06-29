import { defineConfig, devices } from "@playwright/test";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: isCi ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @fandom-harbor/web dev --hostname 127.0.0.1 --port 3000",
      port: 3000,
      reuseExistingServer: !isCi,
    },
    {
      command: "pnpm --filter @fandom-harbor/admin dev --hostname 127.0.0.1 --port 3001",
      port: 3001,
      reuseExistingServer: !isCi,
    },
    {
      command: "pnpm --filter @fandom-harbor/docs dev --hostname 127.0.0.1 --port 3002",
      port: 3002,
      reuseExistingServer: !isCi,
    },
  ],
});
