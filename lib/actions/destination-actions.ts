"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { destinationSchema } from "@/lib/validations/destination.schema";
import type { DestinationFormValues } from "@/types/destination";

export async function createDestination(values: DestinationFormValues) {
    const validatedFields = destinationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Data tidak valid" };
    }

    const { facilityIds, ...data } = validatedFields.data;

    try {
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
                    include: { facility: true },
                },
            },
        });

        revalidatePath("/destinations");
        return { success: true, data: destination };
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes("P2002")) {
                return { error: "Slug sudah digunakan" };
            }
        }
        return { error: "Gagal membuat destinasi" };
    }
}

export async function updateDestination(
    id: string,
    values: DestinationFormValues,
) {
    const validatedFields = destinationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Data tidak valid" };
    }

    const { facilityIds, ...data } = validatedFields.data;

    try {
        // Remove existing relation rows then recreate based on facilityIds
        await prisma.destinationHalalFacility.deleteMany({
            where: { destinationId: id },
        });

        const destination = await prisma.destination.update({
            where: { id },
            data: {
                ...data,
                destinationHalalFacilities: {
                    create: facilityIds?.map((fid) => ({ facilityId: fid })),
                },
            },
            include: {
                destinationHalalFacilities: {
                    include: { facility: true },
                },
            },
        });

        revalidatePath("/destinations");
        return { success: true, data: destination };
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes("P2002")) {
                return {
                    error: "Slug sudah digunakan",
                    message: error.message,
                };
            }
        }
        return { error: "Gagal memperbarui destinasi" };
    }
}

export async function deleteDestination(id: string) {
    try {
        await prisma.destination.delete({
            where: { id },
        });

        revalidatePath("/destinations");
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                error: "Slug sudah digunakan",
                message: error.message,
            };
        }
        return { error: "Gagal menghapus destinasi" };
    }
}

export async function getDestination(id: string) {
    return await prisma.destination.findUnique({
        where: { id },
        include: {
            category: true,
            destinationHalalFacilities: { include: { facility: true } },
        },
    });
}

export async function getDestinations() {
    return await prisma.destination.findMany({
        include: {
            category: true,
            destinationHalalFacilities: { include: { facility: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
