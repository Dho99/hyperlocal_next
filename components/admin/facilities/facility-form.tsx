"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    facilitySchema,
    FacilityFormData,
} from "@/lib/validations/fasilitas.schema";
import { createFacility, updateFacility } from "@/lib/api/facility";
import { getApiErrorMessage } from "@/lib/api-error";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Facility } from "@/types/fasilitas";
import type { Destination } from "@/types/destination";
import { MapPicker } from "@/components/maps";

interface FacilityFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    facility?: Facility | null;
    destinations: Destination[];
}

export function FacilityForm({
    open,
    onOpenChange,
    facility,
}: FacilityFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FacilityFormData>({
        resolver: zodResolver(facilitySchema),
        defaultValues: {
            name: "",
            description: "",
            facilityType: "",
            latitude: undefined,
            longitude: undefined,
        },
    });

    useEffect(() => {
        if (facility) {
            form.reset({
                name: facility.name,
                description: facility.description || "",
                facilityType: facility.facilityType || "",
                latitude: facility.latitude ? Number(facility.latitude) : undefined,
                longitude: facility.longitude ? Number(facility.longitude) : undefined,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                facilityType: "",
                latitude: undefined,
                longitude: undefined,
            });
        }
    }, [facility, form, open]);

    async function onSubmit(data: FacilityFormData) {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                description: data.description ?? null,
                facilityType: data.facilityType ?? null,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
            };
            if (facility) {
                await updateFacility(facility.id, payload);
                toast.success("Fasilitas berhasil diperbarui");
            } else {
                await createFacility(payload);
                toast.success("Fasilitas berhasil ditambahkan");
            }
            router.refresh();
            onOpenChange(false);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading">
                        {facility ? "Edit Fasilitas" : "Tambah Fasilitas"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Fasilitas</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Contoh: Musholla"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="facilityType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Tipe Fasilitas (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Contoh: Ibadah, Sanitasi"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Penjelasan singkat fasilitas"
                                            className="resize-none"
                                            rows={2}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <Label>Lokasi Fasilitas</Label>
                            <MapPicker 
                                latitude={form.watch("latitude") || null}
                                longitude={form.watch("longitude") || null}
                                onChange={(lat, lng) => {
                                    form.setValue("latitude", lat);
                                    form.setValue("longitude", lng);
                                }}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="latitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Latitude</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="-6.2088"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="longitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Longitude</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    placeholder="106.8456"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {facility
                                    ? "Simpan Perubahan"
                                    : "Simpan Fasilitas"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
