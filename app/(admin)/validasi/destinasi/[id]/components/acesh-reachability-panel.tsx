"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { DestinationFacilityTable } from "@/components/admin/facilities/destination-facility-table";
import type { FacilityReachabilityRow } from "@/lib/facilities/facility-reachability";

export interface ReachabilityConfigItem {
    id: string;
    facilityType: string;
    maxDistanceMeters: number | null;
    maxTravelMinutes: number | null;
    travelMode: string | null;
    label: string | null;
}

export interface FacilityMetricItem {
    id: string;
    facility: { id: string; name: string; type: string | null };
    distanceMeters: number | null;
    travelMinutes: number | null;
    travelMode: string | null;
}

const MODE_LABELS: Record<string, string> = {
    WALKING: "Jalan kaki",
    DRIVING: "Berkendara",
    CYCLING: "Bersepeda",
};

export function ReachabilityPanel({
    configs,
    facilityRows,
    facilityRowsLoading,
    facilityRowsError,
    onRefreshFacilities,
    loading,
}: {
    configs: ReachabilityConfigItem[];
    facilityRows: FacilityReachabilityRow[];
    facilityRowsLoading: boolean;
    facilityRowsError: string | null;
    onRefreshFacilities: () => void;
    loading: boolean;
}) {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memuat konfigurasi
                    jangkauan...
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Ambang Jangkauan Fasilitas (Reachability)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Batas jarak/waktu tempuh yang digunakan untuk menilai
                        ketersediaan fasilitas penunjang bagi setiap destinasi.
                        Dikelola global di Konfigurasi → Reachability.
                    </p>
                </CardHeader>
                <CardContent>
                    {configs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Belum ada konfigurasi — sistem memakai nilai bawaan
                            (masjid 500 m jalan kaki, restoran 15 menit berkendara,
                            penginapan 30 menit berkendara).
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">
                                            Tipe Fasilitas
                                        </th>
                                        <th className="py-2 pr-4 font-medium">
                                            Jarak Maks
                                        </th>
                                        <th className="py-2 pr-4 font-medium">
                                            Waktu Maks
                                        </th>
                                        <th className="py-2 pr-4 font-medium">Mode</th>
                                        <th className="py-2 font-medium">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configs.map((c) => (
                                        <tr key={c.id} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-mono text-xs">
                                                {c.facilityType}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {c.maxDistanceMeters
                                                    ? `${(c.maxDistanceMeters / 1000).toLocaleString("id-ID")} km`
                                                    : "-"}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {c.maxTravelMinutes
                                                    ? `${c.maxTravelMinutes} menit`
                                                    : "-"}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {c.travelMode
                                                    ? (MODE_LABELS[c.travelMode] ??
                                                      c.travelMode)
                                                    : "-"}
                                            </td>
                                            <td className="py-2 text-xs text-muted-foreground">
                                                {c.label}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DestinationFacilityTable
                rows={facilityRows}
                loading={facilityRowsLoading}
                error={facilityRowsError}
                onRefresh={onRefreshFacilities}
                title="Fasilitas Penunjang Destinasi Ini"
                description="Jarak dan waktu tempuh dihitung ulang dari koordinat destinasi dan fasilitas saat ini."
            />
        </div>
    );
}
