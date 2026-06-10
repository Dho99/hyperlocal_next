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
}

export function HalalBadge({
    score,
    className = "",
}: HalalBadgeProps): ReactNode {
    if (score == null) return null;

    const config = getBadgeConfig(score);

    return (
        <div
            className={`absolute -top-[31px] -left-[52px] w-[120px] h-[90px] z-20 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${className}`}
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

