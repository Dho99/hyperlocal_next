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
            className: "bg-primary/10 text-primary",
        };
    }

    if (status === "REJECTED") {
        return {
            label: "Ditolak",
            className: "bg-destructive/10 text-destructive",
        };
    }

    return {
        label: "Pending",
        className: "bg-chart-3/15 text-chart-3",
    };
}

export default async function DashboardPage() {
    const dashboard = await getDashboardOverview();

    const stats = [
        {
            label: "Total",
            title: "Total Destinasi",
            value: dashboard.stats.totalDestinations,
            icon: Map,
            tone: "bg-primary/10 text-primary",
            valueTone: "text-foreground",
        },
        {
            label: "Halal",
            title: "Total Tervalidasi",
            value: dashboard.stats.approvedDestinations,
            icon: ShieldCheck,
            tone: "bg-primary text-primary-foreground",
            valueTone: "text-primary",
        },
        {
            label: "Kuliner",
            title: "UMKM & Kuliner",
            value: dashboard.stats.totalUmkms,
            icon: Utensils,
            tone: "bg-chart-3/15 text-chart-3",
            valueTone: "text-chart-3",
        },
        {
            label: "Aksi",
            title: "Pending Verification",
            value:
                dashboard.stats.pendingDestinations +
                dashboard.stats.pendingValidations,
            icon: AlertCircle,
            tone: "bg-destructive/10 text-destructive",
            valueTone: "text-destructive",
        },
    ];

    const recentRows =
        dashboard.recentValidations.length > 0
            ? dashboard.recentValidations
            : dashboard.latestDestinations;

    return (
        <div className="space-y-5">
            <section className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                        Dashboard Overview
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ringkasan data pariwisata halal terkini.
                    </p>
                </div>
                <Button className="h-9 gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                    <Download className="h-4 w-4" />
                    Unduh Laporan
                </Button>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="rounded-xl border-border bg-card py-0 shadow-none"
                    >
                        <CardContent className="flex items-center gap-4 p-4">
                            <div
                                className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                                    stat.tone,
                                )}
                            >
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p
                                        className={cn(
                                            "font-heading text-3xl font-semibold leading-none tracking-tight",
                                            stat.valueTone,
                                        )}
                                    >
                                        {stat.value.toLocaleString("id-ID")}
                                    </p>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {stat.label}
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {stat.title}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div>
                        <CardTitle className="font-heading text-lg font-semibold">
                            Kesiapan ACES-H
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Ringkasan penilaian ACES + Hyperlocal berbasis
                            indikator dan verifikasi bukti.
                        </CardDescription>
                    </div>
                    <Link
                        href="/validasi/destinasi"
                        className="shrink-0 text-sm font-medium text-primary hover:underline"
                    >
                        Kelola Penilaian
                    </Link>
                </CardHeader>
                <CardContent className="p-5">
                    {dashboard.acesh.totalAssessed === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Belum ada destinasi yang dinilai dengan ACES-H. Buka
                            halaman Validasi Destinasi dan isi skor indikator
                            untuk memulai.
                        </p>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Dinilai
                                </p>
                                <p className="font-heading text-2xl font-semibold tracking-tight">
                                    {dashboard.acesh.totalAssessed}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {dashboard.acesh.verifiedCount} terverifikasi ·{" "}
                                    {dashboard.acesh.pendingCount} sementara
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Rerata Skor Terverifikasi
                                </p>
                                <p className="font-heading text-2xl font-semibold tracking-tight">
                                    {dashboard.acesh.averageVerifiedScore != null
                                        ? dashboard.acesh.averageVerifiedScore.toFixed(1)
                                        : "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    dari destinasi terverifikasi
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Rerata Skor Dasar
                                </p>
                                <p className="font-heading text-2xl font-semibold tracking-tight">
                                    {dashboard.acesh.averageBaseScore != null
                                        ? dashboard.acesh.averageBaseScore.toFixed(1)
                                        : "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    sebelum faktor bukti
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Rerata Confidence
                                </p>
                                <p className="font-heading text-2xl font-semibold tracking-tight">
                                    {dashboard.acesh.averageConfidence != null
                                        ? dashboard.acesh.averageConfidence.toFixed(1)
                                        : "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    tingkat keyakinan bukti (0–100)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Distribusi Klasifikasi
                                </p>
                                {dashboard.acesh.classificationDistribution.map(
                                    (bucket) => (
                                        <div
                                            key={bucket.key}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {bucket.label}
                                            </span>
                                            <span className="font-semibold">
                                                {bucket.count}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.86fr)]">
                <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <CardTitle className="font-heading text-lg font-semibold">
                            Peta Persebaran
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="h-7 gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                Destinasi
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border bg-background px-3 text-xs font-medium text-foreground"
                            >
                                Fasilitas
                            </Badge>
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-border bg-background px-3 text-xs font-medium text-foreground"
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
                    <CardHeader className="border-b border-border px-5 py-4">
                        <CardTitle className="font-heading text-lg font-semibold">
                            Halal Readiness
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Skor kesiapan berdasarkan kategori.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 p-5">
                        {dashboard.readiness.map((item, index) => (
                            <div key={item.label} className="space-y-2.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">
                                        {item.label}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            index === 1
                                                ? "text-chart-3"
                                                : index === 2
                                                  ? "text-chart-5"
                                                  : "text-primary",
                                        )}
                                    >
                                        {item.value}%
                                    </span>
                                </div>
                                <Progress
                                    value={item.value}
                                    className="h-2 bg-muted"
                                    indicatorClassName={
                                        index === 1
                                            ? "bg-chart-3"
                                            : index === 2
                                              ? "bg-chart-5"
                                              : "bg-primary"
                                    }
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div>
                        <CardTitle className="font-heading text-lg font-semibold">
                            Daftar Validasi Terbaru
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Menunggu tindakan verifikator.
                        </CardDescription>
                    </div>
                    <Button
                        asChild
                        variant="ghost"
                        className="shrink-0 text-sm font-medium text-primary hover:bg-primary/10"
                    >
                        <Link href="/validasi/destinasi">Lihat Semua</Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr className="text-xs font-medium text-muted-foreground">
                                    <th className="px-5 py-3 text-left font-medium">
                                        Nama Destinasi
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Kategori
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Tanggal Input
                                    </th>
                                    <th className="px-5 py-3 text-left font-medium">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right font-medium">
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
                                            className="border-b border-border last:border-b-0"
                                        >
                                            <td className="px-5 py-3 font-medium text-foreground">
                                                {row.name}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {row.category}
                                            </td>
                                            <td className="px-5 py-3 text-muted-foreground">
                                                {formatDate(row.date)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-6 rounded-full border-transparent px-3 text-xs font-medium",
                                                        badge.className,
                                                    )}
                                                >
                                                    {badge.label}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-primary hover:bg-primary/10"
                                                >
                                                    <Link
                                                        href={
                                                            "city" in row
                                                                ? `/destinations/${row.id}`
                                                                : "/validasi/destinasi"
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
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

            <Card className="rounded-xl border-border bg-card shadow-none">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <div>
                        <CardTitle className="font-heading text-lg font-semibold">
                            Trending Saat Ini
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Destinasi dengan jumlah kunjungan terbanyak.
                        </CardDescription>
                    </div>
                    <TrendingUp className="h-5 w-5 shrink-0 text-primary" />
                </CardHeader>
                <CardContent className="p-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {dashboard.trendingDestinations
                            .slice(0, 5)
                            .map((destination, index) => (
                                <div
                                    key={destination.id}
                                    className="flex items-center gap-2.5 rounded-lg border border-border p-2.5"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {destination.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {destination.category} ·{" "}
                                            {destination.city}
                                        </p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                                        <Eye className="h-3.5 w-3.5" />
                                        {destination.viewCount?.toLocaleString(
                                            "id-ID",
                                        ) ?? 0}
                                    </span>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            <EngagementMetrics />

            <section className="grid gap-5 xl:grid-cols-3">
                <TrendChart />

                <Card className="flex min-h-[340px] flex-col rounded-xl border-border bg-card shadow-none">
                    <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border px-5 py-4">
                        <div>
                            <CardTitle className="font-heading text-lg font-semibold">
                                Top Destinasi
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Berdasarkan rating dan engagement.
                            </CardDescription>
                        </div>
                        <BarChart3 className="h-5 w-5 shrink-0 text-primary" />
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 p-5">
                        {dashboard.topDestinations.length > 0 ? (
                            dashboard.topDestinations
                                .slice(0, 3)
                                .map((destination, index) => (
                                    <div
                                        key={destination.id}
                                        className="flex items-center gap-2.5 rounded-lg border border-border p-2.5"
                                    >
                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
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
                                                    <MapPin className="h-5 w-5 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                #{index + 1} {destination.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {destination.category} ·{" "}
                                                {destination.city}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <span className="inline-flex items-center gap-1 text-sm text-chart-3">
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
                            <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-muted/40 px-5 text-center">
                                <BarChart3 className="mb-3 h-7 w-7 text-primary" />
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
                        <CardTitle className="font-heading text-lg font-semibold">
                            Aktivitas Terbaru
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Sinyal perilaku wisatawan terbaru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3 p-5">
                        {dashboard.recentActivities.length > 0 ? (
                            dashboard.recentActivities
                                .slice(0, 3)
                                .map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex gap-2.5 rounded-lg border border-border p-2.5"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                            <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-muted/40 px-5 text-center">
                                <Activity className="mb-3 h-7 w-7 text-primary" />
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
