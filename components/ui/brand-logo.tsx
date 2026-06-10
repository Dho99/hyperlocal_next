import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    priority?: boolean;
    size?: "sm" | "md" | "lg";
}

const mobileSizeClass = {
    sm: "h-9",
    md: "h-11",
    lg: "h-14",
};

const desktopSizeClass = {
    sm: "h-28",
    md: "h-32",
    lg: "h-36",
};

export function BrandLogo({
    className,
    priority = false,
    size = "md",
}: BrandLogoProps) {
    return (
        <>
            {/* Desktop Logo */}
            <Image
                src="/logo/Logo_Desktop.png"
                alt="Logo Halal Tourism"
                width={1501}
                height={437}
                priority={priority}
                className={cn(
                    "hidden md:block w-auto object-contain",
                    desktopSizeClass[size],
                    className
                )}
            />
            {/* Mobile Logo */}
            <Image
                src="/logo/Logo_Mobile.png"
                alt="Logo Halal Tourism"
                width={677}
                height={838}
                priority={priority}
                className={cn(
                    "block md:hidden w-auto object-contain",
                    mobileSizeClass[size],
                    className
                )}
            />
        </>
    );
}
