"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    Navigation,
    Bookmark,
    BookmarkCheck,
    Phone,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

interface OperatingHoursSidebarProps {
    openingHours:
        | Record<string, { open: string; close: string }>
        | { open: string; close: string }
        | null
        | undefined;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    name: string;
}

const DAY_NAMES: Record<string, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
};

const DAY_ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

function getTodayKey(): string {
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    return days[new Date().getDay()];
}

function isOpenNow(
    hours:
        | Record<string, { open: string; close: string }>
        | { open: string; close: string },
): boolean {
    if ("open" in hours && "close" in hours) {
        const single = hours as { open: string; close: string };
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = single.open.split(":").map(Number);
        const [closeH, closeM] = single.close.split(":").map(Number);
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }

    const multi = hours as Record<string, { open: string; close: string }>;
    const today = getTodayKey();
    const todayHours = multi[today];
    if (!todayHours) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = todayHours.open.split(":").map(Number);
    const [closeH, closeM] = todayHours.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export function OperatingHoursSidebar({
    openingHours,
    phone,
    latitude,
    longitude,
    address,
    name,
}: OperatingHoursSidebarProps) {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("savedUmkm");
            const ids: string[] = stored ? JSON.parse(stored) : [];
            setSaved(ids.includes(name));
        } catch {
            // ignore
        }
    }, [name]);

    const toggleSave = () => {
        try {
            const stored = localStorage.getItem("savedUmkm");
            const ids: string[] = stored ? JSON.parse(stored) : [];
            const next = saved
                ? ids.filter((id) => id !== name)
                : [...ids, name];
            localStorage.setItem("savedUmkm", JSON.stringify(next));
            setSaved(!saved);
        } catch {
            // ignore
        }
    };

    const mapsUrl =
        latitude && longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || name)}`;

    const todayKey = getTodayKey();
    const open = openingHours ? isOpenNow(openingHours) : false;

    return (
        <ScrollReveal>
            <div className="space-y-6">
                {/* Operating Hours */}
                <div className="rounded-lg border border-stone-200 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                        <Clock size={18} />
                        Jam Operasional
                    </h3>

                    {!openingHours ? (
                        <p className="text-sm text-stone-400">
                            Informasi jam operasional belum tersedia
                        </p>
                    ) : (
                        <div className="space-y-1.5">
                            {"open" in openingHours &&
                            "close" in openingHours ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-600">
                                        Setiap Hari
                                    </span>
                                    <span className="font-medium text-stone-800">
                                        {(openingHours as { open: string; close: string }).open}{" "}
                                        -{" "}
                                        {(openingHours as { open: string; close: string }).close}
                                    </span>
                                </div>
                            ) : (
                                DAY_ORDER.map((day) => {
                                    const hours = (
                                        openingHours as Record<
                                            string,
                                            { open: string; close: string }
                                        >
                                    )[day];
                                    const isToday = day === todayKey;
                                    return (
                                        <div
                                            key={day}
                                            className={`flex justify-between text-sm ${
                                                isToday
                                                    ? "font-medium text-emerald-800"
                                                    : "text-stone-600"
                                            }`}
                                        >
                                            <span>
                                                {DAY_NAMES[day] || day}
                                                {isToday && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-xs">
                                                        <span
                                                            className={`inline-block h-2 w-2 rounded-full ${
                                                                open
                                                                    ? "bg-emerald-500"
                                                                    : "bg-red-400"
                                                            }`}
                                                        />
                                                        {open
                                                            ? "Buka"
                                                            : "Tutup"}
                                                    </span>
                                                )}
                                            </span>
                                            <span>
                                                {hours
                                                    ? `${hours.open} - ${hours.close}`
                                                    : "-"}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Phone */}
                {phone && (
                    <div className="rounded-lg border border-stone-200 p-5">
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                            <Phone size={18} />
                            Kontak
                        </h3>
                        <a
                            href={`tel:${phone}`}
                            className="text-sm text-emerald-700 hover:underline"
                        >
                            {phone}
                        </a>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                    >
                        <Navigation size={18} />
                        Arahkan Rute
                    </a>
                    <button
                        onClick={toggleSave}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
                            saved
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                        }`}
                    >
                        {saved ? (
                            <>
                                <BookmarkCheck size={18} />
                                Tersimpan
                            </>
                        ) : (
                            <>
                                <Bookmark size={18} />
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ScrollReveal>
    );
}
