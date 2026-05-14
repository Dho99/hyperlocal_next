"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { destinationSchema } from "@/lib/validations/destination.schema";
import type {
    Destination,
    Category,
    DestinationFormValues,
} from "@/types/destination";
import { createDestination, updateDestination } from "@/lib/api/destination";
import { getFacilities } from "@/lib/api/facility";
import type { Facility } from "@/types/fasilitas";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Upload, Info } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DestinationFormProps {
    initialData?: Destination;
    categories: Category[];
}

export function DestinationForm({
    initialData,
    categories,
}: DestinationFormProps) {
    const [isPending, startTransition] = useTransition();
    const [masterFacilities, setMasterFacilities] = useState<Facility[]>([]);
    const router = useRouter();

    const form = useForm<DestinationFormValues>({
        resolver: zodResolver(
            destinationSchema,
        ) as unknown as Resolver<DestinationFormValues>,
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            categoryId: initialData?.categoryId || "",
            description: initialData?.description || "",
            address: initialData?.address || "",
            city: initialData?.city || "",
            province: initialData?.province || "",
            latitude: initialData?.latitude
                ? Number(initialData.latitude)
                : undefined,
            longitude: initialData?.longitude
                ? Number(initialData.longitude)
                : undefined,
            facilityIds: initialData?.facilities?.map((f) => f.id) || [],
        },
    });

    useEffect(() => {
        async function fetchMasterFacilities() {
            try {
                const data = await getFacilities();
                setMasterFacilities(data);
            } catch (err) {
                console.error("Failed to fetch facilities", err);
            }
        }
        fetchMasterFacilities();
    }, []);

    async function onSubmit(values: DestinationFormValues) {
        startTransition(async () => {
            try {
                if (initialData) {
                    await updateDestination(initialData.id, values);
                    toast.success("Destinasi berhasil diperbarui");
                } else {
                    await createDestination(values);
                    toast.success("Destinasi berhasil ditambahkan");
                }

                router.push("/destinations");
                router.refresh();
            } catch (err: unknown) {
                toast.error(getApiErrorMessage(err));
            }
        });
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name);
        if (!initialData) {
            const slug = name
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
            form.setValue("slug", slug);
        }
    };

    const toggleFacility = (facilityId: string) => {
        const current = form.getValues("facilityIds") || [];
        if (current.includes(facilityId)) {
            form.setValue(
                "facilityIds",
                current.filter((id) => id !== facilityId),
            );
        } else {
            form.setValue("facilityIds", [...current, facilityId]);
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full mx-auto pb-20"
        >
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">
                                Informasi Destinasi
                            </CardTitle>
                            <CardDescription>
                                Detail dasar mengenai destinasi pariwisata.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Destinasi</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Danau Hijau Resort"
                                        {...form.register("name")}
                                        onChange={handleNameChange}
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-xs text-destructive">
                                            {form.formState.errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">
                                        Kategori Wisata
                                    </Label>
                                    <select
                                        id="categoryId"
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        {...form.register("categoryId")}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.formState.errors.categoryId && (
                                        <p className="text-xs text-destructive">
                                            {
                                                form.formState.errors.categoryId
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug URL</Label>
                                <Input
                                    id="slug"
                                    placeholder="danau-hijau-resort"
                                    {...form.register("slug")}
                                />
                                {form.formState.errors.slug && (
                                    <p className="text-xs text-destructive">
                                        {form.formState.errors.slug.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Deskripsi Destinasi
                                </Label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Jelaskan daya tarik dan informasi penting destinasi..."
                                    {...form.register("description")}
                                />
                                {form.formState.errors.description && (
                                    <p className="text-xs text-destructive">
                                        {
                                            form.formState.errors.description
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">
                                Lokasi & Alamat
                            </CardTitle>
                            <CardDescription>
                                Informasi geografis lengkap destinasi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        Kota / Kabupaten
                                    </Label>
                                    <Input
                                        id="city"
                                        placeholder="Contoh: Bandung"
                                        {...form.register("city")}
                                    />
                                    {form.formState.errors.city && (
                                        <p className="text-xs text-destructive">
                                            {form.formState.errors.city.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="province">Provinsi</Label>
                                    <Input
                                        id="province"
                                        placeholder="Contoh: Jawa Barat"
                                        {...form.register("province")}
                                    />
                                    {form.formState.errors.province && (
                                        <p className="text-xs text-destructive">
                                            {
                                                form.formState.errors.province
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <textarea
                                        id="address"
                                        rows={2}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="Jl. Raya Utama No. 123..."
                                        {...form.register("address")}
                                    />
                                </div>
                                {form.formState.errors.address && (
                                    <p className="text-xs text-destructive">
                                        {form.formState.errors.address.message}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Koordinat Peta
                                </Label>
                                <div className="grid gap-4 md:grid-cols-2 mt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">
                                            Latitude
                                        </Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            placeholder="-6.2088"
                                            {...form.register("latitude", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">
                                            Longitude
                                        </Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            placeholder="106.8456"
                                            {...form.register("longitude", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">
                                Fasilitas Halal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {masterFacilities.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">
                                        Memuat daftar fasilitas...
                                    </p>
                                ) : (
                                    masterFacilities.map((facility) => (
                                        <div
                                            key={facility.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <input
                                                type="checkbox"
                                                id={facility.id}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={form
                                                    .watch("facilityIds")
                                                    ?.includes(facility.id)}
                                                onChange={() =>
                                                    toggleFacility(facility.id)
                                                }
                                            />
                                            <Label
                                                htmlFor={facility.id}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {facility.name}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">
                                Foto Destinasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 bg-muted/5">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold">
                                        Klik untuk unggah
                                    </p>
                                    <p className="text-muted-foreground">
                                        Maksimal 5 foto (PNG, JPG)
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <p className="text-[10px] leading-tight">
                                    Foto utama akan digunakan sebagai cover di
                                    hasil pencarian.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isPending}
                        >
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {initialData
                                ? "Simpan Perubahan"
                                : "Simpan Destinasi"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => router.back()}
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
