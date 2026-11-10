export type MatchEntity = {
    name: string;
    city: string | null;
    province: string | null;
};

export type MatchEvidence = {
    title: string;
    description?: string;
    /** Distance from the entity to the file/OSM object, when known. */
    distanceMeters?: number | null;
    source: "osm" | "commons" | "commons-geo" | "openverse" | "mapillary";
};

export type MatchStatus = "auto-accept" | "review" | "reject";

export type MatchDecision = {
    status: MatchStatus;
    score: number;
    reasons: string[];
};

const GENERIC_WORDS = new Set([
    "wisata", "objek", "obyek", "tempat", "kabupaten", "kota", "provinsi",
    "indonesia", "jawa", "barat", "hotel", "penginapan", "restoran", "rumah",
    "makan", "warung", "toko", "usaha", "masjid", "pantai", "dan", "di", "ke",
    "the", "desa", "taman", "alam", "kuliner", "khas", "souvenir", "oleh",
    "air", "terjun", "curug", "situ", "telaga", "danau", "bukit", "gunung",
    "puncak", "kawasan", "area", "park", "waterfall", "beach", "lake", "hill",
    "mountain", "rekreasi", "pemandian", "kolam", "waterpark", "waterboom",
]);

const GENERIC_SINGLE_TOKENS = new Set([
    "situ", "hama", "pirusa", "pico", "taman", "pantai", "curug", "danau",
    "gunung", "bukit", "masjid", "alam", "wisata", "desa", "kampung", "park",
    "hill", "beach", "lake", "sawah", "kebun", "lapangan", "monumen",
]);

const NOISE_PATTERN =
    /(ISS\d|landsat|sentinel|satellite|aerial|orthophoto|map of|peta|diagram|logo|coat of arms|banknote|stamp|graph|chart|poster|screenshot|carcinoma|mammogram)/i;

export function normalize(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

export function tokens(value: string): string[] {
    return normalize(value).split(/\s+/).filter(Boolean);
}

export function meaningfulTokens(value: string): string[] {
    return [...new Set(tokens(value).filter(
        (token) => token.length > 2 && !GENERIC_WORDS.has(token),
    ))];
}

export function isNoiseText(value: string): boolean {
    return NOISE_PATTERN.test(value) || /\.(pdf|svg|tif|tiff|webm|ogv)$/i.test(value);
}

function intersectionCount(left: string[], right: Set<string>): number {
    return left.filter((token) => right.has(token)).length;
}

export function evaluateCandidate(
    entity: MatchEntity,
    evidence: MatchEvidence,
): MatchDecision {
    const reasons: string[] = [];
    const entityName = normalize(entity.name);
    const entityTokens = meaningfulTokens(entity.name);
    const titleText = normalize(evidence.title);
    const titleTokens = new Set(tokens(evidence.title));
    const descriptionTokens = new Set(tokens(evidence.description ?? ""));

    if (isNoiseText(evidence.title)) {
        return { status: "reject", score: 0, reasons: ["file ditandai noise"] };
    }

    if (entityName.length < 3) {
        return { status: "reject", score: 0, reasons: ["nama entitas terlalu pendek"] };
    }

    const exactName = entityName === titleText;
    const sharedTitle = intersectionCount(entityTokens, titleTokens);
    const sharedDescription = intersectionCount(entityTokens, descriptionTokens);

    if (!exactName && sharedTitle === 0) {
        return {
            status: "reject",
            score: 0,
            reasons: ["judul file tidak memuat token nama entitas"],
        };
    }

    const singleToken = entityTokens.length <= 1;
    if (
        singleToken
        && (entityTokens[0]?.length ?? 0) < 5
        && !exactName
    ) {
        return {
            status: "reject",
            score: 0,
            reasons: ["nama satu token terlalu generik"],
        };
    }
    if (
        singleToken
        && GENERIC_SINGLE_TOKENS.has(entityTokens[0] ?? "")
        && !exactName
    ) {
        return {
            status: "reject",
            score: 0,
            reasons: ["nama satu token generik tanpa exact match"],
        };
    }

    let score = 0;
    if (exactName) {
        score += 5;
        reasons.push("exact name +5");
    }
    const titleScore = Math.min(sharedTitle, 3) * 3;
    if (titleScore > 0) {
        score += titleScore;
        reasons.push(`${sharedTitle} token judul +${titleScore}`);
    }
    const descriptionScore = Math.min(sharedDescription, 2);
    if (descriptionScore > 0) {
        score += descriptionScore;
        reasons.push(`${sharedDescription} token deskripsi +${descriptionScore}`);
    }

    const distance = evidence.distanceMeters;
    const locationEvidence = distance !== null && distance !== undefined && distance <= 500;
    if (distance !== null && distance !== undefined) {
        if (distance <= 300) {
            score += 3;
            reasons.push(`jarak ${Math.round(distance)}m +3`);
        } else if (distance <= 500) {
            score += 2;
            reasons.push(`jarak ${Math.round(distance)}m +2`);
        } else if (distance > 500) {
            reasons.push(`jarak ${Math.round(distance)}m di luar radius`);
        }
    }

    const locationTokens = new Set([
        ...meaningfulTokens(entity.city ?? ""),
        ...meaningfulTokens(entity.province ?? ""),
    ]);
    const cityMatches = intersectionCount([...locationTokens], titleTokens)
        + intersectionCount([...locationTokens], descriptionTokens);
    if (cityMatches > 0) {
        score += 1;
        reasons.push("token kota/provinsi +1");
    }

    const strongNameEvidence = exactName
        || sharedTitle >= Math.min(2, entityTokens.length)
        || (
            entityTokens.length === 1
            && sharedTitle === 1
            && (entityTokens[0]?.length ?? 0) >= 5
        );
    if (!strongNameEvidence) {
        reasons.push("bukti nama lemah (butuh exact atau >=2 token judul)");
    }
    if (!locationEvidence) {
        reasons.push("tidak ada bukti lokasi <=500m");
    }
    if (evidence.source === "commons" && !locationEvidence) {
        reasons.push("pencarian judul tanpa GPS tidak boleh auto-accept");
    }

    // Name-only matching is never enough unless the exact name is unique to
    // the file AND there is location evidence. This prevents "Pirusa" ->
    // Sarajevo or "situ" -> carcinoma in situ.
    const singleDistinctiveName = entityTokens.length === 1
        && sharedTitle === 1
        && (entityTokens[0]?.length ?? 0) >= 5;
    const autoThreshold = singleDistinctiveName ? 6 : 8;
    if (score >= autoThreshold && strongNameEvidence && locationEvidence) {
        return { status: "auto-accept", score, reasons };
    }
    if (score >= 5 && (strongNameEvidence || locationEvidence)) {
        return { status: "review", score, reasons };
    }
    return { status: "reject", score, reasons };
}
