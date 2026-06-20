"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
        newPassword: z
            .string()
            .min(8, "Password baru minimal 8 karakter"),
        confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: ChangePasswordValues) {
        setError(null);
        setIsSubmitting(true);
        try {
            await authClient.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            toast.success("Password berhasil diubah");
            form.reset();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Password saat ini salah";
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="rounded-xl bg-card/70 backdrop-blur-md border border-border/40 shadow-sm p-6 space-y-6">
            <div>
                <h2 className="text-lg font-heading font-semibold text-foreground">
                    Ubah Password
                </h2>
                <p className="text-sm text-[#494551] mt-1">
                    Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Masukkan password saat ini"
                        {...form.register("currentPassword")}
                    />
                    {form.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.currentPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        {...form.register("newPassword")}
                    />
                    {form.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Ulangi password baru"
                        {...form.register("confirmPassword")}
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ubah Password
                </Button>
            </form>
        </div>
    );
}
