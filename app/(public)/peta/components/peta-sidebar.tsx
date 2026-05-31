"use client";

import { Search, MapPin, X, Navigation, Star } from "lucide-react";
import type { Destination } from "@/types/destination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import {
    getCategoryColor,
    getAllCategoryNames,
} from "@/lib/config/map-categories";
import type { UserLocation } from "./peta-types";

const RADIUS_PRESETS = [1, 3, 5, 10, 25] as const;

interface PetaSidebarProps {
    destinations: Destination[];
    userLocation: UserLocation | null;
    radius: number;
    searchQuery: string;
    activeCategory: string | null;
    selectedDestination: Destination | null;
    locationDenied: boolean;
    onRadiusChange: (km: number) => void;
    onSearchChange: (q: string) => void;
    onCategoryChange: (cat: string | null) => void;
    onDestinationSelect: (d: Destination | null) => void;
    onLocateMe: () => void;
}

export default function PetaSidebar({
    destinations,
    userLocation,
    radius,
    searchQuery,
    activeCategory,
    selectedDestination,
    locationDenied,
    onRadiusChange,
    onSearchChange,
    onCategoryChange,
    onDestinationSelect,
    onLocateMe,
}: PetaSidebarProps) {
    const categories = getAllCategoryNames();

    const filteredDestinations = destinations.filter((d) => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!d.name.toLowerCase().includes(q)) return false;
        }
        if (activeCategory && d.category?.name !== activeCategory) return false;
        return true;
    });

    if (selectedDestination) {
        const d = selectedDestination;
        const color = getCategoryColor(d.category?.name);
        const facilities = d.destinationHalalFacilities ?? [];

        return (
            <aside className="flex h-full flex-col border-r border-stone-200 bg-white max-w-xl">
                <div className="shrink-0 space-y-4 border-b border-stone-200 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-lg font-semibold text-emerald-900">
                            Detail Destinasi
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDestinationSelect(null)}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 w-full">
                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="font-heading text-base font-semibold">
                                {d.name}
                            </h3>
                            {d.category?.name && (
                                <Badge
                                    variant="outline"
                                    className="mt-1"
                                    style={{
                                        borderColor: color,
                                        color: color,
                                    }}
                                >
                                    {d.category.name}
                                </Badge>
                            )}
                        </div>

                        {d.address && (
                            <p className="flex items-start gap-2 text-sm text-stone-600">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                                {d.address}
                            </p>
                        )}

                        {d.rating != null && (
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                                <Star className="size-4 text-yellow-500" />
                                {d.rating.toFixed(1)}
                                {d.reviewCount != null && (
                                    <span className="text-stone-500">
                                        ({d.reviewCount} ulasan)
                                    </span>
                                )}
                            </div>
                        )}

                        <Separator />

                        {facilities.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-semibold text-emerald-900">
                                    Fasilitas Halal ({facilities.length})
                                </h4>
                                <div className="space-y-2">
                                    {facilities.map((dhf) => (
                                        <div
                                            key={dhf.id}
                                            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm"
                                        >
                                            <p className="font-medium text-emerald-900">
                                                {dhf.facility?.name ??
                                                    "Fasilitas"}
                                            </p>
                                            {dhf.facility?.facilityType && (
                                                <p className="text-xs text-stone-500 capitalize">
                                                    {dhf.facility.facilityType.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </p>
                                            )}
                                            {dhf.latitude != null &&
                                                dhf.longitude != null && (
                                                    <p className="mt-1 text-[10px] font-mono text-stone-500">
                                                        {dhf.latitude.toFixed(
                                                            6,
                                                        )}
                                                        ,{" "}
                                                        {dhf.longitude.toFixed(
                                                            6,
                                                        )}
                                                    </p>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {d.description && (
                            <div>
                                <h4 className="mb-1 text-sm font-semibold text-emerald-900">
                                    Deskripsi
                                </h4>
                                <RichTextRenderer
                                    content={d.description}
                                    className="text-sm text-stone-600"
                                />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </aside>
        );
    }

    return (
        <aside className="flex h-full flex-col border-r border-stone-200 bg-white">
            <div className="shrink-0 space-y-3 border-b border-stone-200 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-emerald-900">
                        Peta Interaktif
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onLocateMe}
                        disabled={locationDenied}
                    >
                        <Navigation className="size-3.5" />
                        {userLocation ? "Lokasi Saya" : "Cari Saya"}
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                    <Input
                        placeholder="Cari destinasi..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {locationDenied && (
                    <p className="text-xs text-amber-600">
                        Lokasi tidak diizinkan. Gunakan pusat kota default.
                    </p>
                )}

                <div>
                    <label className="mb-1 block text-xs font-medium text-stone-500">
                        Radius: {radius} km
                    </label>
                    <div className="flex items-center gap-2">
                        {RADIUS_PRESETS.map((km) => (
                            <button
                                key={km}
                                type="button"
                                onClick={() => onRadiusChange(km)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                    radius === km
                                        ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-700/30"
                                        : "bg-stone-100 text-stone-600 hover:bg-emerald-50"
                                }`}
                            >
                                {km} km
                            </button>
                        ))}
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={50}
                        step={1}
                        value={radius}
                        onChange={(e) => onRadiusChange(Number(e.target.value))}
                        className="mt-2 w-full accent-emerald-700"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => onCategoryChange(null)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            activeCategory === null
                                ? "bg-emerald-800 text-white"
                                : "bg-stone-100 text-stone-600 hover:bg-emerald-50"
                        }`}
                    >
                        Semua
                    </button>
                    {categories.map((cat) => {
                        const color = getCategoryColor(cat);
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() =>
                                    onCategoryChange(isActive ? null : cat)
                                }
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                    isActive
                                        ? "text-white"
                                        : "bg-stone-100 text-stone-600 hover:bg-emerald-50"
                                }`}
                                style={
                                    isActive
                                        ? { backgroundColor: color }
                                        : undefined
                                }
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {categories.map((cat) => (
                        <div key={cat} className="flex items-center gap-1.5">
                            <span
                                className="size-2.5 rounded-full"
                                style={{
                                    backgroundColor: getCategoryColor(cat),
                                }}
                            />
                            <span className="text-xs text-stone-600">
                                {cat}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="shrink-0 border-b border-stone-200 px-4 py-2 text-xs font-medium text-stone-500">
                {filteredDestinations.length} destinasi ditemukan
            </div>

            <ScrollArea className="flex-1">
                <div className="divide-y divide-stone-200">
                    {filteredDestinations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-stone-500">
                            <MapPin className="mb-2 size-8 opacity-40" />
                            Tidak ada destinasi ditemukan
                        </div>
                    )}
                    {filteredDestinations.map((d) => {
                        const color = getCategoryColor(d.category?.name);
                        return (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => onDestinationSelect(d)}
                                className="w-full px-4 py-3 text-left transition hover:bg-emerald-50"
                            >
                                <p className="text-sm font-medium text-emerald-900">
                                    {d.name}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                    {d.category?.name && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px]"
                                            style={{
                                                borderColor: color,
                                                color: color,
                                            }}
                                        >
                                            {d.category.name}
                                        </Badge>
                                    )}
                                    {d.rating != null && (
                                        <span className="text-xs text-stone-500">
                                            ★ {d.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                {d.address && (
                                    <p className="mt-1 truncate text-xs text-stone-500">
                                        {d.address}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </aside>
    );
}
