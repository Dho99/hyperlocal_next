import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MapPin,
    AlertCircle,
    Verified,
    Utensils,
    ArrowUpRight,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Destinasi",
            value: "128",
            description: "+4 bulan ini",
            icon: MapPin,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            title: "Total Tervalidasi",
            value: "94",
            description: "73% dari total",
            icon: Verified,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "UMKM & Kuliner",
            value: "45",
            description: "+8 minggu ini",
            icon: Utensils,
            color: "text-orange-600",
            bg: "bg-orange-100",
        },
        {
            title: "Pending Verification",
            value: "12",
            description: "Segera tindak lanjuti",
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
    ];

    const readiness = [
        { label: "Fasilitas Ibadah", value: 85, color: "bg-green-500" },
        { label: "Kuliner Halal", value: 72, color: "bg-primary" },
        { label: "Layanan Ramah Muslim", value: 64, color: "bg-amber-500" },
    ];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-heading">
                        Pariwisata Halal
                    </h1>
                    <p className="text-muted-foreground">
                        Ringkasan eksekutif data pariwisata dan kesiapan halal
                        wilayah.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Unduh Laporan
                    </Button>
                    <Button
                        size="sm"
                        className="bg-primary text-primary-foreground"
                    >
                        Tambah Data Baru
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.title}
                        className="overflow-hidden border-none shadow-sm ring-1 ring-border/50"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-full p-2 ${stat.bg}`}>
                                <stat.icon
                                    className={`h-4 w-4 ${stat.color}`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-heading">
                                Peta Persebaran
                            </CardTitle>
                            <CardDescription>
                                Visualisasi lokasi destinasi dan UMKM
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {["Destinasi", "Fasilitas", "UMKM"].map((cat) => (
                                <Button
                                    key={cat}
                                    variant="outline"
                                    size="xs"
                                    className="text-[10px] h-7 px-2"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg relative overflow-hidden m-6 mt-0">
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/106.8456,-6.2088,10,0/800x400?access_token=pk.eyJ1IjoiamFja2llIiwiYSI6ImNrMnE4Z3RlazAyNjAzbm1xZ3RlazAyNjAifQ')] bg-cover bg-center opacity-50" />
                        <div className="relative z-10 text-sm font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm">
                            Klik untuk memperbesar peta
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-border/50">
                    <CardHeader>
                        <CardTitle className="font-heading">
                            Halal Readiness
                        </CardTitle>
                        <CardDescription>
                            Skor kesiapan ekosistem halal
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {readiness.map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        {item.label}
                                    </span>
                                    <span className="text-muted-foreground font-bold">
                                        {item.value}%
                                    </span>
                                </div>
                                <Progress
                                    value={item.value}
                                    className="h-2"
                                    indicatorClassName={item.color}
                                />
                            </div>
                        ))}
                        <div className="mt-8 pt-6 border-t">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5">
                                <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center text-primary font-bold">
                                    74
                                </div>
                                <div>
                                    <p className="text-sm font-bold">
                                        Overall Score
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Kategori: Siap Berkembang
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-heading">
                            Daftar Validasi Terbaru
                        </CardTitle>
                        <CardDescription>
                            Riwayat verifikasi data dalam 7 hari terakhir
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary font-bold"
                    >
                        Lihat Semua
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead>
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Nama Destinasi
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Kategori
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Tanggal Input
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {[
                                    {
                                        name: "Warung Nasi Padang Sederhana",
                                        category: "UMKM & Kuliner",
                                        date: "12 Okt 2023",
                                        status: "Pending",
                                        statusColor:
                                            "bg-amber-100 text-amber-700",
                                    },
                                    {
                                        name: "Hotel Syariah Grand",
                                        category: "Fasilitas Penginapan",
                                        date: "11 Okt 2023",
                                        status: "Perlu Verifikasi",
                                        statusColor:
                                            "bg-blue-100 text-blue-700",
                                    },
                                    {
                                        name: "Taman Wisata Alam Pegunungan",
                                        category: "Destinasi Alam",
                                        date: "10 Okt 2023",
                                        status: "Terverifikasi",
                                        statusColor:
                                            "bg-green-100 text-green-700",
                                    },
                                ].map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle font-medium">
                                            {row.name}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {row.category}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {row.date}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${row.statusColor}`}
                                            >
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm">
                                                Detail
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
