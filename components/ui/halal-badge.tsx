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
            imageSrc: "/%2315803d.png",
            containerClass: "bg-green-50/90 border-green-200 text-green-700",
            textClass: "text-green-700",
        };
    }
    if (score >= 60) {
        return {
            label: "Siap (Perbaikan)",
            imageSrc: "/%23ea580c.png",
            containerClass: "bg-orange-50/90 border-orange-200 text-orange-700",
            textClass: "text-orange-700",
        };
    }
    if (score >= 40) {
        return {
            label: "Perlu pengembangan",
            imageSrc: "/%23a16207.png",
            containerClass: "bg-yellow-50/90 border-yellow-200 text-yellow-700",
            textClass: "text-yellow-700",
        };
    }
    return {
        label: "Belum siap",
        imageSrc: "/%23b91c1c.png",
        containerClass: "bg-red-50/90 border-red-200 text-red-700",
        textClass: "text-red-700",
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
            className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md ${config.containerClass} ${className}`}
        >
            <Image
                src={config.imageSrc}
                alt=""
                className="w-4 h-4 object-contain"
                width={16}
                height={16}
            />
            <span>{config.label}</span>
            <span className={config.textClass}>{score}</span>
        </div>
    );
}
