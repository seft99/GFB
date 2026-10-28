import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/src/migration/sitemap";

/**
 * Complete sitemap of the intended indexable canonical URLs (both languages), generated from
 * the migration contract (src/migration/sitemap.ts). `/es_es-sitemap.xml` keeps the legacy
 * Spanish endpoint valid with the Spanish subset.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries().map((entry) => ({
    url: entry.url,
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    alternates: { languages: entry.languages }
  }));
}
