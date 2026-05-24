import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
    Activity,
    AlertCircle,
    BarChart3,
    CalendarClock,
    CheckCircle2,
    Download,
    Eye,
    Map,
    MapPin,
    ShieldCheck,
    Star,
    Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardOverview } from "@/lib/services/dashboard-service";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function statusBadge(status: "PENDING" | "APPROVED" | "REJECTED") {
    if (status === "APPROVED") {
        return {
            label: "Terverifikasi",
            className: "bg-[#e0d2ff] text-[#4f378a] border-transparent",
        };
    }

    if (status === "REJECTED") {
        return {
            label: "Ditolak",
            className: "bg-[#ffdad6] text-[#93000a] border-transparent",
        };
    }

    return {
        label: "Pending",
        className: "bg-[#ffdad6] text-[#93000a] border-transparent",
    };
}

export default async function DashboardPage() {
    const dashboard = await getDashboardOverview();

    const stats = [
        {
            label: "TOTAL",
            title: "Total Destinasi",
            value: dashboard.stats.totalDestinations,
            icon: Map,
            tone: "bg-[#e0d2ff] text-[#6750a4]",
            valueTone: "text-[#1d1b20]",
        },
        {
            label: "HALAL",
            title: "Total Tervalidasi",
            value: dashboard.stats.approvedDestinations,
            icon: ShieldCheck,
            tone: "bg-[#6750a4] text-white",
            valueTone: "text-[#4f378a]",
        },
        {
            label: "KULINER",
            title: "UMKM & Kuliner",
            value: dashboard.stats.totalUmkms,
            icon: Utensils,
            tone: "bg-[#c9a74d] text-[#241a00]",
            valueTone: "text-[#765b00]",
        },
        {
            label: "ACTION",
            title: "Pending Verification",
            value:
                dashboard.stats.pendingDestinations +
                dashboard.stats.pendingValidations,
            icon: AlertCircle,
            tone: "bg-[#ffdad6] text-[#93000a]",
            valueTone: "text-[#ba1a1a]",
        },
    ];

    const recentRows =
        dashboard.recentValidations.length > 0
            ? dashboard.recentValidations
            : dashboard.latestDestinations;

    return (
        <div className="space-y-8 pb-8">
            <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="font-heading text-[40px] font-bold leading-tight tracking-normal text-[#1d1b20]">
                        Dashboard Overview
                    </h1>
                    <p className="mt-3 text-lg text-[#494551]">
                        Ringkasan data pariwisata halal terkini.
                    </p>
                </div>
                <Button className="h-12 gap-3 rounded-lg bg-[#4f378a] px-7 text-base font-semibold text-white shadow-sm hover:bg-[#422b77]">
                    <Download className="h-5 w-5" />
                    Unduh Laporan
                </Button>
            </section>

            <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="min-h-[198px] rounded-xl border-[#cbc4d2] bg-white shadow-none"
                    >
                        <CardContent className="p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div
                                    className={cn(
                                        "flex h-[68px] w-[68px] items-center justify-center rounded-lg",
                                        stat.tone,
                                    )}
                                >
                                    <stat.icon className="h-8 w-8" />
                                </div>
                                <Badge
                                    variant="outline"
                                    className="h-8 rounded-md border-transparent bg-[#f2ecf4] px-4 font-semibold tracking-[0.14em] text-[#1d1b20]"
                                >
                                    {stat.label}
                                </Badge>
                            </div>
                            <p
                                className={cn(
                                    "mt-7 font-heading text-[56px] font-bold leading-none",
                                    stat.valueTone,
                                )}
                            >
                                {stat.value.toLocaleString("id-ID")}
                            </p>
                            <p className="mt-3 text-xl text-[#494551]">
                                {stat.title}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(360px,0.95fr)]">
                <Card className="overflow-hidden rounded-xl border-[#cbc4d2] bg-white shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#cbc4d2] px-7 py-6">
                        <CardTitle className="font-heading text-[32px] font-semibold">
                            Peta Persebaran
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="h-9 rounded-full bg-[#6750a4] px-5 text-sm font-semibold text-white">
                                ✓ Destinasi
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-9 rounded-full border-[#cbc4d2] bg-[#fdf7ff] px-5 text-sm font-semibold text-[#1d1b20]"
                            >
                                Fasilitas
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-9 rounded-full border-[#cbc4d2] bg-[#fdf7ff] px-5 text-sm font-semibold text-[#1d1b20]"
                            >
                                UMKM
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative h-[480px] overflow-hidden bg-[#d8d5db]">
                            <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(22deg,rgba(73,69,81,.18)_1px,transparent_1px),linear-gradient(112deg,rgba(73,69,81,.16)_1px,transparent_1px)] [background-size:42px_42px]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_45%,rgba(255,255,255,.9),transparent_9%),radial-gradient(circle_at_55%_52%,rgba(255,255,255,.8),transparent_12%),linear-gradient(120deg,transparent_0_38%,rgba(255,255,255,.35)_39%_42%,transparent_43%_100%)]" />
                            <div className="absolute inset-0 grayscale [background-image:url('https://tile.openstreetmap.org/2/2/1.png')] bg-cover bg-center opacity-20" />

                            {dashboard.mapDestinations.length === 0 ? (
                                <>
                                    <MapPinMarker
                                        className="left-[41%] top-[30%]"
                                        label="Masjid Agung"
                                        tone="bg-[#6750a4]"
                                    />
                                    <MapPinMarker
                                        className="left-[57%] top-[55%]"
                                        label="Resto Halal"
                                        tone="bg-[#765b00]"
                                    />
                                </>
                            ) : (
                                dashboard.mapDestinations
                                    .slice(0, 5)
                                    .map((point, index) => (
                                        <MapPinMarker
                                            key={point.id}
                                            className=""
                                            label={
                                                index === 0
                                                    ? point.name
                                                    : undefined
                                            }
                                            tone={
                                                index % 2 === 0
                                                    ? "bg-[#6750a4]"
                                                    : "bg-[#765b00]"
                                            }
                                            style={{
                                                left: `${point.x}%`,
                                                top: `${point.y}%`,
                                            }}
                                        />
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-[#cbc4d2] bg-white shadow-none">
                    <CardHeader className="px-8 pb-8 pt-9">
                        <CardTitle className="font-heading text-[32px] font-semibold">
                            Halal Readiness
                        </CardTitle>
                        <CardDescription className="text-lg text-[#494551]">
                            Skor kesiapan berdasarkan kategori.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-12 px-8 pb-8 pt-20">
                        {dashboard.readiness.map((item, index) => (
                            <div key={item.label} className="space-y-4">
                                <div className="flex items-center justify-between text-xl">
                                    <span className="font-medium text-[#1d1b20]">
                                        {item.label}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            index === 1
                                                ? "text-[#765b00]"
                                                : "text-[#4f378a]",
                                        )}
                                    >
                                        {item.value}%
                                    </span>
                                </div>
                                <Progress
                                    value={item.value}
                                    className="h-2.5 bg-[#e6e0e9]"
                                    indicatorClassName={
                                        index === 1
                                            ? "bg-[#765b00]"
                                            : index === 2
                                              ? "bg-[#63597c]"
                                              : "bg-[#4f378a]"
                                    }
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="overflow-hidden rounded-xl border-[#cbc4d2] bg-white shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#cbc4d2] px-8 py-7">
                        <div>
                            <CardTitle className="font-heading text-[32px] font-semibold">
                                Daftar Validasi Terbaru
                            </CardTitle>
                            <CardDescription className="mt-2 text-lg text-[#494551]">
                                Menunggu tindakan verifikator.
                            </CardDescription>
                        </div>
                        <Button
                            asChild
                            variant="ghost"
                            className="text-base font-medium text-[#24005d]"
                        >
                            <Link href="/validations">Lihat Semua</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-base">
                                <thead className="border-b border-[#cbc4d2] bg-white text-sm uppercase tracking-[0.16em] text-[#1d1b20]">
                                    <tr>
                                        <th className="px-7 py-5 text-left font-semibold">
                                            Nama Destinasi
                                        </th>
                                        <th className="px-7 py-5 text-left font-semibold">
                                            Kategori
                                        </th>
                                        <th className="px-7 py-5 text-left font-semibold">
                                            Tanggal Input
                                        </th>
                                        <th className="px-7 py-5 text-left font-semibold">
                                            Status
                                        </th>
                                        <th className="px-7 py-5 text-right font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRows.slice(0, 3).map((row) => {
                                        const badge = statusBadge(row.status);
                                        return (
                                            <tr
                                                key={row.id}
                                                className="border-b border-[#e6e0e9]"
                                            >
                                                <td className="px-7 py-6 font-medium text-[#1d1b20]">
                                                    {row.name}
                                                </td>
                                                <td className="px-7 py-6 text-[#494551]">
                                                    {row.category}
                                                </td>
                                                <td className="px-7 py-6 text-[#494551]">
                                                    {formatDate(row.date)}
                                                </td>
                                                <td className="px-7 py-6">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "h-7 rounded-full px-4 text-sm font-semibold",
                                                            badge.className,
                                                        )}
                                                    >
                                                        • {badge.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-7 py-6 text-right">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-[#24005d]"
                                                    >
                                                        <Link
                                                            href={
                                                                "city" in row
                                                                    ? `/destinations/${row.id}`
                                                                    : "/validations"
                                                            }
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-6 pt-2 xl:grid-cols-3">
                <Card className="rounded-xl border-[#cbc4d2] bg-white shadow-none">
                    <CardHeader>
                        <CardTitle className="font-heading text-2xl">
                            Dashboard Chart
                        </CardTitle>
                        <CardDescription>
                            Aktivitas wisatawan tujuh hari terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-48 items-end gap-3 rounded-lg bg-[#f8f2fa] px-4 pb-4 pt-6">
                            {dashboard.chart.days.map((day) => (
                                <div
                                    key={day.key}
                                    className="flex flex-1 flex-col items-center gap-2"
                                >
                                    <div className="flex h-32 w-full max-w-10 items-end rounded-full bg-white/80 p-1">
                                        <div
                                            className="w-full rounded-full bg-[#4f378a]"
                                            style={{
                                                height: `${day.height}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium">
                                        {day.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-[#cbc4d2] bg-white shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-heading text-2xl">
                                Top Destinasi
                            </CardTitle>
                            <CardDescription>
                                Berdasarkan rating dan engagement.
                            </CardDescription>
                        </div>
                        <BarChart3 className="h-5 w-5 text-[#4f378a]" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {dashboard.topDestinations.slice(0, 3).map(
                            (destination, index) => (
                                <div
                                    key={destination.id}
                                    className="flex items-center gap-3 rounded-lg border border-[#e6e0e9] p-3"
                                >
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#f2ecf4]">
                                        {destination.imageUrl ? (
                                            <Image
                                                src={destination.imageUrl}
                                                alt={destination.name}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <MapPin className="h-5 w-5 text-[#6750a4]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">
                                            #{index + 1} {destination.name}
                                        </p>
                                        <p className="truncate text-xs text-[#494551]">
                                            {destination.category} •{" "}
                                            {destination.city}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-sm text-[#765b00]">
                                        <Star className="h-4 w-4 fill-current" />
                                        {destination.rating.toFixed(1)}
                                    </span>
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-[#cbc4d2] bg-white shadow-none">
                    <CardHeader>
                        <CardTitle className="font-heading text-2xl">
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription>
                            Sinyal perilaku wisatawan terbaru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {dashboard.recentActivities.slice(0, 3).map(
                            (activity) => (
                                <div
                                    key={activity.id}
                                    className="flex gap-3 rounded-lg border border-[#e6e0e9] p-3"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e0d2ff] text-[#4f378a]">
                                        {activity.type === "SAVE" ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Activity className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">
                                            {activity.title}
                                        </p>
                                        <p className="truncate text-sm text-[#494551]">
                                            {activity.destination}
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#494551]">
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function MapPinMarker({
    className,
    label,
    tone,
    style,
}: {
    className?: string;
    label?: string;
    tone: string;
    style?: CSSProperties;
}) {
    return (
        <div className={cn("absolute", className)} style={style}>
            <div className="relative">
                <div
                    className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-white shadow-md",
                        tone,
                    )}
                >
                    <MapPin className="h-5 w-5" />
                </div>
                {label && (
                    <div className="absolute left-1/2 top-[48px] -translate-x-1/2 whitespace-nowrap rounded bg-white px-3 py-1 text-base font-semibold text-[#1d1b20] shadow-sm">
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
}
