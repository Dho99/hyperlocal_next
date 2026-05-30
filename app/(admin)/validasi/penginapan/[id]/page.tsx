import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
    Building2,
    MapPin,
    Phone,
    Globe,
    ChevronLeft,
    ShieldCheck,
    Star,
} from "lucide-react";
import { PenginapanValidationForm } from "./penginapan-validation-form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ValidasiPenginapanDetailPage({ params }: PageProps) {
    const { id } = await params;

    const accommodation = await prisma.accommodation.findUnique({
        where: { id },
        include: {
            images: { orderBy: { isPrimary: "desc" } },
            facilities: {
                include: { facility: true },
            },
        },
    });

    if (!accommodation) notFound();

    const primaryImage = accommodation.images.find((img) => img.isPrimary)?.imageUrl ?? accommodation.images[0]?.imageUrl;

    return (
        <div className="flex flex-col gap-6 p-8 w-full">
            <nav className="flex items-center gap-2 text-sm text-stone-500">
                <Link
                    href="/validasi/penginapan"
                    className="hover:text-emerald-700 transition-colors"
                >
                    Validasi Penginapan
                </Link>
                <span className="text-stone-300">/</span>
                <span className="text-stone-900 font-medium">{accommodation.name}</span>
            </nav>

            <div className="flex items-center gap-3">
                <Link
                    href="/validasi/penginapan"
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">
                        Validasi Penginapan
                    </h1>
                    <p className="text-sm text-stone-500">
                        Tinjau dan validasi data penginapan.
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
                                    alt={accommodation.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="p-5 space-y-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Building2 className="w-5 h-5 text-emerald-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-stone-900">
                                            {accommodation.name}
                                        </h2>
                                        {accommodation.rating && (
                                            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                {accommodation.rating.toFixed(1)}
                                                {accommodation.reviewCount != null && (
                                                    <> &middot; {accommodation.reviewCount} ulasan</>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {accommodation.description && (
                                <div className="text-sm text-stone-600 leading-relaxed prose prose-sm max-w-none">
                                    {typeof accommodation.description === "object" &&
                                    "html" in (accommodation.description as Record<string, unknown>)
                                        ? (accommodation.description as { html?: string }).html
                                        : typeof accommodation.description === "string"
                                          ? accommodation.description
                                          : null}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                {accommodation.phone && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                                        <span>{accommodation.phone}</span>
                                    </div>
                                )}
                                {accommodation.website && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <Globe className="w-4 h-4 text-stone-400 shrink-0" />
                                        <span className="truncate">{accommodation.website}</span>
                                    </div>
                                )}
                                {accommodation.city && (
                                    <div className="flex items-center gap-2 text-stone-600">
                                        <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                                        <span>
                                            {[accommodation.city, accommodation.province]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-stone-600">
                                    <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span>
                                        {accommodation.latitude != null && accommodation.longitude != null
                                            ? `${Number(accommodation.latitude).toFixed(4)}, ${Number(accommodation.longitude).toFixed(4)}`
                                            : "Koordinat tidak tersedia"}
                                    </span>
                                </div>
                            </div>

                            {accommodation.address && (
                                <div className="pt-4 border-t border-stone-100">
                                    <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">
                                        Alamat
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {accommodation.address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    {accommodation.images.length > 0 && (
                        <div className="border border-stone-200 bg-white p-5">
                            <h3 className="text-sm font-semibold text-stone-900 mb-3">
                                Foto Penginapan
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {accommodation.images.map((img) => (
                                    <div key={img.id} className="aspect-[4/3] bg-stone-100 rounded-md overflow-hidden">
                                        <img
                                            src={img.imageUrl}
                                            alt={img.caption ?? accommodation.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Facilities */}
                    {accommodation.facilities.length > 0 && (
                        <div className="border border-stone-200 bg-white p-5">
                            <h3 className="text-sm font-semibold text-stone-900 mb-3">
                                Fasilitas Halal
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {accommodation.facilities.map((ahf) => (
                                    <div
                                        key={ahf.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-sm text-stone-700"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{ahf.facility.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <PenginapanValidationForm
                        accommodationId={accommodation.id}
                        currentStatus={accommodation.validationStatus}
                        currentNotes={accommodation.surveyorNote}
                    />
                </div>
            </div>
        </div>
    );
}
