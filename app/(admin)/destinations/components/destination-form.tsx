"use client";

import { useTransition, useEffect, useState } from "react";
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

interface CoverageAreaOption {
    id: string;
    name: string;
    level: string;
    isActive: boolean;
}
import { getApiErrorMessage } from "@/lib/api-error";
import { getFacilities } from "@/lib/api/facility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, MapPin } from "lucide-react";
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
import Image from "next/image";
import { FacilityArrayList } from "./facility-array-list";
import { ReadinessScoreDisplay } from "@/components/admin/validations/readiness-score-display";
import type { WeightBreakdownItem } from "@/components/admin/validations/readiness-score-display";
import { FACILITY_LABELS } from "@/lib/config/halal-readiness";
import type { Facility } from "@/types/fasilitas";

interface DestinationFormProps {
    initialData?: Destination;
    categories: Category[];
}

export function DestinationForm({
    initialData,
    categories,
}: DestinationFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [masterFacilities, setMasterFacilities] = useState<Facility[]>([]);
    const [coverageAreas, setCoverageAreas] = useState<CoverageAreaOption[]>([]);

    useEffect(() => {
        async function fetchCoverageAreas() {
            try {
                const res = await fetch("/api/admin/coverage-areas");
                if (res.ok) {
                    const json = await res.json();
                    setCoverageAreas((json.data ?? []).filter((a: CoverageAreaOption) => a.isActive));
                }
            } catch { /* ignore */ }
        }
        fetchCoverageAreas();
    }, []);

    useEffect(() => {
        async function load() {
            try {
                const facilities = await getFacilities();
                setMasterFacilities(facilities);
            } catch {
                toast.error("Gagal memuat data fasilitas");
            }
        }
        load();
    }, []);

    const form = useForm<DestinationFormValues>({
        resolver: zodResolver(
            destinationSchema,
        ) as unknown as Resolver<DestinationFormValues>,
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            categoryId: initialData?.categoryId || "",
            coverageAreaId: initialData?.coverageAreaId || null,
            description: initialData?.description ?? "",
            address: initialData?.address || "",
            city: initialData?.city || "",
            province: initialData?.province || "",
            latitude: initialData?.latitude
                ? Number(initialData.latitude)
                : undefined,
            longitude: initialData?.longitude
                ? Number(initialData.longitude)
                : undefined,
            images:
                initialData?.images?.map((img) => ({
                    imageUrl: img.imageUrl,
                })) || [],
            facilities:
                initialData?.destinationHalalFacilities?.map((dhf) => ({
                    facilityId: dhf.facilityId,
                    name: dhf.name ?? "",
                    latitude: dhf.latitude ?? 0,
                    longitude: dhf.longitude ?? 0,
                    evidenceUrls: dhf.evidences?.map((e) => e.imageUrl) || [],
                })) || [],
        },
    });

    const watchedFacilities = form.watch("facilities") || [];

    const weightedFacilities = watchedFacilities
        .map((f) => {
            const facility = masterFacilities.find(
                (mf) => mf.id === f.facilityId,
            );
            if (!facility) return null;
            return {
                facilityType: facility.facilityType ?? null,
                weight: facility.weight ?? 0,
            };
        })
        .filter(Boolean) as { facilityType: string | null; weight: number }[];

    const weightBreakdown: WeightBreakdownItem[] = (() => {
        const typeMaxWeight = new Map<string, number>();
        for (const f of weightedFacilities) {
            const type = f.facilityType ?? "GENERAL";
            const current = typeMaxWeight.get(type) ?? 0;
            typeMaxWeight.set(type, Math.max(current, f.weight));
        }
        const coveredTypes = new Set(typeMaxWeight.keys());
        return Array.from(typeMaxWeight.entries()).map(([type, weight]) => ({
            type,
            label:
                FACILITY_LABELS[type as keyof typeof FACILITY_LABELS] ?? type,
            weight,
            covered: coveredTypes.has(type),
        }));
    })();

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

    const onError = (errors: unknown) => {
        console.log("Validation errors:", errors);
        toast.error("Periksa kembali form, ada beberapa kesalahan.");
    };

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
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
                                                <FormLabel>
                                                    Nama Destinasi
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Contoh: Danau Hijau Resort"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            if (!initialData) {
                                                                const slug =
                                                                    e.target.value
                                                                        .toLowerCase()
                                                                        .replace(
                                                                            / /g,
                                                                            "-",
                                                                        )
                                                                        .replace(
                                                                            /[^\w-]+/g,
                                                                            "",
                                                                        );
                                                                form.setValue(
                                                                    "slug",
                                                                    slug,
                                                                );
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
                                            <FormLabel>
                                                Kategori Wisata
                                            </FormLabel>
                                            <select
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                {...field}
                                            >
                                                <option value="">
                                                    Pilih Kategori
                                                </option>
                                                {categories.map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="coverageAreaId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Coverage Area</FormLabel>
                                            <select
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(e.target.value || null)}
                                            >
                                                <option value="">
                                                    Tidak ada (default)
                                                </option>
                                                {coverageAreas.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.name} ({a.level})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                Hanya visible secara publik jika area aktif.
                                            </p>
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
                                            <FormLabel>
                                                Deskripsi Destinasi
                                            </FormLabel>
                                            <FormControl>
                                                <TiptapEditor
                                                    value={field.value || ""}
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
                                                <FormLabel>
                                                    Kota / Kabupaten
                                                </FormLabel>
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
                                            <FormLabel>
                                                Alamat Lengkap
                                            </FormLabel>
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
                                        latitude={
                                            form.watch("latitude") || null
                                        }
                                        longitude={
                                            form.watch("longitude") || null
                                        }
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
                                                    <FormLabel>
                                                        Latitude
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="-6.2088"
                                                            {...field}
                                                            value={
                                                                field.value ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? undefined
                                                                        : parseFloat(
                                                                              e
                                                                                  .target
                                                                                  .value,
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
                                            name="longitude"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Longitude
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="106.8456"
                                                            {...field}
                                                            value={
                                                                field.value ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? undefined
                                                                        : parseFloat(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                )
                                                            }
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
                        <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-heading">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Fasilitas Halal
                                </CardTitle>
                                <CardDescription>
                                    Data fasilitas halal yang tersedia di
                                    destinasi ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FacilityArrayList
                                    masterFacilities={masterFacilities}
                                />
                            </CardContent>
                        </Card>

                        <ReadinessScoreDisplay
                            weightedFacilities={weightedFacilities}
                            weightBreakdown={weightBreakdown}
                        />

                        <Card className="border-none shadow-sm ring-1 ring-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">
                                    Foto Destinasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {initialData?.images &&
                                initialData?.images.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {initialData?.images.map(
                                            (image, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-square rounded-md overflow-hidden bg-muted group cursor-pointer border"
                                                >
                                                    <Image
                                                        src={image.imageUrl}
                                                        alt={`${initialData.name} ${idx + 1}`}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                                        Belum ada foto galeri.
                                    </p>
                                )}
                            </CardContent>
                            <CardContent>
                                <ImageDropzone
                                    folder="destinations"
                                    multiple={true}
                                    maxFiles={5}
                                    onUploadComplete={(urls) => {
                                        form.setValue(
                                            "images",
                                            urls.map((url) => ({
                                                imageUrl: url,
                                            })),
                                        );
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
