"use client";

import { useState } from "react";
import { deleteFacility } from "@/lib/api/facility";
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
import { Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Facility } from "@/types/fasilitas";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

interface FacilityListProps {
    onEdit: (facility: Facility) => void;
}

export function FacilityList({ onEdit }: FacilityListProps) {
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const { data: facilities, isLoading, hasMore, loadMore, refresh } = useCursorPagination<Facility>({
        url: "/api/facilities",
    });

    async function handleDelete() {
        if (!selectedFacility) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteFacility(selectedFacility.id);
            toast.success("Fasilitas berhasil dihapus");
            setSelectedFacility(null);
            refresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    if (facilities.length === 0 && !isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                    Belum ada data fasilitas.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Fasilitas</TableHead>
                        {/* <TableHead>Destinasi</TableHead> */}
                        <TableHead>Tipe</TableHead>
                        <TableHead className="hidden md:table-cell">
                            Deskripsi
                        </TableHead>
                        <TableHead className="w-[100px] text-right">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {facilities.map((facility) => (
                        <TableRow key={facility.id}>
                            <TableCell className="font-medium">
                                {facility.name}
                            </TableCell>
                            {/* <TableCell>
                                {facility.destination?.name || "-"}
                            </TableCell> */}
                            <TableCell>
                                {facility.facilityType ? (
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                    >
                                        {facility.facilityType}
                                    </Badge>
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground text-xs">
                                {facility.description || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">
                                                Buka menu
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2"
                                            onClick={() => onEdit(facility)}
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onClick={() =>
                                                setSelectedFacility(facility)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>Hapus</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                next={loadMore}
            />

            <AlertDialog
                open={Boolean(selectedFacility)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setSelectedFacility(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">
                            Hapus Fasilitas
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus fasilitas{" "}
                            <span className="font-medium text-foreground">
                                {selectedFacility?.name || "ini"}
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
