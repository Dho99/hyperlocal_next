import { prisma } from "@/lib/prisma";
import type { CategoryFormValues } from "@/types/destinasi-kategori";

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
