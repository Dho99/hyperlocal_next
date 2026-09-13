import { describe, expect, it, vi, beforeEach } from "vitest";
import { DEFAULT_SCORING_WEIGHTS, storedConfigToWeights, getActiveScoringWeights } from "@/lib/services/acesh/scoring-config-service";

const baseConfig = {
  version: "ACES-H-1.0",
  accessWeight: 20, communicationWeight: 15, environmentWeight: 20, servicesWeight: 45,
  spatialAccessibilityWeight: 30, functionalAvailabilityWeight: 25, halalAssuranceWeight: 20,
  ecosystemConnectivityWeight: 15, embeddednessContinuityWeight: 10,
  sourceReliabilityWeight: 15, documentEvidenceWeight: 20, photoGeolocationWeight: 15,
  managementConfirmationWeight: 10, fieldValidationWeight: 25, dataFreshnessWeight: 15,
  baseAcesWeight: 65, baseHyperlocalWeight: 35,
  evidenceFactorBase: 70, evidenceFactorRange: 30,
};

describe("scoring-config-service", () => {
  it("storedConfigToWeights converts percentages to ratios", () => {
    const w = storedConfigToWeights(baseConfig);
    expect(w.aces.ACCESS).toBe(0.2);
    expect(w.aces.SERVICES).toBe(0.45);
    expect(w.hyperlocal.SPATIAL_ACCESSIBILITY).toBe(0.3);
    expect(w.evidence.fieldValidation).toBe(0.25);
    expect(w.baseAces).toBe(0.65);
    expect(w.evidenceFactorBase).toBe(0.7);
    expect(w.version).toBe("ACES-H-1.0");
  });

  it("regression: 65/35 → 50/50 changes baseScore deterministically", () => {
    const w65 = storedConfigToWeights(baseConfig);
    const w50 = storedConfigToWeights({ ...baseConfig, baseAcesWeight: 50, baseHyperlocalWeight: 50 });
    const aces = 66.8, hyper = 59.5;
    const base65 = Math.round((aces * w65.baseAces + hyper * w65.baseHyperlocal + Number.EPSILON) * 10) / 10;
    const base50 = Math.round((aces * w50.baseAces + hyper * w50.baseHyperlocal + Number.EPSILON) * 10) / 10;
    expect(base65).toBe(64.2);
    expect(base50).toBe(63.2);
  });

  describe("getActiveScoringWeights DB path", () => {
    beforeEach(() => vi.resetModules());

    it("returns stored config when DB has row", async () => {
      vi.doMock("@/lib/prisma", () => ({ prisma: { aceshScoringConfig: { findUnique: vi.fn().mockResolvedValue(baseConfig) } } }));
      const { getActiveScoringWeights: get } = await import("@/lib/services/acesh/scoring-config-service");
      const w = await get();
      expect(w.aces.ACCESS).toBe(0.2);
    });

    it("falls back to DEFAULT when DB returns null", async () => {
      vi.doMock("@/lib/prisma", () => ({ prisma: { aceshScoringConfig: { findUnique: vi.fn().mockResolvedValue(null) } } }));
      const { getActiveScoringWeights: get } = await import("@/lib/services/acesh/scoring-config-service");
      const w = await get();
      expect(w).toEqual(DEFAULT_SCORING_WEIGHTS);
    });

    it("falls back to DEFAULT on DB throw", async () => {
      vi.doMock("@/lib/prisma", () => ({ prisma: { aceshScoringConfig: { findUnique: vi.fn().mockRejectedValue(new Error("db down")) } } }));
      const { getActiveScoringWeights: get } = await import("@/lib/services/acesh/scoring-config-service");
      const w = await get();
      expect(w).toEqual(DEFAULT_SCORING_WEIGHTS);
    });
  });
});
