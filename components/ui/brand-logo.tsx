"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    priority?: boolean;
    size?: "sm" | "md" | "lg";
    width?: number;
    height?: number;
    fixedDark?: boolean;
}

const iconSizeClass = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-14 w-auto",
};

export function BrandLogo({
    className,
    priority = false,
    size = "sm",
    width = 1463,
    height = 448,
    fixedDark = false,
}: BrandLogoProps) {
    return (
        <div className={cn("flex items-center", className)}>
            {fixedDark ? (
                <Image
                    src="/logo/safar_admin_dark.png"
                    alt="Safar"
                    width={width}
                    height={height}
                    priority={priority}
                    className={cn("shrink-0 object-contain block", iconSizeClass[size])}
                />
            ) : (
                <>
                    <Image
                        src="/logo/safar.png"
                        alt="Safar"
                        width={width}
                        height={height}
                        priority={priority}
                        className={cn("shrink-0 object-contain block dark:hidden", iconSizeClass[size])}
                    />
                    <Image
                        src="/logo/safar_admin_dark.png"
                        alt="Safar"
                        width={width}
                        height={height}
                        priority={priority}
                        className={cn("shrink-0 object-contain hidden dark:block", iconSizeClass[size])}
                    />
                </>
            )}
        </div>
    );
}
