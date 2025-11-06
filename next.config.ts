import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
      serverActions: {
      /**
       * Allows adjusting body parser size limit for server actions.
       */
      bodySizeLimit: "7mb"
      },
    },
    images: {
      remotePatterns: [
        new URL('https://placehold.co/**'),
        new URL('https://cdn.weatherapi.com/**'),
        {
          protocol: 'https',
          hostname: 'cdn.sanity.io',
        },
      ],
    },
    async rewrites() {
      return [
        {
          source: "/relay-5LNQi9/static/:path*",
          destination: "https://eu-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/relay-5LNQi9/:path*",
          destination: "https://eu.i.posthog.com/:path*",
        },
        // Umami analytics rewrites to bypass Adblockers
        {
          source: "/js/analytics.js",
          destination: "https://cloud.umami.is/script.js",
        },
      ];
    },
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
