import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    Store,
    MapPin,
    Phone,
    User,
    Clock,
    ShieldCheck,
    ChevronLeft,
} from "lucide-react";
import { UmkmValidationForm } from "./umkm-validation-form";

const FACILITY_ICONS: Record<string, string> = {
    MOSQUE: "\u{1F54C}",
    RESTAURANT: "\u{1F37D}",
    ACCESSIBILITY: "\u{267F}",
    FAMILY: "\u{1F46A}",
    CLEANLINESS: "\u{1F9F4}",
    ADDITIONAL: "\u{2795}",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ValidasiUmkmDetailPage({ params }: PageProps) {
    const { id } = await params;

    const umkm = await prisma.umkm.findUnique({
        where: { id },
        include: {
            category: true,
            destination: true,
            images: { orderBy: { isPrimary: "desc" }, take: 1 },
            certifications: { orderBy: { createdAt: "desc" } },
            umkmHalalFacilities: {
                include: { facility: true },
            },
        },
    });

    if (!umkm) notFound();

    const primaryImage = umkm.images[0]?.imageUrl;

    return (
        <div className="flex flex-col gap-6 p-8 w-full">
            <nav className="flex items-center gap-2 text-sm text-stone-500">
                <Link
                    href="/validasi/umkm"
                    className="hover:text-emerald-700 transition-colors"
                >
                    Validasi UMKM
                </Link>
                <span className="text-stone-300">/</span>
                <span className="text-stone-900 font-medium">{umkm.name}</span>
            </nav>

            <div className="flex items-center gap-3">
                <Link
                    href="/validasi/umkm"
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">
                        Validasi UMKM
                    </h1>
                    <p className="text-sm text-stone-500">
                        Tinjau dan validasi data UMKM.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Profile */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Card */}
                    <div className="border border-stone-200 bg-white overflow-hidden">
                        {primaryImage && (
                            <div className="aspect-video bg-stone-100 overflow-hidden">
                                <img
                                    src={primaryImage}
                                    alt={umkm.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="p-5 space-y-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Store className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-stone-900">
                                            {umkm.name}
                                        </h2>
                                        {umkm.category && (
                                            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                                {umkm.category.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {umkm.description && (
                                <p className="text-sm text-stone-600 leading-relaxed">
                                    {umkm.description}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div className="flex items-center gap-2 text-stone-600">
                                    <User className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span>{umkm.owner}</span>
                                </div>
                                {umkm.phone && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                                        <span>{umkm.phone}</span>
                                    </div>
                                )}
                                {umkm.destination && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                                        <span>{umkm.destination.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-stone-600">
                                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span>
                                        {new Date(
                                            umkm.createdAt,
                                        ).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>

                            {umkm.address && (
                                <div className="pt-4 border-t border-stone-100">
                                    <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                                        Alamat
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {umkm.address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Facilities */}
                    {umkm.umkmHalalFacilities.length > 0 && (
                        <div className="border border-stone-200 bg-white p-5">
                            <h3 className="text-sm font-semibold text-stone-900 mb-3">
                                Fasilitas Halal
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {umkm.umkmHalalFacilities.map((uhf) => (
                                    <div
                                        key={uhf.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-sm text-stone-700"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{uhf.facility.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {umkm.certifications.length > 0 && (
                        <div className="border border-stone-200 bg-white p-5">
                            <h3 className="text-sm font-semibold text-stone-900 mb-3">
                                Klaim Sertifikasi Halal
                            </h3>
                            <div className="space-y-3">
                                {umkm.certifications.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span className="text-sm text-stone-700">
                                                {cert.certificateNo ||
                                                    "No. Sertifikat tidak tersedia"}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                cert.status === "VALID"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {cert.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <UmkmValidationForm
                        umkmId={umkm.id}
                        currentStatus={umkm.validationStatus}
                        currentNotes={umkm.surveyorNote}
                    />
                </div>
            </div>
        </div>
    );
}
