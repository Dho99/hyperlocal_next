"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { 
  MapContainer, 
  Marker, 
  useMapEvents,
  useMap
} from "react-leaflet";
import { ThemeTileLayer } from "@/components/maps/theme-tile-layer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import { DEFAULT_CENTER, DEFAULT_ZOOM, isValidCoordinate } from "@/lib/maps/geo-utils";

// Call icon fix
fixLeafletIcons();

interface MapPickerClientProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  zoom?: number;
}

/**
 * Handles map click events to update coordinate state
 */
function LocationMarker({ 
  lat, 
  lng, 
  onChange 
}: { 
  lat: number | null; 
  lng: number | null; 
  onChange: (lat: number, lng: number) => void 
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onChange(lat, lng);
        }
      },
    }),
    [onChange]
  );

  if (lat === null || lng === null) return null;

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[lat, lng]}
      ref={markerRef}
    />
  );
}

/**
 * Helper to center map when coords change from outside (e.g. typing)
 */
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPickerClient({
  latitude,
  longitude,
  onChange,
  zoom = DEFAULT_ZOOM,
}: MapPickerClientProps) {
  const center: [number, number] = useMemo(() => {
    if (isValidCoordinate(latitude, longitude)) {
      return [latitude!, longitude!];
    }
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  return (
    <div className="h-[300px] w-full rounded-md overflow-hidden border shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
                <ThemeTileLayer
                    lightUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    darkUrl="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
        <LocationMarker lat={latitude} lng={longitude} onChange={onChange} />
        {isValidCoordinate(latitude, longitude) && (
          <ChangeView center={center} zoom={zoom} />
        )}
      </MapContainer>
    </div>
  );
}
