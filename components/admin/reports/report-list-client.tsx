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
import { Eye, ExternalLink, Clock } from "lucide-react";
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

export function ReportListClient() {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
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
        } catch (error) {
            toast.error("Gagal memperbarui status laporan");
        } finally {
            setIsUpdating(false);
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

    const getTargetLink = (
        targetId: string,
        targetType: Report["targetType"],
    ) => {
        switch (targetType) {
            case "DESTINATION":
                return `/destinasi/${targetId}`; // Assuming ID works or I should use slug
            case "UMKM":
                return `/umkm/${targetId}`;
            case "ACCOMMODATION":
                return `/penginapan/${targetId}`;
            default:
                return "#";
        }
    };

    const openDetails = (report: Report) => {
        setSelectedReport(report);
        setStatus(report.status);
        setAdminNotes(report.adminNotes || "");
        setIsDetailsOpen(true);
    };

    return (
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe</TableHead>
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
                        reports.map((report) => (
                            <TableRow
                                key={report.id}
                                className="hover:bg-stone-50/50 transition-colors"
                            >
                                <TableCell className="font-medium">
                                    {format(
                                        new Date(report.createdAt),
                                        "dd MMM yyyy, HH:mm",
                                        { locale: localeId },
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className="font-normal uppercase text-[10px] tracking-wider"
                                    >
                                        {report.targetType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {report.reason}
                                </TableCell>
                                <TableCell>
                                    {report.reporter ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {report.reporter.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
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
                                            onClick={() => openDetails(report)}
                                            title="Detail Laporan"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            asChild
                                            title="Lihat Target"
                                        >
                                            <Link
                                                href={getTargetLink(
                                                    report.targetId,
                                                    report.targetType,
                                                )}
                                                target="_blank"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                next={loadMore}
            />

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Detail Laporan</DialogTitle>
                        <DialogDescription>
                            Tinjau detail laporan dan perbarui status
                            penanganan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">
                                        Tipe Target
                                    </Label>
                                    <p className="font-medium uppercase tracking-tight">
                                        {selectedReport.targetType}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">
                                        ID Target
                                    </Label>
                                    <p className="font-mono text-xs">
                                        {selectedReport.targetId}
                                    </p>
                                </div>
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
                                            new Date(selectedReport.createdAt),
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

                    <DialogFooter>
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
