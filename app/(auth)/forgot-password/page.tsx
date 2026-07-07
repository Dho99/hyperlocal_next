"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/request-password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    redirectTo: `${window.location.origin}/reset-password`,
                }),
            });
            if (!res.ok) throw new Error("Gagal mengirim email reset.");
            setIsSent(true);
        } catch {
            setError("Gagal mengirim email reset. Silakan coba lagi.");
        }
        setIsLoading(false);
    }

    if (isSent) {
        return (
            <Card className="border-none shadow-xl ring-1 ring-border/50 text-center p-6">
                <CardContent className="pt-6 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Email Terkirim
                    </CardTitle>
                    <CardDescription className="text-base">
                        Jika email{" "}
                        <span className="font-semibold text-foreground">
                            {email}
                        </span>{" "}
                        terdaftar di sistem, link reset password telah dikirim.
                        Silakan cek inbox (dan folder spam).
                    </CardDescription>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/halal">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Halaman Masuk
                        </Link>
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
                        Lupa Password
                    </CardTitle>
                    <CardDescription>
                        Masukkan email Anda dan kami akan mengirimkan link
                        untuk reset password.
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@anda.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        Kirim Link Reset
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
