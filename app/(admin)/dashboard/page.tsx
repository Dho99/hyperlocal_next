import Image from "next/image";
import Link from "next/link";
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
    TrendingUp,
    Utensils,
} from "lucide-react";
import { DashboardMapSection } from "@/components/admin/dashboard/dashboard-map-section";
import EngagementMetrics from "@/components/admin/dashboard/engagement-metrics";
import TrendChart from "@/components/admin/dashboard/trend-chart";
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
import type { ValidationStatus } from "@/lib/generated/prisma";

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
            className: "bg-[#d1fae5] text-[#047857] border-transparent",
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
            tone: "bg-[#ccfbf1] text-[#0f766e]",
            valueTone: "text-foreground",
        },
        {
            label: "HALAL",
            title: "Total Tervalidasi",
            value: dashboard.stats.approvedDestinations,
            icon: ShieldCheck,
            tone: "bg-[#047857] text-white",
            valueTone: "text-[#047857]",
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
        <div className="space-y-4 pb-5">
            <section className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold leading-tight tracking-normal text-foreground">
                        Dashboard Overview
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ringkasan data pariwisata halal terkini.
                    </p>
                </div>
                <Button className="h-8 gap-2 rounded-lg bg-accent px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-accent/80">
                    <Download className="h-3.5 w-3.5" />
                    Unduh Laporan
                </Button>
            </section>

            <section className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="h-28 min-h-0 rounded-lg border-border bg-card py-0 shadow-none"
                    >
                        <CardContent className="flex h-full items-center gap-4 p-4">
                            <div
                                className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                    stat.tone,
                                )}
                            >
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                    <p
                                        className={cn(
                                            "font-heading text-[32px] font-bold leading-none",
                                            stat.valueTone,
                                        )}
                                    >
                                        {stat.value.toLocaleString("id-ID")}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="h-6 rounded-md border-transparent bg-muted px-2.5 text-[11px] font-semibold tracking-[0.14em] text-foreground"
                                    >
                                        {stat.label}
                                    </Badge>
                                </div>
                                <p className="truncate text-sm text-muted-foreground">
                                    {stat.title}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.86fr)]">
                <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
                        <CardTitle className="font-heading text-xl font-semibold">
                            Peta Persebaran
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="h-7 rounded-full bg-[#047857] px-3.5 text-xs font-semibold text-white">
                                ✓ Destinasi
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border bg-background px-3.5 text-xs font-semibold text-foreground"
                            >
                                Fasilitas
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border bg-background px-3.5 text-xs font-semibold text-foreground"
                            >
                                UMKM
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DashboardMapSection />
                    </CardContent>
                </Card>

                <Card className="rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="px-5 pb-5 pt-6">
                        <CardTitle className="font-heading text-xl font-semibold">
                            Halal Readiness
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Skor kesiapan berdasarkan kategori.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-5 pb-5 pt-6">
                        {dashboard.readiness.map((item, index) => (
                            <div key={item.label} className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">
                                        {item.label}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            index === 1
                                                ? "text-[#765b00]"
                                                : "text-[#047857]",
                                        )}
                                    >
                                        {item.value}%
                                    </span>
                                </div>
                                <Progress
                                    value={item.value}
                                    className="h-2.5 bg-muted"
                                    indicatorClassName={
                                        index === 1
                                            ? "bg-[#765b00]"
                                            : index === 2
                                              ? "bg-[#0f766e]"
                                              : "bg-[#047857]"
                                    }
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <CardTitle className="font-heading text-xl font-semibold">
                                Daftar Validasi Terbaru
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm text-muted-foreground">
                                Menunggu tindakan verifikator.
                            </CardDescription>
                        </div>
                        <Button
                            asChild
                            variant="ghost"
                            className="text-xs font-medium text-[#047857]"
                        >
                            <Link href="/validasi/destinasi">Lihat Semua</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-xs">
                                <thead className="border-b border-border bg-card text-xs uppercase tracking-[0.16em] text-foreground">
                                    <tr>
                                        <th className="px-5 py-4 text-left font-semibold">
                                            Nama Destinasi
                                        </th>
                                        <th className="px-5 py-4 text-left font-semibold">
                                            Kategori
                                        </th>
                                        <th className="px-5 py-4 text-left font-semibold">
                                            Tanggal Input
                                        </th>
                                        <th className="px-5 py-4 text-left font-semibold">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-right font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRows.slice(0, 3).map((row) => {
                                        const badge = statusBadge(
                                            row.status as ValidationStatus,
                                        );
                                        return (
                                            <tr
                                                key={row.id}
                                                className="border-b border-[#dbe7df]"
                                            >
                                                <td className="px-7 py-6 font-medium text-foreground">
                                                    {row.name}
                                                </td>
                                                <td className="px-7 py-6 text-muted-foreground">
                                                    {row.category}
                                                </td>
                                                <td className="px-7 py-6 text-muted-foreground">
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
                                                        className="text-[#047857]"
                                                    >
                                                        <Link
                                                            href={
                                                                "city" in row
                                                                    ? `/destinations/${row.id}`
                                                                     : "/validasi/destinasi"
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

            <section className="grid gap-5 xl:grid-cols-1">
                <Card className="rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <CardTitle className="font-heading text-xl font-semibold">
                                Trending Saat Ini
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm text-muted-foreground">
                                Destinasi dengan jumlah kunjungan terbanyak.
                            </CardDescription>
                        </div>
                        <TrendingUp className="h-4.5 w-4.5 text-[#047857]" />
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {dashboard.trendingDestinations
                                .slice(0, 5)
                                .map((destination, index) => (
                                    <div
                                        key={destination.id}
                                        className="flex items-center gap-2.5 rounded-lg border border-[#dbe7df] p-2.5"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#047857] text-xs font-bold text-white">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-sm">
                                                {destination.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {destination.category} •{" "}
                                                {destination.city}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857] shrink-0">
                                            <Eye className="h-3.5 w-3.5" />
                                            {destination.viewCount?.toLocaleString("id-ID") ?? 0}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <EngagementMetrics />

            <section className="grid gap-5 pt-1 xl:grid-cols-3">
                <TrendChart />

                <Card className="flex min-h-[340px] flex-col rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="flex flex-row items-start justify-between border-b border-border px-5 py-4">
                        <div>
                            <CardTitle className="font-heading text-lg">
                                Top Destinasi
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                                Berdasarkan rating dan engagement.
                            </CardDescription>
                        </div>
                        <BarChart3 className="h-5 w-5 text-[#047857]" />
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-2.5 p-5">
                        {dashboard.topDestinations.length > 0 ? (
                            dashboard.topDestinations
                                .slice(0, 3)
                                .map((destination, index) => (
                                    <div
                                        key={destination.id}
                                        className="flex items-center gap-2.5 rounded-lg border border-[#dbe7df] p-2.5"
                                    >
                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {destination.imageUrl ? (
                                                <Image
                                                    src={destination.imageUrl}
                                                    alt={destination.name}
                                                    fill
                                                    sizes="40px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <MapPin className="h-5 w-5 text-[#047857]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                #{index + 1} {destination.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {destination.category} •{" "}
                                                {destination.city}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="inline-flex items-center gap-1 text-sm text-[#765b00]">
                                                <Star className="h-4 w-4 fill-current" />
                                                {destination.rating.toFixed(1)}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Eye className="h-3 w-3" />
                                                {destination.engagement}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-background px-5 text-center">
                                <BarChart3 className="mb-3 h-7 w-7 text-[#047857]" />
                                <p className="text-sm font-semibold text-foreground">
                                    Belum ada top destinasi
                                </p>
                                <p className="mt-1 max-w-52 text-xs text-muted-foreground">
                                    Data akan muncul setelah destinasi punya
                                    rating atau interaksi.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex min-h-[340px] flex-col rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="border-b border-border px-5 py-4">
                        <CardTitle className="font-heading text-lg">
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                            Sinyal perilaku wisatawan terbaru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-2.5 p-5">
                        {dashboard.recentActivities.length > 0 ? (
                            dashboard.recentActivities
                                .slice(0, 3)
                                .map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex gap-2.5 rounded-lg border border-[#dbe7df] p-2.5"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d1fae5] text-[#047857]">
                                        {activity.type === "SAVE" ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Activity className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">
                                            {activity.title}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {activity.destination}
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                ))
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-background px-5 text-center">
                                <Activity className="mb-3 h-7 w-7 text-[#047857]" />
                                <p className="text-sm font-semibold text-foreground">
                                    Belum ada aktivitas
                                </p>
                                <p className="mt-1 max-w-52 text-xs text-muted-foreground">
                                    Sinyal terbaru akan tampil setelah pengguna
                                    mulai menyimpan atau membuka rute.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
