"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const callbackURL = searchParams.get("callbackURL");

    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading",
    );
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("Token verifikasi tidak ditemukan.");
            return;
        }

        const verifyUrl = `/api/auth/verify-email?token=${encodeURIComponent(token)}${callbackURL ? `&callbackURL=${encodeURIComponent(callbackURL)}` : ""}`;

        fetch(verifyUrl, { redirect: "follow" })
            .then(async (res) => {
                // The API may redirect on success (if callbackURL provided),
                // or return JSON. If we got a redirect response, the browser
                // follows it, so we're on the callback page. If we got JSON:
                if (res.redirected) {
                    // Already redirected by the API to callbackURL
                    return;
                }
                const data = await res.json();
                if (!res.ok || data.status !== true) {
                    throw new Error(
                        data.message || "Gagal memverifikasi email.",
                    );
                }
                setStatus("success");
            })
            .catch((err) => {
                setStatus("error");
                setErrorMessage(
                    err.message || "Terjadi kesalahan saat verifikasi.",
                );
            });
    }, [token, callbackURL]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-none shadow-xl ring-1 ring-border/50 text-center">
                {status === "loading" && (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <CardTitle className="text-xl font-bold">
                                Memverifikasi Email...
                            </CardTitle>
                            <CardDescription>
                                Mohon tunggu sebentar, kami sedang
                                memverifikasi alamat email Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </CardContent>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-xl font-bold">
                                Email Terverifikasi!
                            </CardTitle>
                            <CardDescription>
                                Alamat email Anda telah berhasil diverifikasi.
                                Anda sekarang dapat menggunakan semua fitur.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8 space-y-4">
                            <Button
                                onClick={() => router.push("/halal")}
                                className="w-full font-semibold"
                            >
                                Masuk ke Akun
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/")}
                                className="w-full"
                            >
                                Kembali ke Beranda
                            </Button>
                        </CardContent>
                    </>
                )}

                {status === "error" && (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-xl font-bold">
                                Verifikasi Gagal
                            </CardTitle>
                            <CardDescription>
                                {errorMessage ||
                                    "Terjadi kesalahan saat memverifikasi email Anda."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Token verifikasi mungkin sudah kadaluarsa atau
                                tidak valid. Silakan minta email verifikasi
                                baru.
                            </p>
                            <Button
                                onClick={() => router.push("/halal")}
                                className="w-full font-semibold"
                            >
                                Masuk & Kirim Ulang Verifikasi
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/")}
                                className="w-full"
                            >
                                Kembali ke Beranda
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
