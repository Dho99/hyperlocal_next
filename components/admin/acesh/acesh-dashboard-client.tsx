"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Eye,
  BarChart3,
  MapPin,
  Activity,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Summary = {
  totalDestinations: number;
  totalAssessed: number;
  notAssessed: number;
  verifiedCount: number;
  pendingCount: number;
  siapCount: number;
  belumCount: number;
  berkembangCount: number;
  averageVerifiedScore: number | null;
  averageBaseScore: number | null;
  averageConfidence: number | null;
  distribution: Array<{ key: string; label: string; count: number }>;
};
type Item = {
  destinationId: string;
  destination: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    status: string;
    category: { name: string } | null;
    images: Array<{ imageUrl: string }>;
  };
  baseScore: number | null;
  verifiedScore: number | null;
  classification: string | null;
  verificationStatus: string | null;
  acesScore: number | null;
  hyperlocalScore: number | null;
  evidenceConfidenceScore: number | null;
  evidenceFactor: number | null;
};

const CLASS_BADGE: Record<string, string> = {
  SANGAT_SIAP: "bg-[#d1fae5] text-[#047857] border-transparent",
  SIAP: "bg-[#d1fae5] text-[#047857] border-transparent",
  BERKEMBANG: "bg-[#fef9c3] text-[#713f12] border-transparent",
  PERLU_PENGEMBANGAN: "bg-[#ffedd5] text-[#7c2d12] border-transparent",
  BELUM_SIAP: "bg-[#ffdad6] text-[#93000a] border-transparent",
};

export function AceshDashboardClient() {
  const router = useRouter();
  const [siapFilter, setSiapFilter] = useState<string>("all");
  const [verifFilter, setVerifFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (siapFilter !== "all") p.set("siap", siapFilter);
    if (verifFilter !== "all") p.set("verificationStatus", verifFilter);
    if (debounced) p.set("search", debounced);
    p.set("limit", "20");
    return p.toString();
  }, [siapFilter, verifFilter, debounced]);

  async function fetchData(cursor?: string | null) {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/acesh/dashboard?${query}${cursor ? `&cursor=${cursor}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat");
      const json = await res.json();
      if (json.data) {
        setSummary(json.data.summary);
        if (cursor) setItems((prev) => [...prev, ...json.data.items]);
        else setItems(json.data.items);
        setNextCursor(json.data.nextCursor);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const stats = [
    {
      label: "TERDAFTAR",
      title: "Total Terdaftar",
      value: summary?.totalDestinations ?? 0,
      icon: Layers,
      tone: "bg-[#ccfbf1] text-[#0f766e]",
      valueTone: "text-foreground",
      sub: summary
        ? `${summary.totalAssessed} dinilai • ${summary.notAssessed} belum`
        : undefined,
    },
    {
      label: "SIAP",
      title: "Siap",
      sub: "Sangat siap + Siap",
      value: summary?.siapCount ?? 0,
      icon: CheckCircle2,
      tone: "bg-[#047857] text-white",
      valueTone: "text-[#047857]",
    },
    {
      label: "BELUM",
      title: "Belum Siap",
      sub: "Perlu + Belum + Belum dinilai",
      value: summary ? summary.belumCount + summary.notAssessed : 0,
      icon: AlertTriangle,
      tone: "bg-[#ffdad6] text-[#93000a]",
      valueTone: "text-[#ba1a1a]",
    },
    {
      label: "PROSES",
      title: "Berkembang",
      sub: "Menengah",
      value: summary?.berkembangCount ?? 0,
      icon: Activity,
      tone: "bg-[#fef9c3] text-[#713f12]",
      valueTone: "text-[#713f12]",
    },
  ];

  return (
    <div className="space-y-4 pb-5">
      {/* Stats cards – total terdaftar vs dinilai */}
      <section className="grid gap-3.5 lg:grid-cols-2 xl:grid-cols-4">
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
                    {stat.value}
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
                {stat.sub && (
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Kesiapan ACES-H – single dense card (operate: 1 vocabulary, spacing not borders) */}
      <section className="rounded-xl border border-border bg-card shadow-none overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <div>
            <CardTitle className="font-heading text-xl font-semibold">
              Kesiapan ACES-H
            </CardTitle>
            <CardDescription className="text-sm">
              Ringkasan penilaian ACES + Hyperlocal berbasis indikator dan
              verifikasi bukti
            </CardDescription>
          </div>
          <TrendingUp className="h-4.5 w-4.5 text-[#047857]" />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between min-h-[88px]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">
                Verified
              </p>
              <p className="font-heading text-xl sm:text-2xl font-bold leading-none">
                {summary?.averageVerifiedScore?.toFixed(1) ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                dari VERIFIED
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between min-h-[88px]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">
                Base
              </p>
              <p className="font-heading text-xl sm:text-2xl font-bold leading-none">
                {summary?.averageBaseScore?.toFixed(1) ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                sebelum faktor
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between min-h-[88px]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">
                Confidence
              </p>
              <p className="font-heading text-xl sm:text-2xl font-bold leading-none">
                {summary?.averageConfidence?.toFixed(1) ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                EVC 0–100
              </p>
            </div>
            <div className="rounded-lg border border-[#dbe7df] p-3 flex flex-col justify-between min-h-[88px] bg-[#f0fdf4]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">
                Terverifikasi
              </p>
              <p className="font-heading text-xl sm:text-2xl font-bold leading-none text-[#047857]">
                {summary?.verifiedCount ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {summary?.pendingCount ?? "—"} pending
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-between min-h-[88px] col-span-2 sm:col-span-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">
                Total Dinilai
              </p>
              <p className="font-heading text-xl sm:text-2xl font-bold leading-none">
                {summary?.totalAssessed ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {summary?.siapCount ?? 0} siap • {summary?.belumCount ?? 0}{" "}
                belum
              </p>
            </div>
          </div>
          {summary && (
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                Distribusi Klasifikasi
              </p>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {summary.distribution.map((d) => (
                  <div
                    key={d.key}
                    className="rounded-lg border p-3 flex flex-col items-center justify-center text-center min-h-[72px] gap-1"
                  >
                    <p className="text-xs text-muted-foreground leading-tight line-clamp-1">
                      {d.label}
                    </p>
                    <p className="font-heading text-xl font-bold leading-none">
                      {d.count}
                    </p>
                    <Badge
                      className={cn(
                        "h-5 rounded-full px-2 text-[10px] font-semibold border-transparent",
                        CLASS_BADGE[d.key] ?? "bg-muted",
                      )}
                    >
                      {d.key.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </section>

      {/* Filters – toolbar strip, selected-state chips (operate) */}
      <div className="flex flex-col gap-2 border-y border-border bg-muted/20 px-5 py-2.5 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari destinasi..."
            className="pl-9 h-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={siapFilter}
            onChange={(e) => setSiapFilter(e.target.value)}
            className={cn(
              "flex h-9 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              siapFilter !== "all" &&
                "bg-[#047857] text-white border-transparent",
            )}
          >
            <option value="all">Semua Kesiapan</option>
            <option value="siap">Siap</option>
            <option value="berkembang">Berkembang</option>
            <option value="belum">Belum</option>
            <option value="belum_dinilai">Belum dinilai</option>
          </select>
          <select
            value={verifFilter}
            onChange={(e) => setVerifFilter(e.target.value)}
            className={cn(
              "flex h-9 rounded-lg border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              verifFilter !== "all" &&
                "bg-[#047857] text-white border-transparent",
            )}
          >
            <option value="all">Semua Status</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="PENDING">Pending</option>
            <option value="BELUM_DINILAI">Belum dinilai</option>
          </select>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => {
              setSiapFilter("all");
              setVerifFilter("all");
              setSearch("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      {(siapFilter !== "all" || verifFilter !== "all" || debounced) && (
        <div className="flex flex-wrap gap-2 px-1">
          {siapFilter !== "all" && (
            <Badge className="h-6 rounded-full bg-[#047857] text-white px-3 text-xs">
              Siap: {siapFilter}{" "}
              <button onClick={() => setSiapFilter("all")} className="ml-1">
                ×
              </button>
            </Badge>
          )}
          {verifFilter !== "all" && (
            <Badge className="h-6 rounded-full bg-[#047857] text-white px-3 text-xs">
              Status: {verifFilter}{" "}
              <button onClick={() => setVerifFilter("all")} className="ml-1">
                ×
              </button>
            </Badge>
          )}
          {debounced && (
            <Badge variant="outline" className="h-6 rounded-full px-3 text-xs">
              Search: {debounced}
            </Badge>
          )}
        </div>
      )}

      {/* Table – use ui/table with dashboard header style */}
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
          <div>
            <CardTitle className="font-heading text-xl font-semibold">
              Destinasi ({items.length})
            </CardTitle>
            <CardDescription className="text-sm">
              Semua terdaftar — filter siap/belum dan verifikasi
            </CardDescription>
          </div>
          <Badge className="h-7 rounded-full bg-[#047857] px-3.5 text-xs font-semibold text-white">
            {summary?.totalDestinations ?? 0} terdaftar •{" "}
            {summary?.notAssessed ?? 0} belum dinilai
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-card text-xs uppercase tracking-[0.16em] text-foreground">
                {/* <TableHead className="px-5 py-4 font-semibold">Destinasi</TableHead> */}
                <TableHead className="px-5 py-4 font-semibold">
                  Lokasi
                </TableHead>
                <TableHead className="px-5 py-4 font-semibold">
                  Kategori
                </TableHead>
                <TableHead className="px-5 py-4 font-semibold">
                  Klasifikasi
                </TableHead>
                <TableHead className="px-5 py-4 font-semibold">Skor</TableHead>
                <TableHead className="px-5 py-4 font-semibold">
                  Keadaan
                </TableHead>
                <TableHead className="px-5 py-4 font-semibold">
                  Status
                </TableHead>
                <TableHead className="px-5 py-4 font-semibold">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 bg-[#ffdad6]/20 py-6 rounded-lg">
                      <AlertTriangle className="h-7 w-7 text-[#ba1a1a]" />
                      <p className="text-sm font-semibold">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchData(null)}
                      >
                        Coba lagi
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : loading && items.length === 0 ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="py-3">
                        <div className="grid grid-cols-7 gap-2">
                          <div className="col-span-2 h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3 bg-background px-5 py-8 text-center rounded-lg">
                      <BarChart3 className="h-7 w-7 text-[#047857]" />
                      <p className="text-sm font-semibold">
                        Tidak ada destinasi sesuai filter
                      </p>
                      <p className="text-xs text-muted-foreground max-w-64">
                        Coba ubah filter siap/belum atau kata kunci.
                      </p>
                      <Button
                        size="sm"
                        className="h-7 bg-[#047857] text-white mt-2"
                        onClick={() => {
                          setSiapFilter("all");
                          setVerifFilter("all");
                          setSearch("");
                        }}
                      >
                        Reset filter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((it) => {
                  const isAssessed = it.baseScore != null;
                  const disp = isAssessed
                    ? it.verificationStatus === "VERIFIED" &&
                      it.verifiedScore != null
                      ? it.verifiedScore
                      : it.baseScore
                    : null;
                  return (
                    <TableRow
                      key={it.destinationId}
                      className="border-b border-[#dbe7df]"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* <div className="h-10 w-10 rounded-md bg-muted overflow-hidden relative shrink-0 border">
                            {it.destination.images[0] ? (
                              <Image
                                src={it.destination.images[0].imageUrl}
                                alt={it.destination.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <MapPin className="h-5 w-5 m-auto text-[#047857]" />
                            )}
                          </div> */}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {it.destination.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {it.destination.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="h-6 rounded-full border-border bg-card px-3 text-xs"
                        >
                          {it.destination.category?.name ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-xs text-muted-foreground">
                        {it.destination.city ?? "—"},{" "}
                        {it.destination.province ?? ""}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {isAssessed && disp != null ? (
                          <>
                            <span
                              className={cn(
                                "font-heading font-bold",
                                it.verificationStatus === "VERIFIED"
                                  ? "text-[#047857]"
                                  : "text-[#7c2d12]",
                              )}
                            >
                              {disp.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {" "}
                              / {it.baseScore!.toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            — Belum dinilai
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {isAssessed ? (
                          <Badge
                            className={cn(
                              "h-6 rounded-full px-3 text-xs font-semibold border-transparent",
                              CLASS_BADGE[it.classification ?? ""] ??
                                "bg-muted",
                            )}
                          >
                            {it.classification?.replace(/_/g, " ") ?? "—"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-6 rounded-full px-3 text-xs"
                          >
                            Belum dinilai
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {!isAssessed ? (
                          <Badge
                            variant="outline"
                            className="h-7 rounded-full px-3 text-xs"
                          >
                            Belum dinilai
                          </Badge>
                        ) : it.verificationStatus === "VERIFIED" ? (
                          <Badge className="h-7 rounded-full bg-[#d1fae5] text-[#047857] px-3 text-xs">
                            ● Terverifikasi
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-7 rounded-full px-3 text-xs"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#047857]"
                          onClick={() =>
                            router.push(`/destinations/${it.destinationId}`)
                          }
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="border-t p-4 text-center">
            <Button
              variant="outline"
              onClick={() => nextCursor && fetchData(nextCursor)}
              disabled={!nextCursor || loading}
              className={cn(!nextCursor && "opacity-50 pointer-events-none")}
            >
              {!nextCursor
                ? "Semua dimuat"
                : loading
                  ? "Memuat..."
                  : "Muat lebih banyak"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
