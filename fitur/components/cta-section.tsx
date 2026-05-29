import { ChevronRight } from "lucide-react";

export function CtaSection() {
    return (
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#4f378a] px-6 py-12 text-center text-white shadow-xl shadow-[#4f378a]/20">
                <p className="font-heading text-sm font-semibold text-[#cfbcff]">
                    Siap mulai perjalanan yang lebih tenang?
                </p>
                <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
                    Temukan destinasi halal, fasilitas terdekat, dan rute
                    terbaik dalam satu tempat.
                </h2>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <a
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#4f378a]"
                        href="#popular"
                    >
                        Mulai Eksplorasi
                        <ChevronRight className="size-4" />
                    </a>
                    <a
                        className="inline-flex items-center justify-center rounded-lg border border-white/35 px-5 py-3 text-sm font-bold text-white"
                        href="#map"
                    >
                        Lihat Peta
                    </a>
                </div>
            </div>
        </section>
    );
}
