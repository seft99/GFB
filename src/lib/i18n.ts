import { locales, type Locale } from "@/src/content/types";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

export function localizedPath(pathname: string, locale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${locale}`;
  if (isLocale(parts[0])) parts[0] = locale;
  else parts.unshift(locale);
  return `/${parts.join("/")}`;
}
