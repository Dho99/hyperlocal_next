"use client";

import { useState, useEffect } from "react";
import { getUmkm } from "@/lib/api/umkm";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Umkm } from "@/types/umkm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    Store,
    ArrowLeft,
    Clock,
    ShieldCheck,
    Award,
    Info,
    Phone,
    Globe,
    Mail,
    MapPin,
    ImagePlus,
    Loader2,
    AlertCircle,
    Pencil,
} from "lucide-react";
import Image from "next/image";
import { ReadonlyMap } from "@/components/maps";

interface UmkmDetailProps {
    id: string;
}

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getHalalStatus(umkm: Umkm) {
    const cert = umkm.certifications?.[0];
    if (!cert) return { label: "Belum Terdaftar", color: "bg-muted text-muted-foreground" };
    switch (cert.status) {
        case "VALID":
            return { label: "Tervalidasi", color: "bg-primary/15 text-primary" };
        case "PENDING":
            return { label: "Dalam Proses", color: "bg-amber-100 text-amber-800" };
        case "EXPIRED":
            return { label: "Kedaluwarsa", color: "bg-red-100 text-red-800" };
        case "REVOKED":
            return { label: "Dicabut", color: "bg-red-100 text-red-800" };
        default:
            return { label: "Belum Terdaftar", color: "bg-muted text-muted-foreground" };
    }
}

type SimpleHours = { open: string; close: string };
type DayHours = Record<string, SimpleHours>;

function renderOpeningHours(openingHours: Umkm["openingHours"]) {
    if (!openingHours) return null;

    if ("open" in openingHours && "close" in openingHours) {
        const h = openingHours as SimpleHours;
        return (
            <li className="flex justify-between text-sm">
                <span className="text-muted-foreground">Setiap Hari</span>
                <span className="font-medium text-foreground">
                    {h.open} - {h.close}
                </span>
            </li>
        );
    }

    const dayNames: Record<string, string> = {
        monday: "Senin",
        tuesday: "Selasa",
        wednesday: "Rabu",
        thursday: "Kamis",
        friday: "Jumat",
        saturday: "Sabtu",
        sunday: "Minggu",
    };

    const entries = Object.entries(openingHours as DayHours);
    if (entries.length === 0) return null;

    const isWeekSame = entries.length >= 2 &&
        entries.slice(0, 2).every(([, v]) => v.open === entries[0][1].open && v.close === entries[0][1].close) &&
        entries.every(([, v]) => v.open === entries[0][1].open && v.close === entries[0][1].close);

    if (isWeekSame) {
        return (
            <li className="flex justify-between text-sm">
                <span className="text-muted-foreground">Setiap Hari</span>
                <span className="font-medium text-foreground">
                    {entries[0][1].open} - {entries[0][1].close}
                </span>
            </li>
        );
    }

    return entries.map(([day, hours]) => (
        <li key={day} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{dayNames[day] || day}</span>
            <span className="font-medium text-foreground">
                {hours.open} - {hours.close}
            </span>
        </li>
    ));
}

export function UmkmDetail({ id }: UmkmDetailProps) {
    const [umkm, setUmkm] = useState<Umkm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const data = await getUmkm(id);
                setUmkm(data);
            } catch (err: unknown) {
                setError(getApiErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
                <h3 className="text-lg font-bold text-destructive">Gagal Memuat Data</h3>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-6" onClick={() => router.push("/umkms")}>
                    Kembali ke Daftar
                </Button>
            </div>
        );
    }

    if (!umkm) {
        return (
            <div className="p-20 text-center">
                <h3 className="text-lg font-bold">UMKM tidak ditemukan</h3>
                <Button variant="ghost" className="mt-4" onClick={() => router.push("/umkms")}>
                    Kembali
                </Button>
            </div>
        );
    }

    const status = getHalalStatus(umkm);
    const coverImage = umkm.images?.[0]?.imageUrl;
    const hasHours = !!umkm.openingHours;
    const hasCoordinates = umkm.latitude != null && umkm.longitude != null;

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <span>UMKM Management / Detail</span>
                    </div>
                    <h2 className="text-[32px] font-semibold leading-tight text-foreground font-heading">
                        {umkm.name}
                    </h2>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="h-9 gap-2 border-border text-primary hover:bg-muted"
                        onClick={() => router.push(`/umkms/${umkm.id}/edit`)}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        className="h-9 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        onClick={() => router.push(`/validasi/umkm/${umkm.id}`)}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Validasi
                    </Button>
                </div>
            </div>

            <div className="relative mb-6 h-[300px] overflow-hidden rounded-xl border border-border">
                {coverImage ? (
                    <Image src={coverImage} alt={umkm.name} fill className="object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                        <Store className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                    <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                        {umkm.category?.name || "Kategori"}
                    </span>
                    <h3 className="text-2xl font-semibold text-white font-heading">
                        {umkm.name}
                    </h3>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm md:col-span-4">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                            <ShieldCheck className="text-2xl font-bold text-primary" />
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-foreground">Status Halal</h4>
                            <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4">
                        {umkm.certifications?.[0]?.certificateNo && (
                            <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                                <Award className="mt-0.5 text-primary" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Sertifikasi MUI</p>
                                    <p className="text-sm text-muted-foreground">{umkm.certifications[0].certificateNo}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                            <ShieldCheck className="mt-0.5 text-primary" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Standar CHSE</p>
                                <p className="text-sm text-muted-foreground">
                                    {umkm.certifications?.[0]?.status === "VALID" ? "Memenuhi Standar" : "Belum Tervalidasi"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:col-span-8">
                    <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                        <Info className="text-muted-foreground" />
                        Deskripsi
                    </h4>
                    <p className="mb-4 text-base leading-relaxed text-muted-foreground">
                        {umkm.description || "Tidak ada deskripsi tersedia."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {umkm.destination?.destinationHalalFacilities?.slice(0, 4).map((df) => (
                            <span key={df.id} className="rounded-md bg-secondary/20 px-3 py-1 text-sm text-secondary-foreground">
                                {df.facility?.name || df.name || "Fasilitas"}
                            </span>
                        ))}
                        {(!umkm.destination?.destinationHalalFacilities || umkm.destination.destinationHalalFacilities.length === 0) && (
                            <span className="text-sm text-muted-foreground">Tidak ada label fasilitas</span>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:col-span-4">
                    <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                        <Info className="text-muted-foreground" />
                        Kontak
                    </h4>
                    <ul className="space-y-4">
                        {umkm.phone && (
                            <li className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                    <Phone className="text-[18px] text-muted-foreground" />
                                </div>
                                <span className="text-sm text-foreground">{umkm.phone}</span>
                            </li>
                        )}
                        {!umkm.phone && (
                            <li className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                    <Phone className="text-[18px] text-muted-foreground" />
                                </div>
                                <span className="text-sm text-muted-foreground">Belum tersedia</span>
                            </li>
                        )}
                    </ul>
                </div>

                {hasHours && (
                    <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:col-span-4">
                        <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                            <Clock className="text-muted-foreground" />
                            Jam Operasional
                        </h4>
                        <ul className="space-y-2">
                            {renderOpeningHours(umkm.openingHours)}
                        </ul>
                    </div>
                )}

                <div className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm md:col-span-4">
                    <h4 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                        <MapPin className="text-muted-foreground" />
                        Lokasi
                    </h4>
                    <p className="mb-4 flex-1 text-sm text-muted-foreground">
                        {umkm.address || "Alamat belum diatur"}
                    </p>
                    <div className="relative h-32 overflow-hidden rounded-lg border border-border bg-muted">
                        {hasCoordinates ? (
                            <ReadonlyMap
                                className="h-full w-full"
                                markers={[
                                    {
                                        id: umkm.id,
                                        latitude: Number(umkm.latitude),
                                        longitude: Number(umkm.longitude),
                                        title: umkm.name,
                                        subtitle: umkm.address || "",
                                    },
                                ]}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <MapPin className="text-muted-foreground/40" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground font-heading">Galeri</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {umkm.images?.slice(0, 3).map((image, idx) => (
                        <div
                            key={image.id}
                            className="group aspect-square overflow-hidden rounded-xl border border-border"
                        >
                            <Image
                                src={image.imageUrl}
                                alt={`${umkm.name} ${idx + 1}`}
                                width={400}
                                height={400}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    ))}
                    <div className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-border bg-muted/30 transition-colors hover:bg-muted group">
                        <div className="text-center">
                            <ImagePlus className="mx-auto text-3xl text-primary transition-transform group-hover:scale-110" />
                            <p className="mt-2 text-sm font-medium text-primary">
                                Lihat Semua ({umkm.images?.length ?? 0})
                            </p>
                        </div>
                    </div>
                </div>
                {(!umkm.images || umkm.images.length === 0) && (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
                        <ImagePlus className="mx-auto text-muted-foreground/40" />
                        <p className="mt-2 text-sm text-muted-foreground">Belum ada foto.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
