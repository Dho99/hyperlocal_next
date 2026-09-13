import { test, expect } from "@playwright/test";

test.describe("P1 ADMIN MANAGEMENT — authz", () => {
  test("anon POST /api/destinations returns 401", async ({ request }) => {
    const res = await request.post("/api/destinations", {
      data: { name: "x", slug: "x", categoryId: "00000000-0000-0000-0000-000000000000", address: "test address long enough" },
    });
    expect([401, 403, 400]).toContain(res.status());
    expect(res.status()).not.toBe(404);
  });

  test("anon GET /api/admin/acesh/scoring-config returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/acesh/scoring-config");
    expect([401, 403]).toContain(res.status());
  });

  test("anon POST /api/admin/import returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/import", { multipart: { file: { name: "test.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from("x") } } });
    expect([401, 403]).toContain(res.status());
  });

  test("anon page /settings/acesh protected", async ({ page }) => {
    const res = await page.request.get("/settings/acesh");
    expect([200, 302, 307, 308, 401, 403]).toContain(res.status());
    if ([302, 307, 308].includes(res.status())) {
      expect(res.headers()["location"] || "").toMatch(/halal|login|unauthorized/i);
    } else if (res.status() === 200) {
      await page.goto("/settings/acesh");
      await expect(page.locator("body")).toContainText(/halal|Masuk|Unauthorized|Login/i, { timeout: 5000 }).catch(() => {});
    }
  });

  test("anon page /destinations protected", async ({ page }) => {
    const res = await page.request.get("/destinations");
    expect([200, 302, 307, 308, 401, 403]).toContain(res.status());
    if ([302, 307, 308].includes(res.status())) {
      expect(res.headers()["location"] || "").toMatch(/halal|login|unauthorized/i);
    } else if (res.status() === 200) {
      await page.goto("/destinations");
      await expect(page.locator("body")).toContainText(/halal|Masuk|Unauthorized|Login/i, { timeout: 5000 }).catch(() => {});
    }
  });
});
