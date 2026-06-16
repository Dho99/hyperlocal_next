"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Eye,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Building2,
    MapPin,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

interface HalalValidation {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    notes: string | null;
    adminScore: number | null;
    createdAt: string;
    validatedAt: string | null;
    certification: {
        id: string;
        certificateNo: string | null;
        umkm: {
            id: string;
            name: string;
        };
    } | null;
    destination: {
        id: string;
        name: string;
        halalScore?: number | null;
        validatedScore?: number | null;
        images?: { imageUrl: string }[];
        category?: { name: string } | null;
    } | null;
    validator: {
        id: string;
        name: string;
        email: string;
    } | null;
}

const TRIAGE_NOTE =
    "PERLU ATENSI KHUSUS: Skor awal di bawah ambang batas minimal ekosistem.";

function isTriageNote(notes: string | null): boolean {
    return notes?.includes(TRIAGE_NOTE) ?? false;
}

export function ValidationsClient() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [entityFilter, setEntityFilter] = useState("all");
    const [validationToDelete, setValidationToDelete] =
        useState<HalalValidation | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const params = useMemo(
        () => ({
            status: statusFilter === "all" ? undefined : statusFilter,
        }),
        [statusFilter],
    );

    const {
        data: validations,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useCursorPagination<HalalValidation>({
        url: "/api/validations",
        params,
        limit: 20,
    });

    const filtered = useMemo(() => {
        let result = validations;

        if (entityFilter !== "all") {
            if (entityFilter === "destination") {
                result = result.filter((v) => v.destination != null);
            } else if (entityFilter === "certification") {
                result = result.filter((v) => v.certification != null);
            }
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((v) => {
                const destName = v.destination?.name?.toLowerCase() ?? "";
                const umkmName = v.certification?.umkm?.name?.toLowerCase() ?? "";
                return destName.includes(q) || umkmName.includes(q);
            });
        }

        return result;
    }, [validations, search, entityFilter]);

    const handleDelete = async () => {
        if (!validationToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/validations/${validationToDelete.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Data validasi berhasil dihapus");
                refresh();
            } else {
                toast.error(data.message || "Gagal menghapus data validasi");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsDeleting(false);
            setValidationToDelete(null);
        }
    };

    const getEntityName = (v: HalalValidation) => {
        if (v.destination) return v.destination.name;
        if (v.certification?.umkm) return v.certification.umkm.name;
        return "-";
    };

    const getEntityType = (v: HalalValidation): "destinasi" | "sertifikasi" => {
        return v.destination ? "destinasi" : "sertifikasi";
    };

    const getScoreOrNumber = (v: HalalValidation) => {
        if (v.destination) {
            const score = v.destination.validatedScore ?? v.destination.halalScore;
            return score != null ? `${score}/100` : "-";
        }
        return v.certification?.certificateNo ?? "-";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-200 gap-1"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Disetujui
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-200 gap-1"
                    >
                        <XCircle className="h-3 w-3" />
                        Ditolak
                    </Badge>
                );
            case "PENDING":
            default:
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-600 border-yellow-200 gap-1"
                    >
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
        }
    };

    const deleteEntityName = useMemo(() => {
        if (!validationToDelete) return "";
        return getEntityName(validationToDelete);
    }, [validationToDelete]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari destinasi atau UMKM..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="flex h-9 w-full md:w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value)}
                        >
                            <option value="all">Semua Entitas</option>
                            <option value="destination">Destinasi</option>
                            <option value="certification">Sertifikasi</option>
                        </select>
                        <select
                            className="flex h-9 w-full md:w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>ENTITAS</TableHead>
                            <TableHead>TIPE</TableHead>
                            <TableHead>SKOR / NO.</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>VALIDATOR</TableHead>
                            <TableHead>WAKTU PENGAJUAN</TableHead>
                            <TableHead className="text-right">AKSI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && !isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    Tidak ada data validasi ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((v) => {
                                const hasTriage = isTriageNote(v.notes);
                                return (
                                <TableRow
                                    key={v.id}
                                    className={`group transition-colors ${
                                        hasTriage
                                            ? "border-l-4 border-amber-400 bg-amber-50/50 hover:bg-amber-50/80"
                                            : "hover:bg-muted/50"
                                    }`}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                {v.destination ? (
                                                    v.destination.images?.[0]?.imageUrl ? (
                                                        <img
                                                            src={v.destination.images[0].imageUrl}
                                                            alt=""
                                                            className="h-8 w-8 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                    )
                                                ) : (
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                            <span className="font-semibold text-sm leading-tight">
                                                {getEntityName(v)}
                                            </span>
                                            {hasTriage && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-amber-100 text-amber-700 border-amber-300 gap-1 text-[10px] px-1.5 py-0"
                                                >
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Perlu Atensi Khusus
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                v.destination
                                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                            }
                                        >
                                            {v.destination ? "Destinasi" : "Sertifikasi"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-mono">
                                        {getScoreOrNumber(v)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(v.status)}</TableCell>
                                    <TableCell className="text-sm">
                                        {v.validator?.name ?? (
                                            <span className="text-muted-foreground italic">
                                                Belum diproses
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(
                                            new Date(v.createdAt),
                                            "dd MMM yyyy, HH:mm",
                                            { locale: localeId },
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                title="Proses Validasi"
                                                onClick={() =>
                                                    router.push(`/validasi/destinasi/${v.id}`)
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                title="Hapus"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    setValidationToDelete(v)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
            </div>

            <div className="flex items-center px-2 text-xs text-muted-foreground">
                <p>Menampilkan {filtered.length} entri</p>
            </div>

            {/* Delete confirmation */}
            <AlertDialog
                open={Boolean(validationToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setValidationToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Validasi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data validasi untuk{" "}
                            <span className="font-medium text-foreground">
                                {deleteEntityName}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
