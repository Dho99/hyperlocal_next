"use client";

import { useTransition, useEffect, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accommodationSchema } from "@/lib/validations/accommodation.schema";
import type { Accommodation, AccommodationFormValues } from "@/types/accommodation";
import { createAccommodation, updateAccommodation } from "@/lib/api/accommodation";
import { getApiErrorMessage } from "@/lib/api-error";
import { getFacilities } from "@/lib/api/facility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Building2, MapPin, X } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPicker } from "@/components/maps";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { ImageDropzone } from "@/components/upload/image-dropzone";
import { AxiosError } from "axios";
import axios from "axios";
import {
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import type { Facility } from "@/types/fasilitas";

interface AccommodationFormProps {
    initialData?: Accommodation;
}

export function AccommodationForm({ initialData }: AccommodationFormProps) {
    const [isPending, startTransition] = useTransition();
    const [masterFacilities, setMasterFacilities] = useState<Facility[]>([]);
    const router = useRouter();

    useEffect(() => {
        getFacilities().then(setMasterFacilities).catch(() => toast.error("Gagal memuat data fasilitas"));
    }, []);

    const form = useForm<AccommodationFormValues>({
        resolver: zodResolver(accommodationSchema) as unknown as Resolver<AccommodationFormValues>,
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description ?? null,
            address: initialData?.address || "",
            city: initialData?.city || "",
            province: initialData?.province || "",
            latitude: initialData?.latitude ? Number(initialData.latitude) : null,
            longitude: initialData?.longitude ? Number(initialData.longitude) : null,
            phone: initialData?.phone || "",
            website: initialData?.website || "",
            images: initialData?.images?.map((img) => ({ imageUrl: img.imageUrl, isPrimary: img.isPrimary, caption: img.caption ?? "" })) || [],
            facilityIds: initialData?.facilities?.map((f) => f.facilityId) || [],
        },
    });

    async function onSubmit(values: AccommodationFormValues) {
        startTransition(async () => {
            try {
                if (initialData) {
                    await updateAccommodation(initialData.id, values);
                    toast.success("Penginapan berhasil diperbarui");
                } else {
                    await createAccommodation(values);
                    toast.success("Penginapan berhasil ditambahkan");
                }
                router.push("/accommodations");
                router.refresh();
            } catch (err) {
                if (err instanceof AxiosError) {
                    toast.error(getApiErrorMessage(err.response?.data) || "Terjadi kesalahan saat menyimpan");
                } else {
                    toast.error("Terjadi kesalahan saat menyimpan");
                }
            }
        });
    }

    function handleSlugGeneration(e: React.ChangeEvent<HTMLInputElement>) {
        if (!initialData) {
            const slug = e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
            form.setValue("slug", slug);
        }
    }

    const selectedFacilityIds = form.watch("facilityIds") || [];
const images = form.watch("images") || [];

const handleRemoveImage = useCallback(async (index: number) => {
    const current = form.getValues("images") || [];
    const removed = current[index];
    if (removed?.imageUrl && removed.imageUrl.startsWith("/uploads/")) {
        try {
            await axios.delete("/api/upload", { data: { url: removed.imageUrl } });
        } catch {
            // ignore server delete failure
        }
    }
    form.setValue("images", current.filter((_: unknown, i: number) => i !== index));
}, [form]);

const handleUploadComplete = useCallback((urls: string[]) => {
    const current = form.getValues("images") || [];
    const newImages = urls.map((url, idx) => ({
        imageUrl: url,
        isPrimary: current.length === 0 && idx === 0,
    }));
    form.setValue("images", [...current, ...newImages]);
}, [form]);

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="size-5" />
                                Informasi Penginapan
                            </CardTitle>
                            <CardDescription>Data dasar penginapan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Penginapan</FormLabel>
                                        <FormControl>
                                            <Input {...field} onChange={(e) => { field.onChange(e); handleSlugGeneration(e); }} placeholder="Nama penginapan" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="nama-penginapan" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomor Telepon</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="08xxxx" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="https://" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="size-5" />
                                Lokasi
                            </CardTitle>
                            <CardDescription>Alamat dan koordinat penginapan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alamat</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="Jl. Contoh No. 1" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kota</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="Kota" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="province"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provinsi</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="Provinsi" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="latitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Latitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
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
                                            <FormLabel>Longitude</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="any" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <MapPicker
                                latitude={form.watch("latitude") ?? null}
                                longitude={form.watch("longitude") ?? null}
                                onChange={(lat: number, lng: number) => {
                                    form.setValue("latitude", lat);
                                    form.setValue("longitude", lng);
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Deskripsi</CardTitle>
                        <CardDescription>Informasi lengkap tentang penginapan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <TiptapEditor
                                            value={field.value}
                                            onChange={(value: unknown) => field.onChange(value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fasilitas Halal</CardTitle>
                        <CardDescription>Pilih fasilitas halal yang tersedia</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {masterFacilities.map((facility) => (
                                <label
                                    key={facility.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                        selectedFacilityIds.includes(facility.id)
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-stone-200 bg-white hover:border-stone-300"
                                    }`}
                                >
                                    <Checkbox
                                        checked={selectedFacilityIds.includes(facility.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                form.setValue("facilityIds", [...selectedFacilityIds, facility.id]);
                                            } else {
                                                form.setValue("facilityIds", selectedFacilityIds.filter((id: string) => id !== facility.id));
                                            }
                                        }}
                                    />
                                    <span className="text-sm font-medium text-stone-700">{facility.name}</span>
                                </label>
                            ))}
                            {masterFacilities.length === 0 && (
                                <p className="text-sm text-stone-500 col-span-full">Memuat fasilitas...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Foto</CardTitle>
                        <CardDescription>Upload foto penginapan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {images.map((img: { imageUrl: string }, index: number) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                        <Image
                                            src={img.imageUrl}
                                            alt={`Foto ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 200px"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-2 right-2 size-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm border border-stone-200"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <ImageDropzone
                            folder="accommodations"
                            multiple
                            maxFiles={5}
                            onUploadComplete={handleUploadComplete}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isPending} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                        {initialData ? "Simpan Perubahan" : "Tambah Penginapan"}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
