"use client";

import { useState } from "react";
import {
    Eye,
    EyeOff,
    Loader2,
    MessageSquare,
    MessageSquareOff,
    Search,
    Star,
    Trash2,
} from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import {
    deleteSurvey,
    moderateSurvey,
    type SurveyModerationAction,
    type AdminSurveyItem,
} from "@/lib/api/survey";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    CLASSIFICATION_LABELS,
    GROUP_LABELS_ID,
    VALUE_LABELS,
} from "@/lib/config/acesh-labels";

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
    const [selectedScore, setSelectedScore] = useState<AdminSurveyItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [moderating, setModerating] = useState<string | null>(null);

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

    async function handleModeration(
        item: AdminSurveyItem,
        action: SurveyModerationAction,
    ) {
        setModerating(`${item.id}:${action}`);
        try {
            await moderateSurvey(item.id, action);
            toast.success(
                action === "HIDE_SCORE"
                    ? "Penilaian dikeluarkan dari skor akumulatif"
                    : action === "SHOW_SCORE"
                      ? "Penilaian dimasukkan kembali ke skor akumulatif"
                      : action === "HIDE_COMMENT"
                        ? "Komentar disembunyikan"
                        : "Komentar ditampilkan kembali",
            );
            refresh();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setModerating(null);
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
                            <TableHead className="min-w-[220px]">
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
                                            <div
                                                className="max-w-[190px] truncate"
                                                title={item.destination?.name ?? undefined}
                                            >
                                                {item.destination?.name ?? "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="max-w-[130px] truncate"
                                                title={item.user?.name ?? undefined}
                                            >
                                                {item.user?.name ?? "Anonim"}
                                            </div>
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
                                            <div className="mt-1 flex flex-wrap items-center gap-1">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        item.scoreHiddenAt
                                                            ? "border-amber-200 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-700"
                                                            : "border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-700"
                                                    }
                                                >
                                                    {item.scoreHiddenAt
                                                        ? "Skor disembunyikan"
                                                        : "Skor aktif"}
                                                </Badge>
                                                {item.commentHiddenAt && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600"
                                                    >
                                                        Komentar disembunyikan
                                                    </Badge>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedScore(item)}
                                                className="mt-1 block text-[10px] font-semibold text-primary hover:underline"
                                            >
                                                Lihat nilai ACES-H
                                            </button>
                                        </TableCell>
                                        <TableCell className="max-w-[240px]">
                                            {item.comment ? (
                                                <span
                                                    className="line-clamp-2 text-sm text-muted-foreground"
                                                    title={item.comment}
                                                >
                                                    {item.comment}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                                                    <MessageSquare className="h-3 w-3" />
                                                    Tanpa komentar
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(
                                                item.createdAt,
                                            ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={moderating !== null}
                                                    onClick={() =>
                                                        void handleModeration(
                                                            item,
                                                            item.scoreHiddenAt
                                                                ? "SHOW_SCORE"
                                                                : "HIDE_SCORE",
                                                        )
                                                    }
                                                    title={
                                                        item.scoreHiddenAt
                                                            ? "Masukkan kembali penilaian ke skor"
                                                            : "Keluarkan penilaian dari skor"
                                                    }
                                                >
                                                    {moderating?.startsWith(`${item.id}:`) ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : item.scoreHiddenAt ? (
                                                        <Eye className="h-4 w-4" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                {item.comment && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        disabled={moderating !== null}
                                                        onClick={() =>
                                                            void handleModeration(
                                                                item,
                                                                item.commentHiddenAt
                                                                    ? "SHOW_COMMENT"
                                                                    : "HIDE_COMMENT",
                                                            )
                                                        }
                                                        title={
                                                            item.commentHiddenAt
                                                                ? "Tampilkan komentar"
                                                                : "Sembunyikan komentar"
                                                        }
                                                    >
                                                        {item.commentHiddenAt ? (
                                                            <MessageSquare className="h-4 w-4" />
                                                        ) : (
                                                            <MessageSquareOff className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setSelected(item)}
                                                    title="Hapus penilaian"
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

            <Dialog
                open={Boolean(selectedScore)}
                onOpenChange={(open) => {
                    if (!open) setSelectedScore(null);
                }}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-heading">
                            Nilai ACES-H Pengunjung
                        </DialogTitle>
                        <DialogDescription>
                            {selectedScore?.user?.name ?? "Pengunjung"} · {selectedScore?.destination?.name ?? "Destinasi"}
                            {selectedScore?.overallScore != null
                                ? ` · Skor keseluruhan ${selectedScore.overallScore.toFixed(1)}`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {Object.entries(
                            (selectedScore?.scoreBreakdown ?? []).reduce<
                                Record<string, NonNullable<AdminSurveyItem["scoreBreakdown"]>>
                            >((groups, score) => {
                                (groups[score.group] ??= []).push(score);
                                return groups;
                            }, {}),
                        ).map(([group, scores]) => (
                            <section key={group} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold">
                                        {(GROUP_LABELS_ID as Record<string, string>)[group] ?? group}
                                    </h3>
                                    <Badge variant="outline">
                                        Rata-rata {(
                                            (scores.reduce((sum, score) => sum + score.value, 0) /
                                                scores.length) * 25
                                        ).toFixed(1)}
                                    </Badge>
                                </div>
                                <div className="divide-y">
                                    {scores.map((score) => (
                                        <div
                                            key={score.id}
                                            className="flex items-center justify-between gap-3 py-2 text-sm"
                                        >
                                            <div className="min-w-0">
                                                <span className="mr-2 font-mono text-xs text-muted-foreground">
                                                    {score.code}
                                                </span>
                                                <span>{score.name}</span>
                                            </div>
                                            <span className="shrink-0 font-semibold">
                                                {score.value}/4 · {VALUE_LABELS[score.value] ?? "—"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
