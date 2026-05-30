"use client";

import { useState } from "react";
import { deleteCategory } from "@/lib/api/category";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CategoryForm } from "./category-form";
import type { Category } from "@/types/destinasi-kategori";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

import { CategoryType } from "@/lib/generated/prisma";

interface CategoryListProps {
    type?: CategoryType;
}

export function CategoryList({ type }: CategoryListProps) {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        data: categories,
        isLoading,
        hasMore,
        loadMore,
        refresh,
    } = useCursorPagination<Category>({
        url: "/api/categories",
        params: { type },
    });

    async function handleDelete() {
        if (!categoryToDelete) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteCategory(categoryToDelete.id);
            toast.success("Kategori berhasil dihapus");
            setCategoryToDelete(null);
            refresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    }

    if (categories.length === 0 && !isLoading) {
        return (
            <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                    Belum ada kategori.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="hidden md:table-cell">
                            Deskripsi
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {category.name}
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] py-0 px-1"
                                    >
                                        ID: {category.id.substring(0, 4)}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">
                                    {category.slug}
                                </code>
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground text-xs">
                                {category.description || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon-sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">
                                                Buka menu
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2"
                                            onClick={() =>
                                                setSelectedCategory(category)
                                            }
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onClick={() =>
                                                setCategoryToDelete(category)
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

            <Dialog
                open={Boolean(selectedCategory)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedCategory(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-heading">
                            Edit Kategori
                        </DialogTitle>
                    </DialogHeader>
                    {selectedCategory && (
                        <CategoryForm
                            initialData={selectedCategory}
                            onSuccess={() => setSelectedCategory(null)}
                            type={type}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={Boolean(categoryToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setCategoryToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">
                            Hapus Kategori
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori{" "}
                            <span className="font-medium text-foreground">
                                {categoryToDelete?.name || "ini"}
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
