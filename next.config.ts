import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route prerenders statically, so the build emits a plain
  // static bundle a file server can host with no Node runtime.
  output: "export",
};

export default nextConfig;
