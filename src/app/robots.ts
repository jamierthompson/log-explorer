import type { MetadataRoute } from "next";

// Metadata routes compile to route handlers, which a static export
// only accepts when explicitly marked static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
