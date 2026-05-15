import { prisma } from "../../lib/prisma";
import { slugify } from "./utils/slugify";
import { parseDecimal } from "./utils/parseDecimal";
import { resolveCategory } from "./categoryMapper";
import { upsertExternalSource } from "./externalSourceSeeder";
import { linkFacilities } from "./facilitySeeder";
import { ValidationStatus } from "../../lib/generated/prisma/client";

export async function processDestination(row: any, db: any = prisma) {
    const categoryId = await resolveCategory(row.CATEGORY);
    const slug = slugify(row.NAME);

    // Map status
    let status = ValidationStatus.PENDING;
    if (row.STATUS === "APPROVED") status = ValidationStatus.APPROVED;
    if (row.STATUS === "REJECTED") status = ValidationStatus.REJECTED;

    const destination = await db.destination.upsert({
        where: { slug },
        update: {
            address: row.ADDRESS,
            city: row.CITY,
            province: row.PROVINCE,
            latitude: parseDecimal(row.LATITUDE),
            longitude: parseDecimal(row.LONGITUDE),
            rating: parseFloat(row.RATING) || 0,
            reviewCount: parseInt(row.REVIEWS) || 0,
            externalId: row.VENDOR_ID,
            externalSource: row.SOURCE,
            status,
        },
        create: {
            name: row.NAME,
            slug,
            categoryId,
            address: row.ADDRESS,
            city: row.CITY,
            province: row.PROVINCE,
            latitude: parseDecimal(row.LATITUDE),
            longitude: parseDecimal(row.LONGITUDE),
            rating: parseFloat(row.RATING) || 0,
            reviewCount: parseInt(row.REVIEWS) || 0,
            externalId: row.VENDOR_ID,
            externalSource: row.SOURCE,
            status,
            openingHours: {
                open: "08:00",
                close: "17:00",
            },
        },
    });

    // Track external source
    await upsertExternalSource(
        {
            entityType: "destination",
            entityId: destination.id,
            vendor: row.SOURCE,
            vendorPlaceId: row.VENDOR_ID,
            rawPayload: row,
        },
        db,
    );

    // Link facilities
    await linkFacilities(destination.id, row, db);

    return destination;
}
