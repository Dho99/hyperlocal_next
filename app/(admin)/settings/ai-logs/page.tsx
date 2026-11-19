import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
    SUCCESS: "bg-emerald-100 text-emerald-800",
    RULE_BASED: "bg-slate-100 text-slate-700",
    FALLBACK: "bg-amber-100 text-amber-800",
    ERROR: "bg-red-100 text-red-800",
    SKIPPED: "bg-stone-100 text-stone-600",
};

const FEATURES = ["ROUTE_FINDER", "EXPLORE", "RECOMMENDATION", "AI_TEST"];
const STATUSES = ["SUCCESS", "RULE_BASED", "FALLBACK", "ERROR", "SKIPPED"];
const PROVIDERS = ["groq", "gemini", "none"];

function firstParam(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export default async function AiLogsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const feature = firstParam(params.feature);
    const status = firstParam(params.status);
    const provider = firstParam(params.provider);

    const logs = await prisma.aiIntentLog.findMany({
        where: {
            ...(feature ? { feature } : {}),
            ...(status ? { status } : {}),
            ...(provider ? { provider } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Log AI
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Status provider dan model LLM untuk setiap request AI.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-wrap items-end gap-3" method="get">
                        <FilterSelect name="feature" label="Feature" value={feature} options={FEATURES} />
                        <FilterSelect name="status" label="Status" value={status} options={STATUSES} />
                        <FilterSelect name="provider" label="Provider" value={provider} options={PROVIDERS} />
                        <Button type="submit" size="sm">Terapkan</Button>
                        <a href="/settings/ai-logs" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                            Reset
                        </a>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {logs.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Belum ada log request AI yang cocok dengan filter.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th scope="col" className="py-2 pr-4 font-medium">Waktu</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Feature</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Query</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Intent</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Provider / Model</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Latency</th>
                                        <th scope="col" className="py-2 pr-4 font-medium">Attempt</th>
                                        <th scope="col" className="py-2 font-medium">Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b align-top last:border-0">
                                            <td className="py-3 pr-4 text-xs text-muted-foreground">
                                                {log.createdAt.toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-[11px]">{log.feature}</td>
                                            <td className="max-w-[260px] py-3 pr-4">
                                                <p className="truncate" title={log.userQuery}>{log.userQuery}</p>
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-[11px]">{log.intent}</td>
                                            <td className="py-3 pr-4 text-xs">
                                                <p>{log.provider ?? "-"}</p>
                                                <p className="text-muted-foreground">{log.model ?? "-"}</p>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge
                                                    variant="outline"
                                                    className={STATUS_STYLES[log.status ?? ""] ?? ""}
                                                >
                                                    {log.status ?? "-"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pr-4 text-xs">
                                                {log.latencyMs != null ? `${log.latencyMs} ms` : "-"}
                                            </td>
                                            <td className="py-3 pr-4 text-xs">{log.attemptCount}</td>
                                            <td className="max-w-[240px] py-3 text-xs text-destructive">
                                                {log.errorMessage ? (
                                                    <span className="line-clamp-2" title={log.errorMessage}>
                                                        {log.errorMessage}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function FilterSelect({
    name,
    label,
    value,
    options,
}: {
    name: string;
    label: string;
    value?: string;
    options: string[];
}) {
    return (
        <label className="space-y-1 text-xs font-medium">
            <span className="block text-muted-foreground">{label}</span>
            <select
                name={name}
                defaultValue={value ?? ""}
                className="h-9 rounded-md border bg-background px-3 text-sm"
            >
                <option value="">Semua</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}
