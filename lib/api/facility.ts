import { api as axios } from "@/lib/axios";
import type {
    CreateFacilityInput,
    UpdateFacilityInput,
    Facility,
} from "@/types/fasilitas";

export async function getFacilities() {
    const response = await axios.get<{ data: Facility[] }>("/facilities");
    return response.data.data;
}

export async function createFacility(data: CreateFacilityInput) {
    const response = await axios.post<{ data: Facility }>("/facilities", data);
    return response.data.data;
}

export async function updateFacility(id: string, data: UpdateFacilityInput) {
    const response = await axios.patch<{ data: Facility }>(
        `/facilities/${id}`,
        data,
    );
    return response.data.data;
}

export async function deleteFacility(id: string) {
    const response = await axios.delete<{ data: { message: string } }>(
        `/facilities/${id}`,
    );
    return response.data.data;
}
