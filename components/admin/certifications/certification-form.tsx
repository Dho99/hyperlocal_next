"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    createCertificationSchema, 
    type CreateCertificationInput 
} from "@/lib/validations/halal-certification.schema";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CertificationStatus } from "@/lib/generated/prisma";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface CertificationFormProps {
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CertificationForm({
    initialData,
    onSuccess,
    onCancel,
}: CertificationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [umkms, setUmkms] = useState<any[]>([]);

    const form = useForm<CreateCertificationInput>({
        resolver: zodResolver(createCertificationSchema),
        defaultValues: {
            umkmId: initialData?.umkmId || "",
            certificateNo: initialData?.certificateNo || "",
            issuer: initialData?.issuer || "",
            issuedAt: initialData?.issuedAt ? new Date(initialData.issuedAt) : undefined,
            expiredAt: initialData?.expiredAt ? new Date(initialData.expiredAt) : undefined,
            status: initialData?.status || CertificationStatus.PENDING,
            documentUrl: initialData?.documentUrl || "",
        },
    });

    useEffect(() => {
        const fetchUmkms = async () => {
            try {
                const res = await fetch("/api/umkms?limit=100");
                const data = await res.json();
                if (data.success) {
                    setUmkms(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch UMKMs:", error);
            }
        };
        fetchUmkms();
    }, []);

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
        } catch (error) {
            toast.error("Terjadi kesalahan saat mengunggah");
        } finally {
            setIsUploading(false);
        }
    };

    async function onSubmit(values: CreateCertificationInput) {
        setIsLoading(true);
        try {
            const url = initialData 
                ? `/api/certifications/${initialData.id}` 
                : "/api/certifications";
            
            const method = initialData ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                onSuccess();
            } else {
                toast.error(data.message || "Terjadi kesalahan");
            }
        } catch (error) {
            toast.error("Gagal menghubungkan ke server");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                    control={form.control}
                    name="umkmId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>UMKM</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!!initialData}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih UMKM" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {umkms.map((umkm) => (
                                        <SelectItem key={umkm.id} value={umkm.id}>
                                            {umkm.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="certificateNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. Sertifikat</FormLabel>
                                <FormControl>
                                    <Input placeholder="ID0011..." {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(CertificationStatus).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="issuer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Penerbit (Issuer)</FormLabel>
                            <FormControl>
                                <Input placeholder="BPJPH, MUI, dll" {...field} value={field.value || ""} />
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
                                <FormLabel>Tgl Terbit</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field} 
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""} 
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
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
                                <FormLabel>Tgl Kedaluwarsa</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field} 
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
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
                            <FormLabel>Dokumen Sertifikat</FormLabel>
                            <div className="flex flex-col gap-2">
                                {field.value ? (
                                    <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                        <div className="flex items-center gap-2 text-xs">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="truncate max-w-[200px]">Dokumen Terpilih</span>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon-sm" 
                                            onClick={() => field.onChange("")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative border-2 border-dashed rounded-lg p-4 transition-colors hover:bg-muted/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            accept=".pdf,image/*"
                                        />
                                        <div className="flex flex-col items-center justify-center gap-1 text-center">
                                            {isUploading ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            ) : (
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                            )}
                                            <p className="text-xs font-medium">Klik atau drop file di sini</p>
                                            <p className="text-[10px] text-muted-foreground">PDF atau Gambar (Maks 5MB)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading || isUploading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Simpan Perubahan" : "Tambah Sertifikasi"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
