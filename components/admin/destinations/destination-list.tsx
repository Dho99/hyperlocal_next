"use client";

import { useState, useMemo } from "react";
import { deleteDestination } from "@/lib/api/destination";
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
    MoreHorizontal,
    Search,
    Eye,
    MapPin,
    Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
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
import type { Destination, Category } from "@/types/destination";
import { cn } from "@/lib/utils";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

interface DestinationListProps {
    categories: Category[];
    initialDestinations?: Destination[];
}

export function DestinationList({
    categories,
    initialDestinations,
}: DestinationListProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedDestination, setSelectedDestination] =
        useState<Destination | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const params = useMemo(
        () => ({
            search: search || undefined,
            categoryId: categoryFilter === "all" ? undefined : categoryFilter,
            status: statusFilter === "all" ? undefined : statusFilter,
        }),
        [search, categoryFilter, statusFilter],
    );

    const {
        data: destinations,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useCursorPagination<Destination>({
        url: "/api/destinations",
        params,
    });

    async function handleDelete() {
        if (!selectedDestination) return;

        setIsDeleting(true);
        try {
            await deleteDestination(selectedDestination.id);
            toast.success(
                `Destinasi ${selectedDestination.name} berhasil dihapus`,
            );
            setSelectedDestination(null);
            refresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama destinasi..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="APPROVED">Terverifikasi</option>
                            <option value="PENDING">Pending</option>
                            <option value="REJECTED">Ditolak</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[300px]">
                                DESTINASI
                            </TableHead>
                            <TableHead>KATEGORI</TableHead>
                            <TableHead>LOKASI</TableHead>
                            <TableHead>HALAL SCORE</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead className="w-[100px] text-center">
                                AKSI
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {destinations.length === 0 && !isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    Tidak ada destinasi ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            destinations.map((destination) => (
                                <TableRow
                                    key={destination.id}
                                    className="group hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0 border relative">
                                                {destination.images?.[0] ? (
                                                    <Image
                                                        src={
                                                            destination
                                                                .images[0]
                                                                .imageUrl
                                                        }
                                                        alt={destination.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <MapPin className="h-5 w-5 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm leading-tight">
                                                    {destination.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Update:{" "}
                                                    {destination.updatedAt
                                                        ? new Date(
                                                              destination.updatedAt,
                                                          ).toLocaleDateString()
                                                        : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className="bg-primary/10 text-primary border-none text-[10px]"
                                        >
                                            {destination.category?.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {destination.city},{" "}
                                        {destination.province}
                                    </TableCell>
                                    <TableCell>
                                        <ScoreCell halalScore={destination.halalScore} validatedScore={destination.validatedScore} />
                                    </TableCell>
                                    <TableCell>
                                        {destination.status === "APPROVED" && (
                                            <Badge
                                                variant="success"
                                                className="text-[10px] font-bold"
                                            >
                                                Terverifikasi
                                            </Badge>
                                        )}
                                        {destination.status === "PENDING" && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-bold"
                                            >
                                                Pending
                                            </Badge>
                                        )}
                                        {destination.status === "REJECTED" && (
                                            <Badge
                                                variant="destructive"
                                                className="text-[10px] font-bold"
                                            >
                                                Ditolak
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> */}
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => {
                                                router.push(
                                                    `/destinations/${destination.id}`,
                                                );
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => {
                                                router.push(
                                                    `/destinations/${destination.id}/edit`,
                                                );
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                                setSelectedDestination(
                                                    destination,
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {/* </div> */}
                                        {/* <div className="group-hover:hidden">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground ml-auto" />
                                        </div> */}
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
            </div>
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <p>Menampilkan {destinations.length} entri</p>
                <div className="flex gap-2">
                    {/* Pagination control could go here if using page numbers, but with cursor we use InfiniteScroll or Load More */}
                </div>
            </div>

            <AlertDialog
                open={Boolean(selectedDestination)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setSelectedDestination(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">
                            Hapus Destinasi
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus destinasi{" "}
                            <span className="font-medium text-foreground">
                                {selectedDestination?.name || "ini"}
                            </span>
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

function ScoreCell({ halalScore, validatedScore }: { halalScore?: number | null; validatedScore?: number | null }) {
    const score = validatedScore ?? halalScore ?? 0;
    const isValidated = validatedScore != null;

    const getColor = (s: number) => {
        if (s >= 70) return "bg-green-500";
        if (s >= 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getTextColor = (s: number) => {
        if (s >= 70) return "text-green-600";
        if (s >= 40) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all", getColor(score))}
                    style={{ width: `${Math.min(score, 100)}%` }}
                />
            </div>
            <div className="flex flex-col items-start">
                <span className={cn("text-xs font-bold", getTextColor(score))}>
                    {score}
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">
                    {isValidated ? "Tervalidasi" : "Otomatis"}
                </span>
            </div>
        </div>
    );
}
