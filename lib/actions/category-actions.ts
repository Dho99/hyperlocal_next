"use server"

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category.schema";
import type { CategoryFormValues } from "@/types/category";

export async function createCategory(values: CategoryFormValues) {
  const validatedFields = categorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Data tidak valid" };
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        description: validatedFields.data.description,
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Slug sudah digunakan" };
    }
    return { error: "Gagal membuat kategori" };
  }
}

export async function updateCategory(id: string, values: CategoryFormValues) {
  const validatedFields = categorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Data tidak valid" };
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        description: validatedFields.data.description,
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Slug sudah digunakan" };
    }
    return { error: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kategori. Pastikan tidak ada destinasi yang menggunakan kategori ini." };
  }
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
