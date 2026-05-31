"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bookmark, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface BookmarkButtonProps {
  destinationId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function BookmarkButton({
  destinationId,
  variant = "full",
  className,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data[destinationId]) {
          setSaved(true);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [destinationId]);

  const handleClick = useCallback(() => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan favorit", {
        action: {
          label: "Login",
          onClick: () => router.push("/user/login"),
        },
      });
      return;
    }

    setMutating(true);
    const prev = saved;
    setSaved(!prev);

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetId: destinationId,
        targetType: "DESTINASI",
        actionType: "BOOKMARK",
      }),
    })
      .then((res) => {
        if (!res.ok && res.status === 401) {
          setSaved(prev);
          toast.error("Silakan login terlebih dahulu untuk menyimpan favorit");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data) {
          setSaved(json.data.bookmarked);
        }
      })
      .catch(() => {
        setSaved(prev);
      })
      .finally(() => setMutating(false));
  }, [destinationId, saved, session, router]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={mutating}
        aria-pressed={saved}
        aria-label={saved ? "Hapus dari simpanan" : "Simpan destinasi"}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors",
          "bg-background/70 backdrop-blur-md p-2 shadow-sm",
          saved ? "text-primary" : "text-muted-foreground hover:text-primary",
          mutating && "opacity-60 pointer-events-none",
          className,
        )}
      >
        <Heart className={cn("size-5", saved && "fill-current")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutating}
      aria-pressed={saved}
      className={cn(
        "w-full border text-xs font-semibold tracking-wider py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2",
        saved
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-transparent border-border text-foreground hover:bg-muted",
        mutating && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {mutating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bookmark className={cn("size-4", saved && "fill-current")} />
      )}
      {saved ? "Telah Tersimpan" : "Simpan Destinasi"}
    </button>
  );
}
