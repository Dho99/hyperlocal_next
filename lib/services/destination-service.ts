import { prisma } from "@/lib/prisma";
import type { Destination, DestinationFormValues } from "@/types/destination";

type DestinationRow = any;

function serializeDestination(destination: any): Destination {
    const { destinationHalalFacilities, ...rest } = destination;
    return {
        ...rest,
        latitude:
            destination.latitude === null
                ? ""
                : destination.latitude.toString(),
        longitude:
            destination.longitude === null
                ? ""
                : destination.longitude.toString(),
        facilities: destinationHalalFacilities?.map((df: any) => df.facility) || [],
    };
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
        },
    });

    return destination ? serializeDestination(destination) : null;
}

export async function createDestination(values: DestinationFormValues) {
    const { facilityIds, ...data } = values;

    const destination = await prisma.destination.create({
        data: {
            ...data,
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

        return await tx.destination.update({
            where: { id },
            data: {
                ...data,
                destinationHalalFacilities: {
                    create: facilityIds?.map((facilityId) => ({
                        facilityId,
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
    });

    return serializeDestination(destination);
}

export async function deleteDestination(id: string) {
    return await prisma.destination.delete({
        where: { id },
    });
}
