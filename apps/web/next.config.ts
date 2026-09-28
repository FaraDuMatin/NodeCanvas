import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@node-canvas/schema", "@node-canvas/graph"],
  turbopack: {
    root: path.resolve(import.meta.dirname, "../.."),
  },
};

export default nextConfig;
