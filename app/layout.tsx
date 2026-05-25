import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

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
    title: "Hyperlocal - Eksplorasi Halal Indonesia",
    description:
        "Platform penemuan destinasi, kuliner, penginapan, dan fasilitas halal berbasis data hyperlocal.",
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
                {children} <Toaster richColors position="top-right" />
            </body>
        </html>
    );
}
