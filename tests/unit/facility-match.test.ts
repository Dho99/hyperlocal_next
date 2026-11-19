import { describe, expect, it } from "vitest";
import {
    cleanDestinationQuery,
    detectFacilityKeyword,
    detectFacilityListKeyword,
    facilityCanonicalLabel,
    isStrongDestinationNameMatch,
    matchesFacilityQuery,
} from "@/lib/utils/facility-match";

describe("facility query matching", () => {
    it("detects worship synonyms", () => {
        expect(detectFacilityKeyword("cari musola di situ gede")?.canonical).toBe(
            "WORSHIP",
        );
        expect(detectFacilityKeyword("apakah ada musala?")?.canonical).toBe("WORSHIP");
        expect(detectFacilityKeyword("toilet di mana")?.canonical).toBe("TOILET");
    });

    it("matches a mosque or religious facility for musola queries", () => {
        expect(
            matchesFacilityQuery(
                { name: "Masjid", facilityType: "religious" },
                "musola",
            ),
        ).toBe(true);
        expect(
            matchesFacilityQuery(
                { name: "Masjid Agung", facilityType: "religious" },
                "masjid",
            ),
        ).toBe(true);
        expect(
            matchesFacilityQuery(
                { name: "Masjid", facilityType: "religious" },
                "toilet",
            ),
        ).toBe(false);
    });

    it("cleans question words before destination matching", () => {
        expect(
            cleanDestinationQuery("apakah ada musala di situ gede"),
        ).toBe("situ gede");
        expect(
            cleanDestinationQuery("dimana masjid di pantai pangandaran"),
        ).toBe("pantai pangandaran");
    });

    it("detects requests for the full facility list", () => {
        expect(detectFacilityListKeyword("ada fasilitas apa saja di situ gede")).toBe(true);
        expect(detectFacilityListKeyword("fasilitas apa yang tersedia di pantai pangandaran")).toBe(true);
        expect(detectFacilityListKeyword("daftar fasilitas situ gede")).toBe(true);
        expect(detectFacilityListKeyword("apakah ada musala di situ gede")).toBe(false);
    });

    it("cleans intent and facility words before destination matching", () => {
        expect(cleanDestinationQuery("cari musola di situ gede")).toBe("situ gede");
        expect(
            cleanDestinationQuery("cek masjid di situ gede attractions"),
        ).toBe("situ gede attractions");
        expect(
            cleanDestinationQuery("ada fasilitas apa saja di situ gede"),
        ).toBe("situ gede");
    });

    it("accepts a strong multi-token destination name match", () => {
        expect(
            isStrongDestinationNameMatch("situ gede", "Situ Gede Attractions"),
        ).toBe(true);
        expect(isStrongDestinationNameMatch("bandung", "Bandung")).toBe(false);
        expect(
            isStrongDestinationNameMatch("situ gede", "Pantai Pangandaran"),
        ).toBe(false);
    });

    it("provides a readable label", () => {
        expect(facilityCanonicalLabel("WORSHIP")).toBe("tempat ibadah");
    });
});
