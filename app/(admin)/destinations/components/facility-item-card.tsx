"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPicker } from "@/components/maps";
import { MultiImageDropzone } from "@/components/ui/multi-image-dropzone";
import { FACILITY_LABELS } from "@/lib/config/halal-readiness";
import { Trash2, GripVertical, MapPin, Crosshair, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Facility } from "@/types/fasilitas";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import { useMemo } from "react";

interface FacilityItemCardProps {
    index: number;
    onRemove: () => void;
    masterFacilities: Facility[];
}

export function FacilityItemCard({
    index,
    onRemove,
    masterFacilities,
}: FacilityItemCardProps) {
    const { control, setValue } = useFormContext();

    const facilityId = useWatch({
        control,
        name: `facilities.${index}.facilityId`,
    });
    const latitude = useWatch({
        control,
        name: `facilities.${index}.latitude`,
    });
    const longitude = useWatch({
        control,
        name: `facilities.${index}.longitude`,
    });

    const destLatitude = useWatch({
        control,
        name: "latitude",
    });
    const destLongitude = useWatch({
        control,
        name: "longitude",
    });

    const facilityLat = useWatch({
        control,
        name: `facilities.${index}.latitude`,
    });
    const facilityLng = useWatch({
        control,
        name: `facilities.${index}.longitude`,
    });

    const selectedFacility = masterFacilities.find((f) => f.id === facilityId);

    const distanceInfo = useMemo(() => {
        if (
            destLatitude == null ||
            destLongitude == null ||
            facilityLat == null ||
            facilityLng == null ||
            !selectedFacility
        ) {
            return null;
        }
        const distance = haversineDistance(
            destLatitude,
            destLongitude,
            facilityLat,
            facilityLng,
        );
        const maxDist = selectedFacility.maxDistance;
        return {
            distance: Math.round(distance * 100) / 100,
            maxDistance: maxDist,
            withinRange: distance <= maxDist,
        };
    }, [destLatitude, destLongitude, facilityLat, facilityLng, selectedFacility]);

    return (
        <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 py-3 px-4 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">
                        Fasilitas #{index + 1}
                        {selectedFacility && (
                            <span className="text-muted-foreground font-normal">
                                {" "}
                                — {selectedFacility.name}
                            </span>
                        )}
                    </CardTitle>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onRemove}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <FormField
                    control={control}
                    name={`facilities.${index}.facilityId`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fasilitas</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih fasilitas" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {masterFacilities.map((facility) => (
                                        <SelectItem
                                            key={facility.id}
                                            value={facility.id}
                                        >
                                            {facility.name}
                                            {facility.facilityType && (
                                                <span className="text-muted-foreground ml-2 text-[10px]">
                                                    (
                                                    {FACILITY_LABELS[
                                                        facility.facilityType as keyof typeof FACILITY_LABELS
                                                    ] || facility.facilityType}
                                                    )
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`facilities.${index}.name`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Nama Fasilitas{" "}
                                <span className="text-muted-foreground font-normal">
                                    (Opsional)
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Contoh: Masjid At-Taqwa Tasikmalaya"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel className="text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Lokasi di Peta
                    </FormLabel>
                    <div className="h-[200px] rounded-lg overflow-hidden border">
                        <MapPicker
                            latitude={latitude ?? null}
                            longitude={longitude ?? null}
                            onChange={(lat, lng) => {
                                setValue(`facilities.${index}.latitude`, lat);
                                setValue(`facilities.${index}.longitude`, lng);
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={control}
                            name={`facilities.${index}.latitude`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px]">
                                        Latitude
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Crosshair className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="-7.3274"
                                                className="pl-7 h-8 text-xs font-mono"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val =
                                                        e.target.value === ""
                                                            ? null
                                                            : Number(
                                                                  e.target.value,
                                                              );
                                                    field.onChange(val);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`facilities.${index}.longitude`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px]">
                                        Longitude
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Crosshair className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="108.2207"
                                                className="pl-7 h-8 text-xs font-mono"
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val =
                                                        e.target.value === ""
                                                            ? null
                                                            : Number(
                                                                  e.target.value,
                                                              );
                                                    field.onChange(val);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {distanceInfo && (
                        <div
                            className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
                                distanceInfo.withinRange
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-red-200 bg-red-50 text-red-800"
                            }`}
                        >
                            {distanceInfo.withinRange ? (
                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            ) : (
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            )}
                            <div>
                                <span className="font-medium">
                                    Jarak: {distanceInfo.distance} km
                                </span>
                                <span className="ml-1">
                                    {distanceInfo.withinRange
                                        ? `(maks ${distanceInfo.maxDistance} km)`
                                        : `— melebihi batas ${distanceInfo.maxDistance} km`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <FormLabel className="text-xs font-medium">
                        Bukti Foto
                    </FormLabel>
                    <FormField
                        control={control}
                        name={`facilities.${index}.evidenceUrls`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <MultiImageDropzone
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        folder="facility-evidences"
                                        maxFiles={5}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
