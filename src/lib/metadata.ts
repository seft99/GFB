import type { Metadata } from "next";
import type { Locale } from "@/src/content/types";

const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gfb-solutions.com";

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const localizedPath = `/${locale}${path}`;
  const alternateLocale = locale === "en" ? "es" : "en";
  return {
    title,
    description,
    alternates: {
      canonical: `${origin}${localizedPath}`,
      languages: {
        en: `${origin}/en${path}`,
        es: `${origin}/es${path}`,
        "x-default": `${origin}/en${path}`
      }
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_GB" : "es_ES",
      alternateLocale: alternateLocale === "en" ? "en_GB" : "es_ES",
      url: `${origin}${localizedPath}`,
      siteName: "GFB Solutions"
    }
  };
}

export { origin as siteOrigin };
