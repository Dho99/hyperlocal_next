"use client";

import { HelpCircle, MapPin, Store, Building2, Database, BarChart2, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import Link from "next/link";

interface FlowStep {
    text: string;
    link?: string;
}

interface Flow {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    steps: FlowStep[];
}

const flows: Flow[] = [
    {
        id: "validasi-destinasi",
        icon: <MapPin className="h-4 w-4" />,
        title: "Validasi Destinasi",
        description: "Proses validasi halal untuk destinasi wisata",
        steps: [
            {
                text: "Buka halaman Daftar Destinasi",
                link: "/destinations",
            },
            {
                text: "Pilih destinasi yang akan divalidasi, atau buat destinasi baru",
                link: "/destinations/new",
            },
            {
                text: "Edit destinasi: lengkapi semua data (nama, alamat, koordinat, kategori), tambahkan fasilitas halal, upload bukti foto (evidence) per kategori fasilitas",
            },
            {
                text: "Simpan perubahan",
            },
            {
                text: "Buka halaman Validasi Destinasi",
                link: "/validasi/destinasi",
            },
            {
                text: "Cari destinasi terkait → klik ikon mata untuk membuka form validasi",
            },
            {
                text: "Review skor per kategori fasilitas, tambahkan catatan, klik Setujui atau Tolak",
            },
        ],
    },
    {
        id: "validasi-umkm",
        icon: <Store className="h-4 w-4" />,
        title: "Validasi UMKM",
        description: "Proses validasi dan sertifikasi halal untuk UMKM",
        steps: [
            {
                text: "Buka halaman Daftar UMKM",
                link: "/umkms",
            },
            {
                text: "Pilih UMKM yang akan divalidasi, atau buat UMKM baru",
                link: "/umkms/new",
            },
            {
                text: "Edit UMKM: lengkapi data bisnis (nama, kategori, kontak, lokasi), tambah fasilitas halal, upload dokumen sertifikasi halal jika ada",
            },
            {
                text: "Simpan perubahan",
            },
            {
                text: "Buka halaman Validasi UMKM",
                link: "/validasi/umkm",
            },
            {
                text: "Gunakan filter untuk menyaring status → klik tombol Proses pada UMKM yang dituju",
            },
            {
                text: "Isi catatan surveyor, pilih status: Setujui / Tolak / Perlu Revisi",
            },
        ],
    },
    {
        id: "validasi-penginapan",
        icon: <Building2 className="h-4 w-4" />,
        title: "Validasi Penginapan",
        description: "Proses validasi halal untuk penginapan/akomodasi",
        steps: [
            {
                text: "Buka halaman Penginapan",
                link: "/accommodations",
            },
            {
                text: "Pilih penginapan yang akan divalidasi, atau tambah baru",
                link: "/accommodations/new",
            },
            {
                text: "Edit penginapan: lengkapi info umum, pilih fasilitas halal yang tersedia (mushola, dapur halal, dll), upload gambar",
            },
            {
                text: "Simpan perubahan",
            },
            {
                text: "Buka halaman Validasi Penginapan",
                link: "/validasi/penginapan",
            },
            {
                text: "Filter berdasarkan status → klik Proses pada penginapan yang dituju",
            },
            {
                text: "Review kelengkapan data → pilih status validasi",
            },
        ],
    },
    {
        id: "data-master",
        icon: <Database className="h-4 w-4" />,
        title: "Manajemen Data Master",
        description: "Kelola data referensi yang digunakan di seluruh sistem",
        steps: [
            {
                text: "Area Cakupan — tambah/edit wilayah layanan sistem",
                link: "/coverage-areas",
            },
            {
                text: "Fasilitas — kelola master daftar fasilitas halal (musala, toilet, dll)",
                link: "/facilities",
            },
            {
                text: "Kategori Destinasi — kelola tipe-tipe destinasi wisata",
                link: "/destinations/categories",
            },
            {
                text: "Kategori UMKM — kelola tipe bisnis kuliner, kerajinan, dll",
                link: "/umkms/categories",
            },
        ],
    },
    {
        id: "analytics",
        icon: <BarChart2 className="h-4 w-4" />,
        title: "Analytics & Laporan",
        description: "Monitor performa sistem dan ekspor data",
        steps: [
            {
                text: "Dashboard — overview real-time semua data dan aktivitas terkini",
                link: "/dashboard",
            },
            {
                text: "Statistik — chart analitik mendalam: distribusi, tren, dan engagement",
                link: "/statistics",
            },
            {
                text: "Rekomendasi — gap analysis untuk mengidentifikasi destinasi/UMKM yang prioritas divalidasi",
                link: "/rekomendasi",
            },
            {
                text: "Laporan — ekspor data ke CSV, Excel, atau PDF",
                link: "/laporan",
            },
            {
                text: "Kelola Laporan — tindak lanjuti laporan masalah dari pengguna publik",
                link: "/reports",
            },
        ],
    },
];

function FlowSection({ flow }: { flow: Flow }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                        {flow.icon}
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight">{flow.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{flow.description}</p>
                    </div>
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="px-4 py-3 space-y-2">
                    {flow.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                {idx + 1}
                            </div>
                            <div className="flex-1 text-sm text-foreground leading-snug">
                                {step.link ? (
                                    <Link
                                        href={step.link}
                                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 hover:underline"
                                    >
                                        {step.text}
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                ) : (
                                    step.text
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function AdminGuide() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[#eef7f2]"
                    title="Panduan Penggunaan"
                >
                    <HelpCircle className="h-4.5 w-4.5 text-[#1d1b20]" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[480px] overflow-y-auto"
            >
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2 font-heading text-lg">
                        <HelpCircle className="h-5 w-5 text-emerald-700" />
                        Panduan Penggunaan Sistem
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                        Panduan alur kerja untuk setiap fitur utama admin.
                    </p>
                </SheetHeader>

                <div className="mt-5 space-y-3 pb-8">
                    {flows.map((flow) => (
                        <FlowSection key={flow.id} flow={flow} />
                    ))}
                </div>

                <div className="border-t pt-4 pb-2">
                    <p className="text-[11px] text-muted-foreground text-center">
                        Klik judul flow untuk memperluas langkah-langkah detail.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
