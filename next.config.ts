import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This app lives in a subfolder of a larger repo; pin the root so Turbopack
  // does not pick up the parent lockfile.
  turbopack: { root: __dirname },
};

export default nextConfig;
