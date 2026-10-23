import { cn } from "@/lib/utils";

interface PhotoAttributionProps {
    caption?: string | null;
    className?: string;
}

function safeHttpsUrl(value: string): string | null {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

export function PhotoAttribution({ caption, className }: PhotoAttributionProps) {
    if (!caption) return null;
    const match = caption.match(
        /^Foto:\s*.+?\s+—\s+(.+?)\.\s+Lisensi:\s+(.+?)\s+\((https:\/\/[^)]+)\)\.\s+Sumber:\s+(https:\/\/\S+)$/,
    );
    if (!match) return null;

    const [, creator, license, rawLicenseUrl, rawSourceUrl] = match;
    const licenseUrl = safeHttpsUrl(rawLicenseUrl);
    const sourceUrl = safeHttpsUrl(rawSourceUrl);
    if (!licenseUrl || !sourceUrl) return null;

    return (
        <div className={cn("flex flex-wrap items-center gap-x-1.5 text-[10px] leading-snug text-muted-foreground", className)}>
            <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
            >
                Foto: {creator}
            </a>
            <span aria-hidden="true">·</span>
            <a
                href={licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
            >
                {license}
            </a>
        </div>
    );
}
