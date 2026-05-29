"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white/80 p-2 shadow-lg shadow-black/10 ring-1 ring-white/40 backdrop-blur-md"
        >
            <Search className="ml-3 size-5 shrink-0 text-[#7a7582]" />
            <input
                aria-label="Cari destinasi"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#7a7582]"
                placeholder="Cari destinasi, kuliner, atau UMKM halal..."
            />
            <button
                className="hidden h-12 rounded-xl bg-[#4f378a] px-6 text-sm font-bold text-white shadow-lg shadow-[#4f378a]/25 transition hover:bg-[#3f2a78] sm:block"
                type="submit"
            >
                Cari Sekarang
            </button>
        </form>
    );
}
