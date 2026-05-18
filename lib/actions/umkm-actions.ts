"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { umkmSchema, type UmkmFormValues } from "@/lib/validations/umkm.schema";

export async function createUmkm(values: UmkmFormValues) {
    const validatedFields = umkmSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Data tidak valid" };
    }

    try {
        const umkm = await prisma.umkm.create({
            data: validatedFields.data as any,
            include: {
                category: true,
                destination: true,
            },
        });

        revalidatePath("/umkms");
        return { success: true, data: umkm };
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes("P2002")) {
                return { error: "Slug sudah digunakan" };
            }
        }
        return { error: "Gagal membuat UMKM" };
    }
}

export async function updateUmkm(id: string, values: UmkmFormValues) {
    const validatedFields = umkmSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Data tidak valid" };
    }

    try {
        const umkm = await prisma.umkm.update({
            where: { id },
            data: validatedFields.data as any,
            include: {
                category: true,
                destination: true,
            },
        });

        revalidatePath("/umkms");
        return { success: true, data: umkm };
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes("P2002")) {
                return { error: "Slug sudah digunakan" };
            }
        }
        return { error: "Gagal memperbarui UMKM" };
    }
}

export async function deleteUmkm(id: string) {
    try {
        await prisma.umkm.delete({
            where: { id },
        });

        revalidatePath("/umkms");
        return { success: true };
    } catch (error: unknown) {
        return { error: "Gagal menghapus UMKM" };
    }
}
