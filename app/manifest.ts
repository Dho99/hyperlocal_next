import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "SAFAR - Priangan Halal",
        short_name: "SAFAR",
        description:
            "Platform penemuan destinasi, kuliner, penginapan, dan fasilitas halal berbasis insight lokal.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f766e",
        lang: "id",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
