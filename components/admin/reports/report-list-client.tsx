"use client";

import { useState } from "react";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Clock,
    ExternalLink,
    Eye,
    MapPin,
    Trash2,
} from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Report } from "@/types/report";

function getTargetHref(report: Report) {
    if (!report.target) return null;
    switch (report.targetType) {
        case "DESTINATION":
            return `/destinasi/${report.target.slug}`;
        case "UMKM":
            return `/umkm/${report.target.slug}`;
        case "ACCOMMODATION":
            return `/penginapan/${report.target.slug}`;
        default:
            return null;
    }
}

export function ReportListClient() {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [status, setStatus] = useState<Report["status"]>("PENDING");

    const {
        data: reports,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useCursorPagination<Report>({ url: "/api/reports" });

    const handleUpdateStatus = async () => {
        if (!selectedReport) return;
        setIsUpdating(true);
        try {
            await api.patch(`/admin/reports/${selectedReport.id}`, {
                status,
                adminNotes,
            });
            refresh();
            toast.success("Status laporan berhasil diperbarui");
            setIsDetailsOpen(false);
        } catch {
            toast.error("Gagal memperbarui status laporan");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedReport) return;
        setIsDeleting(true);
        try {
            await api.delete(`/admin/reports/${selectedReport.id}`);
            refresh();
            toast.success("Laporan berhasil dihapus");
            setIsDetailsOpen(false);
        } catch {
            toast.error("Gagal menghapus laporan");
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: Report["status"]) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                        Pending
                    </Badge>
                );
            case "INVESTIGATING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                        Investigating
                    </Badge>
                );
            case "RESOLVED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        Resolved
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                    >
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const openDetails = (report: Report) => {
        setSelectedReport(report);
        setStatus(report.status);
        setAdminNotes(report.adminNotes || "");
        setIsDetailsOpen(true);
    };

    const selectedHref = selectedReport ? getTargetHref(selectedReport) : null;

    return (
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="min-w-[240px]">
                            Data Dilaporkan
                        </TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead>Pelapor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.length === 0 && !isLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Tidak ada laporan ditemukan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        reports.map((report) => {
                            const href = getTargetHref(report);
                            return (
                                <TableRow
                                    key={report.id}
                                    className="hover:bg-stone-50/50 transition-colors"
                                >
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {format(
                                            new Date(report.createdAt),
                                            "dd MMM yyyy, HH:mm",
                                            { locale: localeId },
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[280px] space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="shrink-0 font-normal uppercase text-[10px] tracking-wider"
                                                >
                                                    {report.targetType}
                                                </Badge>
                                                {report.target ? (
                                                    <span
                                                        className="truncate text-sm font-medium"
                                                        title={
                                                            report.target.name
                                                        }
                                                    >
                                                        {report.target.name}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Data tidak ditemukan
                                                    </span>
                                                )}
                                            </div>
                                            {report.target ? (
                                                <p
                                                    className="flex items-start gap-1 text-xs text-muted-foreground"
                                                    title={
                                                        report.target.address ??
                                                        undefined
                                                    }
                                                >
                                                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                                                    <span className="truncate">
                                                        {report.target
                                                            .parentName
                                                            ? `${report.target.parentName} · `
                                                            : ""}
                                                        {report.target.address ??
                                                            "Alamat belum tersedia"}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="truncate font-mono text-[10px] text-muted-foreground">
                                                    Ref: {report.targetId}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[180px] truncate">
                                        {report.reason}
                                    </TableCell>
                                    <TableCell>
                                        {report.reporter ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {report.reporter.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                                                    {report.reporter.email}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-sm">
                                                Anonim
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(report.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() =>
                                                    openDetails(report)
                                                }
                                                title="Detail Laporan"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {href ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    asChild
                                                    title="Lihat Target"
                                                >
                                                    <Link
                                                        href={href}
                                                        target="_blank"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    disabled
                                                    title="Data target sudah dihapus"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
            <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                next={loadMore}
            />

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[540px]">
                    <DialogHeader>
                        <DialogTitle>Detail Laporan</DialogTitle>
                        <DialogDescription>
                            Tinjau detail laporan dan perbarui status
                            penanganan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Data yang Dilaporkan
                                </Label>
                                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="font-normal uppercase text-[10px] tracking-wider"
                                            >
                                                {selectedReport.targetType}
                                            </Badge>
                                            <span className="text-sm font-semibold">
                                                {selectedReport.target?.name ??
                                                    "Data tidak ditemukan"}
                                            </span>
                                        </div>
                                        {selectedHref && (
                                            <Link
                                                href={selectedHref}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                            >
                                                Buka halaman
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>

                                    {selectedReport.target?.parentName && (
                                        <p className="text-xs text-muted-foreground">
                                            Destinasi:{" "}
                                            {selectedReport.target.parentName}
                                        </p>
                                    )}

                                    {selectedReport.target?.address && (
                                        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span>
                                                {selectedReport.target.address}
                                            </span>
                                        </p>
                                    )}

                                    {!selectedReport.target && (
                                        <p className="flex items-start gap-1.5 text-xs text-amber-700">
                                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            Data ini sudah dihapus atau
                                            diubah, sehingga halaman targetnya
                                            tidak bisa dibuka lagi.
                                        </p>
                                    )}

                                    <p className="font-mono text-[10px] text-muted-foreground">
                                        Ref: {selectedReport.targetId}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">
                                        Alasan
                                    </Label>
                                    <p className="font-medium">
                                        {selectedReport.reason}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">
                                        Waktu Laporan
                                    </Label>
                                    <p className="font-medium">
                                        {format(
                                            new Date(
                                                selectedReport.createdAt,
                                            ),
                                            "dd MMMM yyyy, HH:mm",
                                            { locale: localeId },
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Deskripsi Pelapor
                                </Label>
                                <div className="p-3 bg-stone-100 rounded-md text-sm italic min-h-[60px]">
                                    {selectedReport.description ||
                                        "Tidak ada deskripsi tambahan."}
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Update Status
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={(v) =>
                                            setStatus(v as Report["status"])
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status baru" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="INVESTIGATING">
                                                Investigating
                                            </SelectItem>
                                            <SelectItem value="RESOLVED">
                                                Resolved
                                            </SelectItem>
                                            <SelectItem value="REJECTED">
                                                Rejected
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminNotes">
                                        Catatan Admin
                                    </Label>
                                    <Textarea
                                        id="adminNotes"
                                        placeholder="Masukkan catatan internal atau tindakan yang diambil..."
                                        value={adminNotes}
                                        onChange={(e) =>
                                            setAdminNotes(e.target.value)
                                        }
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus Laporan
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Hapus laporan ini?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Laporan akan dihapus permanen dan tidak
                                        bisa dikembalikan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Batal
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => void handleDelete()}
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDetailsOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleUpdateStatus}
                                disabled={isUpdating}
                            >
                                {isUpdating && (
                                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
