"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { umkmSchema, type UmkmFormValues } from "@/lib/validations/umkm.schema";
import type { Umkm } from "@/types/umkm";
import type { Category } from "@/types/category";
import { createUmkm, updateUmkm } from "@/lib/api/umkm";
import { getDestinations } from "@/lib/api/destination";
import type { Destination } from "@/types/destination";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Upload, Info, Store, Phone, User as UserIcon } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UmkmFormProps {
    initialData?: Umkm;
    categories: Category[];
    users?: { id: string; name: string; email: string }[];
}

export function UmkmForm({
    initialData,
    categories,
    users = [],
}: UmkmFormProps) {
    const [isPending, startTransition] = useTransition();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const router = useRouter();

    const form = useForm<UmkmFormValues>({
        resolver: zodResolver(umkmSchema) as unknown as Resolver<UmkmFormValues>,
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            ownerId: initialData?.ownerId || null,
            destinationId: initialData?.destinationId || null,
            categoryId: initialData?.categoryId || null,
            description: initialData?.description || "",
            address: initialData?.address || "",
            phone: initialData?.phone || "",
            latitude: initialData?.latitude ? Number(initialData.latitude) : null,
            longitude: initialData?.longitude ? Number(initialData.longitude) : null,
        },
    });

    useEffect(() => {
        async function fetchDestinations() {
            try {
                const data = await getDestinations();
                setDestinations(data);
            } catch (err) {
                console.error("Failed to fetch destinations", err);
            }
        }
        fetchDestinations();
    }, []);

    async function onSubmit(values: UmkmFormValues) {
        startTransition(async () => {
            try {
                if (initialData) {
                    await updateUmkm(initialData.id, values);
                    toast.success("UMKM berhasil diperbarui");
                } else {
                    await createUmkm(values);
                    toast.success("UMKM berhasil ditambahkan");
                }

                router.push("/umkms");
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
                                Informasi UMKM
                            </CardTitle>
                            <CardDescription>
                                Detail dasar mengenai usaha mikro kecil menengah.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama UMKM</Label>
                                    <div className="relative">
                                        <Store className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            placeholder="Contoh: Warung Halal Mak Nyak"
                                            className="pl-9"
                                            {...form.register("name")}
                                            onChange={handleNameChange}
                                        />
                                    </div>
                                    {form.formState.errors.name && (
                                        <p className="text-xs text-destructive">
                                            {form.formState.errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerId">Pemilik UMKM</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <select
                                            id="ownerId"
                                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            {...form.register("ownerId")}
                                        >
                                            <option value="">Pilih Pemilik (Opsional)</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {form.formState.errors.ownerId && (
                                        <p className="text-xs text-destructive">
                                            {form.formState.errors.ownerId.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">
                                        Kategori UMKM
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
                                            {form.formState.errors.categoryId.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug URL</Label>
                                    <Input
                                        id="slug"
                                        placeholder="warung-halal-mak-nyak"
                                        {...form.register("slug")}
                                    />
                                    {form.formState.errors.slug && (
                                        <p className="text-xs text-destructive">
                                            {form.formState.errors.slug.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor Telepon</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            placeholder="081234567890"
                                            className="pl-9"
                                            {...form.register("phone")}
                                        />
                                    </div>
                                    {form.formState.errors.phone && (
                                        <p className="text-xs text-destructive">
                                            {form.formState.errors.phone.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Deskripsi Usaha
                                </Label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Jelaskan produk dan layanan UMKM..."
                                    {...form.register("description")}
                                />
                                {form.formState.errors.description && (
                                    <p className="text-xs text-destructive">
                                        {form.formState.errors.description.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">
                                Lokasi & Relasi
                            </CardTitle>
                            <CardDescription>
                                Hubungkan UMKM dengan destinasi wisata.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="destinationId">
                                    Destinasi Terkait
                                </Label>
                                <select
                                    id="destinationId"
                                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    {...form.register("destinationId")}
                                >
                                    <option value="">Tanpa Relasi Destinasi</option>
                                    {destinations.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.city})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground">
                                    Pilih destinasi jika UMKM berada di dalam atau sekitar area wisata tersebut.
                                </p>
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
                                    Koordinat Peta (Opsional)
                                </Label>
                                <div className="grid gap-4 md:grid-cols-2 mt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            placeholder="-6.2088"
                                            {...form.register("latitude", { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            placeholder="106.8456"
                                            {...form.register("longitude", { valueAsNumber: true })}
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
                                Foto UMKM
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 bg-muted/5">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold">Klik untuk unggah</p>
                                    <p className="text-muted-foreground">Maksimal 3 foto (PNG, JPG)</p>
                                </div>
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
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Simpan Perubahan" : "Simpan UMKM"}
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
