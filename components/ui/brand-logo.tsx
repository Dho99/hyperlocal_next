import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

const iconSizeClass = {
  sm: "h-10 w-8",
  md: "h-12 w-10",
  lg: "h-14 w-11",
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
  variant = "default",
}: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo/logo.png"
        alt=""
        width={1000}
        height={1000}
        priority={priority}
        className={cn(
          "shrink-0 object-contain -translate-y-1",
          iconSizeClass[size]
        )}
      />
      <span
        className={cn(
          "font-heading font-bold leading-none tracking-widest whitespace-nowrap",
          textSizeClass[size]
        )}
      >
        <span className={isLight ? "text-white" : "text-[var(--navbar-active)]"}>
          SAFAR
        </span>
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
