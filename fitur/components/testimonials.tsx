import { Star } from "lucide-react";

const testimonials = [
    { name: "Aisyah R." },
    { name: "Budi S." },
    { name: "Dina M." },
];

export function Testimonials() {
    return (
        <section className="scroll-mt-20 bg-white/45 py-16" id="reviews">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-semibold">
                        Testimoni Traveller
                    </h2>
                    <p className="mt-2 text-sm text-[#494551]">
                        Pengalaman nyata dari mereka yang telah menjelajahi
                        destinasi pilihan kami.
                    </p>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {testimonials.map(({ name }) => (
                        <article
                            className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
                            key={name}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-[#e1d4fd] font-bold text-[#4f378a]">
                                    {name[0]}
                                </div>
                                <div>
                                    <p className="font-heading text-sm font-bold">
                                        {name}
                                    </p>
                                    <div className="mt-1 flex text-[#c9a74d]">
                                        {Array.from({ length: 5 }).map(
                                            (_, index) => (
                                                <Star
                                                    className="size-3.5 fill-current"
                                                    key={index}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-5 text-sm italic leading-7 text-[#494551]">
                                &quot;Sangat membantu menemukan restoran
                                halal saat liburan. Informasinya akurat dan
                                rekomendasinya cocok untuk keluarga.&quot;
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
