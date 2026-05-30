"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    calculateHalalScore,
    getScoreColor,
    getScoreLabel,
    FACILITY_WEIGHTS,
    FACILITY_LABELS,
    type FacilityType,
} from "@/lib/config/halal-readiness";
import {
    calculateHalalScoreFromWeights,
    type WeightedFacility,
} from "@/lib/utils/calculate-halal-score";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface FacilityEntry {
    type: FacilityType;
    name: string;
}

export interface WeightBreakdownItem {
    type: string;
    label: string;
    weight: number;
    covered: boolean;
}

interface ReadinessScoreDisplayProps {
    facilities?: FacilityEntry[];
    weightedFacilities?: WeightedFacility[];
    score?: number;
    weightBreakdown?: WeightBreakdownItem[];
    className?: string;
}

export function ReadinessScoreDisplay({
    facilities,
    weightedFacilities,
    score: directScore,
    weightBreakdown,
    className,
}: ReadinessScoreDisplayProps) {
    const score = useMemo(() => {
        if (directScore !== undefined) return directScore;
        if (weightedFacilities && weightedFacilities.length > 0) {
            return calculateHalalScoreFromWeights(weightedFacilities);
        }
        return calculateHalalScore(facilities || []);
    }, [directScore, weightedFacilities, facilities]);

    const label = getScoreLabel(score);
    const color = getScoreColor(score);

    const coveredTypes = useMemo(() => {
        if (weightBreakdown) return weightBreakdown;
        if (weightedFacilities && weightedFacilities.length > 0) {
            const typeMaxWeight = new Map<string, number>();
            for (const f of weightedFacilities) {
                const type = f.facilityType ?? "ADDITIONAL";
                const current = typeMaxWeight.get(type) ?? 0;
                typeMaxWeight.set(type, Math.max(current, f.weight));
            }
            const coveredTypes = new Set(typeMaxWeight.keys());
            return Object.entries(FACILITY_WEIGHTS).map(([type]) => ({
                type,
                label: FACILITY_LABELS[type as FacilityType],
                weight: typeMaxWeight.get(type) ?? 0,
                covered: coveredTypes.has(type),
            }));
        }
        const set = new Set((facilities || []).map((f) => f.type));
        return Object.entries(FACILITY_WEIGHTS).map(([type, weight]) => ({
            type: type as FacilityType,
            label: FACILITY_LABELS[type as FacilityType],
            weight: weight * 100,
            covered: set.has(type as FacilityType),
        }));
    }, [weightBreakdown, weightedFacilities, facilities]);

    const facilityCount = useMemo(() => {
        if (weightedFacilities) return weightedFacilities.length;
        if (facilities) return facilities.length;
        return 0;
    }, [weightedFacilities, facilities]);

    return (
        <Card className={cn("border shadow-sm", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                    Skor Kesiapan Halal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                        <svg
                            className="h-full w-full -rotate-90"
                            viewBox="0 0 36 36"
                        >
                            <circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-muted-foreground/20"
                            />
                            <circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${score * 0.97} 100`}
                                strokeLinecap="round"
                                className={cn(
                                    "transition-all duration-700",
                                    color,
                                )}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                className={cn("text-xl font-bold", color)}
                            >
                                {score}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className={cn("text-base font-bold", color)}>
                            {label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Berdasarkan {facilityCount} fasilitas terverifikasi
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {coveredTypes.map(
                        ({ type, label, weight, covered }) => (
                            <div
                                key={type}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className={cn(
                                        "h-2 w-2 rounded-full flex-shrink-0",
                                        covered
                                            ? "bg-primary"
                                            : "bg-muted-foreground/20",
                                    )}
                                />
                                <span className="text-xs flex-1">
                                    {label}
                                </span>
                                <span
                                    className={cn(
                                        "text-[10px] font-medium",
                                        covered
                                            ? "text-primary"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {weight}%
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
