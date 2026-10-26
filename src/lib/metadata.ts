import type { Metadata } from "next";
import { defaultLocale, locales, openGraphLocale, otherLocale, type Locale } from "../i18n/config.ts";

export const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.gfb-solutions.com").replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return `${siteOrigin}${path}`;
}

type PageMetadataInput = {
  locale: Locale;
  /** Public path of this page in every locale, e.g. `{ en: "/en/about", es: "/es/sobre-gfb" }`. */
  paths: Record<Locale, string>;
  title: string;
  description: string;
};

export function pageMetadata({ locale, paths, title, description }: PageMetadataInput): Metadata {
  const languages: Record<string, string> = Object.fromEntries(locales.map((item) => [item, absoluteUrl(paths[item])]));
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
      alternateLocale: openGraphLocale[otherLocale(locale)]
    }
  };
}
