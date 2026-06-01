import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "HyperLocal - Eksplorasi Halal Indonesia",
        short_name: "HyperLocal",
        description:
            "Platform penemuan destinasi, kuliner, penginapan, dan fasilitas halal berbasis data hyperlocal.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f766e",
        icons: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
