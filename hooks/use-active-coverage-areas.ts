"use client";

import { useEffect, useMemo, useState } from "react";
import {
    getActiveCoverageBounds,
    type BoundsLiteral,
    type CoverageAreaSummary,
} from "@/lib/maps/coverage-bounds";

/**
 * Loads the active coverage areas from the public endpoint.
 * The endpoint already filters `isActive: true`, so inactive regions never
 * reach the map.
 */
export function useActiveCoverageAreas() {
    const [areas, setAreas] = useState<CoverageAreaSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/coverage-areas");
                const json = await res.json();
                if (!cancelled && res.ok && Array.isArray(json.data)) {
                    setAreas(json.data as CoverageAreaSummary[]);
                }
            } catch {
                // Coverage areas are optional; maps fall back to all markers.
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const bounds: BoundsLiteral | null = useMemo(
        () => getActiveCoverageBounds(areas),
        [areas],
    );

    return { areas, bounds, loading };
}
