import { defaultLocale, isLocale, locales, type Locale } from "./config.ts";

/**
 * Picks the locale for a request without a locale prefix.
 * Priority: remembered cookie, then the highest-weighted Accept-Language match, then the default.
 */
export function negotiateLocale(acceptLanguage: string | null, cookieLocale?: string): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return { language: tag.toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  return (
    ranked
      .map((entry) => entry.language)
      .find((language): language is Locale => locales.includes(language as Locale)) ?? defaultLocale
  );
}
