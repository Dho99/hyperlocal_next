import Image from "next/image";
import { CheckCircle2, MapPin } from "lucide-react";
import { verifiedDestinations } from "@/fitur/data/landing";
import { SectionHeading } from "@/components/public/home/section-heading";

export function VerifiedDestinations() {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="verified"
        >
            <SectionHeading
                action="Lihat Verifikasi"
                actionHref="#nearby"
                eyebrow="Pilihan destinasi dengan skor kesiapan halal tertinggi."
                title="Destinasi Terverifikasi"
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {verifiedDestinations.map((destination) => (
                    <article
                        className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-lg shadow-[#0f172a]/5"
                        key={destination.title}
                    >
                        <div className="relative aspect-[16/9]">
                            <Image
                                alt={destination.title}
                                className="object-cover"
                                fill
                                sizes="(min-width: 1024px) 33vw, 100vw"
                                src={destination.image}
                            />
                            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                                <CheckCircle2 className="size-4" />
                                Verified Halal
                            </div>
                            <div className="absolute bottom-4 right-4 rounded-full bg-[#00856f] px-3 py-2 text-sm font-bold text-white shadow-lg">
                                {destination.score}%
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-heading text-xl font-bold">
                                {destination.title}
                            </h3>
                            <p className="mt-2 flex items-center gap-2 text-sm text-[#494551]">
                                <MapPin className="size-4" />
                                {destination.location}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
