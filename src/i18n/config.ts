export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie that remembers the last locale a visitor browsed, read by the proxy on `/`. */
export const localeCookie = "NEXT_LOCALE";

export type LocalizedText = Record<Locale, string>;

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

export const openGraphLocale: Record<Locale, string> = { en: "en_GB", es: "es_ES" };
