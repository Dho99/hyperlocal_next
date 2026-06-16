import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import type { Accommodation } from "@/types/accommodation";
import type { AccommodationFormValues } from "@/lib/validations/accommodation.schema";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";

function serializeAccommodation(raw: unknown): Accommodation {
    const a = raw as Accommodation & {
        latitude: unknown | null;
        longitude: unknown | null;
    };
    return {
        ...a,
        latitude: a.latitude ? Number(a.latitude) : null,
        longitude: a.longitude ? Number(a.longitude) : null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}

export async function getAccommodations() {
    const accommodations = await prisma.accommodation.findMany({
        include: {
            images: true,
            facilities: { include: { facility: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return accommodations.map(serializeAccommodation);
}

export async function getPaginatedAccommodations(
    params: CursorPaginationParams & {
        search?: string;
        scope?: "admin" | "public";
        validationStatus?: string;
    },
) {
    const isPublic = params.scope !== "admin";
    const validationStatuses = params.validationStatus
        ? params.validationStatus.split(",").filter(Boolean)
        : undefined;

    return withCursorPagination(
        async (take, cursor, skip) => {
            const where: Prisma.AccommodationWhereInput = {
                ...(isPublic && { validationStatus: "APPROVED" }),
                ...(validationStatuses && {
                    validationStatus: { in: validationStatuses },
                }),
                ...(params.search && {
                    OR: [
                        { name: { contains: params.search, mode: "insensitive" } },
                        { city: { contains: params.search, mode: "insensitive" } },
                        {
                            province: {
                                contains: params.search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            };

            const accommodations = await prisma.accommodation.findMany({
                take,
                skip,
                cursor: cursor ? { id: cursor } : undefined,
                where,
                include: {
                    images: isPublic
                        ? { where: { isPrimary: true }, take: 1 }
                        : true,
                    facilities: { include: { facility: true } },
                },
                orderBy: isPublic
                    ? [
                          { rating: "desc" },
                          { reviewCount: "desc" },
                          { id: "desc" },
                      ]
                    : [{ createdAt: "desc" }, { id: "desc" }],
            });
            return accommodations.map(serializeAccommodation);
        },
        params,
        "Accommodations fetched successfully",
    );
}

export async function getAccommodation(idOrSlug: string) {
    const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            idOrSlug,
        );
    const accommodation = await prisma.accommodation.findFirst({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
            images: true,
            facilities: { include: { facility: true } },
            reviews: {
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });
    return accommodation ? serializeAccommodation(accommodation) : null;
}

export async function getAccommodationBySlug(slug: string) {
    const accommodation = await prisma.accommodation.findUnique({
        where: { slug },
        include: {
            images: true,
            facilities: { include: { facility: true } },
            reviews: {
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });
    return accommodation ? serializeAccommodation(accommodation) : null;
}

export async function createAccommodation(values: AccommodationFormValues) {
    const { images, facilityIds, ...data } = values;

    const accommodation = await prisma.accommodation.create({
        data: {
            ...data,
            description: data.description ?? undefined,
            images:
                images.length > 0
                    ? {
                          create: images.map((img, idx) => ({
                              imageUrl: img.imageUrl,
                              isPrimary: img.isPrimary ?? idx === 0,
                              caption: img.caption ?? `Foto ${idx + 1}`,
                          })),
                      }
                    : undefined,
            facilities:
                facilityIds && facilityIds.length > 0
                    ? {
                          create: facilityIds.map((facilityId) => ({
                              facilityId,
                          })),
                      }
                    : undefined,
        },
        include: { images: true, facilities: { include: { facility: true } } },
    });
    return serializeAccommodation(accommodation);
}

export async function updateAccommodation(
    id: string,
    values: AccommodationFormValues,
) {
    const { images, facilityIds, ...data } = values;

    const accommodation = await prisma.$transaction(async (tx) => {
        if (images) {
            await tx.accommodationImage.deleteMany({
                where: { accommodationId: id },
            });
        }
        await tx.accommodationHalalFacility.deleteMany({
            where: { accommodationId: id },
        });

        return tx.accommodation.update({
            where: { id },
            data: {
                ...data,
                description: data.description ?? undefined,
                images:
                    images.length > 0
                        ? {
                              create: images.map((img, idx) => ({
                                  imageUrl: img.imageUrl,
                                  isPrimary: img.isPrimary ?? idx === 0,
                                  caption: img.caption ?? `Foto ${idx + 1}`,
                              })),
                          }
                        : undefined,
                facilities:
                    facilityIds && facilityIds.length > 0
                        ? {
                              create: facilityIds.map((facilityId) => ({
                                  facilityId,
                              })),
                          }
                        : undefined,
            },
            include: {
                images: true,
                facilities: { include: { facility: true } },
            },
        });
    });
    return serializeAccommodation(accommodation);
}

export async function deleteAccommodation(id: string) {
    return prisma.accommodation.delete({ where: { id } });
}

export async function getPublicAccommodations() {
    const accommodations = await prisma.accommodation.findMany({
        where: { validationStatus: "APPROVED" },
        include: {
            images: { where: { isPrimary: true }, take: 1 },
            facilities: { include: { facility: true } },
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    });
    return accommodations.map(serializeAccommodation);
}
