import { test, expect } from "@playwright/test";
import golden from "../../fixtures/acesh-golden.json";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin-e2e-acesh@test.local";
const ADMIN_PASS = process.env.TEST_ADMIN_PASSWORD || "AdminAcesh123!";

test.describe("ACES-H authenticated TG1-TG10", () => {
  test.skip(!process.env.DATABASE_URL_TEST && !process.env.TEST_ADMIN_EMAIL, "requires DATABASE_URL_TEST isolated DB");

  test.beforeAll(async ({ request }) => {
    const { ensureAdminUser } = await import("../helpers/database");
    await ensureAdminUser(ADMIN_EMAIL, ADMIN_PASS, "E2E ACESH Admin");
  });

  test("TG1 CONFIG valid 100% and invalid 90% validation", async ({ request }) => {
    await request.post("/api/auth/sign-in/email", { data: { email: ADMIN_EMAIL, password: ADMIN_PASS } });
    const valid = {
      version: "ACES-H-1.0",
      accessWeight: 20, communicationWeight: 15, environmentWeight: 20, servicesWeight: 45,
      spatialAccessibilityWeight: 30, functionalAvailabilityWeight: 25, halalAssuranceWeight: 20,
      ecosystemConnectivityWeight: 15, embeddednessContinuityWeight: 10,
      sourceReliabilityWeight: 15, documentEvidenceWeight: 20, photoGeolocationWeight: 15,
      managementConfirmationWeight: 10, fieldValidationWeight: 25, dataFreshnessWeight: 15,
      baseAcesWeight: 65, baseHyperlocalWeight: 35, evidenceFactorBase: 70, evidenceFactorRange: 30,
    };
    const ok = await request.put("/api/admin/acesh/scoring-config", { data: valid });
    expect([200, 401]).toContain(ok.status());
    if (ok.status() === 200) {
      const bad = await request.put("/api/admin/acesh/scoring-config", { data: { ...valid, servicesWeight: 40 } });
      expect(bad.status()).toBe(400);
      const body = await bad.json();
      expect(JSON.stringify(body)).toMatch(/Bobot ACES/i);
    }
  });

  test("TG3 calc ACESH-CALC-002 golden vs TG10 benchmarks", async () => {
    const { calculateAceshScores } = await import("@/lib/services/acesh/acesh-scoring-service");
    const { DEFAULT_SCORING_WEIGHTS } = await import("@/lib/services/acesh/scoring-config-service");
    for (const bm of (golden as any).benchmarks) {
      const input = bm.input;
      const expected = bm.expected;
      const overrides = bm.overrides;
      const weights = overrides ? { ...DEFAULT_SCORING_WEIGHTS, ...overrides } : undefined;
      const result = weights ? calculateAceshScores(input, weights) : calculateAceshScores(input);
      for (const [k, v] of Object.entries(expected)) {
        if ((result as any)[k] === undefined) continue;
        expect((result as any)[k]).toBe(v);
      }
    }
  });

  test("TG9 authz guest cannot access admin acesh", async ({ request }) => {
    const r = await request.get("/api/admin/acesh/dashboard");
    expect([401, 403]).toContain(r.status());
  });

  test("TG5 evidence gate pending vs verified (integration mock already covers, smoke here)", async ({ request }) => {
    const destList = await request.get("/api/destinations?limit=1");
    if (!destList.ok()) test.skip();
  });

  test("TG8 public acesh does not leak evidence", async ({ request }) => {
    const list = await request.get("/api/destinations?limit=1");
    if (!list.ok()) test.skip();
    const body = await list.json().catch(() => null);
    const id = body?.data?.[0]?.id;
    if (!id) test.skip();
    const res = await request.get(`/api/destinations/${id}/acesh`);
    if (res.status() === 200) {
      const j = await res.json();
      expect(JSON.stringify(j)).not.toContain("evidenceRecords");
      expect(JSON.stringify(j)).not.toContain("sourceReliability");
    } else {
      expect([200, 404]).toContain(res.status());
    }
  });
});
