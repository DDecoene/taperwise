import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports
  basePath: '/taperwise', // Add this if deploying to GitHub Pages under a sub-path
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;