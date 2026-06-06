"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, User } from "lucide-react";
import { toast } from "sonner";

const basicInfoSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
    user: {
        name: string;
        email: string;
        image: string | null;
    };
}

export function BasicInfoForm({ user }: BasicInfoFormProps) {
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<BasicInfoValues>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            name: user.name,
        },
    });

    function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (
            !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
                file.type,
            )
        ) {
            toast.error(
                "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.",
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran gambar maksimal 5MB.");
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function onSubmit(values: BasicInfoValues) {
        setIsSubmitting(true);
        try {
            let imageUrl: string | null | undefined = user.image;

            if (avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile);
                const res = await fetch("/api/upload?folder=users", {
                    method: "POST",
                    body: formData,
                });
                const uploadResult = await res.json();
                if (!res.ok || !uploadResult.success) {
                    throw new Error(
                        uploadResult.message || "Gagal mengunggah gambar",
                    );
                }
                imageUrl = uploadResult.data.url;
            }

            await authClient.updateUser({
                name: values.name,
                image: imageUrl ?? undefined,
            });

            toast.success("Profil berhasil diperbarui");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const displayImage = avatarPreview ?? user.image;

    return (
        <div className="rounded-xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm p-6 space-y-6">
            <div>
                <h2 className="text-lg font-heading font-semibold text-[#1f1635]">
                    Informasi Dasar
                </h2>
                <p className="text-sm text-[#494551] mt-1">
                    Perbarui nama dan foto profil Anda.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group size-20 shrink-0 rounded-full overflow-hidden bg-[#eaddff] border-2 border-dashed border-[#cbc4d2] hover:border-[#4f378a] transition-colors"
                    >
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <User className="size-8 text-[#6750a4]" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <Camera className="size-5 text-white" />
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarSelect}
                    />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-[#1f1635]">
                            Foto Profil
                        </p>
                        <p className="text-xs text-[#494551]">
                            Klik untuk mengganti. Format: JPG, PNG, WebP. Maks:
                            5MB.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" {...form.register("name")} />
                    {form.formState.errors.name && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                    />
                    <p className="text-xs text-[#494551]">
                        Email tidak dapat diubah.
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                </Button>
            </form>
        </div>
    );
}
