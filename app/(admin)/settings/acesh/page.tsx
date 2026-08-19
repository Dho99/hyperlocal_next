import { prisma } from "@/lib/prisma";
import {
    AceshScoringSettingsForm,
    DEFAULT_SCORING_CONFIG,
    type ScoringConfigFormValue,
} from "@/components/admin/settings/acesh-scoring-settings-form";

export default async function AceshSettingsPage() {
    let initialConfig: ScoringConfigFormValue = DEFAULT_SCORING_CONFIG;
    try {
        const stored = await prisma.aceshScoringConfig.findUnique({ where: { id: "default" } });
        if (stored) {
            initialConfig = Object.fromEntries(
                Object.keys(DEFAULT_SCORING_CONFIG).map((key) => [key, stored[key as keyof typeof stored]]),
            ) as ScoringConfigFormValue;
        }
    } catch {
        // The defaults keep this page usable while the new migration is being deployed.
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bobot Scoring ACES-H</h1><p className="mt-1 text-muted-foreground">Perubahan digunakan pada perhitungan atau kalkulasi ulang berikutnya.</p></div>
            <AceshScoringSettingsForm initialConfig={initialConfig} />
        </div>
    );
}
