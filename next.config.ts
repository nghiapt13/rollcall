import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: [
            "res.cloudinary.com"
        ]
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Dynamic import PrismaPlugin
            const { PrismaPlugin } = eval('require')('@prisma/nextjs-monorepo-workaround-plugin');
            config.plugins = [...config.plugins, new PrismaPlugin()];
        }
        return config;
    }
};

export default nextConfig;
