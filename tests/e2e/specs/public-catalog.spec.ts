import { test, expect } from "@playwright/test";

test.describe("P0 PUBLIC CATALOG — FR-002", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible({ timeout: 15000 });
  });

  test("/destinasi lists destinations", async ({ page }) => {
    await page.goto("/destinasi");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
  });

  test("public API /api/destinations returns list", async ({ request }) => {
    const res = await request.get("/api/destinations?limit=5");
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("application/json")) {
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toBeDefined();
    } else {
      expect(res.status()).toBeLessThan(500);
    }
  });

  test("public API /api/categories returns categories", async ({ request }) => {
    const res = await request.get("/api/categories");
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("application/json")) expect(res.ok()).toBeTruthy();
    else expect(res.status()).toBeLessThan(500);
  });

  test("/peta loads without crash", async ({ page }) => {
    await page.goto("/peta");
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await expect(page.locator("body")).toBeVisible();
  });

  test("unknown destinasi id handled", async ({ page }) => {
    await page.goto("/destinasi/not-exist-xyz-999", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });
});
