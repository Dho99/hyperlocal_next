"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FacilityItemCard } from "./facility-item-card";
import type { Facility } from "@/types/fasilitas";

interface FacilityArrayListProps {
    masterFacilities: Facility[];
}

export function FacilityArrayList({
    masterFacilities,
}: FacilityArrayListProps) {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "facilities",
    });

    const facilityTypeLabels: Record<string, string> = {};
    for (const f of masterFacilities) {
        if (f.facilityType) {
            facilityTypeLabels[f.id] = f.facilityType;
        }
    }

    return (
        <div className="space-y-4">
            {fields.length > 0 && (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <FacilityItemCard
                            key={field.id}
                            index={index}
                            onRemove={() => remove(index)}
                            masterFacilities={masterFacilities}
                        />
                    ))}
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() =>
                    append({
                        facilityId: "",
                        latitude: null,
                        longitude: null,
                        evidenceUrls: [],
                    })
                }
            >
                <Plus className="h-4 w-4" />
                Tambah Fasilitas
            </Button>
        </div>
    );
}
