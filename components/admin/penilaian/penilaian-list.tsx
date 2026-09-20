"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { deleteSurvey, type AdminSurveyItem } from "@/lib/api/survey";
import { getApiErrorMessage } from "@/lib/api-error";
import { CLASSIFICATION_LABELS } from "@/lib/config/acesh-labels";

function scoreBadgeClass(score: number | null): string {
    if (score == null) return "bg-muted text-muted-foreground";
    if (score >= 85) return "bg-emerald-100 text-emerald-800";
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 55) return "bg-yellow-100 text-yellow-800";
    if (score >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
}

function classificationFor(score: number | null): string | null {
    if (score == null) return null;
    if (score >= 85) return CLASSIFICATION_LABELS.SANGAT_SIAP;
    if (score >= 70) return CLASSIFICATION_LABELS.SIAP;
    if (score >= 55) return CLASSIFICATION_LABELS.BERKEMBANG;
    if (score >= 40) return CLASSIFICATION_LABELS.PERLU_PENGEMBANGAN;
    return CLASSIFICATION_LABELS.BELUM_SIAP;
}

export function PenilaianList() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<AdminSurveyItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading, hasMore, loadMore, refresh } =
        useCursorPagination<AdminSurveyItem>({
            url: "/api/admin/surveys",
            limit: 20,
            params: query ? { search: query } : {},
        });

    async function handleDelete() {
        if (!selected) return;
        setIsDeleting(true);
        try {
            await deleteSurvey(selected.id);
            toast.success("Komentar penilaian berhasil dihapus");
            setSelected(null);
            refresh();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") setQuery(search.trim());
                        }}
                        placeholder="Cari komentar..."
                        className="pl-9"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setQuery(search.trim())}
                >
                    Cari
                </Button>
                {query && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setSearch("");
                            setQuery("");
                        }}
                    >
                        Reset
                    </Button>
                )}
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Destinasi</TableHead>
                            <TableHead>Pengguna</TableHead>
                            <TableHead>Skor</TableHead>
                            <TableHead className="min-w-[260px]">
                                Komentar
                            </TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 && !isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-10 text-center text-sm text-muted-foreground"
                                >
                                    Belum ada penilaian destinasi.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => {
                                const classification = classificationFor(
                                    item.overallScore,
                                );
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.destination?.name ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            {item.user?.name ?? "Anonim"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={scoreBadgeClass(
                                                    item.overallScore,
                                                )}
                                            >
                                                <Star className="mr-1 h-3 w-3" />
                                                {item.overallScore != null
                                                    ? item.overallScore.toFixed(1)
                                                    : "—"}
                                            </Badge>
                                            {classification && (
                                                <p className="mt-1 text-[10px] text-muted-foreground">
                                                    {classification}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            {item.comment ? (
                                                <span className="text-sm text-muted-foreground">
                                                    {item.comment}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                                                    <MessageSquare className="h-3 w-3" />
                                                    Tanpa komentar
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(
                                                item.createdAt,
                                            ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setSelected(item)}
                                                title="Hapus komentar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <div className="border-t p-4 text-center">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={!hasMore || isLoading}
                        className={!hasMore ? "opacity-50 pointer-events-none" : ""}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {!hasMore
                            ? "Semua dimuat"
                            : isLoading
                              ? "Memuat..."
                              : "Muat lebih banyak"}
                    </Button>
                </div>
            </div>

            <AlertDialog
                open={Boolean(selected)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setSelected(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">
                            Hapus Komentar Penilaian
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Hapus penilaian dari{" "}
                            <span className="font-medium text-foreground">
                                {selected?.user?.name ?? "Anonim"}
                            </span>{" "}
                            untuk destinasi{" "}
                            <span className="font-medium text-foreground">
                                {selected?.destination?.name ?? "ini"}
                            </span>
                            {selected?.comment ? (
                                <>
                                    {" "}
                                    beserta komentarnya: &ldquo;
                                    {selected.comment}&rdquo;
                                </>
                            ) : null}
                            ? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
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
