import { describe, expect, it } from "vitest";
import { mapToCandidateData } from "@/lib/utils/ai-candidates";

describe("mapToCandidateData", () => {
    it("includes each facility distance from its destination", () => {
        const candidate = mapToCandidateData({
            id: "destination-1",
            name: "Pantai Contoh",
            slug: "pantai-contoh",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            category: { name: "Pantai" },
            description: "Destinasi contoh",
            address: "Jalan Contoh",
            halalScore: 85,
            rating: 4.5,
            destinationHalalFacilities: [
                {
                    distanceMeters: 350,
                    facility: {
                        name: "Musala Contoh",
                        facilityType: "PRAYER",
                    },
                },
                {
                    distanceMeters: null,
                    facility: {
                        name: "Restoran Halal",
                        facilityType: "HALAL_FOOD",
                    },
                },
            ],
        });

        expect(candidate.facilities).toEqual([
            {
                name: "Musala Contoh",
                type: "PRAYER",
                distanceMeters: 350,
            },
            {
                name: "Restoran Halal",
                type: "HALAL_FOOD",
                distanceMeters: null,
            },
        ]);
    });
});
