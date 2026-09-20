"use client";

import { useState, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    ImageLightbox,
    useImageLightbox,
} from "@/components/ui/image-lightbox";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    MapPin,
    ImageIcon,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    FACILITY_LABELS,
    getScoreColor,
    getScoreLabel,
} from "@/lib/config/halal-readiness";
import { Destination } from "@/types/destination";
import Image from "next/image";

interface FacilityEvidence {
    imageUrl: string;
    validityStatus?: string | null;
    distanceMeters?: number | null;
    validityNotes?: string | null;
}

function evidenceStatusClass(status?: string | null): string {
    switch (status) {
        case "VALID":
            return "ring-2 ring-emerald-400";
        case "INVALID_POSITION":
            return "ring-2 ring-red-400";
        case "INVALID_TIME":
            return "ring-2 ring-orange-400";
        case "NO_METADATA":
            return "ring-2 ring-amber-300";
        default:
            return "";
    }
}

function facilityValidityBadge(
    evidences: FacilityEvidence[],
): { label: string; className: string } | null {
    if (evidences.length === 0) return null;
    if (evidences.some((e) => e.validityStatus === "INVALID_POSITION")) {
        return {
            label: "Foto di luar radius",
            className: "bg-red-100 text-red-700",
        };
    }
    if (evidences.some((e) => e.validityStatus === "INVALID_TIME")) {
        return {
            label: "Waktu foto tidak wajar",
            className: "bg-orange-100 text-orange-700",
        };
    }
    if (evidences.every((e) => e.validityStatus === "VALID")) {
        return {
            label: "Foto valid",
            className: "bg-emerald-100 text-emerald-700",
        };
    }
    return {
        label: "Tanpa metadata",
        className: "bg-amber-100 text-amber-700",
    };
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
    /** Content rendered between the facility review and the decision card. */
    children?: ReactNode;
}

export function DestinationValidationForm({
    validationId,
    destination,
    currentStatus,
    currentNotes,
    currentAdminScore,
    currentCategoryScores,
    children,
}: DestinationValidationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const lightbox = useImageLightbox();

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
                    dhf?.evidences?.map((e) => ({
                        imageUrl: e.imageUrl,
                        validityStatus: e.validityStatus ?? null,
                        distanceMeters: e.distanceMeters ?? null,
                        validityNotes: e.validityNotes ?? null,
                    })) ?? [],
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

    const { allEvidence, evidenceIndexByKey } = useMemo(() => {
        const all: { imageUrl: string; caption?: string | null }[] = [];
        const map = new Map<string, number>();
        for (const cat of categories) {
            for (const f of cat.facilities) {
                f.evidences.forEach((ev, idx) => {
                    map.set(`${f.id}:${idx}`, all.length);
                    all.push({ imageUrl: ev.imageUrl, caption: f.name });
                });
            }
        }
        return { allEvidence: all, evidenceIndexByKey: map };
    }, [categories]);

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
        if (categories.length === 0) return 0;
        let sum = 0;
        for (const cat of categories) {
            sum += localCategoryScores[cat.facilityType] ?? 0;
        }
        return Math.round(sum / categories.length);
    }, [categories, localCategoryScores]);

    const handleScoreChange = (facilityType: string, value: string) => {
        const digits = value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
        const num = digits === "" ? 0 : Math.min(Number(digits), 100);
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
                router.push("/validasi/destinasi");
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
    const isLocked = currentStatus !== "PENDING";

    return (
        <div className="space-y-6 pb-24 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section: Review Data */}
            <div className="lg:col-span-2 space-y-4">
                {/* Compact Destination Context */}
                <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                    <button
                        type="button"
                        onClick={() => setProfileOpen((v) => !v)}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/30"
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate font-bold">
                                {destination.name}
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                                {destination.category?.name ?? "Destinasi"}
                            </Badge>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="hidden text-xs text-muted-foreground sm:inline">
                                Skor Otomatis{" "}
                                <span className="font-bold text-foreground">
                                    {autoScore}/100
                                </span>
                            </span>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform",
                                    profileOpen && "rotate-180",
                                )}
                            />
                        </div>
                    </button>
                    {profileOpen && (
                        <CardContent className="space-y-4 border-t pt-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    {destination.address && (
                                        <div>
                                            <label className="text-xs font-medium uppercase text-muted-foreground">
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
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium uppercase text-muted-foreground">
                                            ID Pengajuan
                                        </label>
                                        <p className="truncate font-mono text-xs">
                                            {validationId}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium uppercase text-muted-foreground">
                                            Skor Otomatis
                                        </label>
                                        <p className="text-sm font-bold">
                                            {autoScore}/100
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {destination.images &&
                                destination.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {destination.images.map((img, i) => (
                                            <Image
                                                width={96}
                                                height={96}
                                                key={i}
                                                src={img.imageUrl}
                                                alt={`${destination.name} ${i + 1}`}
                                                className="h-20 w-20 shrink-0 rounded-lg border object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                        </CardContent>
                    )}
                </Card>

                {/* Facility Categories with Scoring */}
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-12 text-center">
                        <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground opacity-20" />
                        <p className="italic text-muted-foreground">
                            Destinasi ini belum melengkapi data fasilitas halal.
                        </p>
                    </div>
                ) : (
                    <Card className="overflow-hidden border shadow-sm">
                        <Accordion type="multiple" className="px-4">
                            {categories.map((cat) => {
                                const score =
                                    localCategoryScores[cat.facilityType] ??
                                    cat.defaultScore;
                                return (
                                    <AccordionItem
                                        key={cat.facilityType}
                                        value={cat.facilityType}
                                    >
                                        <AccordionHeader className="items-center gap-3">
                                            <AccordionTrigger className="py-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="truncate font-semibold">
                                                        {cat.label}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 text-[10px]"
                                                    >
                                                        {cat.facilities.length}{" "}
                                                        fasilitas
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={score}
                                                    onChange={(e) =>
                                                        handleScoreChange(
                                                            cat.facilityType,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 w-16 text-center"
                                                    disabled={isLocked}
                                                    aria-label={`Skor ${cat.label}`}
                                                />
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "hidden text-[10px] sm:inline-flex",
                                                        getScoreColor(score),
                                                    )}
                                                >
                                                    {getScoreLabel(score)}
                                                </Badge>
                                            </div>
                                        </AccordionHeader>
                                        <AccordionContent>
                                            <div className="space-y-2">
                                                {cat.facilities.map((f) => {
                                                    const validity =
                                                        facilityValidityBadge(
                                                            f.evidences,
                                                        );
                                                    return (
                                                    <div
                                                        key={f.id}
                                                        className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="truncate text-xs font-medium">
                                                                    {f.name}
                                                                </p>
                                                                {validity && (
                                                                    <span
                                                                        className={cn(
                                                                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                                                            validity.className,
                                                                        )}
                                                                    >
                                                                        {
                                                                            validity.label
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {f.weight > 0 && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    Weight{" "}
                                                                    {f.weight}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {f.evidences.length >
                                                        0 ? (
                                                            <div className="flex shrink-0 gap-1.5">
                                                                {f.evidences.map(
                                                                    (
                                                                        ev,
                                                                        idx,
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                idx
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                lightbox.openAt(
                                                                                    evidenceIndexByKey.get(
                                                                                        `${f.id}:${idx}`,
                                                                                    ) ??
                                                                                        0,
                                                                                )
                                                                            }
                                                                            className={cn(
                                                                                "h-12 w-12 overflow-hidden rounded border bg-muted transition-opacity hover:opacity-80",
                                                                                evidenceStatusClass(
                                                                                    ev.validityStatus,
                                                                                ),
                                                                            )}
                                                                            title={
                                                                                ev.validityNotes ??
                                                                                undefined
                                                                            }
                                                                            aria-label={`Lihat bukti ${f.name}`}
                                                                        >
                                                                            <Image
                                                                                width={
                                                                                    48
                                                                                }
                                                                                height={
                                                                                    48
                                                                                }
                                                                                src={
                                                                                    ev.imageUrl
                                                                                }
                                                                                alt={`Bukti ${f.name}`}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="shrink-0 text-[10px] italic text-muted-foreground">
                                                                Tidak ada bukti
                                                            </span>
                                                        )}
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </Card>
                )}
            </div>

            {/* Right Section: Score Summary & Action */}
            <div className="space-y-4">
                {/* Score Summary Card */}
                <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">
                            Ringkasan Skor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <span
                                className={cn(
                                    "text-3xl font-extrabold leading-none",
                                    scoreColor,
                                )}
                            >
                                {totalScore}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                / 100
                            </span>
                            <Badge
                                className={cn(scoreColor)}
                                variant="outline"
                            >
                                {scoreLabel}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-1.5">
                            {categories.map((cat) => {
                                const score =
                                    localCategoryScores[cat.facilityType] ??
                                    cat.defaultScore;
                                return (
                                    <div
                                        key={cat.facilityType}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <span className="truncate">
                                            {cat.label}
                                        </span>
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
            </div>
            </div>

            {children}

            {/* Decision Card — full width at the bottom of the page */}
            <Card className="border shadow-lg ring-1 ring-primary/10 overflow-hidden pt-0">
                <CardHeader className="bg-primary p-4 text-primary-foreground">
                        <CardTitle>Keputusan Validasi</CardTitle>
                        <p className="text-xs text-primary-foreground/80">
                            Tentukan kelayakan destinasi wisata ini.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 py-0">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Catatan Auditor
                            </label>
                            <Textarea
                                placeholder="Berikan alasan persetujuan atau penolakan..."
                                className="min-h-[80px] resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={isLocked}
                            />
                        </div>

                        {currentStatus === "PENDING" ? (
                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    className="w-full h-11 font-bold gap-2"
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
                                    className="w-full h-11 font-bold gap-2"
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

            {/* Mobile sticky decision bar */}
            {currentStatus === "PENDING" && categories.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
                    <Button
                        type="button"
                        variant="destructive"
                        className="flex-1 h-11 font-bold gap-2"
                        onClick={() => handleSubmit("REJECTED")}
                        disabled={isSubmitting}
                    >
                        <XCircle className="h-4 w-4" />
                        Tolak
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 h-11 font-bold gap-2"
                        onClick={() => handleSubmit("APPROVED")}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        Setujui
                    </Button>
                </div>
            )}

            <ImageLightbox
                images={allEvidence}
                open={lightbox.open}
                index={lightbox.index}
                onOpenChange={lightbox.setOpen}
                onIndexChange={lightbox.setIndex}
                alt="Bukti fasilitas"
            />
        </div>
    );
}
