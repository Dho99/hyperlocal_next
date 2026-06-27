import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
    priority?: boolean;
    size?: "sm" | "md" | "lg";
}

const iconSizeClass = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-14 w-auto",
};

const textSizeClass = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
};

export function BrandLogo({
    className,
    priority = false,
    size = "sm",
}: BrandLogoProps) {
    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            <Image
                src="/logo/safar.png"
                alt=""
                width={1463}
                height={448}
                priority={priority}
                className={cn("shrink-0 object-contain", iconSizeClass[size])}
            />
            <span
                className={cn(
                    "font-heading font-bold leading-none tracking-widest whitespace-nowrap",
                    textSizeClass[size],
                )}
            >
                {/* <span className={isLight ? "text-white" : "text-emerald-900"}> */}
                {/*   SAFAR */}
                {/* </span> */}
                {/* <span className={isLight ? "text-emerald-200" : "text-[#44a840]"}> */}
                {/*     Halal */}
                {/* </span>{" "} */}
                {/* <span className={isLight ? "text-cyan-100" : "text-[#168f99]"}> */}
                {/*     Tourism */}
                {/* </span> */}
            </span>
        </div>
    );
}
