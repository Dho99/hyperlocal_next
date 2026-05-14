import { api } from "@/lib/axios";
import type { Destination, DestinationFormValues } from "@/types/destination";

export async function getDestination(id: string) {
  const response = await api.get<{ data: Destination }>(`/destinations/${id}`);
  return response.data.data;
}

export async function createDestination(payload: DestinationFormValues) {
  const response = await api.post("/destinations", payload);
  return response.data.data;
}

export async function updateDestination(id: string, payload: DestinationFormValues) {
  const response = await api.patch(`/destinations/${id}`, payload);
  return response.data.data;
}

export async function deleteDestination(id: string) {
  const response = await api.delete(`/destinations/${id}`);
  return response.data;
}
