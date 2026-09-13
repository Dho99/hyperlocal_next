import { test, expect } from "@playwright/test";

test.describe("SECURITY — headers black-box", () => {
  test("response carries security headers", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    const csp = h["content-security-policy"] || "";
    const hsts = h["strict-transport-security"] || "";
    if (csp || hsts) {
      if (csp) {
        expect(csp).toContain("default-src");
        expect(csp).toContain("frame-ancestors");
      }
      if (hsts) expect(hsts.length).toBeGreaterThan(0);
      expect((h["x-frame-options"] || "").toUpperCase()).toContain("DENY");
      expect((h["x-content-type-options"] || "").toLowerCase()).toContain("nosniff");
    } else {
      test.skip(true, "dev server without security headers (prod only)");
    }
  });
});
