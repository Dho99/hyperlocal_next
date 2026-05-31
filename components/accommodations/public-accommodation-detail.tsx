"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Star, Phone, Globe, ArrowLeft, Building, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Accommodation } from "@/types/accommodation";
import { ReportDialog } from "@/components/report/report-dialog";

const RichTextRenderer = dynamic(
  () => import("@/components/editor/rich-text-renderer").then((m) => m.RichTextRenderer),
  { ssr: false, loading: () => <p className="text-stone-500 text-sm">Memuat konten...</p> },
);

interface PublicAccommodationDetailProps {
  id: string;
}

export function PublicAccommodationDetail({ id }: PublicAccommodationDetailProps) {
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/accommodations/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setAccommodation(res.data);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const primaryImage = useMemo(() => {
    if (!accommodation?.images?.length) return null;
    return accommodation.images.find((img) => img.isPrimary)?.imageUrl ?? accommodation.images[0].imageUrl;
  }, [accommodation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => router.push("/penginapan")} className="text-emerald-700 hover:underline text-sm">
          Kembali ke daftar penginapan
        </button>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Building className="size-12 mx-auto text-stone-300 mb-4" />
        <h2 className="font-heading text-xl font-semibold text-stone-900 mb-2">Penginapan tidak ditemukan</h2>
        <button onClick={() => router.push("/penginapan")} className="text-emerald-700 hover:underline text-sm">
          Kembali ke daftar penginapan
        </button>
      </div>
    );
  }

  const facilityNames = accommodation.facilities?.map((f) => f.facility.name) ?? [];

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
        <button
          onClick={() => router.push("/penginapan")}
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </button>

        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-stone-200 shadow-md">
          {primaryImage ? (
            <Image src={primaryImage} alt={accommodation.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building className="h-16 w-16 text-stone-400" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-bold text-stone-900">{accommodation.name}</h1>
            </div>
            <ReportDialog targetId={accommodation.id} targetType="ACCOMMODATION" />
          </div>
          {accommodation.rating != null && accommodation.rating > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-stone-900">{accommodation.rating.toFixed(1)}</span>
              {accommodation.reviewCount != null && (
                <span className="text-sm text-stone-500">({accommodation.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {(accommodation.city || accommodation.province) && (
          <p className="flex items-center gap-2 text-stone-600">
            <MapPin className="size-4 shrink-0" />
            {[accommodation.address, accommodation.city, accommodation.province].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {accommodation.phone && (
            <a href={`tel:${accommodation.phone}`} className="inline-flex items-center gap-2 text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-700 hover:border-emerald-200 hover:text-emerald-700 transition-colors">
              <Phone className="size-4" />
              {accommodation.phone}
            </a>
          )}
          {accommodation.website && (
            <a href={accommodation.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-700 hover:border-emerald-200 hover:text-emerald-700 transition-colors">
              <Globe className="size-4" />
              Website
            </a>
          )}
        </div>

        {facilityNames.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-lg text-stone-900">Fasilitas Halal</h2>
            <div className="flex flex-wrap gap-2">
              {facilityNames.map((name) => (
                <span key={name} className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {accommodation.description && (
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-lg text-stone-900">Deskripsi</h2>
            <div className="text-stone-700 leading-relaxed">
              <RichTextRenderer content={accommodation.description} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
