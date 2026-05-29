import { CheckCircle2 } from "lucide-react";
import { facilities } from "@/fitur/data/landing";
import { SectionHeading } from "@/components/public/home/section-heading";

export function FacilitiesHighlights() {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="facilities"
        >
            <SectionHeading
                action="Lihat Semua"
                actionHref="#reviews"
                eyebrow="Fasilitas utama yang paling sering dicari traveller muslim."
                title="Highlight Fasilitas"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {facilities.map((facility) => (
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
