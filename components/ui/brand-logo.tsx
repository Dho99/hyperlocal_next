import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    priority?: boolean;
    size?: "sm" | "md" | "lg";
}

const sizeClass = {
    sm: "h-9",
    md: "h-11",
    lg: "h-14",
};

export function BrandLogo({
    className,
    priority = false,
    size = "md",
}: BrandLogoProps) {
    return (
        <Image
            src="/meta_logo.png"
            alt="Logo Halal Tourism"
            width={476}
            height={564}
            priority={priority}
            sizes="56px"
            className={cn("w-auto object-contain", sizeClass[size], className)}
        />
    );
}
