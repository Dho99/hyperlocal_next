"use client";

import { MessageSquareText, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PublicSurveyEntry } from "@/lib/api/survey";

export function SurveyComments({ entries }: { entries: PublicSurveyEntry[] }) {
    if (entries.length === 0) {
        return (
            <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center">
                <MessageSquareText className="mx-auto h-7 w-7 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                    Belum ada penilaian pengunjung yang ditampilkan.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-5 space-y-3">
            {entries.map((item) => {
                const name = item.user?.name ?? "Pengunjung";
                return (
                    <article key={item.id} className="rounded-xl border border-border/60 bg-card p-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={item.user?.image ?? undefined} alt={name} />
                                <AvatarFallback className="bg-muted font-semibold text-muted-foreground">
                                    {name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {item.overallScore != null && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            <Star className="h-3.5 w-3.5" />
                                            ACES-H {item.overallScore.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                {item.comment && (
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        &ldquo;{item.comment}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
