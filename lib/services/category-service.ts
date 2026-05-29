import { prisma } from "@/lib/prisma";
import type { CategoryFormValues } from "@/types/destinasi-kategori";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";
import { CategoryType } from "../generated/prisma";

export async function getPaginatedCategories(
    params: CursorPaginationParams & { search?: string; type?: CategoryType },
) {
    return withCursorPagination(
        async (take, cursor, skip) => {
            return await prisma.category.findMany({
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
        "Categories fetched successfully",
    );
}

export async function getCategories(type?: CategoryType) {
    const categories = await prisma.category.findMany({
        where: {
            ...(type && { type }),
        },
        orderBy: { createdAt: "desc" },
    });

    return categories.map((cat) => ({
        ...cat,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
    }));
}

export async function createCategory(data: CategoryFormValues) {
    return await prisma.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            type: data.type,
        },
    });
}

export async function updateCategory(id: string, data: CategoryFormValues) {
    return await prisma.category.update({
        where: { id },
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            type: data.type,
        },
    });
}

export async function deleteCategory(id: string) {
    return await prisma.category.delete({
        where: { id },
    });
}
