import { prisma } from "@/lib/prisma";
import type { CategoryFormValues } from "@/types/destinasi-kategori";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";

export async function getPaginatedCategories(
    params: CursorPaginationParams & { search?: string }
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
        "Categories fetched successfully"
    );
}

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function createCategory(data: CategoryFormValues) {
    return await prisma.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
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
        },
    });
}

export async function deleteCategory(id: string) {
    return await prisma.category.delete({
        where: { id },
    });
}
