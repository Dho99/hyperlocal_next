import { describe, expect, it } from "vitest";
import { evaluateCandidate, type MatchEvidence } from "@/lib/images/photo-match";

function evidence(
    title: string,
    distanceMeters: number | null,
    source: MatchEvidence["source"] = "commons-geo",
    description = "",
): MatchEvidence {
    return { title, distanceMeters, source, description };
}

const entity = (name: string, city: string | null = "Tasikmalaya") => ({
    name,
    city,
    province: "Jawa Barat",
});

describe("photo match evidence gate", () => {
    it.each([
        ["Pirusa", "Sarajevo (49089898318).jpg", 1200, "Vratnik - Pirusa"],
        ["situ", "Mammogram microcalcifications in carcinoma in situ.jpg", 200, ""],
        ["Taman Pico", "Paratropididae Near Pico Bonito National Park Honduras.jpg", 200, ""],
        ["Curug Cikahuripan Galunggung", "Momo deviluke.jpg", 400, "Deretan warung di kawah Gn.Galunggung"],
        ["Mangoes KS", "Kuttiyaattur Mango1.JPG", 2000, "Big Mangoes in the tree"],
        ["Hama", "Hama, Syria.jpg", 1000, "Hama, Syria"],
    ])("rejects unrelated match for %s", (name, title, distance, description) => {
        const decision = evaluateCandidate(entity(name), evidence(title, distance, "commons", description));

        expect(decision.status).toBe("reject");
    });

    it("accepts an exact waterfall name with nearby location", () => {
        const decision = evaluateCandidate(
            entity("Curug Ngebul"),
            evidence("Curug Ngebul View.jpg", 180, "commons"),
        );

        expect(decision.status).toBe("auto-accept");
    });

    it("accepts an exact multi-token mosque name with nearby location", () => {
        const decision = evaluateCandidate(
            entity("Masjid Agung Tasikmalaya"),
            evidence("Masjid Agung Tasikmalaya.jpg", 120, "commons"),
        );

        expect(decision.status).toBe("auto-accept");
    });

    it("does not auto-accept an exact title without location evidence", () => {
        const decision = evaluateCandidate(
            entity("Curug Ngebul"),
            evidence("Curug Ngebul View.jpg", null, "commons"),
        );

        expect(decision.status).not.toBe("auto-accept");
    });

    it("rejects when the file title has no entity token", () => {
        const decision = evaluateCandidate(
            entity("Cadas Ngampar Valley"),
            evidence("Sunset pantai.jpg", 100, "commons-geo"),
        );

        expect(decision.status).toBe("reject");
    });

    it("rejects generic single-token names without exact match", () => {
        const decision = evaluateCandidate(
            entity("situ"),
            evidence("Situ Gede.jpg", 200, "commons-geo"),
        );

        expect(decision.status).toBe("reject");
    });
});
