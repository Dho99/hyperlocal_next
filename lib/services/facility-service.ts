import { prisma } from "@/lib/prisma";
import type {
    CreateFacilityInput,
    UpdateFacilityInput,
} from "@/types/fasilitas";

export async function getFacilities() {
    return await prisma.halalFacility.findMany({
        orderBy: {
            updatedAt: "desc",
        },
    });
}

export async function getFacilityById(id: string) {
    return await prisma.halalFacility.findUnique({
        where: { id },
    });
}

export async function createFacility(data: CreateFacilityInput) {
    return await prisma.halalFacility.create({
        data,
    });
}

export async function updateFacility(id: string, data: UpdateFacilityInput) {
    return await prisma.halalFacility.update({
        where: { id },
        data,
    });
}

export async function deleteFacility(id: string) {
    return await prisma.halalFacility.delete({
        where: { id },
    });
}
