import { prisma } from "@/lib/prisma";
import type { DestinationFormValues } from "@/types/destination";
import type { Destination } from "@/types/destination";
import type { Prisma } from "@/lib/generated/prisma";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";
import { calculateHalalScoreFromWeights } from "@/lib/utils/calculate-halal-score";
import { haversineDistance } from "@/lib/utils/haversine-distance";

async function validateDestinationCategory(categoryId: string): Promise<void> {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { type: true },
    });
    if (!category) throw new Error("Kategori tidak ditemukan");
    if (category.type !== "DESTINATION") {
        throw new Error(
            "Kategori yang dipilih bukan kategori destinasi. Pilih kategori dengan tipe destinasi.",
        );
    }
}

const destinationIncludes = {
    category: true,
    destinationHalalFacilities: {
        include: {
            facility: true,
            evidences: true,
        },
    },
    umkms: {
        include: {
            category: true,
            images: true,
            certifications: true,
        },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        take: 8,
    },
    images: true,
} satisfies Prisma.DestinationInclude;

type DestinationWithIncludes = Prisma.DestinationGetPayload<{
    include: typeof destinationIncludes;
}>;

function serializeDestination(raw: DestinationWithIncludes): Destination {
    return {
        ...raw,
        latitude: raw.latitude ? Number(raw.latitude) : null,
        longitude: raw.longitude ? Number(raw.longitude) : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        destinationHalalFacilities: raw.destinationHalalFacilities?.map((dhf) => ({
            ...dhf,
            latitude: dhf.latitude ? Number(dhf.latitude) : null,
            longitude: dhf.longitude ? Number(dhf.longitude) : null,
        })),
        umkms: raw.umkms?.map((umkm) => ({
            ...umkm,
            latitude: umkm.latitude ? Number(umkm.latitude) : null,
            longitude: umkm.longitude ? Number(umkm.longitude) : null,
        })),
    };
}

export async function getPaginatedDestinations(
    params: CursorPaginationParams & {
        categoryId?: string;
        search?: string;
        status?: string;
        minScore?: number;
        sort?: DestinationSort;
    },
) {
    const orderBy = getDestinationOrderBy(params.sort);

    return withCursorPagination(
        async (take, cursor, skip) => {
            const destinations = await prisma.destination.findMany({
                take,
                skip,
                cursor: cursor ? { id: cursor } : undefined,
                where: {
                    ...(params.categoryId && { categoryId: params.categoryId }),
                    ...(params.status && {
                        status: params.status as
                            | "PENDING"
                            | "APPROVED"
                            | "REJECTED",
                    }),
                    ...(params.search && {
                        name: { contains: params.search, mode: "insensitive" },
                    }),
                    ...(params.minScore != null && {
                        OR: [
                            { validatedScore: { gte: params.minScore } },
                            {
                                validatedScore: null,
                                halalScore: { gte: params.minScore },
                            },
                        ],
                    }),
                },
                include: destinationIncludes,
                orderBy,
            });

            return destinations.map(serializeDestination);
        },
        params,
        "Destinations fetched successfully",
    );
}

export type DestinationSort =
    | "newest"
    | "rating"
    | "score"
    | "reviews"
    | "name";

function getDestinationOrderBy(sort: DestinationSort = "newest") {
    const orderByMap = {
        newest: [{ createdAt: "desc" }, { id: "desc" }],
        rating: [{ rating: "desc" }, { reviewCount: "desc" }, { id: "desc" }],
        score: [
            { validatedScore: { sort: "desc", nulls: "last" } },
            { halalScore: { sort: "desc", nulls: "last" } },
            { id: "desc" },
        ],
        reviews: [{ reviewCount: "desc" }, { rating: "desc" }, { id: "desc" }],
        name: [{ name: "asc" }, { id: "asc" }],
    } satisfies Record<DestinationSort, Prisma.DestinationOrderByWithRelationInput[]>;

    return orderByMap[sort];
}

export async function getDestinations(): Promise<Destination[]> {
    const data = await prisma.destination.findMany({
        include: destinationIncludes,
        orderBy: { createdAt: "desc" },
    });
    return data.map(serializeDestination);
}

export async function getDestination(id: string): Promise<Destination | null> {
    const data = await prisma.destination.findUnique({
        where: { id },
        include: destinationIncludes,
    });
    return data ? serializeDestination(data) : null;
}

export async function createDestination(values: DestinationFormValues) {
    const { facilities, images, ...data } = values;
    await validateDestinationCategory(data.categoryId);

    const destination = await prisma.$transaction(async (tx) => {
        const facilityIds = facilities?.map((f) => f.facilityId) || [];

        const masterFacilities = await tx.halalFacility.findMany({
            where: { id: { in: facilityIds } },
        });

        if (data.latitude != null && data.longitude != null) {
            for (const f of facilities ?? []) {
                if (f.latitude == null || f.longitude == null) continue;
                const mf = masterFacilities.find((m) => m.id === f.facilityId);
                if (!mf) continue;
                const dist = haversineDistance(
                    data.latitude,
                    data.longitude,
                    f.latitude,
                    f.longitude,
                );
                if (dist > mf.maxDistance) {
                    throw new Error(
                        `Fasilitas "${mf.name}" berjarak ${Math.round(dist * 100) / 100} km — melebihi batas maksimal ${mf.maxDistance} km dari destinasi`,
                    );
                }
            }
        }

        const facilityWeights = masterFacilities.map((mf) => ({
            facilityType: mf.facilityType,
            weight: mf.weight ?? 0,
        }));
        const halalScore = calculateHalalScoreFromWeights(facilityWeights);

        const destination = await tx.destination.create({
            data: {
                ...data,
                description: data.description ?? undefined,
                status: "PENDING",
                halalScore,
                images: {
                    create:
                        images?.map((image) => ({
                            imageUrl: image.imageUrl,
                        })) || [],
                },
                destinationHalalFacilities: {
                    create:
                        facilities?.map((f) => ({
                            facilityId: f.facilityId,
                            name: f.name,
                            latitude: f.latitude,
                            longitude: f.longitude,
                            evidences: {
                                create:
                                    f.evidenceUrls?.map((url) => ({
                                        imageUrl: url,
                                    })) || [],
                            },
                        })) || [],
                },
            },
            include: destinationIncludes,
        });

        await tx.halalValidation.create({
            data: {
                destinationId: destination.id,
                status: "PENDING",
            },
        });

        return destination;
    });

    return serializeDestination(destination);
}

export async function updateDestination(
    id: string,
    values: DestinationFormValues,
) {
    const { facilities, images, ...data } = values;
    await validateDestinationCategory(data.categoryId);

    const destination = await prisma.$transaction(async (tx) => {
        const facilityIds = facilities?.map((f) => f.facilityId) || [];

        const masterFacilities = await tx.halalFacility.findMany({
            where: { id: { in: facilityIds } },
        });

        if (data.latitude != null && data.longitude != null) {
            for (const f of facilities ?? []) {
                if (f.latitude == null || f.longitude == null) continue;
                const mf = masterFacilities.find((m) => m.id === f.facilityId);
                if (!mf) continue;
                const dist = haversineDistance(
                    data.latitude,
                    data.longitude,
                    f.latitude,
                    f.longitude,
                );
                if (dist > mf.maxDistance) {
                    throw new Error(
                        `Fasilitas "${mf.name}" berjarak ${Math.round(dist * 100) / 100} km — melebihi batas maksimal ${mf.maxDistance} km dari destinasi`,
                    );
                }
            }
        }

        const facilityWeights = masterFacilities.map((mf) => ({
            facilityType: mf.facilityType,
            weight: mf.weight ?? 0,
        }));
        const halalScore = calculateHalalScoreFromWeights(facilityWeights);

        await tx.destinationHalalFacility.deleteMany({
            where: { destinationId: id },
        });

        const destination = await tx.destination.update({
            where: { id },
            data: {
                ...data,
                description: data.description ?? undefined,
                status: "PENDING",
                halalScore,
                destinationHalalFacilities: {
                    create:
                        facilities?.map((f) => ({
                            facilityId: f.facilityId,
                            name: f.name,
                            latitude: f.latitude,
                            longitude: f.longitude,
                            evidences: {
                                create:
                                    f.evidenceUrls?.map((url) => ({
                                        imageUrl: url,
                                    })) || [],
                            },
                        })) || [],
                },
                images: {
                    deleteMany: {},
                    create:
                        images?.map((image) => ({
                            imageUrl: image.imageUrl,
                        })) || [],
                },
            },
            include: destinationIncludes,
        });

        const existingValidation = await tx.halalValidation.findFirst({
            where: { destinationId: id, status: "PENDING" },
        });

        if (!existingValidation) {
            await tx.halalValidation.create({
                data: {
                    destinationId: id,
                    status: "PENDING",
                },
            });
        }

        return destination;
    });

    return serializeDestination(destination);
}

export async function deleteDestination(id: string) {
    return await prisma.destination.delete({
        where: { id },
    });
}
