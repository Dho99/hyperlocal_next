import { ScrollReveal } from "./scroll-reveal";

interface AboutSectionProps {
    description: string | null;
}

export function AboutSection({ description }: AboutSectionProps) {
    if (!description) return null;

    return (
        <ScrollReveal>
            <section>
                <h2 className="mb-3 text-xl font-bold text-emerald-900">
                    Tentang
                </h2>
                <p className="leading-relaxed text-stone-700">{description}</p>
            </section>
        </ScrollReveal>
    );
}
