"use client";

import { useState, useMemo } from "react";
import { deleteAccommodation } from "@/lib/api/accommodation";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Edit,
    Trash2,
    Search,
    Building,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import type { Accommodation } from "@/types/accommodation";


const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "outline" }> = {
    PENDING: { label: "Pending", variant: "secondary" },
    APPROVED: { label: "Disetujui", variant: "success" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
    REVISION: { label: "Revisi", variant: "secondary" },
};

export function AccommodationList() {
    const [search, setSearch] = useState("");
    const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const params = useMemo(
        () => ({
            scope: "admin",
            search: search || undefined,
        }),
        [search],
    );

    const {
        data: filtered,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useCursorPagination<Accommodation>({
        url: "/api/accommodations",
        params,
    });

    async function handleDelete() {
        if (!selectedAccommodation) return;
        setIsDeleting(true);
        try {
            await deleteAccommodation(selectedAccommodation.id);
            toast.success(`Penginapan ${selectedAccommodation.name} berhasil dihapus`);
            setSelectedAccommodation(null);
            refresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                    <Input
                        placeholder="Cari penginapan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kota</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-24">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((accommodation) => {
                            const badge = statusBadge[accommodation.validationStatus] ?? statusBadge.PENDING;
                            return (
                                <TableRow key={accommodation.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                                                <Building className="size-5 text-stone-400" />
                                            </div>
                                            <span className="font-medium text-stone-900 truncate max-w-[180px]">{accommodation.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-stone-600 max-w-[120px] truncate">{accommodation.city ?? "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={badge.variant}>{badge.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-stone-600">
                                        {accommodation.rating != null && accommodation.rating > 0 ? accommodation.rating.toFixed(1) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/accommodations/${accommodation.id}/edit`)}
                                            >
                                                <Edit className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedAccommodation(accommodation)}
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filtered.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-stone-500">
                                    {search ? "Tidak ada penginapan yang sesuai" : "Belum ada penginapan"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <InfiniteScroll
                    hasMore={hasMore}
                    isLoading={isLoading}
                    next={loadMore}
                />
            </div>

            <AlertDialog open={!!selectedAccommodation} onOpenChange={() => setSelectedAccommodation(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Penginapan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {selectedAccommodation?.name}? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
