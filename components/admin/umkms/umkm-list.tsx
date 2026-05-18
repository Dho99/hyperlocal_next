"use client";

import { useState } from "react";
import { deleteUmkm } from "@/lib/api/umkm";
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
    Store,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    MapPin,
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
import type { Umkm } from "@/types/umkm";
import type { Category } from "@/types/category";

interface UmkmListProps {
    initialUmkms: Umkm[];
    categories: Category[];
}

export function UmkmList({
    initialUmkms,
    categories,
}: UmkmListProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedUmkm, setSelectedUmkm] = useState<Umkm | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const filteredUmkms = initialUmkms.filter((u) => {
        const matchesSearch = u.name
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || u.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    async function handleDelete() {
        if (!selectedUmkm) return;
        
        setIsDeleting(true);
        try {
            await deleteUmkm(selectedUmkm.id);
            toast.success(`UMKM ${selectedUmkm.name} berhasil dihapus`);
            setSelectedUmkm(null);
            router.refresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    const getStatusBadge = (umkm: Umkm) => {
        const cert = umkm.certifications?.[0];
        if (!cert) return <Badge variant="outline" className="text-[10px]">Belum Ada Sertifikat</Badge>;

        switch (cert.status) {
            case "VALID":
                return (
                    <Badge variant="success" className="text-[10px] font-bold gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Valid
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge variant="secondary" className="text-[10px] font-bold gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "EXPIRED":
            case "REVOKED":
                return (
                    <Badge variant="destructive" className="text-[10px] font-bold gap-1">
                        <XCircle className="h-3 w-3" />
                        {cert.status === "EXPIRED" ? "Kedaluwarsa" : "Dicabut"}
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-[10px]">{cert.status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardContent className="p-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama UMKM..."
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
                            defaultValue="all"
                        >
                            <option value="all">Semua Status Halal</option>
                            <option value="VALID">Valid</option>
                            <option value="PENDING">Pending</option>
                            <option value="EXPIRED">Kedaluwarsa</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[300px]">UMKM</TableHead>
                            <TableHead>KATEGORI</TableHead>
                            <TableHead>DESTINASI</TableHead>
                            <TableHead>STATUS HALAL</TableHead>
                            <TableHead className="w-[100px] text-right">AKSI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUmkms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Tidak ada UMKM ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUmkms.map((umkm) => (
                                <TableRow key={umkm.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0 border relative">
                                                {umkm.images?.[0] ? (
                                                    <Image
                                                        src={umkm.images[0].imageUrl}
                                                        alt={umkm.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Store className="h-5 w-5 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm leading-tight">{umkm.name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {umkm.address || "Alamat tidak tersedia"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">
                                            {umkm.category?.name || "-"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {umkm.destination ? (
                                            <div className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {umkm.destination.name}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(umkm)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => router.push(`/umkms/${umkm.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => router.push(`/umkms/${umkm.id}/edit`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setSelectedUmkm(umkm)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="group-hover:hidden">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground ml-auto" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={Boolean(selectedUmkm)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setSelectedUmkm(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">Hapus UMKM</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus UMKM{" "}
                            <span className="font-medium text-foreground">{selectedUmkm?.name || "ini"}</span>? 
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
