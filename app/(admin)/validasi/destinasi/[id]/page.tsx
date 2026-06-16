"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    processValidationSchema,
    type ProcessValidationInput,
} from "@/lib/validations/unified-validation";
import {
    ChevronLeft,
    Building2,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    History,
    Loader2,
    Upload,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { DestinationValidationForm } from "./components/destination-validation-form";
import { Validation, ValidationEvidence } from "@/types/validation";
import { PhotoGallery } from "@/components/ui/photo-gallery";

export default function ProcessValidationPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [validation, setValidation] = useState<Validation | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<ProcessValidationInput>({
        resolver: zodResolver(processValidationSchema),
        defaultValues: {
            status: "PENDING",
            notes: "",
            certificateNo: "",
            issuer: "",
            issuedAt: undefined,
            expiredAt: undefined,
            documentUrl: "",
        },
    });

    const watchStatus = form.watch("status");

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/validations/${id}`);
                const data = await res.json();
                if (data.success) {
                    setValidation(data.data);
                    // Pre-fill form if already processed (for certification path)
                    form.reset({
                        status: data.data.status,
                        notes: data.data.notes || "",
                        certificateNo:
                            data.data.certification?.certificateNo || "",
                        issuer: data.data.certification?.issuer || "",
                        issuedAt: data.data.certification?.issuedAt
                            ? new Date(data.data.certification.issuedAt)
                            : undefined,
                        expiredAt: data.data.certification?.expiredAt
                            ? new Date(data.data.certification.expiredAt)
                            : undefined,
                        documentUrl: data.data.certification?.documentUrl || "",
                    });
                } else {
                    toast.error(data.message || "Gagal memuat data");
                        router.push("/validasi/destinasi");
                }
            } catch (error) {
                console.error("Error fetching validation detail:", error);
                toast.error("Terjadi kesalahan koneksi");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id, router, form]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                form.setValue("documentUrl", data.url);
                toast.success("File berhasil diunggah");
            } else {
                toast.error("Gagal mengunggah file");
            }
        } catch {
            toast.error("Terjadi kesalahan saat mengunggah");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (values: ProcessValidationInput) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/validations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                router.push("/validasi/destinasi");
                router.refresh();
            } else {
                toast.error(data.message || "Gagal memproses validasi");
            }
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan data");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">
                        Memuat detail validasi...
                    </p>
                </div>
            </div>
        );
    }

    if (!validation) return null;

    // Destination validation path
    if (validation.destinationId && validation.destination) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6 pb-20">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link
                                href="/validasi/destinasi"
                                className="hover:text-primary transition-colors"
                            >
                                Validasi
                            </Link>
                            <span className="text-muted-foreground/50">/</span>
                            <span className="text-foreground font-medium">
                                Validasi Destinasi
                            </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-full h-10 w-10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Validasi Destinasi
                                </h1>
                                <p className="text-muted-foreground">
                                    Tinjau dan nilai fasilitas halal destinasi
                                    wisata.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DestinationValidationForm
                    validationId={id}
                    destination={validation.destination}
                    currentStatus={validation.status}
                    currentNotes={validation.notes as string}
                    currentAdminScore={validation.adminScore as number}
                    currentCategoryScores={validation.categoryScores}
                />
            </div>
        );
    }

    // Certification validation path (existing logic)
    return (
        <div className="flex-1 space-y-8 p-8 pt-6 pb-20">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        href="/validasi/destinasi"
                        className="hover:text-primary transition-colors"
                    >
                        Validasi
                    </Link>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-foreground font-medium">Proses</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-full h-10 w-10"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Proses Validasi Halal
                            </h1>
                            <p className="text-muted-foreground">
                                Tinjau bukti dan terbitkan sertifikasi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Review Data */}
                <div className="lg:col-span-2 space-y-8">
                    {/* UMKM Context */}
                    <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Profil UMKM
                                </CardTitle>
                                <Badge variant="secondary">
                                    {validation.certification?.umkm?.category
                                        ?.name || "UMKM"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">
                                            Nama UMKM
                                        </label>
                                        <p className="font-bold text-lg">
                                            {
                                                validation.certification?.umkm
                                                    ?.name
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">
                                            Alamat
                                        </label>
                                        <p className="text-sm">
                                            {validation.certification?.umkm
                                                ?.address || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">
                                            ID Pengajuan
                                        </label>
                                        <p className="text-sm font-mono">
                                            {validation.id}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">
                                            Waktu Pengajuan
                                        </label>
                                        <p className="text-sm">
                                            {format(
                                                new Date(
                                                    validation.createdAt as Date,
                                                ),
                                                "dd MMMM yyyy, HH:mm",
                                                { locale: localeId },
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidences Gallery */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">
                                Bukti & Dokumen Pendukung
                            </h2>
                        </div>

                        {validation.evidences &&
                        validation.evidences.length > 0 ? (
                            <PhotoGallery
                                images={validation.evidences.map(
                                    (ev: ValidationEvidence) => ({
                                        imageUrl: ev.fileUrl,
                                        caption: ev.description,
                                    }),
                                )}
                                name="Bukti"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-xl text-center">
                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                                <p className="text-muted-foreground italic">
                                    Tidak ada bukti fisik yang dilampirkan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Historical Context if any */}
                    {validation?.certification?.validations &&
                        validation?.certification?.validations?.length > 1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold">
                                        Riwayat Validasi Sebelumnya
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {validation.certification.validations
                                        .filter((v) => v.id !== id)
                                        .map((v) => (
                                            <div
                                                key={v.id}
                                                className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border text-sm"
                                            >
                                                <div className="mt-1">
                                                    {v.status === "APPROVED" ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold">
                                                            {v.status}
                                                        </p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(
                                                                new Date(
                                                                    v.createdAt as Date,
                                                                ),
                                                                "dd MMM yyyy",
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        {v.notes ||
                                                            "Tidak ada catatan."}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                </div>

                {/* Right Section: Action Form */}
                <div className="space-y-6">
                    <Card className="sticky top-6 border-none shadow-lg ring-1 ring-primary/10 overflow-hidden">
                        <CardHeader className="bg-primary text-primary-foreground">
                            <CardTitle>Keputusan Validasi</CardTitle>
                            <CardDescription className="text-primary-foreground/80">
                                Tentukan status kelayakan sertifikasi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Status Keputusan
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">
                                                            Pending (Tunda)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="APPROVED"
                                                            className="text-green-600 font-medium"
                                                        >
                                                            APPROVED (Disetujui)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="REJECTED"
                                                            className="text-red-600 font-medium"
                                                        >
                                                            REJECTED (Ditolak)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Catatan Auditor
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Berikan alasan persetujuan atau penolakan..."
                                                        className="resize-none min-h-[100px]"
                                                        {...field}
                                                        value={
                                                            field.value || ""
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Conditional Certification Fields */}
                                    {watchStatus === "APPROVED" && (
                                        <div className="space-y-6 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="flex items-center gap-2 text-primary">
                                                <ShieldCheck className="h-5 w-5" />
                                                <h3 className="font-bold">
                                                    Data Sertifikasi
                                                </h3>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="certificateNo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Nomor Sertifikat
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="ID0011..."
                                                                {...field}
                                                                value={
                                                                    field.value ||
                                                                    ""
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="issuer"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Penerbit (Issuer)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="BPJPH / MUI"
                                                                {...field}
                                                                value={
                                                                    field.value ||
                                                                    ""
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="issuedAt"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Tgl Terbit
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    className="text-xs"
                                                                    value={
                                                                        field.value
                                                                            ? format(
                                                                                  field.value,
                                                                                  "yyyy-MM-dd",
                                                                              )
                                                                            : ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                                ? new Date(
                                                                                      e
                                                                                          .target
                                                                                          .value,
                                                                                  )
                                                                                : undefined,
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
                                                    name="expiredAt"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Tgl Kedaluwarsa
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    className="text-xs"
                                                                    value={
                                                                        field.value
                                                                            ? format(
                                                                                  field.value,
                                                                                  "yyyy-MM-dd",
                                                                              )
                                                                            : ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                                ? new Date(
                                                                                      e
                                                                                          .target
                                                                                          .value,
                                                                                  )
                                                                                : undefined,
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="documentUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Salinan Sertifikat
                                                            (PDF/JPG)
                                                        </FormLabel>
                                                        <div className="flex flex-col gap-2">
                                                            {field.value ? (
                                                                <div className="flex items-center justify-between p-2 rounded-md border bg-primary/5 border-primary/20">
                                                                    <div className="flex items-center gap-2 text-xs truncate">
                                                                        <FileText className="h-4 w-4 text-primary" />
                                                                        <span className="truncate max-w-[150px]">
                                                                            {field.value
                                                                                .split(
                                                                                    "/",
                                                                                )
                                                                                .pop()}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon-sm"
                                                                        onClick={() =>
                                                                            field.onChange(
                                                                                "",
                                                                            )
                                                                        }
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="relative border-2 border-dashed rounded-lg p-4 transition-colors hover:bg-muted/50 cursor-pointer">
                                                                    <input
                                                                        type="file"
                                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                                        onChange={
                                                                            handleFileUpload
                                                                        }
                                                                        disabled={
                                                                            isUploading
                                                                        }
                                                                        accept=".pdf,image/*"
                                                                    />
                                                                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                                                                        {isUploading ? (
                                                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                                        ) : (
                                                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                                                        )}
                                                                        <p className="text-xs font-medium">
                                                                            Unggah
                                                                            Dokumen
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-bold"
                                        disabled={isSubmitting || isUploading}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            "Simpan & Selesaikan"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-50/50 border-yellow-200">
                        <CardContent className="p-4 flex gap-3">
                            <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                <strong>Catatan Auditor:</strong> Pastikan
                                seluruh bukti fisik telah diperiksa dengan
                                teliti sebelum memberikan keputusan APPROVED.
                                Keputusan yang disimpan akan langsung
                                memperbarui status sertifikasi publik UMKM.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
