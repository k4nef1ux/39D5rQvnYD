// app/sitemap.ts - full sitemap from content + taxonomy.
import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getAllPages, getAllTags } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const [pages, tags] = await Promise.all([getAllPages(), getAllTags()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/allfinds`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: new Date(p.updated || p.date || Date.now()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${base}/tags/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
