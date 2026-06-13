import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Opt into React's <ViewTransition> integration so route navigations
    // can drive enter/exit animations between views.
    viewTransition: true,
  },
};

export default nextConfig;
