export interface Facility {
    id: string;
    name: string;
    description: string | null;
    facilityType: string | null;
    weight: number | null;
    maxDistance: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateFacilityInput = Omit<Facility, "id" | "createdAt" | "updatedAt">;
export type UpdateFacilityInput = Partial<CreateFacilityInput>;
