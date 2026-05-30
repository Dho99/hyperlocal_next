const CATEGORY_STYLES: Record<string, { color: string; label: string }> = {
    "Wisata Alam": { color: "#16a34a", label: "Wisata Alam" },
    "Pantai": { color: "#2563eb", label: "Pantai" },
    "Kuliner Halal": { color: "#ea580c", label: "Kuliner Halal" },
    "Kuliner": { color: "#ea580c", label: "Kuliner" },
    "Penginapan": { color: "#d97706", label: "Penginapan" },
    "Hotel": { color: "#d97706", label: "Hotel" },
    "Masjid": { color: "#7c3aed", label: "Masjid" },
    "Tempat Ibadah": { color: "#7c3aed", label: "Tempat Ibadah" },
    "Wisata Budaya": { color: "#ec4899", label: "Wisata Budaya" },
    "Sejarah": { color: "#ec4899", label: "Sejarah" },
    "Oleh-Oleh": { color: "#14b8a6", label: "Oleh-Oleh" },
    "Belanja": { color: "#14b8a6", label: "Belanja" },
};

const DEFAULT_COLOR = "#6b21a8";

export function getCategoryColor(category?: string): string {
    if (!category) return DEFAULT_COLOR;
    return CATEGORY_STYLES[category]?.color ?? DEFAULT_COLOR;
}

export function getCategoryLabel(category?: string): string {
    if (!category) return "Destinasi";
    return CATEGORY_STYLES[category]?.label ?? category;
}

export function getAllCategoryNames(): string[] {
    return Object.keys(CATEGORY_STYLES);
}

export function createPinSvg(color: string): string {
    return `<svg width="28" height="42" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`;
}
