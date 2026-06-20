"use client";

import { useState, useCallback } from "react";
import { MessageCircle, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsappButtonProps {
  destinationId: string;
  phoneNumber: string | null;
  className?: string;
}

export function WhatsappButton({
  destinationId,
  phoneNumber,
  className,
}: WhatsappButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleClick = useCallback(() => {
    const raw = phoneNumber?.replace(/[^0-9]/g, "").trim();

    if (!raw || raw.length < 8) {
      setShowDialog(true);
      return;
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetId: destinationId,
        targetType: "DESTINASI",
        actionType: "CLICK_WHATSAPP",
      }),
    }).catch(() => undefined);

    window.open(`https://wa.me/${raw}`, "_blank", "noopener,noreferrer");
  }, [destinationId, phoneNumber]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full bg-[#25D366] text-white text-xs font-semibold tracking-wider py-3 rounded-lg hover:bg-[#1da851] transition-colors shadow-sm flex items-center justify-center gap-2",
          className,
        )}
      >
        <MessageCircle className="size-4" />
        Hubungi via WhatsApp
      </button>

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl border-2 border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <AlertTriangle className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-stone-700 leading-relaxed">
                  Mohon Maaf, pengelola destinasi ini belum mencantumkan nomor
                  WhatsApp resmi yang dapat dihubungi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="mt-2 w-full rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 flex items-center justify-center gap-2"
              >
                <X className="size-4" />
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
