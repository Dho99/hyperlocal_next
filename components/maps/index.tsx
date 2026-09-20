"use client";

import dynamic from "next/dynamic";
import React from "react";
import { MapErrorBoundary } from "./map-error-boundary";

/**
 * Loading state for maps
 */
const MapSkeleton = () => (
  <div className="h-[300px] w-full rounded-md overflow-hidden bg-muted animate-pulse flex items-center justify-center">
    <p className="text-sm text-muted-foreground">Memuat Peta...</p>
  </div>
);

/**
 * MapPicker component - Dynamically loaded for SSR compatibility
 */
const MapPickerDynamic = dynamic(() => import("./map-picker-client"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * ReadonlyMap component - Dynamically loaded for SSR compatibility
 */
const ReadonlyMapDynamic = dynamic(() => import("./readonly-map-client"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export function MapPicker(
  props: React.ComponentProps<typeof MapPickerDynamic>,
) {
  return (
    <MapErrorBoundary>
      <MapPickerDynamic {...props} />
    </MapErrorBoundary>
  );
}

export function ReadonlyMap(
  props: React.ComponentProps<typeof ReadonlyMapDynamic>,
) {
  return (
    <MapErrorBoundary>
      <ReadonlyMapDynamic {...props} />
    </MapErrorBoundary>
  );
}

export { DynamicContextMap } from "./dynamic-context-map";
export { DynamicDashboardMap } from "../admin/dashboard/dynamic-dashboard-map";
