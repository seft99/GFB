import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/src/lib/metadata";

/**
 * Crawling stays allowed on every host so crawlers can read the X-Robots-Tag noindex that
 * proxy.ts sends outside the production host; robots.txt never carries noindex. Both sitemap
 * endpoints point at the production origin.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/es_es-sitemap.xml")]
  };
}
