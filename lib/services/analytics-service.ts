import { prisma } from "@/lib/prisma";
import { 
  InteractionType, 
  SentimentLabel, 
  ValidationStatus 
} from "@/lib/generated/prisma/client";
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function trackInteraction(data: {
  destinationId: string;
  userId?: string;
  type: InteractionType;
  keyword?: string;
  source?: string;
  metadata?: any;
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
  let periodStart: Date;
  
  if (period === "daily") periodStart = startOfDay(now);
  else if (period === "weekly") periodStart = startOfWeek(now);
  else periodStart = startOfMonth(now);

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

  const destScores: Record<string, any> = {};
  
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

    const destData: Record<string, any> = {};
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
