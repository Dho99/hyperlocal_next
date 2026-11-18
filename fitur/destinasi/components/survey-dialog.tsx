"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    AceshLayerForm,
    type EvidenceComponentValues,
} from "@/components/acesh/acesh-layer-form";
import {
    getSurveyStructure,
    submitSurvey,
    type MySurveyResponse,
    type SurveyIndicator,
} from "@/lib/api/survey";
import { getApiErrorMessage } from "@/lib/api-error";

interface SurveyDialogProps {
    destinationId: string;
    session: { user: { name: string; image?: string | null } } | null;
    sessionPending: boolean;
    initialMyResponse?: MySurveyResponse | null;
    onSubmitted?: () => void;
}

export function SurveyDialog({
    destinationId,
    session,
    sessionPending,
    initialMyResponse = null,
    onSubmitted,
}: SurveyDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDetail, setShowDetail] = useState(true);
    const [indicators, setIndicators] = useState<SurveyIndicator[]>([]);
    const [comment, setComment] = useState(initialMyResponse?.comment ?? "");
    const [submittedResponse, setSubmittedResponse] =
        useState<MySurveyResponse | null>(null);

    const myResponse = submittedResponse ?? initialMyResponse;
    const hasSubmitted = myResponse != null;

    const formIndicators = useMemo(() => {
        const saved = myResponse?.scores?.indicators ?? {};
        return indicators.map((indicator) => ({
            id: indicator.id,
            code: indicator.code,
            name: indicator.name,
            description: indicator.description,
            weight: indicator.weight,
            group: indicator.group,
            value: saved[indicator.id] ?? 0,
        }));
    }, [indicators, myResponse]);

    const formEvidence = useMemo<EvidenceComponentValues>(() => {
        const saved = myResponse?.scores?.evidence ?? {};
        return {
            sourceReliability: saved.sourceReliability ?? 0,
            documentEvidence: saved.documentEvidence ?? 0,
            photoGeolocation: saved.photoGeolocation ?? 0,
            managementConfirmation: saved.managementConfirmation ?? 0,
            fieldValidation: saved.fieldValidation ?? 0,
            dataFreshness: saved.dataFreshness ?? 0,
        };
    }, [myResponse]);

    const handleOpenChange = useCallback(
        async (next: boolean) => {
            setOpen(next);
            if (next && indicators.length === 0) {
                setLoading(true);
                try {
                    const structure = await getSurveyStructure(destinationId);
                    setIndicators(structure.indicators);
                    setSubmittedResponse(structure.myResponse);
                    setComment(structure.myResponse?.comment ?? "");
                } catch (err) {
                    toast.error(getApiErrorMessage(err));
                } finally {
                    setLoading(false);
                }
            }
        },
        [destinationId, indicators.length],
    );

    const handleLogin = useCallback(() => {
        const redirectTo = `${window.location.pathname}${window.location.search}`;
        router.push(`/halal?redirect=${encodeURIComponent(redirectTo)}`);
    }, [router]);

    const handleSubmit = async (payload: {
        scores: Array<{ indicatorId: string; value: number }>;
        evidence: EvidenceComponentValues;
    }) => {
        setSubmitting(true);
        try {
            const created = await submitSurvey(destinationId, {
                scores: {
                    indicators: Object.fromEntries(
                        payload.scores.map((s) => [s.indicatorId, s.value]),
                    ),
                    evidence: payload.evidence as unknown as Record<
                        string,
                        number
                    >,
                },
                comment: comment || null,
            });
            setSubmittedResponse({
                id: created.id,
                scores: created.scores,
                overallScore: created.overallScore,
                comment: created.comment,
                createdAt: created.createdAt,
                scoreHiddenAt: created.scoreHiddenAt,
                commentHiddenAt: created.commentHiddenAt,
            });
            toast.success("Terima kasih! Penilaian Anda tersimpan.");
            setOpen(false);
            onSubmitted?.();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold tracking-wider text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                    <Star className="size-4" />
                    {hasSubmitted ? "Lihat Penilaian Saya" : "Beri Penilaian"}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading">
                        {hasSubmitted ? "Penilaian Anda" : "Penilaian Destinasi"}
                    </DialogTitle>
                    <DialogDescription>
                        {hasSubmitted
                            ? "Satu penilaian per destinasi. Nilai yang tersimpan ditampilkan di bawah dan dihitung pada skor publik."
                            : "Nilai setiap item pada model SAFAR ACES-H. Skor kesiapan dihitung otomatis dari jawaban Anda."}
                    </DialogDescription>
                </DialogHeader>

                {sessionPending ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Mengecek sesi...
                    </div>
                ) : !session ? (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Masuk terlebih dahulu untuk mengirim penilaian.
                        </p>
                        <Button onClick={handleLogin} className="w-full">
                            Masuk untuk Menilai
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Memuat instrumen penilaian...
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="flex items-center justify-end gap-2 text-xs font-medium text-muted-foreground">
                            Tampilkan detail item
                            <Switch
                                checked={showDetail}
                                onCheckedChange={setShowDetail}
                            />
                        </label>
                        <p className="text-xs text-muted-foreground">
                            Nilai Lapis 3 (keyakinan bukti) ikut dihitung sebagai
                            kontribusi pengunjung. Bukti resmi dari pengelola
                            tetap diperlukan untuk status terverifikasi.
                        </p>
                        <AceshLayerForm
                            indicators={formIndicators}
                            evidence={formEvidence}
                            showDetail={showDetail}
                            layout="stacked"
                            readOnly={hasSubmitted}
                            saving={submitting}
                            submitLabel="Kirim Penilaian"
                            beforeSubmit={
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">
                                        Komentar (opsional)
                                    </label>
                                    <Textarea
                                        value={comment}
                                        onChange={(e) =>
                                            setComment(e.target.value)
                                        }
                                        rows={3}
                                        maxLength={1000}
                                        readOnly={hasSubmitted}
                                        placeholder="Bagikan catatan tambahan..."
                                    />
                                    {hasSubmitted && (
                                        <p className="text-xs text-muted-foreground">
                                            Penilaian dan komentar hanya dapat
                                            dikirim satu kali per destinasi.
                                        </p>
                                    )}
                                </div>
                            }
                            onSubmit={handleSubmit}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
