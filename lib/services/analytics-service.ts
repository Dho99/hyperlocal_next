import { prisma } from "@/lib/prisma";
import { 
  InteractionType, 
  SentimentLabel, 
} from "@/lib/generated/prisma/client";
import { subDays, startOfDay, startOfWeek, startOfMonth } from "date-fns";

export async function trackInteraction(data: {
  destinationId: string;
  userId?: string;
  type: InteractionType;
  keyword?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}) {
  return await prisma.destinationInteraction.create({
    data: {
      destinationId: data.destinationId,
      userId: data.userId,
      type: data.type,
      keyword: data.keyword,
      source: data.source,
      metadata: data.metadata,
    },
  });
}

export async function getHottestDestinations(params: {
  period: "daily" | "weekly" | "monthly";
  limit: number;
}) {
  const { period, limit } = params;
  
  // Try to get from DestinationTrend first
  const now = new Date();
  
  const trends = await prisma.destinationTrend.findMany({
    where: {
      period,
      periodStart: {
        lte: now,
        gte: period === "daily" ? subDays(now, 1) : period === "weekly" ? subDays(now, 7) : subDays(now, 30)
      }
    },
    orderBy: { trendScore: "desc" },
    take: limit,
    include: {
      destination: {
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }
    }
  });

  if (trends.length > 0) {
    return trends.map(t => ({
      ...t.destination,
      trendScore: t.trendScore,
      counts: {
        view: t.viewCount,
        search: t.searchCount,
        click: t.clickCount,
        save: t.saveCount,
        share: t.shareCount,
        route: t.routeCount
      }
    }));
  }

  // Fallback to aggregation if trends not yet calculated for current period
  const interactions = await prisma.destinationInteraction.groupBy({
    by: ["destinationId", "type"],
    _count: { _all: true },
    where: {
      createdAt: {
        gte: period === "daily" ? subDays(now, 1) : period === "weekly" ? subDays(now, 7) : subDays(now, 30)
      }
    }
  });

  const destScores: Record<string, { view: number; search: number; click: number; save: number; share: number; route: number; score: number }> = {};
  
  interactions.forEach(i => {
    if (!destScores[i.destinationId]) {
      destScores[i.destinationId] = { 
        view: 0, search: 0, click: 0, save: 0, share: 0, route: 0, score: 0 
      };
    }
    const count = i._count._all;
    if (i.type === "VIEW") { destScores[i.destinationId].view = count; destScores[i.destinationId].score += count * 1; }
    else if (i.type === "SEARCH") { destScores[i.destinationId].search = count; destScores[i.destinationId].score += count * 3; }
    else if (i.type === "CLICK") { destScores[i.destinationId].click = count; destScores[i.destinationId].score += count * 2; }
    else if (i.type === "SAVE") { destScores[i.destinationId].save = count; destScores[i.destinationId].score += count * 4; }
    else if (i.type === "SHARE") { destScores[i.destinationId].share = count; destScores[i.destinationId].score += count * 5; }
    else if (i.type === "ROUTE") { destScores[i.destinationId].route = count; destScores[i.destinationId].score += count * 4; }
  });

  const sortedDestIds = Object.keys(destScores).sort((a, b) => destScores[b].score - destScores[a].score).slice(0, limit);

  const destinations = await prisma.destination.findMany({
    where: { id: { in: sortedDestIds } },
    include: {
      category: true,
      images: {
        where: { isPrimary: true },
        take: 1
      }
    }
  });

  return destinations.map(d => ({
    ...d,
    trendScore: destScores[d.id].score,
    counts: destScores[d.id]
  })).sort((a, b) => b.trendScore - a.trendScore);
}

export async function recalculateTrends(params: { period?: "daily" | "weekly" | "monthly" }) {
  const periods: ("daily" | "weekly" | "monthly")[] = params.period ? [params.period] : ["daily", "weekly", "monthly"];
  const now = new Date();
  let totalProcessed = 0;

  for (const p of periods) {
    let start: Date;
    if (p === "daily") start = startOfDay(now);
    else if (p === "weekly") start = startOfWeek(now);
    else start = startOfMonth(now);

    const interactions = await prisma.destinationInteraction.groupBy({
      by: ["destinationId", "type"],
      _count: { _all: true },
      where: {
        createdAt: { gte: p === "daily" ? subDays(now, 1) : p === "weekly" ? subDays(now, 7) : subDays(now, 30) }
      }
    });

    const destData: Record<string, { view: number; search: number; click: number; save: number; share: number; route: number }> = {};
    interactions.forEach(i => {
      if (!destData[i.destinationId]) {
        destData[i.destinationId] = { 
          view: 0, search: 0, click: 0, save: 0, share: 0, route: 0 
        };
      }
      const count = i._count._all;
      if (i.type === "VIEW") destData[i.destinationId].view = count;
      else if (i.type === "SEARCH") destData[i.destinationId].search = count;
      else if (i.type === "CLICK") destData[i.destinationId].click = count;
      else if (i.type === "SAVE") destData[i.destinationId].save = count;
      else if (i.type === "SHARE") destData[i.destinationId].share = count;
      else if (i.type === "ROUTE") destData[i.destinationId].route = count;
    });

    for (const [destId, counts] of Object.entries(destData)) {
      const trendScore = (counts.view * 1) + (counts.search * 3) + (counts.click * 2) + (counts.save * 4) + (counts.share * 5) + (counts.route * 4);
      
      await prisma.destinationTrend.upsert({
        where: {
          destinationId_period_periodStart: {
            destinationId: destId,
            period: p,
            periodStart: start,
          }
        },
        update: {
          viewCount: counts.view,
          searchCount: counts.search,
          clickCount: counts.click,
          saveCount: counts.save,
          shareCount: counts.share,
          routeCount: counts.route,
          trendScore,
        },
        create: {
          destinationId: destId,
          period: p,
          periodStart: start,
          viewCount: counts.view,
          searchCount: counts.search,
          clickCount: counts.click,
          saveCount: counts.save,
          shareCount: counts.share,
          routeCount: counts.route,
          trendScore,
        }
      });
      totalProcessed++;
    }
  }

  return totalProcessed;
}

export async function getSearchTrends(params: { period: "daily" | "weekly" | "monthly", limit: number }) {
  const { period, limit } = params;
  const now = new Date();
  
  const interactions = await prisma.destinationInteraction.groupBy({
    by: ["keyword"],
    _count: { _all: true },
    where: {
      type: "SEARCH",
      keyword: { not: null },
      createdAt: { gte: period === "daily" ? subDays(now, 1) : period === "weekly" ? subDays(now, 7) : subDays(now, 30) }
    },
    orderBy: { _count: { keyword: "desc" } },
    take: limit
  });

  return interactions.map(i => ({
    keyword: i.keyword,
    count: i._count._all,
    period
  }));
}

export async function analyzeReviewSentiment(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || !review.comment) throw new Error("Review not found or has no comment");

  const comment = review.comment.toLowerCase();
  const positiveWords = ["bagus", "indah", "bersih", "nyaman", "ramah", "murah", "recommended", "menyenangkan", "mantap", "enak"];
  const negativeWords = ["buruk", "kotor", "mahal", "kecewa", "macet", "tidak nyaman", "jelek", "kecewa", "parah"];

  let score = 0.5;
  const foundKeywords: string[] = [];
  
  positiveWords.forEach(w => {
    if (comment.includes(w)) {
      score += 0.1;
      foundKeywords.push(w);
    }
  });
  
  negativeWords.forEach(w => {
    if (comment.includes(w)) {
      score -= 0.1;
      foundKeywords.push(w);
    }
  });

  score = Math.max(0, Math.min(1, score));
  let label: SentimentLabel = "NEUTRAL";
  if (score > 0.6) label = "POSITIVE";
  else if (score < 0.4) label = "NEGATIVE";

  return await prisma.reviewSentiment.upsert({
    where: { reviewId },
    update: { label, score, keywords: foundKeywords, analyzedAt: new Date() },
    create: { reviewId, label, score, keywords: foundKeywords }
  });
}

export async function getDestinationSentimentSummary(destinationId: string) {
  const sentiments = await prisma.reviewSentiment.findMany({
    where: { review: { destinationId } }
  });

  const totalAnalyzedReviews = sentiments.length;
  if (totalAnalyzedReviews === 0) {
    return { positiveCount: 0, neutralCount: 0, negativeCount: 0, averageScore: 0, topKeywords: [], totalAnalyzedReviews: 0 };
  }

  const counts = sentiments.reduce((acc, s) => {
    acc[s.label]++;
    acc.sumScore += s.score;
    s.keywords.forEach(k => {
      acc.keywords[k] = (acc.keywords[k] || 0) + 1;
    });
    return acc;
  }, { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, sumScore: 0, keywords: {} as Record<string, number> });

  const topKeywords = Object.entries(counts.keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(e => e[0]);

  return {
    positiveCount: counts.POSITIVE,
    neutralCount: counts.NEUTRAL,
    negativeCount: counts.NEGATIVE,
    averageScore: counts.sumScore / totalAnalyzedReviews,
    topKeywords,
    totalAnalyzedReviews
  };
}

export interface DetailedStatistics {
  kpi: {
    totalDestinations: number;
    totalUmkms: number;
    totalFacilities: number;
    verifiedUmkms: number;
    avgHalalScore: number;
  };
  distributions: {
    destinationsByCategory: { label: string; count: number; value: number }[];
    facilitiesByType: { label: string; count: number; value: number }[];
  };
  umkmHalalStatus: {
    verified: number;
    inProgress: number;
    unverified: number;
    verifiedPercent: number;
  };
  rankings: {
    topRegions: {
      regionName: string;
      regionType: string;
      totalScore: number;
      destinationCount: number;
    }[];
    topDestinations: { id: string; name: string; score: number; category: string; city: string }[];
    topUmkms: { id: string; name: string; rating: number; category: string; city: string }[];
  };
  weeklyTrend: { label: string; submissions: number; approvals: number }[];
  mapData: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    halalScore: number | null;
    category: string;
    intensity: number;
  }[];
}

export async function getDetailedStatistics(): Promise<DetailedStatistics> {
  const now = new Date();
  const fourWeeksAgo = subDays(now, 28);

  // 1. KPI Stats
  const [
    totalDestinations,
    totalUmkms,
    totalFacilities,
    verifiedUmkms,
    avgScoreResult
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.umkm.count(),
    prisma.halalFacility.count(),
    prisma.halalCertification.count({ where: { status: "VALID" } }),
    prisma.destination.aggregate({
      _avg: {
        halalScore: true
      }
    })
  ]);

  const avgHalalScore = avgScoreResult._avg.halalScore || 0;

  // 2. Distributions
  const [categoryDistribution, facilityTypes] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { destinations: true } } }
    }),
    prisma.halalFacility.groupBy({
      by: ['facilityType'],
      _count: { _all: true }
    })
  ]);

  const destinationsByCategory = categoryDistribution.map(c => ({
    label: c.name,
    count: c._count.destinations,
    value: totalDestinations > 0 ? Math.round((c._count.destinations / totalDestinations) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const facilitiesByType = facilityTypes.map(f => ({
    label: f.facilityType || "Other",
    count: f._count._all,
    value: totalFacilities > 0 ? Math.round((f._count._all / totalFacilities) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // 3. UMKM Halal Status
  const umkmStatusCounts = await prisma.halalCertification.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  const statusMap: Record<string, number> = {
    VALID: 0,
    PENDING: 0,
    EXPIRED: 0,
    REVOKED: 0
  };
  umkmStatusCounts.forEach(c => {
    statusMap[c.status] = c._count._all;
  });

  const totalCerts = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const umkmHalalStatus = {
    verified: statusMap.VALID,
    inProgress: statusMap.PENDING,
    unverified: totalUmkms - totalCerts,
    verifiedPercent: totalCerts > 0 ? Math.round((statusMap.VALID / totalCerts) * 100) : 0
  };

  // 4. Rankings (Regions, Destinations, UMKMs)
  let topRegions = await prisma.halalReadinessScore.findMany({
    where: { regionType: "city" },
    orderBy: { totalScore: "desc" },
    take: 5
  });

  // Auto-populate if empty
  if (topRegions.length === 0) {
    await recalculateHalalReadiness();
    topRegions = await prisma.halalReadinessScore.findMany({
      where: { regionType: "city" },
      orderBy: { totalScore: "desc" },
      take: 5
    });
  }

  const [topDestinations, topUmkms] = await Promise.all([
    prisma.destination.findMany({
      orderBy: { halalScore: "desc" },
      take: 5,
      include: { category: { select: { name: true } } }
    }),
    prisma.umkm.findMany({
      orderBy: { rating: "desc" },
      take: 5,
      include: { category: { select: { name: true } } }
    })
  ]);

  // 5. Validation Trend (Last 4 Weeks)
  const validations = await prisma.halalValidation.findMany({
    where: {
      createdAt: { gte: fourWeeksAgo }
    },
    select: {
      status: true,
      createdAt: true
    }
  });

  const weeklyTrend = [0, 1, 2, 3].map(weekIndex => {
    const weekStart = subDays(now, (4 - weekIndex) * 7);
    const weekEnd = subDays(now, (3 - weekIndex) * 7);
    const weekValidations = validations.filter(v => v.createdAt >= weekStart && v.createdAt < weekEnd);
    
    return {
      label: `Week ${weekIndex + 1}`,
      submissions: weekValidations.length,
      approvals: weekValidations.filter(v => v.status === "APPROVED").length
    };
  });

  // 6. Map & Heatmap Data
  const mapDestinations = await prisma.destination.findMany({
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      status: true,
      halalScore: true,
      category: { select: { name: true } }
    }
  });

  return {
    kpi: {
      totalDestinations,
      totalUmkms,
      totalFacilities,
      verifiedUmkms,
      avgHalalScore: Math.round(avgHalalScore * 10) / 10
    },
    distributions: {
      destinationsByCategory,
      facilitiesByType
    },
    umkmHalalStatus,
    rankings: {
      topRegions,
      topDestinations: topDestinations.map(d => ({
        id: d.id,
        name: d.name,
        score: d.halalScore || 0,
        category: d.category.name,
        city: d.city || "Jakarta"
      })),
      topUmkms: topUmkms.map(u => ({
        id: u.id,
        name: u.name,
        rating: u.rating || 0,
        category: u.category?.name || "UMKM",
        city: u.address || "Jakarta"
      }))
    },
    weeklyTrend,
    mapData: mapDestinations.map(d => ({
      ...d,
      latitude: d.latitude ? Number(d.latitude) : 0,
      longitude: d.longitude ? Number(d.longitude) : 0,
      category: d.category.name,
      intensity: (d.halalScore || 0) / 100 // For heatmap
    }))
  };
}

export async function recalculateHalalReadiness() {
  const regions = await prisma.destination.groupBy({
    by: ["city", "province"]
  });

  const results = [];
  for (const region of regions) {
    if (!region.city && !region.province) continue;
    
    const city = region.city;
    const province = region.province;
    
    // Process by city
    if (city) {
      const cityScore = await calculateScore(city, "city");
      results.push(cityScore);
    }
    
    // Process by province (might duplicate if we don't track, but let's keep it simple)
    if (province) {
      const provinceScore = await calculateScore(province, "province");
      results.push(provinceScore);
    }
  }

  // Deduplicate and Upsert
  const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.regionName === v.regionName && t.regionType === v.regionType) === i);

  for (const res of uniqueResults) {
    await prisma.halalReadinessScore.upsert({
      where: { id: (await prisma.halalReadinessScore.findFirst({ where: { regionName: res.regionName, regionType: res.regionType } }))?.id || 'new-id-' + Math.random() },
      update: res,
      create: res
    });
  }

  return uniqueResults;
}

async function calculateScore(name: string, type: "city" | "province") {
  const where = type === "city" ? { city: name } : { province: name };
  
  const destinations = await prisma.destination.findMany({
    where,
    include: {
      destinationHalalFacilities: { include: { facility: true } },
      umkms: { include: { certifications: true } }
    }
  });

  const destinationCount = destinations.length;
  if (destinationCount === 0) return { regionName: name, regionType: type, totalScore: 0 };

  let totalFacilityScore = 0;
  let totalFoodScore = 0;
  let totalWorshipScore = 0;

  destinations.forEach(d => {
    totalFacilityScore += d.destinationHalalFacilities.length;
    
    const validUmkms = d.umkms.filter(u => u.certifications.some(c => c.status === "VALID")).length;
    totalFoodScore += validUmkms;

    const worshipFacilities = d.destinationHalalFacilities.filter(f => 
      ["mushola", "masjid", "tempat_ibadah"].includes(f.facility.facilityType?.toLowerCase() || "")
    ).length;
    totalWorshipScore += worshipFacilities;
  });

  const halalFacilityScore = totalFacilityScore / destinationCount;
  const halalFoodScore = totalFoodScore / destinationCount;
  const worshipAccessScore = totalWorshipScore / destinationCount;
  const transportAccessScore = 0; // Placeholder

  const totalScore = (halalFacilityScore + halalFoodScore + worshipAccessScore) / 3;

  let recommendation = "";
  if (worshipAccessScore < 0.5) recommendation = "Prioritas intervensi: tambah fasilitas ibadah. ";
  if (halalFoodScore < 0.5) recommendation += "Prioritas intervensi: tambah atau validasi UMKM halal. ";
  if (totalScore > 2) recommendation = "Wilayah siap mendukung wisata halal.";
  else if (!recommendation) recommendation = "Wilayah berkembang untuk wisata halal.";

  return {
    regionName: name,
    regionType: type,
    destinationCount,
    halalFacilityScore,
    halalFoodScore,
    worshipAccessScore,
    transportAccessScore,
    totalScore,
    recommendation,
    calculatedAt: new Date()
  };
}

export async function getHalalReadinessDashboard(regionType: "city" | "province") {
  return await prisma.halalReadinessScore.findMany({
    where: { regionType },
    orderBy: { totalScore: "desc" }
  });
}
