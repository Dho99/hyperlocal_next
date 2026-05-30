import Image from "next/image";
import { Store, Star, CheckCircle2 } from "lucide-react";
import { formatDistance, type NearbyUmkm } from "@/fitur/destinasi/data/destinasi-detail-data";

interface UmkmSectionProps {
    umkms: NearbyUmkm[];
}

export function UmkmSection({ umkms }: UmkmSectionProps) {
    if (umkms.length === 0) return null;

    return (
        <section>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                UMKM di Sekitar Destinasi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {umkms.slice(0, 4).map((umkm) => (
                    <div
                        key={umkm.id}
                        className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm"
                    >
                        <div className="flex gap-3 p-3">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-accent">
                                {umkm.primaryImage ? (
                                    <Image
                                        src={umkm.primaryImage}
                                        alt={umkm.name}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Store className="size-7 text-border" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                                        {umkm.name}
                                    </h3>
                                    {umkm.validCertification && (
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    )}
                                </div>
                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                    {umkm.category?.name ?? "UMKM"}
                                    {" • "}
                                    {formatDistance(umkm.distance)}
                                </p>
                                {umkm.rating != null && (
                                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                                        <Star className="size-3 fill-[#e7c365] text-[#e7c365]" />
                                        {umkm.rating.toFixed(1)}
                                        {umkm.reviewCount != null && (
                                            <span className="font-normal text-muted-foreground">
                                                ({umkm.reviewCount})
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
