import type { Metadata } from "next";
import { defaultLocale, hreflang, locales, openGraphLocale, otherLocale, type Locale } from "../i18n/config.ts";

/**
 * Canonical origin of every canonical, hreflang, sitemap and structured-data URL. It is fixed
 * (not taken from the environment) so a preview or misconfigured deployment can never publish
 * metadata that points at a Vercel/preview host; previews are kept out of the index by the
 * X-Robots-Tag set in proxy.ts instead.
 */
export const siteOrigin = "https://www.gfb-solutions.com";

export function absoluteUrl(path: string) {
  return `${siteOrigin}${path}`;
}

type PageMetadataInput = {
  locale: Locale;
  /** Public path of this page in every locale, e.g. `{ en: "/en/about", es: "/es/sobre-gfb" }`. */
  paths: Record<Locale, string>;
  title: string;
  description: string;
  /** Social card image (site-relative); defaults to the brand card. */
  image?: string;
};

/** Default social card: a resolvable local asset on the production origin. */
export const defaultSocialImage = "/images/raw-materials/grapes.webp";

export function pageMetadata({ locale, paths, title, description, image }: PageMetadataInput): Metadata {
  // Reciprocal, self-inclusive cluster with the legacy regional codes (en-US, es-ES, x-default → English).
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((item) => [hreflang[item], absoluteUrl(paths[item])])
  );
  languages["x-default"] = absoluteUrl(paths[defaultLocale]);
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(paths[locale]), languages },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "GFB Solutions",
      url: absoluteUrl(paths[locale]),
      locale: openGraphLocale[locale],
      alternateLocale: openGraphLocale[otherLocale(locale)],
      images: [{ url: absoluteUrl(image ?? defaultSocialImage) }]
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(image ?? defaultSocialImage)] }
  };
}
