import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports
  basePath: process.env.NODE_ENV === 'production' ? '/taperwise' : '', // Add basePath only in production
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;