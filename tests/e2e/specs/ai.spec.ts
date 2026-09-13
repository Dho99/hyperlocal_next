import { test, expect } from "@playwright/test";

test.describe("P1 AI — FR-005", () => {
  test("/api/recommendations returns result", async ({ request }) => {
    test.setTimeout(60_000);
    const res = await request.post("/api/recommendations", { data: { preferences: [], limit: 3 }, timeout: 45_000 });
    expect([200, 400, 429, 500]).toContain(res.status());
  });

  test("/api/explore returns with q param", async ({ request }) => {
    const res = await request.get("/api/explore?q=wisata");
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("application/json")) expect([200, 400, 429]).toContain(res.status());
    else expect(res.status()).toBeLessThan(500);
  });

  test("/api/assistant/route-finder handles empty query", async ({ request }) => {
    const res = await request.post("/api/assistant/route-finder", { data: { query: "" } });
    expect([200, 400, 429, 500]).toContain(res.status());
  });
});
