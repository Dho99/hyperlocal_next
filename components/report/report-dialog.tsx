"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReportSchema, CreateReportInput } from "@/lib/validations/report.schema";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2 } from "lucide-react";

const REPORT_REASONS = [
    "Informasi Salah",
    "Tempat Sudah Tutup",
    "Lokasi Tidak Akurat",
    "Konten Tidak Pantas",
    "Spam",
    "Lainnya",
];

interface ReportDialogProps {
    targetId: string;
    targetType: "DESTINATION" | "UMKM" | "ACCOMMODATION";
    trigger?: React.ReactNode;
}

export function ReportDialog({ targetId, targetType, trigger }: ReportDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateReportInput>({
        resolver: zodResolver(createReportSchema),
        defaultValues: {
            targetId,
            targetType,
            reason: "",
            description: "",
        },
    });

    const onSubmit = async (values: CreateReportInput) => {
        setIsLoading(true);
        try {
            await api.post("/reports", values);
            toast.success("Laporan berhasil dikirim. Terima kasih atas kontribusi Anda.");
            setOpen(false);
            form.reset();
        } catch (error) {
            toast.error("Gagal mengirim laporan. Silakan coba lagi nanti.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Flag className="h-4 w-4" />
                        Laporkan
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Laporkan Masalah</DialogTitle>
                    <DialogDescription>
                        Bantu kami menjaga kualitas informasi dengan melaporkan masalah yang Anda temukan.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alasan</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih alasan pelaporan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {REPORT_REASONS.map((reason) => (
                                                <SelectItem key={reason} value={reason}>
                                                    {reason}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi Tambahan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Berikan detail lebih lanjut tentang laporan Anda..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kirim Laporan
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
