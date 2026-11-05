"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    Circle,
    GeoJSON,
    useMap,
} from "react-leaflet";
import { ThemeTileLayer } from "@/components/maps/theme-tile-layer";
import L from "leaflet";
import { toast } from "sonner";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/geo-utils";
import {
    getGeoJsonBounds,
    toCoverageFeatureCollection,
    type BoundsLiteral,
} from "@/lib/maps/coverage-bounds";
import { useActiveCoverageAreas } from "@/hooks/use-active-coverage-areas";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import { getCategoryColor, createPinSvg } from "@/lib/config/map-categories";
import type {
    Destination,
    DestinationHalalFacility,
} from "@/types/destination";
import PetaSidebar from "./peta-sidebar";
import UserLocationMarker from "./user-location-marker";
import FacilityRoutePolyline, {
    type OsrmRouteInfo,
} from "./facility-route-polyline";
import type { UserLocation } from "./peta-types";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Navigation,
    Route,
} from "lucide-react";

fixLeafletIcons();

function MapController({
    center,
    zoom,
}: {
    center: [number, number];
    zoom: number;
}) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center, zoom]);
    return null;
}

function MapBoundsController({
    bounds,
    destinations,
    fitMarkers,
}: {
    bounds: BoundsLiteral | null;
    destinations: Destination[];
    fitMarkers: boolean;
}) {
    const map = useMap();
    const pointsKey = useMemo(
        () =>
            destinations
                .filter((d) => d.latitude != null && d.longitude != null)
                .map((d) => `${d.latitude},${d.longitude}`)
                .join("|"),
        [destinations],
    );

    useEffect(() => {
        if (bounds) {
            const target = L.latLngBounds(
                [bounds.south, bounds.west],
                [bounds.north, bounds.east],
            );
            if (target.isValid()) {
                map.fitBounds(target, { padding: [50, 50], maxZoom: 14 });
            }
            return;
        }

        if (!fitMarkers || !pointsKey) return;
        const points = pointsKey
            .split("|")
            .map((pair) => pair.split(",").map(Number) as [number, number]);
        const target = L.latLngBounds(points);
        if (target.isValid()) {
            map.fitBounds(target, { padding: [50, 50], maxZoom: 14 });
        }
    }, [map, bounds, pointsKey, fitMarkers]);

    return null;
}

function MapResizer({ isOpen }: { isOpen: boolean }) {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 300);
        return () => clearTimeout(timer);
    }, [map, isOpen]);
    return null;
}

export default function PetaMapClient() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [radius, setRadius] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedDestination, setSelectedDestination] =
        useState<Destination | null>(null);
    const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
        null,
    );
    const [routeInfo, setRouteInfo] = useState<OsrmRouteInfo | null>(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { areas: coverageAreas, bounds: activeAreaBounds } =
        useActiveCoverageAreas();

    useEffect(() => {
        fixLeafletIcons();
    }, []);

    const selectedArea = useMemo(
        () => coverageAreas.find((area) => area.id === selectedAreaId) ?? null,
        [coverageAreas, selectedAreaId],
    );

    const selectedAreaBounds = useMemo(
        () =>
            selectedArea ? getGeoJsonBounds(selectedArea.geoJsonData) : null,
        [selectedArea],
    );

    const coverageFeatures = useMemo(
        () => toCoverageFeatureCollection(coverageAreas),
        [coverageAreas],
    );

    const activeAreaId = selectedArea?.id ?? null;

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                const url = activeAreaId
                    ? `/api/destinations?areaId=${activeAreaId}`
                    : "/api/destinations";
                const res = await fetch(url);
                const json = await res.json();
                if (!cancelled) {
                    if (!res.ok) {
                        throw new Error(
                            json.error ?? "Gagal memuat data destinasi",
                        );
                    }

                    const data = Array.isArray(json.data)
                        ? json.data
                        : Array.isArray(json)
                          ? json
                          : [];
                    setDestinations(data);
                }
            } catch {
                if (!cancelled) {
                    setDestinations([]);
                    toast.error("Gagal memuat data destinasi");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchData();
        return () => {
            cancelled = true;
        };
    }, [activeAreaId]);

    const handleLocateMe = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("Geolokasi tidak didukung browser ini");
            setLocationDenied(true);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setLocationDenied(false);
                toast.success("Lokasi ditemukan");
            },
            () => {
                setLocationDenied(true);
                toast.error(
                    "Lokasi tidak diizinkan, gunakan pusat kota default",
                );
            },
        );
    }, []);

    const filteredDestinations = useMemo(() => {
        let result = destinations;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((d) => d.name.toLowerCase().includes(q));
        }

        if (activeCategory) {
            result = result.filter((d) => d.category?.name === activeCategory);
        }

        if (userLocation) {
            result = result.filter((d) => {
                if (d.latitude == null || d.longitude == null) return false;
                const dist = haversineDistance(
                    userLocation.lat,
                    userLocation.lng,
                    d.latitude,
                    d.longitude,
                );
                return dist <= radius;
            });
        }

        return result;
    }, [destinations, searchQuery, activeCategory, userLocation, radius]);

    const mapCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : DEFAULT_CENTER;

    const handleAreaChange = useCallback((areaId: string | null) => {
        setSelectedAreaId(areaId);
        setSelectedDestination(null);
        setSelectedFacilityId(null);
        setRouteInfo(null);
    }, []);

    const selectedFacilities: DestinationHalalFacility[] = useMemo(
        () => selectedDestination?.destinationHalalFacilities ?? [],
        [selectedDestination],
    );
    const selectedFacility = useMemo(
        () =>
            selectedFacilities.find(
                (facility) => facility.id === selectedFacilityId,
            ) ?? null,
        [selectedFacilities, selectedFacilityId],
    );
    const handleRouteInfo = useCallback((info: OsrmRouteInfo | null) => {
        setRouteInfo(info);
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">Memuat peta...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh-4rem)] overflow-hidden w-full relative">
            <PetaSidebar
                destinations={filteredDestinations}
                userLocation={userLocation}
                radius={radius}
                searchQuery={searchQuery}
                activeCategory={activeCategory}
                selectedDestination={selectedDestination}
                selectedFacilityId={selectedFacilityId}
                locationDenied={locationDenied}
                coverageAreas={coverageAreas}
                selectedAreaId={activeAreaId}
                isSidebarOpen={isSidebarOpen}
                onRadiusChange={setRadius}
                onSearchChange={setSearchQuery}
                onCategoryChange={setActiveCategory}
                onDestinationSelect={(d) => {
                    setSelectedDestination(d);
                    setSelectedFacilityId(null);
                    setRouteInfo(null);
                    if (d && d.latitude != null && d.longitude != null) {
                        setRadius((prev) => prev);
                    }
                }}
                onFacilitySelect={(facilityId) => {
                    setSelectedFacilityId(facilityId);
                    setRouteInfo(null);
                }}
                onLocateMe={handleLocateMe}
                onAreaChange={handleAreaChange}
            />

            <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="absolute top-1/2 -translate-y-1/2 z-20 -ml-4 rounded-full bg-card border border-border shadow-md p-1.5 hover:bg-muted transition-all duration-300"
                style={{ left: isSidebarOpen ? "420px" : "40px" }}
            >
                {isSidebarOpen ? (
                    <ChevronLeft className="size-8 text-muted-foreground" />
                ) : (
                    <ChevronRight className="size-8 text-muted-foreground" />
                )}
            </button>

            <main className="relative flex-1 w-full transition-all duration-300">
                {selectedDestination && selectedFacility && (
                    <div className="absolute left-1/2 top-4 z-[500] w-[min(92%,430px)] -translate-x-1/2 rounded-2xl border border-white/60 bg-card/95 p-4 shadow-xl backdrop-blur-md">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                    <Route className="size-4" />
                                    {routeInfo ? "Rute OSRM" : "Memuat rute"}
                                </div>
                                <p className="font-semibold text-foreground">
                                    {selectedFacility.name ??
                                        selectedFacility.facility?.name ??
                                        "Fasilitas"}
                                </p>
                            </div>
                            {routeInfo && (
                                <div className="flex shrink-0 gap-3 text-sm">
                                    <span className="flex items-center gap-1 font-medium">
                                        <Navigation className="size-4 text-emerald-600" />
                                        {routeInfo.distanceMeters >= 1000
                                            ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km`
                                            : `${routeInfo.distanceMeters} m`}
                                    </span>
                                    <span className="flex items-center gap-1 font-medium">
                                        <Clock className="size-4 text-emerald-600" />
                                        {routeInfo.durationMinutes} mnt
                                    </span>
                                </div>
                            )}
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${selectedDestination.latitude},${selectedDestination.longitude}&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            <Navigation className="size-4" />
                            Mulai Navigasi
                        </a>
                    </div>
                )}
                <MapContainer
                    center={mapCenter}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <ThemeTileLayer />

                    <MapController center={mapCenter} zoom={DEFAULT_ZOOM} />

                    <MapBoundsController
                        bounds={selectedAreaBounds ?? activeAreaBounds}
                        destinations={filteredDestinations}
                        fitMarkers={!userLocation}
                    />
                    <MapResizer isOpen={isSidebarOpen} />

                    {coverageFeatures && (
                        <GeoJSON
                            key={`${activeAreaId ?? "all"}-${coverageFeatures.features.length}`}
                            data={
                                coverageFeatures as unknown as GeoJSON.GeoJsonObject
                            }
                            style={(feature) => {
                                const properties = feature?.properties as
                                    | { id?: string; colorHex?: string }
                                    | undefined;
                                const isSelected =
                                    properties?.id === activeAreaId;
                                const color =
                                    properties?.colorHex || "#047857";
                                return {
                                    color,
                                    weight: isSelected ? 3 : 1.5,
                                    fillColor: color,
                                    fillOpacity: isSelected ? 0.25 : 0.1,
                                };
                            }}
                        />
                    )}

                    {userLocation && (
                        <>
                            <UserLocationMarker location={userLocation} />
                            <Circle
                                center={[userLocation.lat, userLocation.lng]}
                                radius={radius * 1000}
                                pathOptions={{
                                    color: "#047857",
                                    fillColor: "#d1fae5",
                                    fillOpacity: 0.15,
                                    weight: 2,
                                    dashArray: "4, 4",
                                }}
                            />
                        </>
                    )}

                    {filteredDestinations.map((d) => {
                        if (d.latitude == null || d.longitude == null)
                            return null;
                        const color = getCategoryColor(d.category?.name);
                        const icon = L.divIcon({
                            className: "",
                            html: createPinSvg(color),
                            iconSize: [28, 42],
                            iconAnchor: [14, 42],
                            popupAnchor: [0, -44],
                        });
                        const isSelected = selectedDestination?.id === d.id;
                        return (
                            <Marker
                                key={d.id}
                                position={[d.latitude, d.longitude]}
                                icon={
                                    isSelected
                                        ? L.divIcon({
                                              className: "",
                                              html: createPinSvg("#047857"),
                                              iconSize: [36, 54],
                                              iconAnchor: [18, 54],
                                              popupAnchor: [0, -56],
                                          })
                                        : icon
                                }
                                eventHandlers={{
                                    click: () => {
                                        setSelectedDestination(d);
                                        setSelectedFacilityId(null);
                                        setRouteInfo(null);
                                    },
                                }}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <p className="m-0 text-sm font-bold text-foreground">
                                            {d.name}
                                        </p>
                                        {d.category?.name && (
                                            <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                                                {d.category.name}
                                            </p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {selectedDestination &&
                        selectedDestination.latitude != null &&
                        selectedDestination.longitude != null &&
                        (() => {
                            const destLat = selectedDestination.latitude;
                            const destLng = selectedDestination.longitude;
                            return selectedFacilities.map((dhf) => {
                                if (
                                    dhf.latitude == null ||
                                    dhf.longitude == null
                                )
                                    return null;
                                const facilityIcon = L.divIcon({
                                    className: "",
                                    html: `<div style="
                                        width:22px;height:22px;border-radius:50%;
                                        background:#3B82F6;border:2px solid white;
                                        box-shadow:0 2px 6px rgba(0,0,0,0.25);
                                    "></div>`,
                                    iconSize: [22, 22],
                                    iconAnchor: [11, 11],
                                });
                                return (
                                    <Marker
                                        key={dhf.id}
                                        position={[dhf.latitude, dhf.longitude]}
                                        icon={facilityIcon}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedFacilityId(dhf.id);
                                                setRouteInfo(null);
                                            },
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-1">
                                                <p className="m-0 text-sm font-bold text-foreground">
                                                    {dhf.facility?.name ??
                                                        "Fasilitas"}
                                                </p>
                                                {dhf.facility?.facilityType && (
                                                    <p className="m-0 mt-0.5 text-xs text-muted-foreground capitalize">
                                                        {dhf.facility.facilityType.replace(
                                                            /_/g,
                                                            " ",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                        {selectedFacilityId === dhf.id && (
                                            <FacilityRoutePolyline
                                                from={[destLat, destLng]}
                                                to={[
                                                    dhf.latitude,
                                                    dhf.longitude,
                                                ]}
                                                travelMode={dhf.travelMode}
                                                onRouteInfo={handleRouteInfo}
                                            />
                                        )}
                                    </Marker>
                                );
                            });
                        })()}
                </MapContainer>
            </main>
        </div>
    );
}
