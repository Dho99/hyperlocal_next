import type { Step } from "@/fitur/data/landing-data";

interface HowItWorksProps {
    items: Step[];
}

export function HowItWorks({ items }: HowItWorksProps) {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="how-it-works"
        >
            <div className="text-center">
                <h2 className="font-heading text-3xl font-semibold">
                    Cara Kerja Hyperlocal
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#494551]">
                    Mulai dari pencarian sampai rencana perjalanan, semua
                    dibuat ringkas agar keputusan wisata lebih percaya diri.
                </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
                {items.map((step, index) => (
                    <article
                        className="relative rounded-xl border border-[#cbc4d2]/60 bg-white p-7 shadow-sm"
                        key={step.title}
                    >
                        <div className="absolute right-5 top-5 font-heading text-4xl font-bold text-[#e6e0e9]">
                            0{index + 1}
                        </div>
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#4f378a] text-white">
                            <step.icon className="size-5" />
                        </div>
                        <h3 className="mt-5 font-heading text-lg font-semibold">
                            {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#494551]">
                            {step.copy}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
