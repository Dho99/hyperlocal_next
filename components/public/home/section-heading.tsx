import { ChevronRight } from "lucide-react";

interface SectionHeadingProps {
    title: string;
    eyebrow: string;
    action?: string;
    actionHref?: string;
}

export function SectionHeading({
    title,
    eyebrow,
    action,
    actionHref = "#popular",
}: SectionHeadingProps) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-[#494551]">{eyebrow}</p>
            </div>
            {action && (
                <a
                    className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#4f378a] sm:inline-flex"
                    href={actionHref}
                >
                    {action}
                    <ChevronRight className="size-4" />
                </a>
            )}
        </div>
    );
}
