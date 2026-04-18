import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // turbopack.root pointing to monorepo root is only needed for local dev.
  // Omit it in CI/production to avoid path resolution issues.
  ...(process.env.NODE_ENV !== "production" && {
    turbopack: {
      root: path.resolve(__dirname, ".."),
    },
  }),
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
