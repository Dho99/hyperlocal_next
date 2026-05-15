import { prisma } from "@/lib/prisma";
import type { Destination, DestinationFormValues } from "@/types/destination";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";

function serializeDestination(destination: Destination): Destination {
    const { destinationHalalFacilities, ...rest } = destination;
    return {
        ...rest,
        latitude:
            destination.latitude === null ? "" : String(destination.latitude),
        longitude:
            destination.longitude === null ? "" : String(destination.longitude),
        destinationHalalFacilities: destinationHalalFacilities,
    };
}

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
                include: {
                    category: true,
                    destinationHalalFacilities: {
                        include: {
                            facility: true,
                        },
                    },
                    images: true,
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            });

            return destinations.map((d) => serializeDestination(d));
        },
        params,
        "Destinations fetched successfully",
    );
}

export async function getDestinations() {
    const destinations = await prisma.destination.findMany({
        include: {
            category: true,
            destinationHalalFacilities: {
                include: {
                    facility: true,
                },
            },
            images: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return destinations.map((destination) => serializeDestination(destination));
}

export async function getDestination(id: string) {
    const destination = await prisma.destination.findUnique({
        where: { id },
        include: {
            category: true,
            destinationHalalFacilities: {
                include: {
                    facility: true,
                },
            },
            images: true,
        },
    });

    return destination ? serializeDestination(destination) : null;
}

export async function createDestination(values: DestinationFormValues) {
    const { facilityIds, ...data } = values;

    const destination = await prisma.destination.create({
        data: {
            ...data,
            images: {
                create:
                    values.images?.map((url) => ({
                        imageUrl: url,
                    })) || [],
            },
            destinationHalalFacilities: {
                create: facilityIds?.map((id) => ({
                    facilityId: id,
                })),
            },
        },
        include: {
            destinationHalalFacilities: {
                include: {
                    facility: true,
                },
            },
        },
    });

    return serializeDestination(destination);
}

export async function updateDestination(
    id: string,
    values: DestinationFormValues,
) {
    const { facilityIds, ...data } = values;

    const destination = await prisma.$transaction(async (tx) => {
        // Sync facilities
        await tx.destinationHalalFacility.deleteMany({
            where: { destinationId: id },
        });

        // console.log(data);
        data.description = JSON.stringify(data.description);

        return await tx.destination.update({
            where: { id },
            data: {
                ...data,
                destinationHalalFacilities: {
                    create: facilityIds?.map((facilityId) => ({
                        facilityId,
                    })),
                },
                images: {
                    deleteMany: {}, // Hapus semua gambar lama
                    create:
                        values.images?.map((url) => ({
                            imageUrl: url,
                        })) || [],
                },
            },
            include: {
                destinationHalalFacilities: {
                    include: {
                        facility: true,
                    },
                },
            },
        });
    });

    return serializeDestination(destination);
}

export async function deleteDestination(id: string) {
    return await prisma.destination.delete({
        where: { id },
    });
}
