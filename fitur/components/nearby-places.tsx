import { nearbyPlaces } from "@/fitur/data/landing";

export function NearbyPlaces() {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="nearby"
        >
            <div className="grid gap-6 rounded-xl border border-[#cbc4d2]/60 bg-white/65 p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#4f378a]">
                        Rekomendasi Sekitar
                    </p>
                    <h2 className="mt-3 font-heading text-3xl font-semibold">
                        Fasilitas halal dekat tujuanmu
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[#494551]">
                        Kombinasikan destinasi utama dengan masjid, kuliner
                        halal, dan penginapan ramah muslim yang berada dalam
                        radius dekat.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {nearbyPlaces.map((place) => (
                        <article
                            className="rounded-xl border border-[#e6e0e9] bg-white p-5"
                            key={place.title}
                        >
                            <div className="flex size-11 items-center justify-center rounded-lg bg-[#e9ddff] text-[#4f378a]">
                                <place.icon className="size-5" />
                            </div>
                            <h3 className="mt-4 font-heading text-base font-bold">
                                {place.title}
                            </h3>
                            <p className="mt-2 text-sm text-[#494551]">
                                {place.distance} - {place.type}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
