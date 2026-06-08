"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
    Loader2,
    Globe,
    Map,
    Plus,
    Pencil,
    Trash2,
    Search,
    RotateCcw,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const LEVEL_LABELS: Record<string, string> = {
    REGIONAL: "Regional",
    PROVINSI: "Provinsi",
    PROVINCIAL: "Provinsi",
    NASIONAL: "Nasional",
    NATIONAL: "Nasional",
};

const LEVEL_OPTIONS = [
    { value: "REGIONAL", label: "Regional" },
    { value: "PROVINSI", label: "Provinsi" },
    { value: "NASIONAL", label: "Nasional" },
];

interface CoverageArea {
    id: string;
    name: string;
    level: string;
    geoJsonData: unknown;
    colorHex: string | null;
    isActive: boolean;
    createdAt: string;
}

const EMPTY_FORM = {
    name: "",
    level: "REGIONAL",
    colorHex: "#047857",
    geoJsonData: null,
    isActive: true,
};

const COLOR_PRESETS = [
    { label: "Hijau", value: "#047857" },
    { label: "Biru", value: "#1d4ed8" },
    { label: "Merah", value: "#b91c1c" },
    { label: "Kuning", value: "#a16207" },
    { label: "Ungu", value: "#7c3aed" },
    { label: "Pink", value: "#be185d" },
];

interface FormState {
    name: string;
    level: string;
    colorHex: string;
    isActive: boolean;
    geoJsonData: unknown;
}

function MapPreview({
    geoJsonData,
    colorHex,
}: {
    geoJsonData: unknown;
    colorHex: string;
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const layerRef = useRef<L.GeoJSON | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;
        const map = L.map(mapRef.current, {
            center: [-7.3274, 108.2207],
            zoom: 10,
            zoomControl: true,
            attributionControl: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
        }).addTo(map);
        mapInstanceRef.current = map;
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }
        if (!geoJsonData) return;
        try {
            const layer = L.geoJSON(geoJsonData as GeoJSON.GeoJsonObject, {
                style: {
                    color: colorHex,
                    weight: 3,
                    fillColor: colorHex,
                    fillOpacity: 0.2,
                },
            });
            layer.addTo(map);
            layerRef.current = layer;
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
            }
        } catch {
            toast.error("Gagal menampilkan peta untuk data ini");
        }
    }, [geoJsonData, colorHex]);

    return (
        <div
            ref={mapRef}
            className="h-64 w-full rounded-lg border border-stone-300"
        />
    );
}

export function CoverageAreaList() {
    const router = useRouter();
    const [areas, setAreas] = useState<CoverageArea[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<CoverageArea | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [geoJsonData, setGeoJsonData] = useState<unknown>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    async function fetchAreas() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/coverage-areas");
            const json = await res.json();
            if (res.ok) {
                setAreas(json.data);
            } else {
                toast.error(json.error || "Gagal memuat data");
            }
        } catch {
            toast.error("Gagal menghubungkan ke server");
        } finally {
            setIsLoading(false);
        }
    }

    function openCreateDialog() {
        setEditingArea(null);
        setForm(EMPTY_FORM);
        setGeoJsonData(null);
        setSearchValue("");
        setDialogOpen(true);
    }

    function openEditDialog(area: CoverageArea) {
        setEditingArea(area);
        setForm({
            name: area.name,
            level: area.level,
            colorHex: area.colorHex || "#047857",
            isActive: area.isActive,
            geoJsonData: area.geoJsonData,
        });
        setGeoJsonData(area.geoJsonData);
        setSearchValue("");
        setDialogOpen(true);
    }

    async function handleCariOtomatis() {
        if (!searchValue.trim()) {
            toast.error("Masukkan nama wilayah terlebih dahulu");
            return;
        }
        setIsSearching(true);
        try {
            const q = encodeURIComponent(searchValue.trim());
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${q}&polygon_geojson=1&format=json&limit=1`,
                {
                    headers: {
                        "Accept-Language": "id",
                        "User-Agent": "HyperLocalApp/1.0",
                    },
                },
            );
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
                toast.error(
                    "Wilayah tidak ditemukan. Coba gunakan kata kunci lain (contoh: 'Kota Tasikmalaya', 'Jawa Barat').",
                );
                setIsSearching(false);
                return;
            }
            const result = data[0];
            const geojson = result.geojson;
            if (!geojson) {
                toast.error(
                    "Wilayah ditemukan tetapi data peta tidak tersedia untuk wilayah ini.",
                );
                setIsSearching(false);
                return;
            }
            const featureCollection = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {
                            osmType: result.osm_type,
                            osmId: result.osm_id,
                            displayName: result.display_name,
                        },
                        geometry: geojson,
                    },
                ],
            };
            setGeoJsonData(featureCollection);
            if (!form.name) {
                setForm((prev) => ({
                    ...prev,
                    name: result.display_name.split(",")[0] || result.name,
                }));
            }
            toast.success(`Wilayah "${result.display_name}" berhasil dimuat!`);
        } catch {
            toast.error(
                "Gagal menghubungi server peta. Periksa koneksi internet.",
            );
        } finally {
            setIsSearching(false);
        }
    }

    function handleResetPeta() {
        setGeoJsonData(null);
        setSearchValue("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!geoJsonData) {
            toast.error(
                "Silakan cari wilayah terlebih dahulu menggunakan fitur 'Cari & Gambar Otomatis'.",
            );
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                name: form.name,
                level: form.level,
                geoJsonData,
                colorHex: form.colorHex || null,
                isActive: form.isActive,
            };
            let res: Response;
            if (editingArea) {
                res = await fetch(
                    `/api/admin/coverage-areas/${editingArea.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    },
                );
            } else {
                res = await fetch("/api/admin/coverage-areas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "Gagal menyimpan data");
                setIsSubmitting(false);
                return;
            }
            toast.success(
                editingArea
                    ? "Area cakupan berhasil diperbarui"
                    : "Area cakupan berhasil ditambahkan",
            );
            setDialogOpen(false);
            router.refresh();
            fetchAreas();
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/admin/coverage-areas/${id}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "Gagal menghapus data");
                return;
            }
            toast.success("Area cakupan berhasil dihapus");
            setDeleteConfirm(null);
            router.refresh();
            fetchAreas();
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-heading">
                            Daftar Area Cakupan
                        </CardTitle>
                        <CardDescription>
                            {areas.length} wilayah terdaftar
                        </CardDescription>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        size="lg"
                        className="gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Area
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : areas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Globe className="h-12 w-12 mb-4 opacity-30" />
                            <p>Belum ada area cakupan</p>
                            <p className="text-sm">
                                Klik &quot;Tambah Area&quot; untuk membuat area
                                baru
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Wilayah</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Warna</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {areas.map((area) => (
                                    <TableRow key={area.id}>
                                        <TableCell className="font-medium">
                                            {area.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {LEVEL_LABELS[area.level] ||
                                                    area.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    area.isActive
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className={
                                                    area.isActive
                                                        ? "bg-green-600"
                                                        : ""
                                                }
                                            >
                                                {area.isActive
                                                    ? "Aktif"
                                                    : "Tidak Aktif"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-5 w-5 rounded border"
                                                    style={{
                                                        backgroundColor:
                                                            area.colorHex ||
                                                            "#047857",
                                                    }}
                                                />
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {area.colorHex || "-"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEditDialog(area)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteConfirm(
                                                            area.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl">
                            {editingArea
                                ? "Edit Area Cakupan"
                                : "Tambah Area Cakupan"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-base font-semibold"
                                >
                                    Nama Wilayah
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Priangan Timur"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="text-base h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="level"
                                    className="text-base font-semibold"
                                >
                                    Level Wilayah
                                </Label>
                                <Select
                                    value={form.level}
                                    onValueChange={(v) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            level: v,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="text-base h-11">
                                        <SelectValue placeholder="Pilih level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEVEL_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="colorHex"
                                    className="text-base font-semibold"
                                >
                                    Warna Wilayah
                                </Label>
                                <div className="flex items-center gap-3 h-11">
                                    <Input
                                        id="colorHex"
                                        type="color"
                                        className="w-14 h-full p-1 cursor-pointer"
                                        value={form.colorHex}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                colorHex: e.target.value,
                                            }))
                                        }
                                    />
                                    <span
                                        className="flex-1 rounded-md border px-3 py-2 text-sm h-full flex items-center"
                                        style={{
                                            backgroundColor:
                                                form.colorHex + "20",
                                        }}
                                    >
                                        {form.colorHex}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
                            <Label className="text-base font-semibold shrink-0">
                                Status Area
                            </Label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            isActive: true,
                                        }))
                                    }
                                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                                        form.isActive
                                            ? "bg-green-600 text-white shadow-sm"
                                            : "bg-white text-stone-500 border border-stone-300 hover:bg-stone-100"
                                    }`}
                                >
                                    Aktif
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            isActive: false,
                                        }))
                                    }
                                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                                        !form.isActive
                                            ? "bg-red-600 text-white shadow-sm"
                                            : "bg-white text-stone-500 border border-stone-300 hover:bg-stone-100"
                                    }`}
                                >
                                    Tidak Aktif
                                </button>
                            </div>
                            <p className="text-xs text-stone-500 ml-2">
                                {form.isActive
                                    ? "Area ini akan terlihat oleh pengguna"
                                    : "Area ini disembunyikan dari pengguna"}
                            </p>
                        </div>

                        <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                            <Label className="text-base font-semibold text-emerald-900">
                                Pencarian Peta Otomatis
                            </Label>
                            <p className="text-sm text-emerald-700">
                                Ketik nama wilayah (kota, provinsi, atau daerah)
                                lalu klik tombol &quot;Cari &amp; Gambar
                                Otomatis&quot;. Sistem akan mengambil data peta
                                secara otomatis.
                            </p>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Contoh: Kota Tasikmalaya, Jawa Barat, Priangan Timur"
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                    className="flex-1 text-base h-12"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCariOtomatis();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={handleCariOtomatis}
                                    disabled={isSearching}
                                    className="h-12 px-6 gap-2 text-base whitespace-nowrap"
                                >
                                    {isSearching ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Search className="h-5 w-5" />
                                    )}
                                    Cari &amp; Gambar Otomatis
                                </Button>
                            </div>

                            {!!geoJsonData && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                                            <Map className="h-4 w-4" />
                                            Area berhasil dimuat
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetPeta}
                                            className="gap-1"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Reset Peta
                                        </Button>
                                    </div>
                                    <MapPreview
                                        geoJsonData={geoJsonData}
                                        colorHex={form.colorHex}
                                    />
                                </div>
                            )}

                            {!geoJsonData && (
                                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-white">
                                    <div className="text-center text-stone-400">
                                        <Map className="mx-auto h-10 w-10 mb-2 opacity-50" />
                                        <p className="text-sm">
                                            Belum ada peta. Gunakan fitur di
                                            atas untuk mencari wilayah.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => setDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !geoJsonData}
                                size="lg"
                                className="gap-2"
                            >
                                {isSubmitting && (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                )}
                                {editingArea
                                    ? "Simpan Perubahan"
                                    : "Simpan Area"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => !open && setDeleteConfirm(null)}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="font-heading">
                            Hapus Area
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Area ini akan dihapus secara permanen. Destinasi dan
                        UMKM yang terikat akan di-set ke tidak memiliki area.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteConfirm && handleDelete(deleteConfirm)
                            }
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
