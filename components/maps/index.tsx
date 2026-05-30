"use client";

import dynamic from "next/dynamic";
import React from "react";

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
export const MapPicker = dynamic(() => import("./map-picker-client"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * ReadonlyMap component - Dynamically loaded for SSR compatibility
 */
export const ReadonlyMap = dynamic(() => import("./readonly-map-client"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export { DynamicContextMap } from "./dynamic-context-map";
export { DynamicDashboardMap } from "../admin/dashboard/dynamic-dashboard-map";
