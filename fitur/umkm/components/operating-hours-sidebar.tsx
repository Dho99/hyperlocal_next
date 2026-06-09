"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Clock,
    Navigation,
    Bookmark,
    BookmarkCheck,
    Phone,
    MessageCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ScrollReveal } from "./scroll-reveal";

interface OperatingHoursSidebarProps {
    id: string;
    slug: string;
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
    id,
    slug,
    openingHours,
    phone,
    latitude,
    longitude,
    address,
    name,
}: OperatingHoursSidebarProps) {
    const router = useRouter();
    const [saved, setSaved] = useState(false);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        fetch(`/api/user/saved-items?targetSlug=${slug}`)
            .then((res) => res.json())
            .then((json) => {
                if (json.data && json.data[slug]) {
                    setSaved(true);
                }
            })
            .catch(() => undefined);
    }, [slug]);

    const toggleSave = () => {
        if (!session) {
            toast.error("Silakan login terlebih dahulu untuk menyimpan favorit", {
                action: {
                    label: "Login",
                    onClick: () => router.push("/halal"),
                },
            });
            return;
        }

        const prev = saved;
        setSaved(!prev);

        fetch("/api/user/saved-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetSlug: slug,
                targetType: "UMKM",
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
                if (json && json.data) {
                    setSaved(json.data.bookmarked);
                }
            })
            .catch(() => {
                setSaved(prev);
            });
    };

    const handleRoute = () => {
        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetId: id,
                targetType: "UMKM",
                actionType: "CLICK_ROUTE",
            }),
        }).catch(() => undefined);
    };

    const handleWhatsApp = () => {
        if (!phone) return;
        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetId: id,
                targetType: "UMKM",
                actionType: "CLICK_WHATSAPP",
            }),
        }).catch(() => undefined);

        const waNumber = phone.replace(/[^0-9]/g, "");
        window.open(
            `https://wa.me/${waNumber}`,
            "_blank",
            "noopener,noreferrer",
        );
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
                        onClick={handleRoute}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                    >
                        <Navigation size={18} />
                        Arahkan Rute
                    </a>
                    {phone && (
                        <button
                            onClick={handleWhatsApp}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1da851]"
                        >
                            <MessageCircle size={18} />
                            Hubungi via WhatsApp
                        </button>
                    )}
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
