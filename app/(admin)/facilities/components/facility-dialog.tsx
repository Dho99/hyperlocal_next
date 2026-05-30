"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    facilitySchema,
    FacilityFormData,
} from "@/lib/validations/facility.schema";
import { createFacility, updateFacility } from "@/lib/api/facility";
import { getApiErrorMessage } from "@/lib/api-error";
import { useState, useEffect } from "react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Facility } from "@/types/fasilitas";
import { FACILITY_TYPES, FACILITY_LABELS } from "@/lib/config/halal-readiness";

interface FacilityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    facility?: Facility | null;
}

export function FacilityDialog({
    open,
    onOpenChange,
    facility,
}: FacilityDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FacilityFormData>({
        resolver: zodResolver(facilitySchema) as unknown as Resolver<FacilityFormData>,
        defaultValues: {
            name: "",
            description: "",
            facilityType: undefined,
            weight: undefined,
            maxDistance: 5.0,
        },
    });

    useEffect(() => {
        if (facility) {
            form.reset({
                name: facility.name,
                description: facility.description || "",
                facilityType: facility.facilityType as FacilityFormData["facilityType"],
                weight: facility.weight ?? undefined,
                maxDistance: facility.maxDistance,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                facilityType: undefined,
                weight: undefined,
                maxDistance: 5.0,
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
                weight: data.weight ?? null,
                maxDistance: data.maxDistance,
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
            <DialogContent className="sm:max-w-[500px]">
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
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Fasilitas</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Contoh: Musholla Al-Hikmah"
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
                                    <FormLabel>Tipe Fasilitas</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe fasilitas" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {FACILITY_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {FACILITY_LABELS[type]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Penjelasan singkat fasilitas"
                                            className="resize-none"
                                            rows={2}
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Bobot Skor (0-100)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="Contoh: 30"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ""
                                                        ? undefined
                                                        : parseInt(
                                                              e.target.value,
                                                              10,
                                                          ),
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxDistance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Radius Maksimal (km)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={0.1}
                                            placeholder="Contoh: 5"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
