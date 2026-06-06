import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    size?: "sm" | "md";
}

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
    const cls = size === "md" ? "size-5" : "size-3.5";
    return (
        <span className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        cls,
                        i < Math.round(rating)
                            ? "fill-[#e7c365] text-[#e7c365]"
                            : "fill-[#e6e0e9] text-[#e6e0e9]",
                    )}
                />
            ))}
        </span>
    );
}
