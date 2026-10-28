import { sitemapEntries, sitemapXml } from "@/src/migration/sitemap";

/** Legacy Spanish sitemap endpoint (Wix `/es_es-sitemap.xml`): the Spanish canonical URLs. */
export const dynamic = "force-static";

export function GET() {
  const xml = sitemapXml(sitemapEntries().filter((entry) => entry.locale === "es"));
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
