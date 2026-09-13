import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/workflows/", "/settings/", "/profile/"],
      },
    ],
    sitemap: "https://flowlens.app/sitemap.xml", // ← your real domain
  };
}