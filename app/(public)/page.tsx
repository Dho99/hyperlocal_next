import { HeroSection } from "@/components/public/home/hero-section";
import {
    getLandingData,
    formatNumber,
    reasons,
    steps,
    faqs,
} from "@/fitur/data/landing-data";
import { WhyChooseUs } from "@/fitur/components/why-choose-us";
import { CategoriesSection } from "@/fitur/components/categories-section";
import { PopularSection } from "@/fitur/components/popular-section";
import { VerifiedDestinations } from "@/fitur/components/verified-destinations";
import { NearbyPlaces } from "@/fitur/components/nearby-places";
import { RouteInspiration } from "@/fitur/components/route-inspiration";
import { HowItWorks } from "@/fitur/components/how-it-works";
import { FacilitiesHighlights } from "@/fitur/components/facilities-highlights";
import { Testimonials } from "@/fitur/components/testimonials";
import { FaqSection } from "@/fitur/components/faq-section";
import { CtaSection } from "@/fitur/components/cta-section";
import { Footer } from "@/fitur/components/footer";

export default async function Home() {
    const data = await getLandingData();

    return (
        <main className="min-h-screen bg-[#fdf7ff] text-[#1d1b20]">
            <HeroSection
                stats={[
                    {
                        label: "Total Destinasi",
                        value: formatNumber(data.stats.totalDestinations),
                        icon: "map",
                    },
                    {
                        label: "Total UMKM",
                        value: formatNumber(data.stats.totalUmkms),
                        icon: "utensils",
                    },
                    {
                        label: "Terverifikasi",
                        value: `${data.stats.verifiedPercent}%`,
                        icon: "shield",
                    },
                ]}
            />
            <WhyChooseUs items={reasons} />
            <CategoriesSection categories={data.categories} />
            <PopularSection items={data.popular} />
            <VerifiedDestinations items={data.verified} />
            <NearbyPlaces items={data.topUmkmCards} />
            <RouteInspiration items={data.routeIdeas} />
            <HowItWorks items={steps} />
            <FacilitiesHighlights items={data.facilityHighlights} />
            <Testimonials items={data.reviewCards} />
            <FaqSection items={faqs} />
            <CtaSection
                totalDestinations={data.stats.totalDestinations}
                totalUmkms={data.stats.totalUmkms}
            />
            <Footer stats={data.stats} />
        </main>
    );
}
