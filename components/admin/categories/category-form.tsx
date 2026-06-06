"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/lib/validations/destinasi-kategori.schema";
import type { Category, CategoryFormValues } from "@/types/destinasi-kategori";
import { createCategory, updateCategory } from "@/lib/api/category";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

import { CategoryType } from "@/lib/generated/prisma";

interface CategoryFormProps {
    initialData?: Category;
    onSuccess?: () => void;
    type?: CategoryType;
}

export function CategoryForm({ initialData, onSuccess, type = CategoryType.DESTINATION }: CategoryFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            type: initialData?.type || type,
        },
    });

    useEffect(() => {
        form.reset({
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            type: initialData?.type || type,
        });
    }, [form, initialData, type]);

    async function onSubmit(values: CategoryFormValues) {
        setError(null);
        startTransition(async () => {
            try {
                if (initialData) {
                    await updateCategory(initialData.id, values);
                    toast.success("Kategori berhasil diperbarui");
                } else {
                    await createCategory(values);
                    toast.success("Kategori berhasil ditambahkan");
                }

                form.reset();
                router.refresh();
                if (onSuccess) onSuccess();
            } catch (err: unknown) {
                const message = getApiErrorMessage(err);
                setError(message);
                toast.error(message);
            }
        });
    }

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name);
        if (!initialData) {
            const slug = name
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
            form.setValue("slug", slug);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                    id="name"
                    placeholder="Contoh: Wisata Alam"
                    {...form.register("name")}
                    onChange={handleNameChange}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    placeholder="wisata-alam"
                    {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.slug.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Input
                    id="description"
                    placeholder="Deskripsi singkat kategori..."
                    {...form.register("description")}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Perbarui Kategori" : "Tambah Kategori"}
            </Button>
        </form>
    );
}
