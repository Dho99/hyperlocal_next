"use client";

import { useEffect, useState } from "react";
import { Bookmark, MessageCircle, Navigation, TrendingUp } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface BookmarkedDestination {
    id: string;
    name: string;
    city: string;
    slug: string;
    bookmarkCount: number;
}

interface WhatsappClickedUmkm {
    id: string;
    name: string;
    address: string;
    slug: string;
    whatsappClickCount: number;
}

interface CtaSummary {
    totalRouteClicks: number;
    totalWhatsappClicks: number;
    totalBookmarks: number;
    uniqueBookmarkUsers: number;
}

export default function EngagementMetrics() {
    const [bookmarked, setBookmarked] = useState<BookmarkedDestination[]>([]);
    const [whatsappUmkms, setWhatsappUmkms] = useState<WhatsappClickedUmkm[]>([]);
    const [summary, setSummary] = useState<CtaSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then((res) => res.json())
            .then((json) => {
                if (json.data) {
                    setBookmarked(json.data.topBookmarkedDestinations || []);
                    setWhatsappUmkms(json.data.topWhatsappClickedUmkms || []);
                    setSummary(json.data.ctaSummary || null);
                }
            })
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <Card className="rounded-xl border-border bg-card shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                    <CardTitle className="font-heading text-lg font-semibold">
                        Engagement Metrics
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Pelacakan perilaku pengguna — bookmark & konversi CTA.
                    </CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 shrink-0 text-primary" />
            </CardHeader>
            <CardContent className="p-5">
                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Bookmark className="h-4 w-4 text-primary" />
                            Destinasi Paling Banyak Disimpan
                        </h3>
                        {bookmarked.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                Belum ada data bookmark.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {bookmarked.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {item.city}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-primary">
                                            {item.bookmarkCount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-border p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            UMKM Populer (Klik WhatsApp Tertinggi)
                        </h3>
                        {whatsappUmkms.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                Belum ada data WhatsApp.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {whatsappUmkms.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {item.address}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-primary">
                                            {item.whatsappClickCount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {summary && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/15 text-chart-3">
                                <Navigation className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Rute Maps
                                </p>
                                <p className="font-heading text-lg font-semibold text-foreground">
                                    {summary.totalRouteClicks.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <MessageCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    WhatsApp
                                </p>
                                <p className="font-heading text-lg font-semibold text-foreground">
                                    {summary.totalWhatsappClicks.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/15 text-chart-5">
                                <Bookmark className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total Bookmark
                                </p>
                                <p className="font-heading text-lg font-semibold text-foreground">
                                    {summary.totalBookmarks.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
