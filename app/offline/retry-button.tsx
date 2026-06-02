"use client";

import { RefreshCw } from "lucide-react";

export function RetryButton() {
    return (
        <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
        >
            <RefreshCw className="size-4" aria-hidden="true" />
            Coba Lagi
        </button>
    );
}
