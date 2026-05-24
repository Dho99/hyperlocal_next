import { prisma } from '../../lib/prisma';
import { slugify } from './utils/slugify';
import { parseDecimal } from './utils/parseDecimal';
import { resolveCategory } from './categoryMapper';
import { upsertExternalSource } from './externalSourceSeeder';

export async function processUmkm(row: any, db: any = prisma) {
  const categoryId = await resolveCategory(row.CATEGORY);
  const slug = slugify(row.NAME);

  const umkm = await db.umkm.upsert({
    where: { slug },
    update: {
      address: row.ADDRESS,
      latitude: parseDecimal(row.LATITUDE),
      longitude: parseDecimal(row.LONGITUDE),
      rating: parseFloat(row.RATING) || 0,
      reviewCount: parseInt(row.REVIEWS) || 0,
      externalId: row.VENDOR_ID,
      externalSource: row.SOURCE,
    },
    create: {
      name: row.NAME,
      slug,
      categoryId,
      address: row.ADDRESS,
      latitude: parseDecimal(row.LATITUDE),
      longitude: parseDecimal(row.LONGITUDE),
      rating: parseFloat(row.RATING) || 0,
      reviewCount: parseInt(row.REVIEWS) || 0,
      externalId: row.VENDOR_ID,
      externalSource: row.SOURCE,
      openingHours: {
        open: "08:00",
        close: "17:00"
      }
    },
  });

  // Track external source
  await upsertExternalSource({
    entityType: 'umkm',
    entityId: umkm.id,
    vendor: row.SOURCE,
    vendorPlaceId: row.VENDOR_ID,
    rawPayload: row,
  }, db);

  return umkm;
}
