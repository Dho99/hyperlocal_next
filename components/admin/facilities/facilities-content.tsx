"use client";

import { useState } from "react";
import { FacilityList } from "./facility-list";
import { FacilityForm } from "./facility-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Facility } from "@/types/fasilitas";
import type { Destination } from "@/types/destination";

interface FacilitiesContentProps {
    initialFacilities: Facility[];
    destinations: Destination[];
}

export function FacilitiesContent({
    initialFacilities,
    destinations,
}: FacilitiesContentProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null,
    );

    function handleAdd() {
        setSelectedFacility(null);
        setIsFormOpen(true);
    }

    function handleEdit(facility: Facility) {
        setSelectedFacility(facility);
        setIsFormOpen(true);
    }

    function handleFormOpenChange(open: boolean) {
        setIsFormOpen(open);

        if (!open) {
            setSelectedFacility(null);
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-heading">
                        Manajemen Fasilitas
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola daftar fasilitas halal yang tersedia di berbagai
                        destinasi.
                    </p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Fasilitas
                </Button>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardHeader>
                    <CardTitle className="font-heading">
                        Daftar Fasilitas
                    </CardTitle>
                    <CardDescription>
                        Semua fasilitas terdaftar di seluruh destinasi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FacilityList
                        initialFacilities={initialFacilities}
                        onEdit={handleEdit}
                    />
                </CardContent>
            </Card>

            <FacilityForm
                open={isFormOpen}
                onOpenChange={handleFormOpenChange}
                facility={selectedFacility}
                destinations={destinations}
            />
        </div>
    );
}
