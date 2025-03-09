import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
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
