import type { MetadataRoute } from "next";
import { divisions } from "@/src/content/catalog";
import { locales, type Locale } from "@/src/i18n/config";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { absoluteUrl } from "@/src/lib/metadata";

type Entry = { build: (locale: Locale) => string; priority: number; changeFrequency: "weekly" | "monthly" };

// Legal pages are drafts marked noindex, so they are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { build: paths.home, priority: 1, changeFrequency: "weekly" },
    { build: (locale) => paths.page(locale, "about"), priority: 0.6, changeFrequency: "monthly" },
    { build: (locale) => paths.page(locale, "contact"), priority: 0.6, changeFrequency: "monthly" },
    ...divisions.flatMap((division): Entry[] => [
      { build: (locale) => paths.division(locale, division), priority: 0.8, changeFrequency: "monthly" },
      ...division.categories.map((category): Entry => ({
        build: (locale) => paths.category(locale, division, category),
        priority: 0.7,
        changeFrequency: "monthly"
      }))
    ])
  ];

  return entries.flatMap(({ build, priority, changeFrequency }) => {
    const alternates = localizedPaths(build);
    const languages = Object.fromEntries(locales.map((locale) => [locale, absoluteUrl(alternates[locale])]));
    return locales.map((locale) => ({
      url: absoluteUrl(alternates[locale]),
      changeFrequency,
      priority,
      alternates: { languages }
    }));
  });
}
