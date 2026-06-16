import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import {
  withCursorPagination,
  CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";

export async function createItinerary(data: {
  userId?: string;
  title: string;
  city?: string;
  province?: string;
  startDate?: Date;
  endDate?: Date;
  items: {
    destinationId: string;
    dayNumber: number;
    orderIndex: number;
    estimatedTime?: number;
    notes?: string;
  }[];
}) {
  return await prisma.$transaction(async (tx) => {
    const itinerary = await tx.itinerary.create({
      data: {
        userId: data.userId,
        title: data.title,
        city: data.city,
        province: data.province,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    const items = await Promise.all(
      data.items.map((item) =>
        tx.itineraryItem.create({
          data: {
            itineraryId: itinerary.id,
            destinationId: item.destinationId,
            dayNumber: item.dayNumber,
            orderIndex: item.orderIndex,
            estimatedTime: item.estimatedTime,
            notes: item.notes,
          },
        })
      )
    );

    return { ...itinerary, items };
  });
}

const itineraryInclude = {
  items: {
    include: {
      destination: {
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: [{ dayNumber: "asc" as const }, { orderIndex: "asc" as const }],
  },
};

export async function getUserItineraries(userId: string) {
  return await prisma.itinerary.findMany({
    where: { userId },
    include: itineraryInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaginatedUserItineraries(
  userId: string,
  params: CursorPaginationParams,
) {
  return withCursorPagination(
    (take, cursor, skip) =>
      prisma.itinerary.findMany({
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: { userId },
        include: itineraryInclude,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    params,
    "Itineraries fetched successfully",
  );
}

export async function generateItineraryRecommendation(params: {
  city?: string;
  province?: string;
  durationDays: number;
  halalOnly: boolean;
  categoryIds?: string[];
  maxDestinations: number;
}) {
  const { city, province, durationDays, halalOnly, categoryIds, maxDestinations } = params;

  const where: Prisma.DestinationWhereInput = {
    status: "APPROVED",
  };
  if (city) where.city = city;
  if (province) where.province = province;
  if (categoryIds && categoryIds.length > 0) where.categoryId = { in: categoryIds };

  // Prioritize halal facilities if halalOnly is true
  const destinations = await prisma.destination.findMany({
    where,
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      destinationHalalFacilities: true,
      trends: {
        where: { period: "weekly" },
        orderBy: { periodStart: "desc" },
        take: 1,
      },
    },
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
    ],
    take: maxDestinations * 2, // Take more to filter/sort
  });

  let filtered = destinations;
  if (halalOnly) {
    filtered = destinations.sort((a, b) => {
      const aHalal = a.destinationHalalFacilities.length;
      const bHalal = b.destinationHalalFacilities.length;
      return bHalal - aHalal;
    });
  }

  // Final sort by trend score if available
  filtered = filtered.sort((a, b) => {
    const aScore = a.trends[0]?.trendScore || 0;
    const bScore = b.trends[0]?.trendScore || 0;
    return bScore - aScore;
  }).slice(0, maxDestinations);

  // Distribute into days
  const items = filtered.map((d, index) => ({
    destinationId: d.id,
    destination: d,
    dayNumber: Math.floor(index / (maxDestinations / durationDays)) + 1,
    orderIndex: index % Math.floor(maxDestinations / durationDays),
  }));

  return {
    title: `Rekomendasi Trip ${city || province || "Wisata"}`,
    city,
    province,
    items,
  };
}
