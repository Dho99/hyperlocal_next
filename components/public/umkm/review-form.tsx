"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Star,
    MapPin,
    ImagePlus,
    AlertTriangle,
    Send,
    Store,
    Loader2,
} from "lucide-react";
import type { Umkm } from "@/types/umkm";

interface ReviewFormProps {
    umkm: Umkm;
}

export function ReviewForm({ umkm }: ReviewFormProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const coverImage = umkm.images?.[0]?.imageUrl;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setSubmitError("Silakan pilih rating terlebih dahulu");
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    umkmId: umkm.id,
                    rating,
                    comment: comment.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Gagal mengirim ulasan");
            }

            setSubmitSuccess(true);
            setTimeout(() => router.push("/umkm"), 2000);
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <Send className="h-8 w-8 text-emerald-700" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">Ulasan Terkirim!</h2>
                <p className="text-gray-500">Terima kasih atas partisipasi Anda.</p>
            </div>
        );
    }

    const locationText = umkm.address || umkm.destination?.city || "Lokasi tidak tersedia";

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="mb-8 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    {coverImage ? (
                        <Image src={coverImage} alt={umkm.name} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <Store className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Mengulas
                    </p>
                    <h1 className="text-xl font-semibold text-gray-900">{umkm.name}</h1>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        {locationText}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        Beri Rating & Ulasan
                    </h2>

                    <div>
                        <label className="mb-2 block text-sm text-muted-foreground">
                            Bagaimana pengalaman Anda secara keseluruhan?
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const filled = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className={`transition-colors ${
                                            filled ? "text-amber-500" : "text-gray-200"
                                        } hover:text-amber-500`}
                                    >
                                        <Star
                                            size={32}
                                            className={
                                                filled ? "fill-current" : ""
                                            }
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                            <label
                            htmlFor="review-text"
                            className="mb-2 block text-sm text-muted-foreground"
                        >
                            Ceritakan pengalaman Anda
                        </label>
                        <textarea
                            id="review-text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Misal: Makanannya sangat enak dan terjamin kehalalannya..."
                            rows={4}
                            maxLength={1000}
                            className="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-foreground transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-muted-foreground">
                            Tambahkan Foto (Opsional)
                        </label>
                        <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:bg-muted">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-accent/20">
                                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-foreground">Tarik & lepas foto ke sini</p>
                            <p className="mt-1 text-xs text-muted-foreground">atau klik untuk memilih file</p>
                        </div>
                    </div>
                </div>

                {submitError && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {submitError}
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border border-border px-6 py-2 text-sm text-muted-foreground transition-all hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-lg bg-accent px-8 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent/90 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                Kirim Ulasan
                                <Send size={20} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
