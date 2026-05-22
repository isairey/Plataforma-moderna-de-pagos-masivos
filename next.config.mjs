/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@stellar/freighter-api"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stellar/freighter-api": "@stellar/freighter-api/build/index.min.js",
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "@stellar/freighter-api": "@stellar/freighter-api/build/index.min.js",
      },
    },
  },
}

export default nextConfig
