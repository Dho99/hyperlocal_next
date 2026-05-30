"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HalalCertification } from "@/lib/generated/prisma";

type CertificationWithUmkm = HalalCertification & {
    umkm: { id: string; name: string };
};

export function CertificationList() {
    const router = useRouter();
    const [certifications, setCertifications] = useState<CertificationWithUmkm[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [certToDelete, setCertToDelete] = useState<HalalCertification | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCertifications = useCallback(
        async (cursor?: string | null) => {
            const isInitial = !cursor;
            if (isInitial) setLoading(true);
            else setIsLoadingMore(true);

            try {
                const params = new URLSearchParams();
                if (cursor) params.append("cursor", cursor);
                if (search) params.append("search", search);
                if (statusFilter !== "all")
                    params.append("status", statusFilter);
                params.append("limit", "10");

                const res = await fetch(
                    `/api/certifications?${params.toString()}`,
                );
                const data = await res.json();

                if (data.success) {
                    if (isInitial) {
                        setCertifications(data.data);
                    } else {
                        setCertifications((prev) => [...prev, ...data.data]);
                    }
                    setNextCursor(data.pagination.next_cursor);
                } else {
                    toast.error(data.message || "Gagal memuat data");
                }
            } catch (error) {
                console.error("Failed to fetch certifications:", error);
                toast.error("Terjadi kesalahan saat memuat data");
            } finally {
                setLoading(false);
                setIsLoadingMore(false);
            }
        },
        [search, statusFilter],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCertifications();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCertifications]);

    const handleDelete = async () => {
        if (!certToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/certifications/${certToDelete.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Sertifikasi berhasil dihapus");
                fetchCertifications();
            } else {
                toast.error(data.message || "Gagal menghapus sertifikasi");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsDeleting(false);
            setCertToDelete(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "VALID":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-200 gap-1"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Valid
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-600 border-yellow-200 gap-1"
                    >
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "EXPIRED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-200 gap-1"
                    >
                        <XCircle className="h-3 w-3" />
                        Kedaluwarsa
                    </Badge>
                );
            case "REVOKED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-600 border-gray-300 gap-1"
                    >
                        <XCircle className="h-3 w-3" />
                        Dicabut
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                    Sertifikasi Halal
                </h2>
                <Button
                    onClick={() => router.push("/certifications/create")}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Sertifikasi
                </Button>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nomor sertifikat, penerbit, atau UMKM..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="flex h-9 w-full md:w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="VALID">Valid</option>
                            <option value="EXPIRED">Kedaluwarsa</option>
                            <option value="REVOKED">Dicabut</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>UMKM</TableHead>
                            <TableHead>No. Sertifikat</TableHead>
                            <TableHead>Penerbit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Masa Berlaku</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && certifications.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat data...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : certifications.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Tidak ada data sertifikasi.
                                </TableCell>
                            </TableRow>
                        ) : (
                            certifications.map((cert) => (
                                <TableRow
                                    key={cert.id}
                                    className="group hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-medium">
                                        {cert.umkm.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {cert.certificateNo || "-"}
                                    </TableCell>
                                    <TableCell>{cert.issuer || "-"}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(cert.status)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <div className="flex flex-col">
                                            <span>
                                                {cert.issuedAt
                                                    ? format(
                                                          new Date(
                                                              cert.issuedAt,
                                                          ),
                                                          "dd/MM/yyyy",
                                                      )
                                                    : "-"}
                                            </span>
                                            <span className="text-muted-foreground">
                                                s/d{" "}
                                                {cert.expiredAt
                                                    ? format(
                                                          new Date(
                                                              cert.expiredAt,
                                                          ),
                                                          "dd/MM/yyyy",
                                                      )
                                                    : "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() =>
                                                    router.push(
                                                        `/certifications/${cert.id}`,
                                                    )
                                                }
                                                title="Lihat Detail"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() =>
                                                    router.push(
                                                        `/certifications/${cert.id}/edit`,
                                                    )
                                                }
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    setCertToDelete(cert)
                                                }
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {nextCursor && (
                    <div className="p-4 border-t flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchCertifications(nextCursor)}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Muat Lebih Banyak
                        </Button>
                    </div>
                )}
            </div>

            <AlertDialog
                open={Boolean(certToDelete)}
                onOpenChange={(open) => !open && setCertToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Sertifikasi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus sertifikasi ini?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

