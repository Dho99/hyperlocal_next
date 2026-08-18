import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
    fromLat: z.coerce.number().min(-90).max(90),
    fromLng: z.coerce.number().min(-180).max(180),
    toLat: z.coerce.number().min(-90).max(90),
    toLng: z.coerce.number().min(-180).max(180),
    profile: z.enum(["driving", "walking", "cycling"]).default("driving"),
});

const OSRM_PROFILE: Record<"driving" | "walking" | "cycling", string> = {
    driving: "driving",
    walking: "foot",
    cycling: "cycling",
};

export async function GET(request: Request) {
    const parsed = querySchema.safeParse(
        Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Koordinat atau profil rute tidak valid" },
            { status: 400 },
        );
    }

    const { fromLat, fromLng, toLat, toLng, profile } = parsed.data;
    const baseUrl =
        process.env.OSRM_BASE_URL?.replace(/\/$/, "") ??
        "https://router.project-osrm.org";
    const osrmProfile = process.env.OSRM_BASE_URL
        ? OSRM_PROFILE[profile]
        : "driving";
    const coordinates = `${fromLng},${fromLat};${toLng},${toLat}`;
    const url = `${baseUrl}/route/v1/${osrmProfile}/${coordinates}?overview=full&geometries=geojson&steps=false`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { "User-Agent": "SAFAR-Halal-Map/1.0" },
        });
        if (!response.ok) {
            throw new Error(`OSRM merespons ${response.status}`);
        }

        const data = (await response.json()) as {
            code?: string;
            routes?: Array<{
                distance: number;
                duration: number;
                geometry: { coordinates: Array<[number, number]> };
            }>;
        };
        const route = data.routes?.[0];
        if (data.code !== "Ok" || !route?.geometry?.coordinates?.length) {
            throw new Error("Rute OSRM tidak ditemukan");
        }

        return NextResponse.json({
            data: {
                positions: route.geometry.coordinates.map(([lng, lat]) => [
                    lat,
                    lng,
                ]),
                distanceMeters: Math.round(route.distance),
                durationMinutes: Math.max(1, Math.ceil(route.duration / 60)),
                profile,
                source: "OSRM",
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil rute OSRM",
            },
            { status: 502 },
        );
    } finally {
        clearTimeout(timeout);
    }
}
