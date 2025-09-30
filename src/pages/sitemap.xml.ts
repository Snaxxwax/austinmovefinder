import type { APIRoute } from "astro";
import { AUSTIN_SEO_CONFIG, AUSTIN_NEIGHBORHOODS } from "@/config/seo";

interface SitemapURL {
  url: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

export const GET: APIRoute = async () => {
  const baseUrl = AUSTIN_SEO_CONFIG.siteUrl;
  const currentDate = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages: SitemapURL[] = [
    {
      url: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/quote`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reviews`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/moving-checklist`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/moving-tips`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastmod: currentDate,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastmod: currentDate,
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  // Service pages
  const servicePages: SitemapURL[] = [
    {
      url: `${baseUrl}/services/local-moving`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/long-distance-moving`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/residential-moving`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/commercial-moving`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/packing-services`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/storage-solutions`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/apartment-moving`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/office-moving`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
  ];

  // Neighborhood pages for local SEO
  const neighborhoodPages: SitemapURL[] = AUSTIN_NEIGHBORHOODS.map(
    (neighborhood) => ({
      url: `${baseUrl}/areas/${neighborhood.toLowerCase().replace(/\s+/g, "-")}`,
      lastmod: currentDate,
      changefreq: "monthly" as const,
      priority: 0.6,
    }),
  );

  // Blog/guide pages
  const guidePages: SitemapURL[] = [
    {
      url: `${baseUrl}/guides/moving-to-austin`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/austin-neighborhoods`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/austin-moving-costs`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/moving-timeline`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guides/packing-tips`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/guides/moving-with-pets`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/guides/moving-insurance`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: 0.5,
    },
  ];

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...servicePages,
    ...neighborhoodPages,
    ...guidePages,
  ];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
    ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ""}
    ${page.priority ? `<priority>${page.priority}</priority>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
