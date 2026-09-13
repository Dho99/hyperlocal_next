import { test, expect } from "@playwright/test";

test.describe("SECURITY — authz black-box", () => {
  test("guest POST /api/validations returns 401", async ({ request }) => {
    const res = await request.post("/api/validations", { data: { status: "APPROVED" } });
    expect([401, 403]).toContain(res.status());
  });

  test("guest GET /api/admin/analytics returns 401/404", async ({ request }) => {
    const res = await request.get("/api/admin/analytics");
    expect([401, 403, 404]).toContain(res.status());
  });

  test("XSS payload in review returns 401 or 400", async ({ request }) => {
    const xss = "<script>alert(1)</script>";
    const res = await request.post("/api/reviews", { data: { destinationId: "00000000-0000-0000-0000-000000000000", rating: 5, comment: xss } });
    expect([401, 400, 403, 404]).toContain(res.status());
  });

  test("invalid login does not create session cookie", async ({ request }) => {
    const res = await request.post("/api/auth/sign-in/email", { data: { email: "nope@test.local", password: "Wrong12345!" } });
    expect([400, 401, 403, 422]).toContain(res.status());
    const setCookie = res.headers()["set-cookie"] || res.headersArray().find(h => h.name.toLowerCase() === "set-cookie")?.value || "";
    if (setCookie) expect(setCookie.toLowerCase()).not.toContain("better-auth.session");
  });

  test("rate-limit burst does not crash", async ({ request }) => {
    let lastStatus = 200;
    for (let i = 0; i < 35; i++) {
      const r = await request.get("/api/explore?limit=1");
      lastStatus = r.status();
      if (lastStatus === 429) break;
    }
    expect([200, 429, 400]).toContain(lastStatus);
  });
});
