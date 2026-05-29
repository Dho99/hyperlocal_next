import { ChevronRight } from "lucide-react";
import { faqs } from "@/fitur/data/landing";

export function FaqSection() {
    return (
        <section
            className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="faq"
        >
            <div className="text-center">
                <h2 className="font-heading text-3xl font-semibold">
                    FAQ Perjalanan Halal
                </h2>
                <p className="mt-2 text-sm text-[#494551]">
                    Jawaban singkat untuk hal yang paling sering ditanyakan.
                </p>
            </div>
            <div className="mt-8 space-y-3">
                {faqs.map((faq) => (
                    <details
                        className="group rounded-xl border border-[#cbc4d2]/60 bg-white p-5 shadow-sm"
                        key={faq.question}
                    >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold">
                            {faq.question}
                            <ChevronRight className="size-5 shrink-0 text-[#4f378a] transition group-open:rotate-90" />
                        </summary>
                        <p className="mt-3 text-sm leading-6 text-[#494551]">
                            {faq.answer}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    );
}
