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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FacilityDialog } from "./facility-dialog";
import type { Facility } from "@/types/fasilitas";
import { FACILITY_LABELS } from "@/lib/config/halal-readiness";

interface FacilitiesTableProps {
    facilities: Facility[];
}

export function FacilitiesTable({ facilities }: FacilitiesTableProps) {
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleAdd() {
        setSelectedFacility(null);
        setIsFormOpen(true);
    }

    function handleEdit(facility: Facility) {
        setSelectedFacility(facility);
        setIsFormOpen(true);
    }

    function handleFormOpenChange(open: boolean) {
        setIsFormOpen(open);
        if (!open) {
            setSelectedFacility(null);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteFacility(deleteTarget.id);
            toast.success("Fasilitas berhasil dihapus");
            setDeleteTarget(null);
            router.refresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    function getTypeLabel(type: string | null): string {
        if (!type) return "-";
        return FACILITY_LABELS[type as keyof typeof FACILITY_LABELS] || type;
    }

    return (
        <>
            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-heading">
                        Daftar Fasilitas
                    </CardTitle>
                    <Button onClick={handleAdd} className="gap-2" size="sm">
                        <Plus className="h-4 w-4" />
                        Tambah Fasilitas
                    </Button>
                </CardHeader>
                <CardContent>
                    {facilities.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">
                                Belum ada data fasilitas.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Fasilitas</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Deskripsi
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell w-[80px] text-center">
                                            Bobot
                                        </TableHead>
                                        <TableHead className="w-[80px] text-right">
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
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px]"
                                                >
                                                    {getTypeLabel(
                                                        facility.facilityType,
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground text-xs">
                                                {facility.description || "-"}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-center text-sm">
                                                {facility.weight ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handleEdit(facility)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Edit
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                facility,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Hapus
                                                        </span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <FacilityDialog
                open={isFormOpen}
                onOpenChange={handleFormOpenChange}
                facility={selectedFacility}
            />

            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setDeleteTarget(null);
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
                                {deleteTarget?.name || "ini"}
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
        </>
    );
}
