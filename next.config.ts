import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route prerenders statically, so the build emits a plain
  // static bundle a file server can host with no Node runtime.
  output: "export",
  // Emit each route as its own directory with an index.html so a static
  // host resolves a deep link like /demo on a direct hit or refresh, not
  // only when navigating in from the entry page.
  trailingSlash: true,
  experimental: {
    // Opt into React's <ViewTransition> integration so route navigations
    // can drive enter/exit animations between views.
    viewTransition: true,
  },
};

export default nextConfig;
