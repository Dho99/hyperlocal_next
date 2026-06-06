import { api } from "@/lib/axios";
import type { Accommodation, AccommodationFormValues } from "@/types/accommodation";

export async function getAccommodations() {
    const response = await api.get<{ data: Accommodation[] }>("/accommodations");
    return response.data.data;
}

export async function getAccommodation(id: string) {
    const response = await api.get<{ data: Accommodation }>(`/accommodations/${id}`);
    return response.data.data;
}

export async function createAccommodation(payload: AccommodationFormValues) {
    const response = await api.post("/accommodations", payload);
    return response.data.data;
}

export async function updateAccommodation(id: string, payload: AccommodationFormValues) {
    const response = await api.patch(`/accommodations/${id}`, payload);
    return response.data.data;
}

export async function deleteAccommodation(id: string) {
    const response = await api.delete(`/accommodations/${id}`);
    return response.data;
}
