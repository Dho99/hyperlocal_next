import { prisma } from "../../lib/prisma";

const DEFAULT_FACILITIES = [
    {
        id: "7a04336a-306b-4076-a2e3-0fd493016e1e",
        name: "Masjid",
        type: "religious",
        key: "NEARBY_MOSQUES",
    },
    {
        id: "c835c19d-a079-4dd3-bc4d-34fa99bb191c",
        name: "Toilet",
        type: "amenity",
        key: "NEARBY_TOILETS",
    },
    {
        id: "ff44e655-6f9b-4513-b071-b4d00721d0a8",
        name: "Kuliner Halal",
        type: "food",
        key: "NEARBY_HALAL_FOOD",
    },
    {
        id: "5daba6f2-dfa1-4db7-90ec-e1d6b93bb306",
        name: "Penginapan",
        type: "lodging",
        key: "NEARBY_LODGING",
    },
];

const facilityCache: Record<string, string> = {};

export async function ensureDefaultFacilities() {
    for (const f of DEFAULT_FACILITIES) {
        const facility = await prisma.halalFacility.upsert({
            where: { id: f.id },
            update: {},
            create: {
                name: f.name,
                facilityType: f.type,
                externalId: `default-${f.type}`,
                externalSource: "SYSTEM",
            },
        });
        facilityCache[f.key] = facility.id;
    }
}

export async function linkFacilities(
    destinationId: string,
    row: any,
    db: any = prisma,
) {
    for (const f of DEFAULT_FACILITIES) {
        const value = row[f.key]?.toString().toUpperCase();
        if (value === "YES" || value === "1" || value === "TRUE") {
            const facilityId = facilityCache[f.key];
            if (facilityId) {
                await db.destinationHalalFacility.upsert({
                    where: {
                        destinationId_facilityId: {
                            destinationId,
                            facilityId,
                        },
                    },
                    update: {},
                    create: {
                        destinationId,
                        facilityId,
                    },
                });
            }
        }
    }
}
