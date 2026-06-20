export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-heading",
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Eksplorasi Halal Indonesia",
    description:
        "Platform penemuan destinasi, kuliner, penginapan, dan fasilitas halal berbasis insight lokal.",
    icons: {
        icon: [
            {
                url: "/favicon-transparent-v2.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        shortcut: "/favicon-transparent-v2.png",
        apple: [
            {
                url: "/apple-touch-icon-transparent.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                montserrat.variable,
                inter.variable,
                "font-sans",
            )}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    <ServiceWorkerRegistration />
                    <NextTopLoader />
                    {children} <Toaster richColors position="top-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}
