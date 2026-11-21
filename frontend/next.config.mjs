/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Pages are client-rendered behind a JWT guard (token in localStorage), so they
    // intentionally show a loading state first. Only validate segments that opt in.
    instantInsights: { validationLevel: 'manual-warning' },
  },
};

export default nextConfig;
