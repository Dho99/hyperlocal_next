import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

const CLASS_KEYS = ["SANGAT_SIAP", "SIAP", "BERKEMBANG", "PERLU_PENGEMBANGAN", "BELUM_SIAP"] as const;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const siapFilter = searchParams.get("siap"); // "siap" | "belum" | "berkembang" | all
        const verificationStatus = searchParams.get("verificationStatus"); // VERIFIED/PENDING/BELUM_DINILAI
        const categoryId = searchParams.get("categoryId");
        const city = searchParams.get("city");
        const search = searchParams.get("search");
        const classification = searchParams.get("classification");
        const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
        const cursor = searchParams.get("cursor");

        const destWhere: any = {};
        if (categoryId) destWhere.categoryId = categoryId;
        if (city) destWhere.city = { contains: city, mode: "insensitive" };
        if (search) destWhere.name = { contains: search, mode: "insensitive" };

        // Fetch all destinations (semua terdaftar), left join aceshAssessment
        const allDests = await prisma.destination.findMany({
            where: destWhere,
            select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                province: true,
                status: true,
                category: { select: { name: true } },
                images: { take: 1, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }], select: { imageUrl: true } },
                aceshAssessment: {
                    select: {
                        acesScore: true,
                        hyperlocalScore: true,
                        baseScore: true,
                        evidenceConfidenceScore: true,
                        evidenceFactor: true,
                        verifiedScore: true,
                        classification: true,
                        verificationStatus: true,
                        calculatedAt: true,
                    },
                },
            },
            orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
            take: 1000,
        });

        // Apply acesh filters in-memory to include belum dinilai
        let filtered = allDests;
        if (classification && CLASS_KEYS.includes(classification as any)) {
            filtered = filtered.filter((d) => d.aceshAssessment?.classification === classification);
        } else if (siapFilter === "siap") {
            filtered = filtered.filter((d) => ["SANGAT_SIAP", "SIAP"].includes(d.aceshAssessment?.classification ?? ""));
        } else if (siapFilter === "belum") {
            filtered = filtered.filter((d) => {
                const c = d.aceshAssessment?.classification;
                return c == null || ["BELUM_SIAP", "PERLU_PENGEMBANGAN"].includes(c);
            });
        } else if (siapFilter === "berkembang") {
            filtered = filtered.filter((d) => d.aceshAssessment?.classification === "BERKEMBANG");
        } else if (siapFilter === "belum_dinilai") {
            filtered = filtered.filter((d) => d.aceshAssessment == null);
        }

        if (verificationStatus === "VERIFIED" || verificationStatus === "PENDING") {
            filtered = filtered.filter((d) => d.aceshAssessment?.verificationStatus === verificationStatus);
        } else if (verificationStatus === "BELUM_DINILAI") {
            filtered = filtered.filter((d) => d.aceshAssessment == null);
        }

        // Summary rekap: total terdaftar vs dinilai
        const totalDestinations = allDests.length;
        const assessed = allDests.filter((d) => d.aceshAssessment != null);
        const totalAssessed = assessed.length;
        const notAssessed = totalDestinations - totalAssessed;
        const verifiedCount = assessed.filter((d) => d.aceshAssessment?.verificationStatus === "VERIFIED").length;
        const pendingCount = totalAssessed - verifiedCount;
        const avg = (vals: number[]) => vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : null;
        const verifiedScores = assessed.filter((d) => d.aceshAssessment?.verifiedScore != null).map((d) => d.aceshAssessment!.verifiedScore!);
        const baseScores = assessed.map((d) => d.aceshAssessment!.baseScore).filter((v): v is number => v != null);
        const confidences = assessed.map((d) => d.aceshAssessment!.evidenceConfidenceScore).filter((v): v is number => v != null);

        const distribution = CLASS_KEYS.map((key) => ({
            key,
            label:
                key === "SANGAT_SIAP" ? "Sangat siap" :
                key === "SIAP" ? "Siap" :
                key === "BERKEMBANG" ? "Berkembang" :
                key === "PERLU_PENGEMBANGAN" ? "Perlu pengembangan" : "Belum siap",
            count: assessed.filter((d) => d.aceshAssessment?.classification === key).length,
        }));

        const siapCount = assessed.filter((d) => ["SANGAT_SIAP", "SIAP"].includes(d.aceshAssessment?.classification ?? "")).length;
        const belumCount = assessed.filter((d) => ["BELUM_SIAP", "PERLU_PENGEMBANGAN"].includes(d.aceshAssessment?.classification ?? "")).length;
        const berkembangCount = assessed.filter((d) => d.aceshAssessment?.classification === "BERKEMBANG").length;

        // Paginated for table (cursor on destination id, from filtered)
        let paginated = filtered;
        if (cursor) {
            const idx = filtered.findIndex((d) => d.id === cursor);
            if (idx >= 0) paginated = filtered.slice(idx + 1, idx + 1 + limit);
            else paginated = filtered.slice(0, limit);
        } else {
            paginated = filtered.slice(0, limit);
        }
        const nextCursor = paginated.length === limit && filtered.length > paginated.length ? paginated[paginated.length - 1].id : null;

        const items = paginated.map((d) => ({
            destinationId: d.id,
            destination: {
                id: d.id,
                name: d.name,
                slug: d.slug,
                city: d.city,
                province: d.province,
                status: d.status,
                category: d.category,
                images: d.images,
            },
            acesScore: d.aceshAssessment?.acesScore ?? null,
            hyperlocalScore: d.aceshAssessment?.hyperlocalScore ?? null,
            baseScore: d.aceshAssessment?.baseScore ?? null,
            evidenceConfidenceScore: d.aceshAssessment?.evidenceConfidenceScore ?? null,
            evidenceFactor: d.aceshAssessment?.evidenceFactor ?? null,
            verifiedScore: d.aceshAssessment?.verifiedScore ?? null,
            classification: d.aceshAssessment?.classification ?? null,
            verificationStatus: d.aceshAssessment?.verificationStatus ?? null,
            calculatedAt: d.aceshAssessment?.calculatedAt ?? null,
        }));

        return NextResponse.json({
            data: {
                summary: {
                    totalDestinations,
                    totalAssessed,
                    notAssessed,
                    verifiedCount,
                    pendingCount,
                    siapCount,
                    belumCount,
                    berkembangCount,
                    averageVerifiedScore: avg(verifiedScores),
                    averageBaseScore: avg(baseScores),
                    averageConfidence: avg(confidences),
                    distribution,
                },
                items,
                nextCursor,
                hasMore: nextCursor != null,
            },
        });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
