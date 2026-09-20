"use client";

import { useCallback, useState } from "react";
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
    type SurveyIndicator,
} from "@/lib/api/survey";
import { getApiErrorMessage } from "@/lib/api-error";

interface SurveyDialogProps {
    destinationId: string;
    session: { user: { name: string; image?: string | null } } | null;
    sessionPending: boolean;
    onSubmitted?: () => void;
}

const DEFAULT_EVIDENCE: EvidenceComponentValues = {
    sourceReliability: 0,
    documentEvidence: 0,
    photoGeolocation: 0,
    managementConfirmation: 0,
    fieldValidation: 0,
    dataFreshness: 0,
};

export function SurveyDialog({
    destinationId,
    session,
    sessionPending,
    onSubmitted,
}: SurveyDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showDetail, setShowDetail] = useState(true);
    const [indicators, setIndicators] = useState<SurveyIndicator[]>([]);
    const [comment, setComment] = useState("");

    const handleOpenChange = useCallback(
        async (next: boolean) => {
            setOpen(next);
            if (next && indicators.length === 0) {
                setLoading(true);
                try {
                    const structure = await getSurveyStructure(destinationId);
                    setIndicators(structure.indicators);
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
            await submitSurvey(destinationId, {
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
            toast.success("Terima kasih! Penilaian Anda tersimpan.");
            setOpen(false);
            setComment("");
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
                    Beri Penilaian
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading">
                        Penilaian Destinasi
                    </DialogTitle>
                    <DialogDescription>
                        Nilai setiap item pada model SAFAR ACES-H. Skor
                        kesiapan dihitung otomatis dari jawaban Anda.
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
                        <AceshLayerForm
                            indicators={indicators.map((i) => ({
                                id: i.id,
                                code: i.code,
                                name: i.name,
                                description: i.description,
                                weight: i.weight,
                                group: i.group,
                                value: 0,
                            }))}
                            evidence={DEFAULT_EVIDENCE}
                            showDetail={showDetail}
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
                                        placeholder="Bagikan catatan tambahan..."
                                    />
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
