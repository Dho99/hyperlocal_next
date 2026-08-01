import { describe, expect, it } from "vitest";
import { classifyScore } from "@/lib/services/acesh/acesh-classification-service";

describe("ACES-H classification boundaries", () => {
    it("classifies BELUM_SIAP below 40", () => {
        expect(classifyScore(0).key).toBe("BELUM_SIAP");
        expect(classifyScore(39.9).key).toBe("BELUM_SIAP");
    });

    it("classifies PERLU_PENGEMBANGAN from 40 to 54.9", () => {
        expect(classifyScore(40).key).toBe("PERLU_PENGEMBANGAN");
        expect(classifyScore(54.9).key).toBe("PERLU_PENGEMBANGAN");
    });

    it("classifies BERKEMBANG from 55 to 69.9", () => {
        expect(classifyScore(55).key).toBe("BERKEMBANG");
        expect(classifyScore(58.2).key).toBe("BERKEMBANG");
        expect(classifyScore(69.9).key).toBe("BERKEMBANG");
    });

    it("classifies SIAP from 70 to 84.9", () => {
        expect(classifyScore(70).key).toBe("SIAP");
        expect(classifyScore(84.9).key).toBe("SIAP");
    });

    it("classifies SANGAT_SIAP from 85 to 100", () => {
        expect(classifyScore(85).key).toBe("SANGAT_SIAP");
        expect(classifyScore(100).key).toBe("SANGAT_SIAP");
    });

    it("clamps out-of-range scores before classifying", () => {
        expect(classifyScore(-10).key).toBe("BELUM_SIAP");
        expect(classifyScore(150).key).toBe("SANGAT_SIAP");
    });

    it("rejects NaN", () => {
        expect(() => classifyScore(Number.NaN)).toThrow();
    });
});
