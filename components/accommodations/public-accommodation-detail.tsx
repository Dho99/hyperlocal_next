"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, Phone, Globe, ArrowLeft, Building, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Accommodation } from "@/types/accommodation";
import { ReportDialog } from "@/components/report/report-dialog";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import {
  ImageLightbox,
  useImageLightbox,
} from "@/components/ui/image-lightbox";

const RichTextRenderer = dynamic(
  () => import("@/components/editor/rich-text-renderer").then((m) => m.RichTextRenderer),
  { ssr: false, loading: () => <p className="text-stone-500 text-sm">Memuat konten...</p> },
);

interface PublicAccommodationDetailProps {
  identifier: string;
}

export function PublicAccommodationDetail({ identifier }: PublicAccommodationDetailProps) {
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lightbox = useImageLightbox();

  useEffect(() => {
    fetch(`/api/accommodations/${identifier}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setAccommodation(res.data);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [identifier]);

  const primaryImage = useMemo(() => {
    if (!accommodation?.images?.length) return null;
    return accommodation.images.find((img) => img.isPrimary)?.imageUrl ?? accommodation.images[0].imageUrl;
  }, [accommodation]);

  const primaryIndex = useMemo(() => {
    if (!accommodation?.images?.length) return 0;
    const i = accommodation.images.findIndex((img) => img.isPrimary);
    return i >= 0 ? i : 0;
  }, [accommodation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={() => router.push("/penginapan")} className="text-accent hover:underline text-sm">
          Kembali ke daftar penginapan
        </button>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Building className="size-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Penginapan tidak ditemukan</h2>
        <button onClick={() => router.push("/penginapan")} className="text-accent hover:underline text-sm">
          Kembali ke daftar penginapan
        </button>
      </div>
    );
  }

  const facilityNames = accommodation.facilities?.map((f) => f.facility.name) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
        <button
          onClick={() => router.push("/penginapan")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </button>

        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-muted shadow-md">
          {primaryImage ? (
            <>
              <Image src={primaryImage} alt={accommodation.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
              <button
                type="button"
                onClick={() => lightbox.openAt(primaryIndex)}
                aria-label={`Lihat galeri foto ${accommodation.name}`}
                className="absolute inset-0 cursor-zoom-in focus:outline-none"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-bold text-foreground">{accommodation.name}</h1>
              {accommodation.validationStatus === "APPROVED" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-accent/20 text-accent border border-accent/20">
                  ✓ Tervalidasi Halal
                </span>
              )}
            </div>
            <ReportDialog targetId={accommodation.id} targetType="ACCOMMODATION" />
          </div>
          {accommodation.rating != null && accommodation.rating > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-2">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{accommodation.rating.toFixed(1)}</span>
              {accommodation.reviewCount != null && (
                <span className="text-sm text-muted-foreground">({accommodation.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {(accommodation.city || accommodation.province) && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {[accommodation.address, accommodation.city, accommodation.province].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {accommodation.phone && (
            <a href={`tel:${accommodation.phone}`} className="inline-flex items-center gap-2 text-sm bg-card border border-border rounded-lg px-3 py-2 text-muted-foreground hover:border-accent/30 hover:text-accent transition-colors">
              <Phone className="size-4" />
              {accommodation.phone}
            </a>
          )}
          {accommodation.website && (
            <a href={accommodation.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-card border border-border rounded-lg px-3 py-2 text-muted-foreground hover:border-accent/30 hover:text-accent transition-colors">
              <Globe className="size-4" />
              Website
            </a>
          )}
        </div>

        {facilityNames.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-lg text-foreground">Fasilitas Halal</h2>
            <div className="flex flex-wrap gap-2">
              {facilityNames.map((name) => (
                <span key={name} className="text-sm bg-accent/10 text-accent px-3 py-1.5 rounded-full border border-accent/20 font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {accommodation.description && (
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-lg text-foreground">Deskripsi</h2>
            <div className="text-muted-foreground leading-relaxed">
              <RichTextRenderer content={accommodation.description} />
            </div>
          </div>
        )}

        <PhotoGallery
          images={accommodation.images ?? []}
          name={accommodation.name}
          heading="Galeri Foto"
          controller={lightbox}
        />
      </main>

      <ImageLightbox
        images={accommodation.images ?? []}
        open={lightbox.open}
        index={lightbox.index}
        onOpenChange={lightbox.setOpen}
        onIndexChange={lightbox.setIndex}
        alt={accommodation.name}
      />
    </div>
  );
}
