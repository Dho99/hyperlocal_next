"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
    FacilityReachabilityRow,
    ReachabilityStatus,
} from "@/lib/facilities/facility-reachability";
import { Loader2, RefreshCcw } from "lucide-react";

const MODE_LABELS: Record<string, string> = {
    WALKING: "Jalan kaki",
    DRIVING: "Berkendara",
    CYCLING: "Bersepeda",
};

function formatDistance(meters: number | null | undefined): string {
    if (meters == null) return "-";
    return meters >= 1000
        ? `${(meters / 1000).toFixed(2)} km`
        : `${meters} m`;
}

function formatMinutes(minutes: number | null | undefined): string {
    return minutes == null ? "-" : `${minutes} menit`;
}

function formatMode(mode: string | null | undefined): string {
    return mode ? (MODE_LABELS[mode] ?? mode) : "-";
}

const STATUS_LABELS: Record<ReachabilityStatus, string> = {
    WITHIN: "Dalam ambang",
    OUTSIDE_DISTANCE: "Melebihi jarak",
    OUTSIDE_TIME: "Melebihi waktu",
    OUTSIDE_BOTH: "Melebihi jarak & waktu",
    NO_CONFIG: "Tanpa ambang",
    UNKNOWN: "Belum dinilai",
};

function statusVariant(
    status: ReachabilityStatus,
): "success" | "destructive" | "secondary" | "outline" {
    if (status === "WITHIN") return "success";
    if (status.startsWith("OUTSIDE")) return "destructive";
    if (status === "NO_CONFIG") return "secondary";
    return "outline";
}

function thresholdLabel(row: FacilityReachabilityRow): string {
    const threshold = row.reachability.threshold;
    if (!threshold) return "-";
    const parts: string[] = [];
    if (threshold.maxDistanceMeters != null && threshold.maxDistanceMeters > 0) {
        parts.push(formatDistance(threshold.maxDistanceMeters));
    }
    if (threshold.maxTravelMinutes != null && threshold.maxTravelMinutes > 0) {
        parts.push(`${threshold.maxTravelMinutes} mnt`);
    }
    return parts.length > 0 ? parts.join(" / ") : "Tanpa batas";
}

function statusDetail(row: FacilityReachabilityRow): string | null {
    const threshold = row.reachability.threshold;
    const live = row.live;
    if (!threshold) return null;

    if (row.reachability.status === "UNKNOWN") {
        return row.liveReason ?? "Metrik live belum tersedia.";
    }

    if (!live) return null;

    const reasons: string[] = [];
    if (
        threshold.maxDistanceMeters != null &&
        threshold.maxDistanceMeters > 0 &&
        live.distanceMeters != null &&
        live.distanceMeters > threshold.maxDistanceMeters
    ) {
        reasons.push(
            `${formatDistance(live.distanceMeters)} > ${formatDistance(threshold.maxDistanceMeters)}`,
        );
    }
    if (
        threshold.maxTravelMinutes != null &&
        threshold.maxTravelMinutes > 0 &&
        live.travelMinutes != null &&
        live.travelMinutes > threshold.maxTravelMinutes
    ) {
        reasons.push(
            `${formatMinutes(live.travelMinutes)} > ${threshold.maxTravelMinutes} menit`,
        );
    }
    return reasons.length > 0 ? reasons.join(" · ") : null;
}

function storedLabel(row: FacilityReachabilityRow): string | null {
    if (!row.live) return null;
    if (
        row.stored.distanceMeters == null &&
        row.stored.travelMinutes == null &&
        row.stored.travelMode == null
    ) {
        return null;
    }
    const stored = [
        formatDistance(row.stored.distanceMeters),
        formatMinutes(row.stored.travelMinutes),
        formatMode(row.stored.travelMode),
    ];
    const live = [
        formatDistance(row.live.distanceMeters),
        formatMinutes(row.live.travelMinutes),
        formatMode(row.live.travelMode),
    ];
    return stored.join(" · ") === live.join(" · ") ? null : stored.join(" · ");
}

export function DestinationFacilityTable({
    rows,
    loading = false,
    error = null,
    onRefresh,
    title = "Fasilitas Terdaftar",
    description = "Fasilitas penunjang yang terhubung ke destinasi ini. Jarak dan waktu tempuh dihitung ulang dari koordinat saat ini.",
}: {
    rows: FacilityReachabilityRow[];
    loading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
    title?: string;
    description?: string;
}) {
    const isRefreshing = loading && rows.length > 0;
    const withinCount = rows.filter((row) => row.reachability.status === "WITHIN").length;
    const outsideCount = rows.filter((row) =>
        row.reachability.status.startsWith("OUTSIDE"),
    ).length;
    const noConfigCount = rows.filter(
        (row) => row.reachability.status === "NO_CONFIG",
    ).length;
    const unknownCount = rows.filter(
        (row) => row.reachability.status === "UNKNOWN",
    ).length;

    return (
        <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg font-heading">{title}</CardTitle>
                        <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{rows.length} fasilitas</Badge>
                        {onRefresh && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                {isRefreshing ? (
                                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                                ) : (
                                    <RefreshCcw className="size-3.5" aria-hidden="true" />
                                )}
                                {isRefreshing ? "Memuat..." : "Muat ulang"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {rows.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="success">{withinCount} dalam ambang</Badge>
                        {outsideCount > 0 && (
                            <Badge variant="destructive">{outsideCount} melebihi ambang</Badge>
                        )}
                        {noConfigCount > 0 && (
                            <Badge variant="secondary">{noConfigCount} tanpa ambang</Badge>
                        )}
                        {unknownCount > 0 && (
                            <Badge variant="outline">{unknownCount} belum dinilai</Badge>
                        )}
                    </div>
                )}
                {loading && rows.length === 0 ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Memuat jarak dan waktu tempuh fasilitas...
                    </div>
                ) : rows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Belum ada fasilitas terdaftar untuk destinasi ini.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th scope="col" className="py-2 pr-4 font-medium">Fasilitas</th>
                                    <th scope="col" className="py-2 pr-4 font-medium">Koordinat</th>
                                    <th scope="col" className="py-2 pr-4 font-medium">Jarak</th>
                                    <th scope="col" className="py-2 pr-4 font-medium">Waktu</th>
                                    <th scope="col" className="py-2 pr-4 font-medium">Mode</th>
                                    <th scope="col" className="py-2 pr-4 font-medium">Ambang</th>
                                    <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                                    <th scope="col" className="py-2 font-medium">Bukti Foto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const previous = storedLabel(row);
                                    return (
                                        <tr key={row.id} className="border-b align-top last:border-0">
                                            <td className="py-3 pr-4">
                                                <p className="font-medium text-foreground">{row.facilityName}</p>
                                                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                                    {row.facilityType ?? "Tipe belum diisi"}
                                                </p>
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                                                {row.latitude != null && row.longitude != null
                                                    ? `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`
                                                    : "-"}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <p>{formatDistance(row.live?.distanceMeters ?? row.stored.distanceMeters)}</p>
                                                {row.live?.source === "ROUTING" && (
                                                    <p className="text-[11px] text-muted-foreground">Rute OSRM</p>
                                                )}
                                                {row.live?.source === "ESTIMATION" && (
                                                    <p className="text-[11px] text-muted-foreground">Estimasi garis lurus</p>
                                                )}
                                                {previous && (
                                                    <p className="text-[11px] text-muted-foreground">
                                                        Sebelumnya: {previous}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {formatMinutes(row.live?.travelMinutes ?? row.stored.travelMinutes)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {formatMode(row.live?.travelMode ?? row.stored.travelMode)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <p className="text-xs">{thresholdLabel(row)}</p>
                                                {row.reachability.threshold && (
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {formatMode(row.reachability.threshold.travelMode)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant={statusVariant(row.reachability.status)}>
                                                    {STATUS_LABELS[row.reachability.status]}
                                                </Badge>
                                                {statusDetail(row) && (
                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                        {statusDetail(row)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <EvidenceBadges row={row} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {rows.some((row) => storedLabel(row)) && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Nilai tersimpan berbeda dari hasil hitung terbaru. Angka utama di atas adalah nilai aktual.
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        <span>{error}</span>
                        {onRefresh && (
                            <Button type="button" size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
                                Coba lagi
                            </Button>
                        )}
                    </div>
                )}

                {rows.some((row) => row.liveReason) && (
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {rows
                            .filter((row) => row.liveReason)
                            .map((row) => (
                                <li key={row.id}>
                                    <span className="font-medium text-foreground">{row.facilityName}:</span>{" "}
                                    {row.liveReason}
                                </li>
                            ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

function EvidenceBadges({ row }: { row: FacilityReachabilityRow }) {
    if (row.evidence.total === 0) {
        return <span className="text-xs text-muted-foreground">Belum ada foto</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{row.evidence.total} foto</Badge>
            {row.evidence.valid > 0 && (
                <Badge variant="success">{row.evidence.valid} valid</Badge>
            )}
            {row.evidence.invalidPosition > 0 && (
                <Badge variant="destructive">{row.evidence.invalidPosition} luar radius</Badge>
            )}
            {row.evidence.invalidTime > 0 && (
                <Badge variant="destructive">{row.evidence.invalidTime} waktu aneh</Badge>
            )}
            {row.evidence.noMetadata > 0 && (
                <Badge variant="outline">{row.evidence.noMetadata} tanpa metadata</Badge>
            )}
            {row.evidence.pending > 0 && (
                <Badge variant="outline">{row.evidence.pending} menunggu validasi</Badge>
            )}
        </div>
    );
}
