import { describe, expect, it } from "vitest";
import { calculateAceshScores } from "@/lib/services/acesh/acesh-scoring-service";
import { DEFAULT_SCORING_WEIGHTS, storedConfigToWeights } from "@/lib/services/acesh/scoring-config-service";
import golden from "../fixtures/acesh-golden.json";

describe("ACES-H benchmark — TG3/TG10 research artifact", () => {
  const benchmarks = (golden as any).benchmarks as Array<{ id: string; input: any; expected: any; overrides?: any }>;

  it.each(benchmarks)("$id expected == actual", ({ input, expected, overrides }) => {
    const result = overrides
      ? calculateAceshScores(input, { ...DEFAULT_SCORING_WEIGHTS, ...overrides })
      : calculateAceshScores(input);
    for (const [k, v] of Object.entries(expected)) {
      if ((result as any)[k] === undefined) continue;
      expect((result as any)[k]).toBe(v);
    }
  });

  it("regression ACESH-REGRESSION-001 65/35 → 50/50", () => {
    const reg = (golden as any).regression;
    const base65 = storedConfigToWeights({ version: "ACES-H-1.0", accessWeight: 20, communicationWeight: 15, environmentWeight: 20, servicesWeight: 45, spatialAccessibilityWeight: 30, functionalAvailabilityWeight: 25, halalAssuranceWeight: 20, ecosystemConnectivityWeight: 15, embeddednessContinuityWeight: 10, sourceReliabilityWeight: 15, documentEvidenceWeight: 20, photoGeolocationWeight: 15, managementConfirmationWeight: 10, fieldValidationWeight: 25, dataFreshnessWeight: 15, baseAcesWeight: 65, baseHyperlocalWeight: 35, evidenceFactorBase: 70, evidenceFactorRange: 30 });
    const base50 = storedConfigToWeights({ version: "ACES-H-1.0", accessWeight: 20, communicationWeight: 15, environmentWeight: 20, servicesWeight: 45, spatialAccessibilityWeight: 30, functionalAvailabilityWeight: 25, halalAssuranceWeight: 20, ecosystemConnectivityWeight: 15, embeddednessContinuityWeight: 10, sourceReliabilityWeight: 15, documentEvidenceWeight: 20, photoGeolocationWeight: 15, managementConfirmationWeight: 10, fieldValidationWeight: 25, dataFreshnessWeight: 15, baseAcesWeight: 50, baseHyperlocalWeight: 50, evidenceFactorBase: 70, evidenceFactorRange: 30 });
    const aces = reg.given.acesScore, hyper = reg.given.hyperlocalScore;
    const b65 = Math.round((aces * base65.baseAces + hyper * base65.baseHyperlocal + Number.EPSILON) * 10) / 10;
    const b50 = Math.round((aces * base50.baseAces + hyper * base50.baseHyperlocal + Number.EPSILON) * 10) / 10;
    expect(b65).toBe(reg.expected.fromBase);
    expect(b50).toBe(reg.expected.toBase);
  });
});
