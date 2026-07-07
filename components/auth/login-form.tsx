"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/validations/auth.schema";
import type { LoginFormValues } from "@/types/auth";
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff, Send } from "lucide-react";
//
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [resendMsg, setResendMsg] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginFormValues) {
        setIsLoading(true);
        setError(null);
        setNeedsVerification(false);
        setLoginEmail(values.email);

        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            fetchOptions: {
                onSuccess: (ctx) => {
                    const user = ctx.data.user;
                    if (user.role === "admin") {
                        router.push("/dashboard");
                    } else {
                        const redirect =
                            new URLSearchParams(window.location.search).get(
                                "redirect",
                            ) ?? "/";
                        router.push(
                            redirect.startsWith("/") &&
                                !redirect.startsWith("//")
                                ? redirect
                                : "/",
                        );
                    }
                    router.refresh();
                },
                onError: (ctx) => {
                    const msg = ctx.error.message || "";
                    // better-auth returns "Email not verified" when requireEmailVerification is true
                    if (
                        msg.toLowerCase().includes("email not verified") ||
                        msg.toLowerCase().includes("email belum")
                    ) {
                        setNeedsVerification(true);
                    } else {
                        setError(
                            msg ||
                                "Gagal masuk. Silakan cek email dan password Anda.",
                        );
                    }
                },
            },
        });

        setIsLoading(false);
    }

    async function handleResendVerification() {
        if (!loginEmail || resendCooldown > 0) return;
        setIsResending(true);
        setResendMsg(null);
        try {
            const res = await fetch("/api/auth/send-verification-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginEmail,
                    callbackURL: "/",
                }),
            });
            if (!res.ok) throw new Error("Gagal mengirim ulang.");
            setResendMsg("Link verifikasi telah dikirim ulang!");
            setResendCooldown(60);
            cooldownRef.current = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        if (cooldownRef.current) clearInterval(cooldownRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch {
            setResendMsg("Gagal mengirim ulang. Silakan coba lagi.");
        }
        setIsResending(false);
    }

    if (needsVerification) {
        return (
            <Card className="border-none shadow-xl ring-1 ring-border/50 text-center p-6">
                <CardContent className="pt-6 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Verifikasi Email Diperlukan
                    </CardTitle>
                    <CardDescription className="text-base">
                        Email{" "}
                        <span className="font-semibold text-foreground">
                            {loginEmail}
                        </span>{" "}
                        belum diverifikasi. Link verifikasi telah dikirim ulang
                        ke email Anda. Silakan cek inbox (dan folder spam)
                        untuk mengaktifkan akun.
                    </CardDescription>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={isResending || resendCooldown > 0}
                    >
                        {isResending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        {resendCooldown > 0
                            ? `Kirim Ulang (${resendCooldown}s)`
                            : "Kirim Ulang Link Verifikasi"}
                    </Button>
                    {resendMsg && (
                        <p className="text-sm font-medium text-green-600">
                            {resendMsg}
                        </p>
                    )}
                    <Button
                        variant="ghost"
                        className="w-full text-sm"
                        onClick={() => {
                            setNeedsVerification(false);
                            setError(null);
                        }}
                    >
                        ← Kembali ke halaman masuk
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
                    <CardTitle className="text-2xl font-bold">Masuk User</CardTitle>
                    <CardDescription>
                        Masukkan email dan password Anda untuk mulai menjelajah.
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CardContent className="space-y-4">
                    {error && (
                        <Alert
                            variant="destructive"
                            className="bg-destructive/10 text-destructive border-destructive/20"
                        >
                            <AlertCircle className="h-4 w-4" />
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
                                placeholder={"user@email.com"}
                                className="pl-10 focus-visible:ring-primary/20"
                                disabled={isLoading}
                                {...form.register("email")}
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-xs font-medium text-destructive">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                Lupa password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10 focus-visible:ring-primary/20"
                                disabled={isLoading}
                                {...form.register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                disabled={isLoading}
                                aria-label={
                                    showPassword
                                        ? "Sembunyikan password"
                                        : "Tampilkan password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-xs font-medium text-destructive">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full font-semibold shadow-md transition-all active:scale-95"
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Masuk Sekarang
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Belum punya akun?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary hover:underline"
                        >
                            Daftar Gratis
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
