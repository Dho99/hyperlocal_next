import { prisma } from '../../lib/prisma';

export interface ExternalSourceData {
  entityType: 'destination' | 'umkm' | 'facility';
  entityId: string;
  vendor: string;
  vendorPlaceId: string;
  rawPayload: any;
}

export async function upsertExternalSource(data: ExternalSourceData, db: any = prisma) {
  return await db.externalPlaceSource.upsert({
    where: {
      vendor_vendorPlaceId: {
        vendor: data.vendor,
        vendorPlaceId: data.vendorPlaceId,
      },
    },
    update: {
      entityId: data.entityId,
      entityType: data.entityType,
      rawPayload: data.rawPayload,
      fetchedAt: new Date(),
    },
    create: {
      entityType: data.entityType,
      entityId: data.entityId,
      vendor: data.vendor,
      vendorPlaceId: data.vendorPlaceId,
      rawPayload: data.rawPayload,
    },
  });
}
