import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@shared/saas-core'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared/saas-core': require('path').resolve(__dirname, './shared-saas-core'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@shared/saas-core': './shared-saas-core',
    },
  },
};

export default nextConfig;
