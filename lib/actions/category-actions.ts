"use server"

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category.schema";
import type { CategoryFormValues } from "@/types/category";

import { CategoryType } from "../generated/prisma";

export async function createCategory(values: CategoryFormValues) {
  try { await assertAdmin(); } catch { return { error: "Unauthorized" }; }
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
        type: validatedFields.data.type || CategoryType.DESTINATION,
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return { error: "Slug sudah digunakan untuk tipe kategori ini" };
    }
    return { error: "Gagal membuat kategori" };
  }
}

export async function updateCategory(id: string, values: CategoryFormValues) {
  try { await assertAdmin(); } catch { return { error: "Unauthorized" }; }
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
        type: validatedFields.data.type,
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return { error: "Slug sudah digunakan untuk tipe kategori ini" };
    }
    return { error: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategory(id: string) {
  try { await assertAdmin(); } catch { return { error: "Unauthorized" }; }
  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kategori. Pastikan tidak ada entitas yang menggunakan kategori ini." };
  }
}

export async function getCategories(type?: CategoryType) {
  return await prisma.category.findMany({
    where: {
      ...(type && { type }),
    },
    orderBy: { createdAt: 'desc' },
  });
}
