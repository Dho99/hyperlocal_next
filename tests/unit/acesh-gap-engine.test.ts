import { describe, expect, it } from "vitest";
import { calculateGroupGaps } from "@/lib/services/acesh/gap-engine";
import { ACES_DIMENSION_WEIGHTS } from "@/lib/services/acesh/constants";

describe("gap-engine", () => {
  it("gap 0 when value 4 (100)", () => {
    const gaps = calculateGroupGaps([{ id: "1", code: "ACCESS.01", name: "a", group: "ACCESS", weight: 1, value: 4 }], ACES_DIMENSION_WEIGHTS, 0.65);
    expect(gaps[0].gap).toBe(0);
    expect(gaps[0].baseImpact).toBe(0);
  });

  it("gap 100 when value 0", () => {
    const gaps = calculateGroupGaps([{ id: "1", code: "ACCESS.01", name: "a", group: "ACCESS", weight: 1, value: 0 }], ACES_DIMENSION_WEIGHTS, 0.65);
    expect(gaps[0].gap).toBe(100);
  });

  it("sorts by baseImpact desc", () => {
    const gaps = calculateGroupGaps([
      { id: "1", code: "ACCESS.01", name: "a", group: "ACCESS", weight: 1, value: 0 },
      { id: "2", code: "SERVICES.01", name: "b", group: "SERVICES", weight: 1, value: 2 },
    ], ACES_DIMENSION_WEIGHTS, 0.65);
    expect(gaps[0].group).toBe("SERVICES");
  });
});
