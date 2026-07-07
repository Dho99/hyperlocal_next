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
                src: "/logo/logo.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/logo/logo.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
