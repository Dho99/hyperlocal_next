"use client";

import { useState, useEffect } from "react";
import { getUmkm } from "@/lib/api/umkm";
import { getApiErrorMessage } from "@/lib/api-error";
import { Umkm } from "@/types/umkm";
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
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Store,
  Phone,
  FileCheck,
  CheckCircle2,
  XCircle,
  Info,
  User as UserIcon
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

interface UmkmDetailProps {
  id: string;
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
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-destructive">Gagal Memuat Data</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push("/umkms")}
          >
            Kembali ke Daftar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!umkm) {
    return (
      <div className="text-center p-20">
        <h3 className="text-lg font-bold">UMKM tidak ditemukan</h3>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/umkms")}>
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

  const getStatusBadge = () => {
    const cert = umkm.certifications?.[0];
    if (!cert) return <Badge variant="outline">Belum Terdaftar</Badge>;

    switch (cert.status) {
      case "VALID":
        return (
          <Badge variant="success" className="gap-1 font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Terverifikasi Halal
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1 font-bold">
            <Clock className="h-3 w-3" />
            Dalam Proses
          </Badge>
        );
      case "EXPIRED":
      case "REVOKED":
        return (
          <Badge variant="destructive" className="gap-1 font-bold">
            <XCircle className="h-3 w-3" />
            {cert.status === "EXPIRED" ? "Kedaluwarsa" : "Sertifikat Dicabut"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{cert.status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/umkms")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">Detail UMKM</h1>
          <p className="text-sm text-muted-foreground">Melihat informasi lengkap mengenai {umkm.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
            <div className="relative aspect-video bg-muted">
              {umkm.images && umkm.images.length > 0 ? (
                <Image
                  src={umkm.images[0].imageUrl}
                  alt={umkm.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Store className="h-12 w-12 opacity-20" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 shadow-lg">
                  {umkm.category?.name || "Kategori UMKM"}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold font-heading">{umkm.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{umkm.address || "Alamat belum diatur"}</span>
                  </div>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Tentang Usaha
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {umkm.description || "Tidak ada deskripsi tersedia."}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  Kontak & Lokasi
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Nomor Telepon</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-primary" />
                      {umkm.phone || "-"}
                    </div>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Destinasi Terkait</p>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-primary" />
                      {umkm.destination?.name || "Mandiri (Tidak Terikat)"}
                    </div>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30 col-span-full">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Koordinat Peta</p>
                    <p className="text-sm">{umkm.latitude || "-"}, {umkm.longitude || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {umkm.certifications && umkm.certifications.length > 0 && (
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Informasi Sertifikasi Halal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {umkm.certifications.map((cert) => (
                    <div key={cert.id} className="grid gap-4 sm:grid-cols-2 border rounded-lg p-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Nomor Sertifikat</p>
                        <p className="text-sm font-medium">{cert.certificateNo || "Sedang diproses"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Penerbit</p>
                        <p className="text-sm">{cert.issuer || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Tanggal Terbit</p>
                        <p className="text-sm">{cert.issuedAt ? formatDate(cert.issuedAt) : "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Masa Berlaku</p>
                        <p className="text-sm">{cert.expiredAt ? formatDate(cert.expiredAt) : "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Foto Galeri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {umkm.images && umkm.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {umkm.images.map((image, idx) => (
                    <div key={idx} className="relative aspect-square rounded bg-muted overflow-hidden border">
                      <Image
                        src={image.imageUrl}
                        alt={`${umkm.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">Belum ada foto.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span>Pemilik</span>
                </div>
                <span className="font-medium">{umkm.owner || "Tidak ada pemilik"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Pendaftaran</span>
                </div>
                <span className="font-medium">{formatDate(umkm.createdAt)}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Slug URL</p>
                <div className="bg-muted p-2 rounded text-xs font-mono break-all italic">
                  {umkm.slug}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => router.push(`/umkms/${umkm.id}/edit`)}
            >
              Edit UMKM
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/umkms")}
            >
              Kembali ke Daftar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
