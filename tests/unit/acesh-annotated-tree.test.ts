import { describe, expect, it } from "vitest";
import { buildAnnotatedTree } from "@/lib/services/acesh/annotated-tree";

describe("annotated-tree", () => {
  it("builds tree for null data (Belum dinilai)", () => {
    const tree = buildAnnotatedTree({ data: null, groupBreakdown: [], indicators: [], evidenceRecords: [] });
    expect(tree.outputs.kategori.label).toBe("Belum dinilai");
    expect(Object.keys(tree.aces)).toContain("ACCESS");
    expect(Object.keys(tree.hyperlocal)).toContain("SPATIAL_ACCESSIBILITY");
    expect(Object.keys(tree.evidence)).toContain("fieldValidation");
  });

  it("VERIFIED tree kategori matches classification", () => {
    const tree = buildAnnotatedTree({
      data: { acesScore: 66.8, hyperlocalScore: 59.5, baseScore: 64.2, evidenceConfidenceScore: 69, classification: "BERKEMBANG", verificationStatus: "VERIFIED" } as any,
      groupBreakdown: [{ group: "ACCESS", groupScore: 75, dimensionWeight: 0.2 }],
      indicators: [{ id: "i1", code: "ACCESS_01", name: "akses", group: "ACCESS", weight: 1, value: 3 }],
      evidenceRecords: [],
    });
    expect(tree.outputs.kategori.label).toContain("BERKEMBANG");
    expect(tree.aces.ACCESS.score).toBe(75);
  });

  it("PENDING outputs Verified tertahan", () => {
    const tree = buildAnnotatedTree({
      data: { acesScore: 66.8, hyperlocalScore: 59.5, baseScore: 64.2, evidenceConfidenceScore: 30, classification: "BERKEMBANG", verificationStatus: "PENDING" } as any,
      groupBreakdown: [],
      indicators: [],
      evidenceRecords: [],
    });
    expect(tree.outputs.kategori.alasan).toContain("Verified tertahan");
  });
});
