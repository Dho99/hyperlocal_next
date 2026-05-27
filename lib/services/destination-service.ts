import { prisma } from "@/lib/prisma";
import type { DestinationFormValues } from "@/types/destination";
import type { Destination } from "@/types/destination";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";
import { calculateHalalScoreFromWeights } from "@/lib/utils/calculate-halal-score";
import { haversineDistance } from "@/lib/utils/haversine-distance";

const destinationIncludes = {
    category: true,
    destinationHalalFacilities: {
        include: {
            facility: true,
            evidences: true,
        },
    },
    images: true,
} as const;

export async function getPaginatedDestinations(
    params: CursorPaginationParams & {
        categoryId?: string;
        search?: string;
        status?: string;
    },
) {
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
                },
                include: destinationIncludes,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            });

            return destinations as unknown as typeof destinations;
        },
        params,
        "Destinations fetched successfully",
    );
}

export async function getDestinations(): Promise<Destination[]> {
    const data = await prisma.destination.findMany({
        include: destinationIncludes,
        orderBy: { createdAt: "desc" },
    });
    return data as unknown as Destination[];
}

export async function getDestination(id: string): Promise<Destination | null> {
    const data = await prisma.destination.findUnique({
        where: { id },
        include: destinationIncludes,
    });
    return data as unknown as Destination | null;
}

export async function createDestination(values: DestinationFormValues) {
    const { facilities, images, ...data } = values;

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

    return destination as unknown as Destination;
}

export async function updateDestination(
    id: string,
    values: DestinationFormValues,
) {
    const { facilities, images, ...data } = values;

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

    return destination as unknown as Destination;
}

export async function deleteDestination(id: string) {
    return await prisma.destination.delete({
        where: { id },
    });
}
