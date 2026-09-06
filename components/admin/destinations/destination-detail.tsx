"use client";

import { useState, useEffect } from "react";
import { getDestination } from "@/lib/api/destination";
import { getApiErrorMessage } from "@/lib/api-error";
import { Destination } from "@/types/destination";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Navigation,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { DynamicContextMap } from "@/components/maps";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import {
  AceshModelDiagram,
  type AceshModelDatum,
} from "@/components/admin/acesh/acesh-model-diagram";
import { AceshRuleActions } from "@/components/admin/acesh/acesh-rule-actions";

interface DestinationDetailProps {
  id: string;
}

export function DestinationDetail({ id }: DestinationDetailProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [aceshModel, setAceshModel] = useState<AceshModelDatum | null>(null);
  const [aceshTree, setAceshTree] = useState<{
    groupBreakdown: any[];
    indicators: any[];
    evidenceRecords: any[];
  } | null>(null);
  const [descOpen, setDescOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getDestination(id);
        console.log(data);
        setDestination(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/destinations/${id}/acesh`);
        if (!res.ok) {
          if (!cancelled) setAceshModel(null);
          return;
        }
        const json = await res.json();
        if (!cancelled) setAceshModel(json.data as AceshModelDatum);
      } catch {
        if (!cancelled) setAceshModel(null);
      }
    })();
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/destinations/${id}/acesh-assessment`,
        );
        if (!res.ok) return;
        const json = await res.json();
        const d = json.data;
        if (!cancelled && d) {
          setAceshTree({
            groupBreakdown: d.groupBreakdown ?? [],
            indicators: (d.indicators ?? []).map((ind: any) => ({
              id: ind.id,
              code: ind.code,
              name: ind.name,
              group: ind.group,
              weight: ind.weight,
              value: ind.score?.value ?? 0,
            })),
            evidenceRecords: d.evidenceRecords ?? [],
          });
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
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
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-destructive">
            Gagal Memuat Data
          </h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push("/destinations")}
          >
            Kembali ke Daftar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!destination) {
    return (
      <div className="text-center p-20">
        <h3 className="text-lg font-bold">Destinasi tidak ditemukan</h3>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/destinations")}
        >
          Kembali
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/destinations")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">
            Detail Destinasi
          </h1>
          <p className="text-sm text-muted-foreground">
            Melihat informasi lengkap mengenai {destination.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
            <div className="relative aspect-video bg-muted">
              {destination.images && destination.images.length > 0 ? (
                <Image
                  src={destination.images[0].imageUrl}
                  alt={destination.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 opacity-20" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 shadow-lg">
                  {destination.category?.name || "Kategori"}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold font-heading">
                    {destination.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {destination.city}, {destination.province}
                    </span>
                  </div>
                </div>
                <Badge variant="success" className="px-3 py-1 font-bold">
                  Terverifikasi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => setDescOpen((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/30"
                >
                  <span className="font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Deskripsi
                  </span>
                  {descOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <div
                  className={`grid transition-all ${descOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 max-h-[480px] overflow-auto">
                      <RichTextRenderer content={destination.description} />
                      {!destination.description && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada deskripsi.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  Lokasi & Alamat
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      Alamat
                    </p>
                    <p className="text-sm">{destination.address || "-"}</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                      Koordinat
                    </p>
                    <p className="text-sm">
                      {destination.latitude?.toString() ?? "-"},{" "}
                      {destination.longitude?.toString() ?? "-"}
                    </p>
                  </div>
                </div>

                {String(destination?.latitude) &&
                  String(destination?.longitude) && (
                    <DynamicContextMap
                      destination={{
                        id: destination.id,
                        name: destination.name,
                        latitude: Number(destination.latitude),
                        longitude: Number(destination.longitude),
                        facilities: (
                          destination.destinationHalalFacilities ?? []
                        )
                          .filter(
                            (f) => f.latitude != null && f.longitude != null,
                          )
                          .map((f) => ({
                            id: f.id,
                            name: f.facility?.name ?? "",
                            type: f.facility?.facilityType ?? "",
                            latitude: f.latitude!,
                            longitude: f.longitude!,
                          })),
                      }}
                      className="h-[400px] w-full rounded-lg border shadow-inner mt-4"
                    />
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Galeri Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {destination.images && destination.images.length > 0 ? (
                <PhotoGallery
                  images={destination.images}
                  name={destination.name}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                  Belum ada foto galeri.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ditambahkan</span>
                </div>
                <span className="font-medium">
                  {formatDate(destination.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Pembaruan Terakhir</span>
                </div>
                <span className="font-medium">
                  {formatTime(destination.updatedAt)}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  Slug URL
                </p>
                <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                  {destination.slug}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/destinations/${destination.id}/edit`)
              }
            >
              Edit Destinasi
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/destinations")}
            >
              Kembali ke Daftar
            </Button>
          </div>
        </div>
      </div>

      {/* Full-width ACES-H Model - w-full with integrated recommendations */}
      <Card className="w-full border-none shadow-sm ring-1 ring-border/50">
        {/* <CardHeader>
                    <CardTitle className="text-sm font-heading">Model SAFAR ACES-H</CardTitle>
                    <CardDescription className="text-xs">Tiga lapis penilaian terintegrasi diagnosis & rekomendasi — klik domain untuk detail, before-after simulation</CardDescription>
                </CardHeader> */}
        <CardContent>
          <AceshModelDiagram
            data={aceshModel}
            groupBreakdown={aceshTree?.groupBreakdown}
            indicators={aceshTree?.indicators}
            evidenceRecords={aceshTree?.evidenceRecords}
            profile={{
              slug: destination.slug,
              categoryName: destination.category?.name ?? undefined,
              city: destination.city ?? undefined,
            }}
          />
        </CardContent>
      </Card>

      {/* Rule-based actions — saran peningkatan ACES-H (Quick/Medium/Strategic) */}
      <AceshRuleActions destinationId={id} />
    </div>
  );
}
