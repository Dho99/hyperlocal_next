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
        },
    });

    useEffect(() => {
        if (facility) {
            form.reset({
                name: facility.name,
                description: facility.description || "",
                facilityType: facility.facilityType || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                facilityType: "",
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
            <DialogContent className="sm:max-w-[425px]">
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
                                            {...field}
                                            value={field.value || ""}
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
