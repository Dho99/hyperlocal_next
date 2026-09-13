import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e/specs",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 4,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: process.env as Record<string, string>,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
