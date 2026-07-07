"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrandLogo } from "@/components/ui/brand-logo";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [validationError, setValidationError] = useState("");

    if (!token) {
        return (
            <Card className="border-none shadow-xl ring-1 ring-border/50 text-center p-6">
                <CardContent className="pt-6 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                        Link Tidak Valid
                    </CardTitle>
                    <CardDescription>
                        Link reset password tidak valid atau sudah kadaluarsa.
                        Silakan minta link reset yang baru.
                    </CardDescription>
                    <Button className="w-full" asChild>
                        <Link href="/forgot-password">
                            Minta Link Baru
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    function validate(): boolean {
        setValidationError("");
        if (newPassword.length < 8) {
            setValidationError("Password minimal 8 karakter.");
            return false;
        }
        if (newPassword !== confirmPassword) {
            setValidationError("Konfirmasi password tidak cocok.");
            return false;
        }
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword, token }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    data.message || "Gagal mereset password.",
                );
            }
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "Gagal mereset password. Link mungkin sudah kadaluarsa.");
        }
        setIsLoading(false);
    }

    if (isSuccess) {
        return (
            <Card className="border-none shadow-xl ring-1 ring-border/50 text-center p-6">
                <CardContent className="pt-6 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                        Password Berhasil Direset
                    </CardTitle>
                    <CardDescription>
                        Password Anda telah berhasil diperbarui. Silakan masuk
                        dengan password baru Anda.
                    </CardDescription>
                    <Button
                        className="w-full font-semibold"
                        onClick={() => router.push("/halal")}
                    >
                        Masuk Sekarang
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-xl ring-1 ring-border/50">
            <CardHeader className="space-y-1">
                <div className="flex justify-center">
                    <BrandLogo size="sm" priority />
                </div>
                <div className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        Reset Password
                    </CardTitle>
                    <CardDescription>
                        Masukkan password baru untuk akun Anda.
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
                <CardContent className="space-y-4">
                    {(error || validationError) && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {error || validationError}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Minimal 8 karakter"
                                className="pl-10"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            Konfirmasi Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Ulangi password baru"
                                className="pl-10"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardContent className="space-y-4">
                    <Button
                        type="submit"
                        className="w-full font-semibold"
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Reset Password
                    </Button>
                    <Button variant="ghost" className="w-full" asChild>
                        <Link href="/halal">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Halaman Masuk
                        </Link>
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
