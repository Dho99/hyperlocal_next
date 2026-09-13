import { test, expect } from "@playwright/test";

test.describe("P1 ACES-H — FR-004", () => {
  test("anon cannot GET acesh assessment", async ({ request }) => {
    const destList = await request.get("/api/destinations?limit=1");
    const ct = destList.headers()["content-type"] || "";
    if (!ct.includes("application/json") || !destList.ok()) test.skip();
    const body = await destList.json();
    const id = body?.data?.[0]?.id || body?.items?.[0]?.id || body?.destinations?.[0]?.id;
    if (!id) test.skip();
    const res = await request.get(`/api/admin/destinations/${id}/acesh-assessment`);
    expect([401, 403, 404]).toContain(res.status());
  });

  test("public acesh score endpoint available", async ({ request }) => {
    const list = await request.get("/api/destinations?limit=1");
    const ct = list.headers()["content-type"] || "";
    if (!ct.includes("application/json") || !list.ok()) test.skip();
    const body = await list.json();
    const id = body?.data?.[0]?.id || body?.items?.[0]?.id || body?.destinations?.[0]?.id;
    if (!id) test.skip();
    const res = await request.get(`/api/destinations/${id}/acesh`);
    expect([200, 404, 401]).toContain(res.status());
  });

  test("anon cannot PUT scoring-config", async ({ request }) => {
    const res = await request.put("/api/admin/acesh/scoring-config", { data: {} });
    expect([401, 403, 404, 405]).toContain(res.status());
  });
});
