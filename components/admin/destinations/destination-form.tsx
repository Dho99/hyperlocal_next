"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { Loader2, MapPin } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageDropzone } from "@/components/upload/image-dropzone";
import { MapPicker } from "@/components/maps";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { AxiosError } from "axios";
import {
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

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
    const [imgUrls, setImgUrls] = useState<string[]>([]);
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
        const payload = {
            ...values,
            images:
                imgUrls.length > 0
                    ? imgUrls
                    : initialData?.images?.map((img) => img.imageUrl) || [],
        };
        startTransition(async () => {
            try {
                if (initialData) {
                    await updateDestination(initialData.id, payload);
                    toast.success("Destinasi berhasil diperbarui");
                } else {
                    await createDestination(payload);
                    toast.success("Destinasi berhasil ditambahkan");
                }

                router.push("/destinations");
                router.refresh();
            } catch (err) {
                if (err instanceof AxiosError) {
                    toast.error(
                        getApiErrorMessage(err.response?.data) ||
                            "Terjadi kesalahan saat menyimpan destinasi",
                    );
                    console.log(err.response?.data);
                }
            }
        });
    }

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
        <FormProvider {...form}>
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
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Destinasi</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Contoh: Danau Hijau Resort"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            if (!initialData) {
                                                                const slug = e.target.value
                                                                    .toLowerCase()
                                                                    .replace(/ /g, "-")
                                                                    .replace(/[^\w-]+/g, "");
                                                                form.setValue("slug", slug);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kategori Wisata</FormLabel>
                                                <select
                                                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    {...field}
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="danau-hijau-resort"
                                                    {...field}
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
                                            <FormLabel>Deskripsi Destinasi</FormLabel>
                                            <FormControl>
                                                <TiptapEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kota / Kabupaten</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Contoh: Bandung"
                                                        {...field}
                                                    />
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
                                                    <Input
                                                        placeholder="Contoh: Jawa Barat"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alamat Lengkap</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Textarea
                                                        rows={2}
                                                        className="min-h-[60px] pl-9"
                                                        placeholder="Jl. Raya Utama No. 123..."
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4 border-t space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Lokasi di Peta
                                    </Label>

                                    <MapPicker
                                        latitude={form.watch("latitude") || null}
                                        longitude={form.watch("longitude") || null}
                                        onChange={(lat, lng) => {
                                            form.setValue("latitude", lat);
                                            form.setValue("longitude", lng);
                                        }}
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="latitude"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Latitude</FormLabel>
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
                                                    <FormLabel>Longitude</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="facilityIds"
                                    render={() => (
                                        <div className="space-y-3">
                                            {masterFacilities.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">
                                                    Memuat daftar fasilitas...
                                                </p>
                                            ) : (
                                                masterFacilities.map((facility) => (
                                                    <FormItem
                                                        key={facility.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                checked={form
                                                                    .watch("facilityIds")
                                                                    ?.includes(facility.id)}
                                                                onChange={() =>
                                                                    toggleFacility(facility.id)
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            {facility.name}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))
                                            )}
                                        </div>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm ring-1 ring-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">
                                    Foto Destinasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ImageDropzone
                                    folder="destinations"
                                    multiple={true}
                                    maxFiles={5}
                                    onUploadComplete={(urls) => {
                                        setImgUrls(urls);
                                    }}
                                />
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
        </FormProvider>
    );
}
