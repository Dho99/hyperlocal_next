import { HeroSection } from "@/components/public/home/hero-section";
import Navbar from "@/components/ui/navbar";
import { SectionHeading } from "@/components/public/home/section-heading";
import { AiRecommendations } from "@/components/public/home/ai-recommendations";
import { WhyChooseUs } from "@/fitur/components/why-choose-us";
import { VerifiedDestinations } from "@/fitur/components/verified-destinations";
import { NearbyPlaces } from "@/fitur/components/nearby-places";
import { RouteInspiration } from "@/fitur/components/route-inspiration";
import { HowItWorks } from "@/fitur/components/how-it-works";
import { FacilitiesHighlights } from "@/fitur/components/facilities-highlights";
import { Testimonials } from "@/fitur/components/testimonials";
import { FaqSection } from "@/fitur/components/faq-section";
import { Newsletter } from "@/fitur/components/newsletter";
import { CtaSection } from "@/fitur/components/cta-section";
import { Footer } from "@/fitur/components/footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#fdf7ff] text-[#1d1b20]">
            <Navbar />
            <HeroSection />

            <WhyChooseUs />

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8"
                id="popular"
            >
                <SectionHeading
                    eyebrow="Destinasi pilihan yang dipersonalisasi oleh AI"
                    title="Rekomendasi Untukmu"
                />
                <div className="mt-6">
                    <AiRecommendations />
                </div>
            </section>

            <VerifiedDestinations />
            <NearbyPlaces />
            <RouteInspiration />

            {/*
            <section
                className="relative h-[100vh] scroll-mt-20 overflow-hidden"
                id="map"
            >
                <HeroMapSection />
            </section>
            */}

            <HowItWorks />
            <FacilitiesHighlights />
            <Testimonials />
            <FaqSection />
            <Newsletter />
            <CtaSection />
            <Footer />
        </main>
    );
}


