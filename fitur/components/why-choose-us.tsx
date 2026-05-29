import { reasons } from "@/fitur/data/landing";

export function WhyChooseUs() {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="why"
        >
            <div className="text-center">
                <h2 className="font-heading text-3xl font-semibold">
                    Kenapa Memilih Kami
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#494551]">
                    Kami berkomitmen memberikan pengalaman wisata yang aman,
                    nyaman, dan sesuai dengan prinsip-prinsip halal.
                </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
                {reasons.map((reason) => (
                    <article
                        className="rounded-xl border border-[#cbc4d2]/60 bg-white/55 p-7 text-center shadow-sm"
                        key={reason.title}
                    >
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e1d4fd] text-[#4f378a]">
                            <reason.icon className="size-5" />
                        </div>
                        <h3 className="mt-5 font-heading text-lg font-semibold">
                            {reason.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#494551]">
                            {reason.copy}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
