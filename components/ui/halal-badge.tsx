import Image from "next/image";
import type { ReactNode } from "react";

interface BadgeConfig {
    label: string;
    imageSrc: string;
    containerClass: string;
    textClass: string;
}

function getBadgeConfig(score: number): BadgeConfig {
    if (score >= 80) {
        return {
            label: "Sangat siap",
            imageSrc: "/Tag/Tag_Hijau.png",
            containerClass: "",
            textClass: "",
        };
    }
    if (score >= 60) {
        return {
            label: "Siap dengan perbaikan kecil",
            imageSrc: "/Tag/Tag_Kuning.png",
            containerClass: "",
            textClass: "",
        };
    }
    if (score >= 40) {
        return {
            label: "Perlu pengembangan",
            imageSrc: "/Tag/Tag_Oren.png",
            containerClass: "",
            textClass: "",
        };
    }
    return {
        label: "Belum siap",
        imageSrc: "/Tag/Tag_Merah.png",
        containerClass: "",
        textClass: "",
    };
}

interface HalalBadgeProps {
    score: number | null | undefined;
    className?: string;
    inline?: boolean;
    /** Absolute placement when `inline` is false. */
    placement?: "card" | "corner";
}

export function HalalBadge({
    score,
    className = "",
    inline = false,
    placement = "card",
}: HalalBadgeProps): ReactNode {
    if (score == null) return null;

    const config = getBadgeConfig(score);

    if (inline) {
        return (
            <div
                className={`relative inline-block h-[72px] w-[96px] shrink-0 drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${className}`}
                title={`${config.label} — Skor ${score}`}
            >
                <Image
                    src={config.imageSrc}
                    alt={config.label}
                    fill
                    sizes="96px"
                    className="object-contain"
                />
            </div>
        );
    }

    const placementClass =
        placement === "corner"
            ? "-top-8 -left-6 w-[104px] h-[78px]"
            : "-top-[31px] -left-[52px] w-[120px] h-[90px]";

    return (
        <div
            className={`absolute ${placementClass} z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${className}`}
        >
            <Image
                src={config.imageSrc}
                alt={config.label}
                fill
                sizes="120px"
                className="object-contain"
                priority
            />
        </div>
    );
}

