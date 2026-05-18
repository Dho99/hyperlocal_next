import { prisma } from "@/lib/prisma";
import type {
    CreateFacilityInput,
    UpdateFacilityInput,
} from "@/types/fasilitas";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";

export async function getPaginatedFacilities(
    params: CursorPaginationParams & { search?: string }
) {
    return withCursorPagination(
        async (take, cursor, skip) => {
            return await prisma.halalFacility.findMany({
                take,
                skip,
                cursor: cursor ? { id: cursor } : undefined,
                where: {
                    ...(params.search && {
                        name: { contains: params.search, mode: "insensitive" },
                    }),
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            });
        },
        params,
        "Facilities fetched successfully"
    );
}

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
