import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // turbopack.root only needed locally (monorepo root node_modules).
  // On Vercel, root dir is ui/ so the parent has no node_modules.
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
