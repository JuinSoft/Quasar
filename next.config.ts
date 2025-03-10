import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_COVALENT_API_KEY: process.env.NEXT_PUBLIC_COVALENT_API_KEY,
  },
  images: {
    domains: ['lcw.nyc3.cdn.digitaloceanspaces.com'],
  },
  // Ignore specific build warnings
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ignore .md files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    
    return config;
  },
};

export default nextConfig;
