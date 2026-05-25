"use server";

import { revalidatePath } from "next/cache";
import { 
    createUmkm as createUmkmService, 
    updateUmkm as updateUmkmService, 
    deleteUmkm as deleteUmkmService 
} from "@/lib/services/umkm-service";
import { umkmSchema, type UmkmFormValues } from "@/lib/validations/umkm.schema";

export async function createUmkm(values: UmkmFormValues) {
    const validatedFields = umkmSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Data tidak valid" };
    }

    try {
        const umkm = await createUmkmService(validatedFields.data);

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
        const umkm = await updateUmkmService(id, validatedFields.data);

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
        await deleteUmkmService(id);

        revalidatePath("/umkms");
        return { success: true };
    } catch (error: unknown) {
        return { error: "Gagal menghapus UMKM" };
    }
}
