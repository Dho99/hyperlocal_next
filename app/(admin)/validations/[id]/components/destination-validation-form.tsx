"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    MapPin,
    ImageIcon,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
    FACILITY_LABELS,
    getScoreColor,
    getScoreLabel,
} from "@/lib/config/halal-readiness";
import { Destination } from "@/types/destination";
import Image from "next/image";

interface FacilityEvidence {
    imageUrl: string;
}

interface Facility {
    id: string;
    name: string;
    weight: number;
    facilityType: string;
    evidences: FacilityEvidence[];
}

interface DestinationValidationFormProps {
    validationId: string;
    destination: Destination;
    currentStatus: string;
    currentNotes: string | null;
    currentAdminScore: number | null;
    currentCategoryScores:
        | {
              facilityType: string;
              label: string;
              score: number;
              weight: number;
          }[]
        | null
        | undefined;
}

export function DestinationValidationForm({
    validationId,
    destination,
    currentStatus,
    currentNotes,
    currentAdminScore,
    currentCategoryScores,
}: DestinationValidationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [notes, setNotes] = useState(currentNotes ?? "");
    const [categoryScores, setCategoryScores] = useState<
        Record<string, number>
    >(() => {
        if (currentCategoryScores) {
            const map: Record<string, number> = {};
            currentCategoryScores.forEach((cs) => {
                map[cs.facilityType] = cs.score;
            });
            return map;
        }
        return {};
    });

    const categories = useMemo(() => {
        const facilities = (destination.destinationHalalFacilities ?? []).map(
            (dhf) => ({
                id: dhf?.facility?.id,
                name: dhf?.facility?.name,
                weight: 0,
                facilityType: dhf?.facility?.facilityType ?? "GENERAL",
                evidences:
                    dhf?.evidences?.map((e) => ({ imageUrl: e.imageUrl })) ??
                    [],
            }),
        );

        const byType = new Map<
            string,
            {
                facilityType: string;
                facilities: Facility[];
            }
        >();

        for (const f of facilities) {
            const existing = byType.get(f.facilityType);
            if (existing) {
                existing.facilities.push(f as Facility);
            } else {
                byType.set(f.facilityType, {
                    facilityType: f.facilityType,
                    facilities: [f as Facility],
                });
            }
        }

        const result = Array.from(byType.entries()).map(([type, group]) => {
            const maxWeight = Math.max(
                ...group.facilities.map((f) => f.weight),
                0,
            );
            return {
                facilityType: type,
                label:
                    FACILITY_LABELS[type as keyof typeof FACILITY_LABELS] ??
                    type,
                defaultScore: maxWeight,
                facilities: group.facilities,
            };
        });

        // Sort by predefined FACILITY_TYPES order
        const order = [
            "MOSQUE",
            "RESTAURANT",
            "ACCESSIBILITY",
            "FAMILY",
            "CLEANLINESS",
            "ADDITIONAL",
        ];
        result.sort(
            (a, b) =>
                order.indexOf(a.facilityType) - order.indexOf(b.facilityType),
        );

        return result;
    }, [destination.destinationHalalFacilities]);

    // Pre-fill categoryScores with default weights if not already set
    const localCategoryScores = useMemo(() => {
        const scores = { ...categoryScores };
        for (const cat of categories) {
            if (scores[cat.facilityType] === undefined) {
                scores[cat.facilityType] = cat.defaultScore;
            }
        }
        return scores;
    }, [categories, categoryScores]);

    const totalScore = useMemo(() => {
        let sum = 0;
        for (const cat of categories) {
            sum += localCategoryScores[cat.facilityType] ?? 0;
        }
        return Math.min(Math.round(sum), 100);
    }, [categories, localCategoryScores]);

    const handleScoreChange = (facilityType: string, value: string) => {
        const num = Math.min(Math.max(Number(value) || 0, 0), 100);
        setCategoryScores((prev) => ({ ...prev, [facilityType]: num }));
    };

    const handleSubmit = async (status: "APPROVED" | "REJECTED") => {
        if (
            status === "APPROVED" &&
            categories.length > 0 &&
            totalScore === 0
        ) {
            toast.error("Skor total tidak boleh 0 untuk menyetujui validasi");
            return;
        }

        setIsSubmitting(true);
        try {
            const categoryScoresArray = categories.map((cat) => ({
                facilityType: cat.facilityType,
                label: cat.label,
                score: localCategoryScores[cat.facilityType] ?? 0,
                weight: cat.defaultScore,
            }));

            const res = await fetch(`/api/validations/${validationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    notes: notes || null,
                    adminScore: status === "APPROVED" ? totalScore : null,
                    categoryScores:
                        status === "APPROVED" ? categoryScoresArray : null,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                router.push("/validations");
                router.refresh();
            } else {
                toast.error(data.message || "Gagal memproses validasi");
            }
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan data");
        } finally {
            setIsSubmitting(false);
        }
    };

    const autoScore = destination.halalScore ?? 0;
    const scoreColor = getScoreColor(totalScore);
    const scoreLabel = getScoreLabel(totalScore);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section: Review Data */}
            <div className="lg:col-span-2 space-y-8">
                {/* Destination Context */}
                <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                    <CardHeader className="bg-muted/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                                Profil Destinasi
                            </CardTitle>
                            <Badge variant="secondary">
                                {destination.category?.name ?? "Destinasi"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">
                                        Nama Destinasi
                                    </label>
                                    <p className="font-bold text-lg">
                                        {destination.name}
                                    </p>
                                </div>
                                {destination.address && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">
                                            Alamat
                                        </label>
                                        <p className="text-sm">
                                            {[
                                                destination.address,
                                                destination.city,
                                                destination.province,
                                            ]
                                                .filter(Boolean)
                                                .join(", ") || "-"}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">
                                        ID Pengajuan
                                    </label>
                                    <p className="text-sm font-mono">
                                        {validationId}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">
                                        Skor Otomatis
                                    </label>
                                    <p className="text-lg font-bold">
                                        {autoScore}/100
                                    </p>
                                </div>
                            </div>
                        </div>

                        {destination.images &&
                            destination.images.length > 0 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto">
                                    {destination.images.map((img, i) => (
                                        <Image
                                            width={150}
                                            height={150}
                                            key={i}
                                            src={img.imageUrl}
                                            alt={`${destination.name} ${i + 1}`}
                                            className="rounded-lg object-cover border shrink-0"
                                        />
                                    ))}
                                </div>
                            )}
                    </CardContent>
                </Card>

                {/* Facility Categories with Scoring */}
                <div className="space-y-6">
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-xl text-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                            <p className="text-muted-foreground italic">
                                Destinasi ini belum melengkapi data fasilitas
                                halal.
                            </p>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <Card
                                key={cat.facilityType}
                                className="border shadow-sm overflow-hidden"
                            >
                                <CardHeader className="bg-muted/20 pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold">
                                            {cat.label}
                                        </CardTitle>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {cat.facilities.length} fasilitas
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    {cat.facilities.map((f) => (
                                        <div
                                            key={f.id}
                                            className="rounded-lg border bg-card p-3"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">
                                                    {f.name}
                                                </span>
                                                {f.weight > 0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Weight: {f.weight}
                                                    </Badge>
                                                )}
                                            </div>
                                            {f.evidences.length > 0 ? (
                                                <div className="flex gap-2 flex-wrap">
                                                    {f.evidences.map(
                                                        (ev, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={
                                                                    ev.imageUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="group relative rounded-md overflow-hidden border bg-muted"
                                                            >
                                                                <Image
                                                                    width={200}
                                                                    height={200}
                                                                    src={
                                                                        ev.imageUrl
                                                                    }
                                                                    alt={`Evidence ${idx + 1}`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <ExternalLink className="h-4 w-4 text-white" />
                                                                </div>
                                                            </a>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">
                                                    Tidak ada bukti foto
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    <Separator />

                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium shrink-0">
                                            Skor Admin:
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={
                                                    localCategoryScores[
                                                        cat.facilityType
                                                    ] ?? cat.defaultScore
                                                }
                                                onChange={(e) =>
                                                    handleScoreChange(
                                                        cat.facilityType,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-20 h-9 text-center"
                                                disabled={
                                                    currentStatus !== "PENDING"
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                / 100
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            (Default: {cat.defaultScore})
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Right Section: Score Summary & Action */}
            <div className="space-y-6">
                {/* Score Summary Card */}
                <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">
                            Ringkasan Skor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <p
                                    className={scoreColor}
                                    style={{
                                        fontSize: "3rem",
                                        fontWeight: 800,
                                        lineHeight: 1,
                                    }}
                                >
                                    {totalScore}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    / 100
                                </p>
                                <Badge
                                    className={`mt-2 ${scoreColor}`}
                                    variant="outline"
                                >
                                    {scoreLabel}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            {categories.map((cat) => {
                                const score =
                                    localCategoryScores[cat.facilityType] ??
                                    cat.defaultScore;
                                return (
                                    <div
                                        key={cat.facilityType}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <span>{cat.label}</span>
                                        <span className="font-medium">
                                            {score}
                                        </span>
                                    </div>
                                );
                            })}
                            <Separator />
                            <div className="flex items-center justify-between text-sm font-bold">
                                <span>Total</span>
                                <span>{totalScore}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Card */}
                <Card className="sticky border shadow-lg ring-1 ring-primary/10 overflow-hidden pt-0 ">
                    <CardHeader className="bg-primary text-primary-foreground p-5">
                        <CardTitle>Keputusan Validasi</CardTitle>
                        <p className="text-xs text-primary-foreground/80">
                            Tentukan kelayakan destinasi wisata ini.
                        </p>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5 py-0">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Catatan Auditor
                            </label>
                            <Textarea
                                placeholder="Berikan alasan persetujuan atau penolakan..."
                                className="resize-none min-h-[100px]"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={currentStatus !== "PENDING"}
                            />
                        </div>

                        {currentStatus === "PENDING" ? (
                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    className="w-full h-12 font-bold gap-2"
                                    onClick={() => handleSubmit("APPROVED")}
                                    disabled={
                                        isSubmitting || categories.length === 0
                                    }
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5" />
                                    )}
                                    Setujui Destinasi
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full h-12 font-bold gap-2"
                                    onClick={() => handleSubmit("REJECTED")}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <XCircle className="h-5 w-5" />
                                    )}
                                    Tolak Destinasi
                                </Button>
                            </div>
                        ) : (
                            <Badge
                                variant="outline"
                                className={`w-full justify-center py-3 text-sm ${
                                    currentStatus === "APPROVED"
                                        ? "bg-green-50 text-green-600 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                }`}
                            >
                                {currentStatus === "APPROVED" ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Telah Disetujui
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Ditolak
                                    </>
                                )}
                            </Badge>
                        )}

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50/50 border border-yellow-200">
                            <p className="text-xs text-yellow-700 leading-relaxed">
                                <strong>Catatan:</strong> Pastikan seluruh bukti
                                foto fasilitas telah diperiksa sebelum
                                menyetujui. Skor admin akan menjadi nilai
                                tervalidasi yang tampil di publik.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
