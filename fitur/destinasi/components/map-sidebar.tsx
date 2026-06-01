"use client";

import dynamic from "next/dynamic";
import {
    MapPin,
    Navigation,
    Share2,
    Copy,
    Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";
import type { MapData } from "@/fitur/destinasi/data/destinasi-detail-data";
import { BookmarkButton } from "@/components/destinations/bookmark-button";
import { WhatsappButton } from "@/components/destinations/whatsapp-button";

const DynamicContextMap = dynamic(
    () => import("@/components/maps").then((m) => m.DynamicContextMap),
    { ssr: false },
);

interface MapSidebarProps {
    destination: Destination;
    mapData: MapData | null;
    shareCopied: boolean;
    onRoute: () => void;
    onShare: () => void;
    destinationId: string;
}

export function MapSidebar({
    destination,
    mapData,
    shareCopied,
    onRoute,
    onShare,
    destinationId,
}: MapSidebarProps) {
    return (
        <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
                <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border/30">
                        <h3 className="font-bold text-base text-foreground">
                            Cek Sekitar
                        </h3>
                    </div>
                    {mapData ? (
                        <div className="h-48 bg-muted relative">
                            <DynamicContextMap
                                destination={mapData}
                                className="h-full w-full"
                            />
                        </div>
                    ) : (
                        <div className="h-48 bg-muted relative flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-border" />
                        </div>
                    )}
                    <div className="p-4 bg-muted/30">
                        <button
                            type="button"
                            onClick={onRoute}
                            className="w-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider py-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Buka Rute di Maps
                        </button>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <h3 className="font-bold text-base text-foreground mb-4">
                        Mulai Perjalanan Anda
                    </h3>
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={onRoute}
                            className="w-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <Navigation className="size-4" />
                            Arahkan Rute
                        </button>
                        <WhatsappButton
                            destinationId={destinationId}
                            phoneNumber={null}
                        />
                        <BookmarkButton
                            targetId={destinationId}
                            targetType="DESTINASI"
                            className="flex-1"
                        />
                        <button
                            type="button"
                            onClick={onShare}
                            className="w-full bg-transparent border border-border text-foreground text-xs font-semibold tracking-wider py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                        >
                            {shareCopied ? (
                                <Copy className="size-4" />
                            ) : (
                                <Share2 className="size-4" />
                            )}
                            {shareCopied ? "Link Disalin" : "Bagikan Destinasi"}
                        </button>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
                    <h3 className="font-bold text-sm text-foreground mb-3">
                        Informasi Singkat
                    </h3>
                    <div className="space-y-2.5 text-sm">
                        {destination.category && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Kategori
                                </span>
                                <span className="font-semibold text-foreground">
                                    {destination.category.name}
                                </span>
                            </div>
                        )}
                        {destination.rating != null && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Rating
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                                    <Star className="size-3.5 fill-[#e7c365] text-[#e7c365]" />
                                    {destination.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                        {destination.address && (
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground shrink-0">
                                    Alamat
                                </span>
                                <span className="text-right font-medium text-foreground truncate max-w-[160px]">
                                    {destination.address}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                                    destination.status === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : destination.status === "REJECTED"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-amber-100 text-amber-800",
                                )}
                            >
                                {destination.status === "APPROVED"
                                    ? "Terverifikasi"
                                    : destination.status === "REJECTED"
                                      ? "Ditolak"
                                      : "Pending"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
