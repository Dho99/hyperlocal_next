import { describe, expect, it } from "vitest";
import { calculateRIS, classifyActionType, timelineFromFeasibility } from "@/lib/services/acesh/recommendation-engine";

describe("recommendation-engine", () => {
  it("RIS deterministic and priority = ris*baseWeight", () => {
    const a = calculateRIS({ indicator: { id: "1", code: "ACCESS_01", name: "a", group: "ACCESS", weight: 1, value: 0 }, dimensionWeight: 0.2, groupScore: 0, baseWeight: 0.65, evidenceConfidence: 50 });
    const b = calculateRIS({ indicator: { id: "1", code: "ACCESS_01", name: "a", group: "ACCESS", weight: 1, value: 0 }, dimensionWeight: 0.2, groupScore: 0, baseWeight: 0.65, evidenceConfidence: 50 });
    expect(a.ris).toBe(b.ris);
    expect(a.priority).toBeCloseTo(a.ris * 0.65, 6);
  });

  it("classifyActionType BUILD when value<2", () => {
    expect(classifyActionType(1, 80, false)).toBe("BUILD");
    expect(classifyActionType(3, 50, false)).toBe("VERIFY");
    expect(classifyActionType(3, 80, false)).toBe("MAINTAIN");
  });

  it("timeline QUICK when feasibility>=0.85 and ris>=0.08", () => {
    expect(timelineFromFeasibility(0.9, 0.1)).toBe("QUICK");
    expect(timelineFromFeasibility(0.4, 0.1)).toBe("STRATEGIC");
    expect(timelineFromFeasibility(0.7, 0.05)).toBe("MEDIUM");
  });
});
