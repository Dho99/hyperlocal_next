"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { destinationSchema } from "@/lib/validations/destination.schema";
import type { DestinationFormValues } from "@/types/destination";
import { calculateHalalScore } from "@/lib/config/halal-readiness";

export async function createDestination(values: DestinationFormValues) {
    const validatedFields = destinationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Data tidak valid" };
    }

    const { facilities, images, ...data } = validatedFields.data;

    try {
        const facilityIds = facilities?.map((f) => f.facilityId) || [];

        const masterFacilities = await prisma.halalFacility.findMany({
            where: { id: { in: facilityIds } },
        });

        const facilityEntries = masterFacilities.map((mf) => ({
            type: (mf.facilityType || "GENERAL") as "MOSQUE" | "RESTAURANT" | "TOILET" | "GENERAL",
            name: mf.name,
        }));
        const halalScore = calculateHalalScore(facilityEntries);

        const destination = await prisma.destination.create({
            data: {
                ...data,
                description: data.description ?? undefined,
                status: "PENDING",
                openingHours: { halalScore },
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
            include: {
                destinationHalalFacilities: {
                    include: { facility: true, evidences: true },
                },
            },
        });

        await prisma.halalValidation.create({
            data: {
                destinationId: destination.id,
                status: "PENDING",
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

    const { facilities, images, ...data } = validatedFields.data;

    try {
        const facilityIds = facilities?.map((f) => f.facilityId) || [];

        const masterFacilities = await prisma.halalFacility.findMany({
            where: { id: { in: facilityIds } },
        });

        const facilityEntries = masterFacilities.map((mf) => ({
            type: (mf.facilityType || "GENERAL") as "MOSQUE" | "RESTAURANT" | "TOILET" | "GENERAL",
            name: mf.name,
        }));
        const halalScore = calculateHalalScore(facilityEntries);

        await prisma.destinationHalalFacility.deleteMany({
            where: { destinationId: id },
        });

        const destination = await prisma.destination.update({
            where: { id },
            data: {
                ...data,
                description: data.description ?? undefined,
                status: "PENDING",
                openingHours: { halalScore },
                images: {
                    deleteMany: {},
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
            include: {
                destinationHalalFacilities: {
                    include: { facility: true, evidences: true },
                },
            },
        });

        const existingValidation = await prisma.halalValidation.findFirst({
            where: { destinationId: id, status: "PENDING" },
        });

        if (!existingValidation) {
            await prisma.halalValidation.create({
                data: {
                    destinationId: id,
                    status: "PENDING",
                },
            });
        }

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
            destinationHalalFacilities: {
                include: { facility: true, evidences: true },
            },
        },
    });
}

export async function getDestinations() {
    return await prisma.destination.findMany({
        include: {
            category: true,
            destinationHalalFacilities: {
                include: { facility: true, evidences: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
