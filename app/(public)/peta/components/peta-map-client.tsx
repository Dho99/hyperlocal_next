"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/geo-utils";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import { getCategoryColor, createPinSvg } from "@/lib/config/map-categories";
import { getDestinations } from "@/lib/api/destination";
import type {
    Destination,
    DestinationHalalFacility,
} from "@/types/destination";
import PetaSidebar from "./peta-sidebar";
import UserLocationMarker from "./user-location-marker";
import FacilityRoutePolyline from "./facility-route-polyline";
import type { UserLocation } from "./peta-types";
import Navbar from "@/components/ui/navbar";

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

    useEffect(() => {
        fixLeafletIcons();
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                const data = await getDestinations();
                if (!cancelled) setDestinations(data);
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
    }, []);

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

    const selectedFacilities: DestinationHalalFacility[] = useMemo(
        () => selectedDestination?.destinationHalalFacilities ?? [],
        [selectedDestination],
    );

    if (loading) {
        return (
            <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-[#f2ecf4]">
                <p className="text-sm text-[#7a7380]">Memuat peta...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="flex h-[calc(100dvh-4rem)]">
                <PetaSidebar
                    destinations={filteredDestinations}
                    userLocation={userLocation}
                    radius={radius}
                    searchQuery={searchQuery}
                    activeCategory={activeCategory}
                    selectedDestination={selectedDestination}
                    locationDenied={locationDenied}
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
                />

                <main className="relative flex-1">
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

                        {userLocation && (
                            <>
                                <UserLocationMarker location={userLocation} />
                                <Circle
                                    center={[
                                        userLocation.lat,
                                        userLocation.lng,
                                    ]}
                                    radius={radius * 1000}
                                    pathOptions={{
                                        color: "#4f378a",
                                        fillColor: "#eaddff",
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
                                                  html: createPinSvg("#4f378a"),
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
                                            <p className="m-0 text-sm font-bold text-[#4f378a]">
                                                {d.name}
                                            </p>
                                            {d.category?.name && (
                                                <p className="m-0 mt-0.5 text-xs text-[#7a7380]">
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
                                            position={[
                                                dhf.latitude,
                                                dhf.longitude,
                                            ]}
                                            icon={facilityIcon}
                                        >
                                            <Popup>
                                                <div className="p-1">
                                                    <p className="m-0 text-sm font-bold text-[#4f378a]">
                                                        {dhf.facility?.name ??
                                                            "Fasilitas"}
                                                    </p>
                                                    {dhf.facility
                                                        ?.facilityType && (
                                                        <p className="m-0 mt-0.5 text-xs text-[#7a7380] capitalize">
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
                                                to={[
                                                    dhf.latitude,
                                                    dhf.longitude,
                                                ]}
                                            />
                                        </Marker>
                                    );
                                });
                            })()}
                    </MapContainer>
                </main>
            </div>
        </>
    );
}
