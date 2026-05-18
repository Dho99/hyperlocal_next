import { api } from "@/lib/axios";
import type { Umkm, UmkmFormValues } from "@/types/umkm";

export async function getUmkms() {
  const response = await api.get<{ data: Umkm[] }>("/umkms");
  return response.data.data;
}

export async function getUmkm(id: string) {
  const response = await api.get<{ data: Umkm }>(`/umkms/${id}`);
  return response.data.data;
}

export async function createUmkm(payload: UmkmFormValues) {
  const response = await api.post("/umkms", payload);
  return response.data.data;
}

export async function updateUmkm(id: string, payload: UmkmFormValues) {
  const response = await api.patch(`/umkms/${id}`, payload);
  return response.data.data;
}

export async function deleteUmkm(id: string) {
  const response = await api.delete(`/umkms/${id}`);
  return response.data;
}
