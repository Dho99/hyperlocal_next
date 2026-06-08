"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    GeoJSON,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/geo-utils";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import { getCategoryColor, createPinSvg } from "@/lib/config/map-categories";
import type {
    Destination,
    DestinationHalalFacility,
} from "@/types/destination";
import PetaSidebar from "./peta-sidebar";
import UserLocationMarker from "./user-location-marker";
import FacilityRoutePolyline from "./facility-route-polyline";
import type { UserLocation } from "./peta-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

fixLeafletIcons();

interface CoverageArea {
    id: string;
    name: string;
    level: string;
    geoJsonData: unknown;
    colorHex: string | null;
}

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

function GeoJSONBoundsFitter({ geoJsonData }: { geoJsonData: unknown }) {
    const map = useMap();
    useEffect(() => {
        if (!geoJsonData) return;
        try {
            const layer = L.geoJSON(geoJsonData as GeoJSON.GeoJsonObject);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        } catch {
            // ignore invalid geojson bounds
        }
    }, [map, geoJsonData]);
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
    const [locationDenied, setLocationDenied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [selectedAreaGeo, setSelectedAreaGeo] = useState<unknown>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        fixLeafletIcons();
    }, []);

    useEffect(() => {
        async function fetchAreas() {
            try {
                const res = await fetch("/api/coverage-areas");
                const json = await res.json();
                if (res.ok) setCoverageAreas(json.data);
            } catch {
                // coverage areas are optional
            }
        }
        fetchAreas();
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                const url = selectedAreaId
                    ? `/api/destinations?areaId=${selectedAreaId}`
                    : "/api/destinations";
                const res = await fetch(url);
                const json = await res.json();
                if (!cancelled) {
                    setDestinations(json.data ?? json);
                }
            } catch {
                if (!cancelled) toast.error("Gagal memuat data destinasi");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchData();
        return () => {
            cancelled = true;
        };
    }, [selectedAreaId]);

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

    const handleAreaChange = useCallback(async (areaId: string | null) => {
        setSelectedAreaId(areaId);
        if (areaId) {
            try {
                const res = await fetch(`/api/coverage-areas/${areaId}`);
                const json = await res.json();
                if (res.ok) {
                    setSelectedAreaGeo(json.data.geoJsonData);
                }
            } catch {
                setSelectedAreaGeo(null);
            }
        } else {
            setSelectedAreaGeo(null);
        }
    }, []);

    const selectedFacilities: DestinationHalalFacility[] = useMemo(
        () => selectedDestination?.destinationHalalFacilities ?? [],
        [selectedDestination],
    );

    if (loading) {
        return (
            <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-emerald-50">
                <p className="text-sm text-stone-500">Memuat peta...</p>
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
                locationDenied={locationDenied}
                coverageAreas={coverageAreas}
                selectedAreaId={selectedAreaId}
                isSidebarOpen={isSidebarOpen}
                onRadiusChange={setRadius}
                onSearchChange={setSearchQuery}
                onCategoryChange={setActiveCategory}
                onDestinationSelect={(d) => {
                    setSelectedDestination(d);
                    if (d && d.latitude != null && d.longitude != null) {
                        setRadius((prev) => prev);
                    }
                }}
                onLocateMe={handleLocateMe}
                onAreaChange={handleAreaChange}
            />

            <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="absolute top-1/2 -translate-y-1/2 z-20 -ml-4 rounded-full bg-white border border-stone-200 shadow-md p-1.5 hover:bg-stone-50 transition-all duration-300"
                style={{ left: isSidebarOpen ? "420px" : "40px" }}
            >
                {isSidebarOpen ? (
                    <ChevronLeft className="size-8 text-stone-600" />
                ) : (
                    <ChevronRight className="size-8 text-stone-600" />
                )}
            </button>

            <main className="relative flex-1 w-full transition-all duration-300">
                <MapContainer
                    center={mapCenter}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    <MapController center={mapCenter} zoom={DEFAULT_ZOOM} />

                    <GeoJSONBoundsFitter geoJsonData={selectedAreaGeo} />
                    <MapResizer isOpen={isSidebarOpen} />

                    {!!selectedAreaGeo && (
                        <GeoJSON
                            key={selectedAreaId ?? "none"}
                            data={selectedAreaGeo as GeoJSON.GeoJsonObject}
                            style={() => ({
                                color: "#047857",
                                weight: 2,
                                fillColor: "#d1fae5",
                                fillOpacity: 0.2,
                            })}
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
                                    click: () => setSelectedDestination(d),
                                }}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <p className="m-0 text-sm font-bold text-emerald-900">
                                            {d.name}
                                        </p>
                                        {d.category?.name && (
                                            <p className="m-0 mt-0.5 text-xs text-stone-500">
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
                                    >
                                        <Popup>
                                            <div className="p-1">
                                                <p className="m-0 text-sm font-bold text-emerald-900">
                                                    {dhf.facility?.name ??
                                                        "Fasilitas"}
                                                </p>
                                                {dhf.facility?.facilityType && (
                                                    <p className="m-0 mt-0.5 text-xs text-stone-500 capitalize">
                                                        {dhf.facility.facilityType.replace(
                                                            /_/g,
                                                            " ",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                        <FacilityRoutePolyline
                                            from={[destLat, destLng]}
                                            to={[dhf.latitude, dhf.longitude]}
                                        />
                                    </Marker>
                                );
                            });
                        })()}
                </MapContainer>
            </main>
        </div>
    );
}
