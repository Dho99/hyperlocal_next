import { getUmkmDetail } from "@/lib/services/umkm-service";
import { notFound } from "next/navigation";
import { HeroSection } from "@/fitur/umkm/components/hero-section";
import { AboutSection } from "@/fitur/umkm/components/about-section";
import { FacilitiesSection } from "@/fitur/umkm/components/facilities-section";
import { LocationSection } from "@/fitur/umkm/components/location-section";
import { ReviewSection } from "@/fitur/umkm/components/review-section";
import { OperatingHoursSidebar } from "@/fitur/umkm/components/operating-hours-sidebar";
import { ScrollReveal } from "@/fitur/umkm/components/scroll-reveal";

interface UmkmDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function UmkmDetailPage({
    params,
}: UmkmDetailPageProps) {
    const { id } = await params;
    const umkm = await getUmkmDetail(id, "public");

    if (!umkm) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-stone-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6 sm:space-y-8">
                <HeroSection umkm={umkm} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-12">
                        <AboutSection description={umkm.description} />
                        <FacilitiesSection
                            facilities={umkm.destinationFacilities}
                        />
                        <LocationSection umkm={umkm} />
                        <ReviewSection
                            umkmId={umkm.id}
                            initialReviews={umkm.reviews}
                        />
                    </div>

                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <OperatingHoursSidebar
                            id={umkm.id}
                            slug={umkm.slug}
                            openingHours={umkm.openingHours}
                            phone={umkm.phone}
                            latitude={umkm.latitude}
                            longitude={umkm.longitude}
                            address={umkm.address}
                            name={umkm.name}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
