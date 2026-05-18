import { api } from "@/lib/axios";
import type { CategoryFormValues } from "@/types/destinasi-kategori";

export async function createCategory(payload: CategoryFormValues) {
    const response = await api.post("/categories", payload);
    return response.data.data;
}

export async function updateCategory(id: string, payload: CategoryFormValues) {
    const response = await api.patch(`/categories/${id}`, payload);
    return response.data.data;
}

export async function deleteCategory(id: string) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
}
