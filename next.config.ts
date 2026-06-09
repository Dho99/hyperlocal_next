import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "plus.unsplash.com",
            },
        ],
    },
    async redirects() {
        return [
            {
                source: "/login",
                destination: "/halal",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
