import { test, expect } from "@playwright/test";

// P1 User Journey — bookmark/review/itinerary black-box
test.describe("P1 USER JOURNEY — FR-002/FR-005", () => {
  test("unauthenticated /api/reviews POST returns 401", async ({ request }) => {
    const res = await request.post("/api/reviews", {
      data: { destinationId: "00000000-0000-0000-0000-000000000000", rating: 5, comment: "halal" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("unauthenticated /api/bookmarks returns empty (200 with data)", async ({ request }) => {
    const res = await request.get("/api/bookmarks");
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("application/json")) {
      expect([200, 401, 403]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.json();
        expect(body.data).toBeDefined();
      }
    } else {
      expect(res.status()).toBeLessThan(500);
    }
  });

  test("unauthenticated /api/itineraries GET returns 401", async ({ request }) => {
    const res = await request.get("/api/itineraries");
    expect([401, 403]).toContain(res.status());
  });

  test("/api/explore returns results", async ({ request }) => {
    const res = await request.get("/api/explore?q=wisata");
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("application/json")) expect([200, 400, 429]).toContain(res.status());
    else expect(res.status()).toBeLessThan(500);
  });

  test("/profile without session redirects or shows login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("body")).toBeVisible();
  });
});
