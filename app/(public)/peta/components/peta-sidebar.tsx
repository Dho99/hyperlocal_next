"use client";

import { Search, MapPin, X, Navigation, Star, Globe } from "lucide-react";
import type { Destination } from "@/types/destination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getCategoryColor,
    getAllCategoryNames,
} from "@/lib/config/map-categories";
import type { UserLocation } from "./peta-types";

const RADIUS_PRESETS = [1, 3, 5, 10, 25] as const;

interface CoverageArea {
    id: string;
    name: string;
    level: string;
    colorHex: string | null;
}

interface PetaSidebarProps {
    destinations: Destination[];
    userLocation: UserLocation | null;
    radius: number;
    searchQuery: string;
    activeCategory: string | null;
    selectedDestination: Destination | null;
    selectedFacilityId: string | null;
    locationDenied: boolean;
    coverageAreas: CoverageArea[];
    selectedAreaId: string | null;
    onRadiusChange: (km: number) => void;
    onSearchChange: (q: string) => void;
    onCategoryChange: (cat: string | null) => void;
    onDestinationSelect: (d: Destination | null) => void;
    onFacilitySelect: (facilityId: string) => void;
    onLocateMe: () => void;
    onAreaChange: (areaId: string | null) => void;
    isSidebarOpen: boolean;
}

export default function PetaSidebar({
    destinations,
    userLocation,
    radius,
    searchQuery,
    activeCategory,
    selectedDestination,
    selectedFacilityId,
    locationDenied,
    coverageAreas,
    selectedAreaId,
    onRadiusChange,
    onSearchChange,
    onCategoryChange,
    onDestinationSelect,
    onFacilitySelect,
    onLocateMe,
    onAreaChange,
    isSidebarOpen,
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
            <aside
                className={`flex max-h-[calc(100dvh-4rem)] h-full min-h-0 flex-col border-r border-border bg-card transition-all duration-300 ${isSidebarOpen ? "w-[420px]" : "w-0 overflow-hidden"}`}
            >
                <div className="shrink-0 space-y-4 border-b border-border p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-lg font-semibold text-foreground">
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

                <ScrollArea className="flex-1 w-full min-h-0">
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
                            <p className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                                {d.address}
                            </p>
                        )}

                        {d.rating != null && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="size-4 text-amber-400" />
                                {d.rating.toFixed(1)}
                                {d.reviewCount != null && (
                                    <span className="text-muted-foreground">
                                        ({d.reviewCount} ulasan)
                                    </span>
                                )}
                            </div>
                        )}

                        <Separator />

                        {facilities.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-semibold text-foreground">
                                    Fasilitas Halal ({facilities.length})
                                </h4>
                                <div className="space-y-2">
                                    {facilities.map((dhf) => (
                                        <button
                                            key={dhf.id}
                                            type="button"
                                            disabled={
                                                dhf.latitude == null ||
                                                dhf.longitude == null
                                            }
                                            onClick={() =>
                                                onFacilitySelect(dhf.id)
                                            }
                                            className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                                                selectedFacilityId === dhf.id
                                                    ? "border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/15 dark:bg-emerald-950/50"
                                                    : "border-border bg-background hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30"
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="font-medium text-foreground">
                                                    {dhf.name ??
                                                        dhf.facility?.name ??
                                                        "Fasilitas"}
                                                </p>
                                                <Navigation className={`mt-0.5 size-4 shrink-0 ${selectedFacilityId === dhf.id ? "text-emerald-600" : "text-muted-foreground"}`} />
                                            </div>
                                            {dhf.facility?.facilityType && (
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {dhf.facility.facilityType.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </p>
                                            )}
                                            {dhf.distanceMeters != null && (
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    {dhf.distanceMeters >= 1000
                                                        ? `${(dhf.distanceMeters / 1000).toFixed(2)} km`
                                                        : `${dhf.distanceMeters} m`}
                                                    {dhf.travelMinutes != null
                                                        ? ` · ±${dhf.travelMinutes} menit`
                                                        : ""}
                                                    {dhf.travelMode
                                                        ? ` (${dhf.travelMode === "WALKING" ? "jalan kaki" : dhf.travelMode === "CYCLING" ? "bersepeda" : "berkendara"})`
                                                        : ""}
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                {selectedFacilityId === dhf.id
                                                    ? "Rute sedang ditampilkan"
                                                    : "Tampilkan rute"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {d.description && (
                            <div>
                                <h4 className="mb-1 text-sm font-semibold text-foreground">
                                    Deskripsi
                                </h4>
                                <RichTextRenderer
                                    content={d.description}
                                    className="text-sm text-muted-foreground"
                                />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </aside>
        );
    }

    return (
        <aside
                    className={`flex max-h-[calc(100dvh-4rem)] overflow-hidden h-full min-h-0 flex-col border-r border-border bg-card transition-all duration-300 ${isSidebarOpen ? "w-[420px]" : "w-0 overflow-hidden"}`}
                >
                    <div className="shrink-0 space-y-3 border-b border-border p-4">
                        <div className="flex items-center justify-between ">
                            <h2 className="font-heading text-lg font-semibold text-foreground">
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
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari destinasi..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {coverageAreas.length > 0 && (
                    <div className="flex items-center gap-2 ">
                        <Globe className="size-4 shrink-0 text-muted-foreground" />
                        <Select
                            value={selectedAreaId ?? "all"}
                            onValueChange={(v) =>
                                onAreaChange(v === "all" ? null : v)
                            }
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Semua Area" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Area</SelectItem>
                                {coverageAreas.map((area) => (
                                    <SelectItem key={area.id} value={area.id}>
                                        {area.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {locationDenied && (
                    <p className="text-xs text-amber-400">
                        Lokasi tidak diizinkan. Gunakan pusat kota default.
                    </p>
                )}

                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
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
                                        ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                                        : "bg-muted text-muted-foreground hover:bg-accent/10"
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
                        className="mt-2 w-full accent-accent"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => onCategoryChange(null)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            activeCategory === null
                                ? "bg-accent text-white"
                                : "bg-muted text-muted-foreground hover:bg-accent/10"
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
                                        : "bg-muted text-muted-foreground hover:bg-accent/10"
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
                            <span className="text-xs text-muted-foreground">
                                {cat}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="shrink-0 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
                {filteredDestinations.length} destinasi ditemukan
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="divide-y divide-border">
                    {filteredDestinations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
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
                                className="w-full px-4 py-3 text-left transition hover:bg-accent/10"
                            >
                                <p className="text-sm font-medium text-foreground">
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
                                        <span className="text-xs text-muted-foreground">
                                            ★ {d.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                {d.address && (
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
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
