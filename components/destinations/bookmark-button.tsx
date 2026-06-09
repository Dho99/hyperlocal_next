"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
    targetSlug: string;
    targetType?: "DESTINASI" | "UMKM";
    className?: string;
    showLabel?: boolean;
}

export function BookmarkButton({
    targetSlug,
    targetType = "DESTINASI",
    className,
    showLabel = true,
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = authClient.useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session || !targetSlug) {
            setIsLoading(false);
            return;
        }

        async function checkStatus() {
            try {
                const res = await fetch(
                    `/api/user/saved-items?targetSlug=${targetSlug}`,
                );
                if (res.ok) {
                    const json = await res.json();
                    setIsBookmarked(json.data?.[targetSlug] ?? false);
                }
            } catch (err) {
                console.error("Failed to check bookmark status:", err);
            } finally {
                setIsLoading(false);
            }
        }

        checkStatus();
    }, [targetSlug, targetType, session]);

    const handleToggleBookmark = useCallback(async () => {
        if (!session) {
            toast.error("Silakan login untuk menyimpan item", {
                action: {
                    label: "Login",
                    onClick: () => router.push("/halal"),
                },
            });
            return;
        }

        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus);
        const originalStatus = !newStatus;

        try {
            const res = await fetch("/api/user/saved-items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetSlug,
                    targetType,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to toggle bookmark");
            }

            toast.success(
                newStatus ? "Tersimpan ke favorit" : "Dihapus dari favorit",
            );
        } catch (err) {
            setIsBookmarked(originalStatus);
            toast.error("Gagal memperbarui status simpan");
        }
    }, [session, targetSlug, targetType, isBookmarked]);

    return (
        <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={isLoading}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors w-full",
                showLabel ? "px-4 py-2 text-sm" : "p-2",
                isBookmarked
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                isLoading && "opacity-50 cursor-not-allowed",
                className,
            )}
            title={isBookmarked ? "Hapus dari tersimpan" : "Simpan ke favorit"}
        >
            <Bookmark
                className={cn(
                    "h-4 w-4 transition-transform",
                    isBookmarked && "fill-current scale-110",
                    !isBookmarked && "hover:scale-110",
                )}
            />
            {showLabel && (
                <span className="hidden sm:inline">
                    {isBookmarked ? "Tersimpan" : "Simpan"}
                </span>
            )}
        </button>
    );
}
