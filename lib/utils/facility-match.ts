export type FacilityCanonical =
    | "WORSHIP"
    | "TOILET"
    | "PARKING"
    | "HALAL_CERTIFICATE";

const WORSHIP_TERMS = [
    "masjid",
    "mesjid",
    "musala",
    "musola",
    "mushala",
    "mushola",
    "musholla",
    "musolla",
    "mosque",
    "prayer",
    "religious",
    "worship",
    "ibadah",
    "tempat wudu",
    "tempat wudhu",
    "wudhu",
    "wudu",
];

const FACILITY_TERMS: Array<{ canonical: FacilityCanonical; terms: string[] }> = [
    { canonical: "WORSHIP", terms: WORSHIP_TERMS },
    { canonical: "TOILET", terms: ["toilet", "wc", "kamar mandi", "restroom"] },
    { canonical: "PARKING", terms: ["parkir", "parking"] },
    {
        canonical: "HALAL_CERTIFICATE",
        terms: ["sertifikat halal", "sertifikasi halal", "halal certificate"],
    },
];

const ALL_FACILITY_TERMS = FACILITY_TERMS.flatMap((entry) => entry.terms);

function normalize(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Detects a facility keyword in the user's query. */
export function detectFacilityKeyword(
    query: string,
): { canonical: FacilityCanonical; matched: string } | null {
    const normalized = ` ${normalize(query)} `;
    for (const entry of FACILITY_TERMS) {
        const matched = entry.terms.find((term) => normalized.includes(` ${term} `));
        if (matched) return { canonical: entry.canonical, matched };
    }
    return null;
}

/** Detects a request for the full facility list, not a specific facility. */
export function detectFacilityListKeyword(query: string): boolean {
    const normalized = normalize(query);
    return (
        /(?:fasilitas\s+(?:apa|apa saja|yang tersedia|tersedia)|daftar\s+fasilitas|semua\s+fasilitas|apa\s+saja\s+fasilitas)/.test(
            normalized,
        ) ||
        (normalized.includes("fasilitas") &&
            /(?:apa|saja|semua|daftar|tersedia)/.test(normalized))
    );
}

/** Removes intent words and facility words before matching a destination name. */
export function cleanDestinationQuery(query: string): string {
    const remove = new Set([
        ...ALL_FACILITY_TERMS.flatMap((term) => term.split(" ")),
        "cari",
        "carikan",
        "cek",
        "periksa",
        "apakah",
        "apa",
        "adakah",
        "dimana",
        "mana",
        "bagaimana",
        "temukan",
        "fasilitas",
        "saja",
        "semua",
        "daftar",
        "tersedia",
        "dimiliki",
        "miliki",
        "tampilkan",
        "lihat",
        "tunjukkan",
        "rekomendasi",
        "rekomendasikan",
        "sarankan",
        "saran",
        "di",
        "ke",
        "dari",
        "untuk",
        "yang",
        "ada",
        "sekitar",
        "halal",
        "wisata",
        "destinasi",
        "tempat",
        "lokasi",
        "tolong",
        "bantu",
        "dong",
        "deh",
        "ya",
        "yuk",
    ]);

    return normalize(query)
        .split(" ")
        .filter((token) => token.length > 1 && !remove.has(token))
        .join(" ")
        .trim();
}

/**
 * True when every meaningful query token appears in the destination name.
 * Two or more tokens avoids turning a city query ("bandung") into a
 * destination match.
 */
export function isStrongDestinationNameMatch(
    cleanedQuery: string,
    destinationName: string,
): boolean {
    const queryTokens = cleanedQuery.split(" ").filter(Boolean);
    if (queryTokens.length < 2) return false;

    const name = normalize(destinationName);
    return queryTokens.every((token) => name.includes(token));
}

/** Checks whether a facility row satisfies the requested facility keyword. */
export function matchesFacilityQuery(
    facility: { name: string; facilityType: string | null },
    query: string,
): boolean {
    const detected = detectFacilityKeyword(query);
    const facilityText = normalize(
        `${facility.name} ${facility.facilityType ?? ""}`,
    );
    const queryText = normalize(query);

    if (queryText && facilityText.includes(queryText)) return true;

    if (!detected) return false;

    if (detected.canonical === "WORSHIP") {
        return WORSHIP_TERMS.some((term) => facilityText.includes(term));
    }

    const terms =
        FACILITY_TERMS.find((entry) => entry.canonical === detected.canonical)
            ?.terms ?? [];
    return terms.some((term) => facilityText.includes(term));
}

/** User-facing label used by the facility-check route. */
export function facilityCanonicalLabel(canonical: FacilityCanonical): string {
    switch (canonical) {
        case "WORSHIP":
            return "tempat ibadah";
        case "TOILET":
            return "toilet";
        case "PARKING":
            return "parkir";
        case "HALAL_CERTIFICATE":
            return "sertifikat halal";
    }
}
