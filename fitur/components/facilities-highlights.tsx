import { CheckCircle2 } from "lucide-react";
import type { FacilityHighlight } from "@/fitur/data/landing-data";
import { SectionHeading } from "@/components/public/home/section-heading";

interface FacilitiesHighlightsProps {
    items: FacilityHighlight[];
}

export function FacilitiesHighlights({ items }: FacilitiesHighlightsProps) {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="facilities"
        >
            <SectionHeading
                action="Lihat Destinasi"
                actionHref="/destinasi"
                eyebrow="Ringkasan fasilitas, UMKM, sertifikasi, dan status destinasi."
                title="Highlight Fasilitas"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((facility) => (
                    <article
                        className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
                        key={facility.title}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-[#e1d4fd] text-[#4f378a]">
                                <facility.icon className="size-5" />
                            </div>
                            <CheckCircle2 className="size-5 text-[#00856f]" />
                        </div>
                        <h3 className="mt-5 font-heading text-lg font-bold">
                            {facility.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#494551]">
                            {facility.count}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
