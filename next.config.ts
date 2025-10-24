import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@sanity/client'],
  // Disable static optimization for admin pages
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Disable static optimization for admin pages
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Exclude admin pages from static generation
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  // Exclude admin pages from static generation
  async generateBuildId() {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
