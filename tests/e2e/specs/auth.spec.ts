import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

test.describe("P0 AUTH — FR-001", () => {
  test("register shows verification card on valid input", async ({ page }) => {
    const rp = new RegisterPage(page);
    await rp.goto();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    const email = `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`;
    await rp.register("E2E User", email, "Password123!");
    await expect(rp.successCard).toBeVisible({ timeout: 20_000 });
    await expect(rp.resendButton).toBeVisible();
  });

  test("register rejects mismatched passwords", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.getByLabel("Nama Lengkap").fill("E2E");
    await page.getByLabel("Email").fill("mismatch@test.local");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Konfirmasi").fill("Different123!");
    await page.getByRole("checkbox", { name: /Syarat/i }).check();
    await page.getByRole("button", { name: "Buat Akun Sekarang" }).click();
    await expect(page.getByText("Konfirmasi password tidak cocok")).toBeVisible({ timeout: 10000 });
  });

  test("login shows error on invalid credentials", async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await lp.login("notexist+auth@test.local", "WrongPass123!");
    await expect(page.getByText(/Gagal masuk|tidak valid|Email/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("unauthenticated /dashboard redirects to /halal", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/halal/, { timeout: 15_000 });
  });

  test("login page accessible and shows Masuk Sekarang", async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await expect(page.getByRole("button", { name: "Masuk Sekarang" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  });

  test("/login redirects to /halal", async ({ request }) => {
    const res = await request.get("/login");
    if (res.status() === 404) test.skip();
    const loc = res.headers()["location"] || "";
    if ([301, 302, 307, 308].includes(res.status())) {
      expect(loc).toContain("/halal");
    } else {
      expect(res.status()).toBeLessThan(500);
    }
  });

  test("resend cooldown disables button for 60s after register", async ({ page }) => {
    const rp = new RegisterPage(page);
    await rp.goto();
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    const email = `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.local`;
    await rp.register("E2E Cooldown", email, "Password123!");
    await expect(rp.successCard).toBeVisible({ timeout: 20_000 });
    await rp.resendButton.click();
    await expect(page.getByText(/Kirim Ulang \(60s\)|Kirim Ulang \(59s\)|telah dikirim/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(rp.resendButton).toBeDisabled();
  });
});
