import type { DestinationCard } from "@/fitur/data/landing-data";
import { SectionHeading } from "@/components/public/home/section-heading";
import { DestinationCardComponent } from "./destination-card";
import { EmptyState } from "./empty-state";

interface PopularSectionProps {
    items: DestinationCard[];
}

export function PopularSection({ items }: PopularSectionProps) {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8"
            id="popular"
        >
            <SectionHeading
                action="Lihat Semua"
                actionHref="/destinasi"
                eyebrow="Diurutkan dari jumlah ulasan, rating, dan pembaruan terbaru."
                title="Rekomendasi Terpopuler"
            />
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {items.length ? (
                    items.slice(0, 4).map((destination) => (
                        <DestinationCardComponent
                            destination={destination}
                            key={destination.id}
                        />
                    ))
                ) : (
                    <EmptyState message="Belum ada destinasi approved untuk ditampilkan." />
                )}
            </div>
        </section>
    );
}
