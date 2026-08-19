import { describe, expect, it } from "vitest";
import { aceshScoringConfigSchema } from "@/lib/validations/acesh.schema";

const validConfig = {
    version: "ACES-H-1.0",
    accessWeight: 20, communicationWeight: 15, environmentWeight: 20, servicesWeight: 45,
    spatialAccessibilityWeight: 30, functionalAvailabilityWeight: 25, halalAssuranceWeight: 20,
    ecosystemConnectivityWeight: 15, embeddednessContinuityWeight: 10,
    sourceReliabilityWeight: 15, documentEvidenceWeight: 20, photoGeolocationWeight: 15,
    managementConfirmationWeight: 10, fieldValidationWeight: 25, dataFreshnessWeight: 15,
    baseAcesWeight: 65, baseHyperlocalWeight: 35,
    evidenceFactorBase: 70, evidenceFactorRange: 30,
};

describe("ACES-H dynamic scoring configuration", () => {
    it("accepts groups whose weights total 100%", () => {
        expect(aceshScoringConfigSchema.safeParse(validConfig).success).toBe(true);
    });

    it("rejects a group whose weights do not total 100%", () => {
        const result = aceshScoringConfigSchema.safeParse({ ...validConfig, servicesWeight: 40 });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues[0]?.message).toContain("Bobot ACES");
    });
});
