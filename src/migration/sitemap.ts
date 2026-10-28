import { divisions } from "../content/catalog.ts";
import { hreflang, locales, type Locale } from "../i18n/config.ts";
import { localizedPaths, paths } from "../i18n/routes.ts";
import { absoluteUrl } from "../lib/metadata.ts";
import { detailPaths, legacyPage } from "./manifest.ts";
import { publicUrl, redesignedRoutes } from "./public-paths.ts";

export type SitemapEntry = {
  url: string;
  locale: Locale;
  /** Genuine source modification date (legacy sitemap lastmod); omitted when unknown. */
  lastModified?: string;
  languages: Record<string, string>;
};

function cluster(build: (locale: Locale) => string, lastModified?: string): SitemapEntry[] {
  const urls = localizedPaths(build);
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((locale) => [hreflang[locale], absoluteUrl(urls[locale])])
  );
  languages["x-default"] = absoluteUrl(urls.en);
  return locales.map((locale) => ({
    url: absoluteUrl(urls[locale]),
    locale,
    ...(lastModified ? { lastModified } : {}),
    languages
  }));
}

/**
 * Every intended indexable canonical page: redesigned pages at their legacy URLs, retained
 * legacy detail pages and genuinely new pages. Excluded: localized aliases, redirect sources
 * (/frozen-*), broken historical links, internal routes and the noindex legal drafts.
 */
export function sitemapEntries(): SitemapEntry[] {
  const consulting = divisions.find((division) => division.id === "industrial-consulting");
  return [
    ...Object.keys(redesignedRoutes).flatMap((path) => cluster((locale) => publicUrl(path, locale))),
    ...detailPaths.flatMap((path) =>
      cluster((locale) => publicUrl(path, locale), legacyPage(path)?.lastmod ?? undefined)
    ),
    ...cluster((locale) => paths.page(locale, "contact")),
    ...cluster((locale) => paths.page(locale, "product-index")),
    ...(consulting?.categories.flatMap((category) =>
      cluster((locale) => paths.category(locale, consulting, category))
    ) ?? [])
  ];
}

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** XML urlset with xhtml:link alternates (used for the Spanish legacy endpoint). */
export function sitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const links = Object.entries(entry.languages)
        .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`)
        .join("");
      const lastmod = entry.lastModified ? `<lastmod>${entry.lastModified}</lastmod>` : "";
      return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}${links}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}
