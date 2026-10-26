import { isLocale, locales, type Locale, type LocalizedText } from "./config.ts";

/**
 * Single source of truth for public URLs.
 *
 * Static pages live in English-named route folders (`app/[locale]/about`), while each locale
 * exposes its own public slug (`/es/sobre-gfb`). The proxy rewrites public slugs to the folder
 * and permanently redirects folder names that are not the public slug for that locale.
 * Division and category slugs are resolved directly by their dynamic segments.
 *
 * This module is pure and client-safe: it never imports the content catalog.
 */

export const staticPages = {
  about: { en: "about", es: "sobre-gfb" },
  contact: { en: "contact", es: "contacto" }
} as const satisfies Record<string, LocalizedText>;

export type StaticPage = keyof typeof staticPages;

export const legalPolicies = {
  privacy: { en: "privacy", es: "privacidad" },
  cookies: { en: "cookies", es: "cookies" }
} as const satisfies Record<string, LocalizedText>;

export type LegalPolicy = keyof typeof legalPolicies;

/** Minimal slug tree needed to translate catalog URLs between locales. */
export type SlugTree = { slug: LocalizedText; categories: { slug: LocalizedText }[] }[];

export const paths = {
  home: (locale: Locale) => `/${locale}`,
  page: (locale: Locale, page: StaticPage) => `/${locale}/${staticPages[page][locale]}`,
  legal: (locale: Locale, policy: LegalPolicy) => `/${locale}/legal/${legalPolicies[policy][locale]}`,
  division: (locale: Locale, division: { slug: LocalizedText }) => `/${locale}/${division.slug[locale]}`,
  category: (locale: Locale, division: { slug: LocalizedText }, category: { slug: LocalizedText }) =>
    `/${locale}/${division.slug[locale]}/${category.slug[locale]}`,
  contact: (locale: Locale, context?: { interest?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (context?.interest) query.set("interest", context.interest);
    if (context?.category) query.set("category", context.category);
    const search = query.toString();
    return `/${locale}/${staticPages.contact[locale]}${search ? `?${search}` : ""}`;
  }
};

/** Builds the `{ en, es }` map used for hreflang alternates and the language switcher. */
export function localizedPaths(build: (locale: Locale) => string): Record<Locale, string> {
  return Object.fromEntries(locales.map((locale) => [locale, build(locale)])) as Record<Locale, string>;
}

export function findLegalPolicy(locale: Locale, slug: string): LegalPolicy | undefined {
  return (Object.keys(legalPolicies) as LegalPolicy[]).find((policy) => legalPolicies[policy][locale] === slug);
}

export type StaticSegmentResolution =
  { type: "rewrite"; page: StaticPage } | { type: "redirect"; page: StaticPage } | { type: "none" };

/** Classifies the first segment after the locale for the proxy. */
export function resolveStaticSegment(locale: Locale, segment: string | undefined): StaticSegmentResolution {
  if (!segment) return { type: "none" };
  for (const page of Object.keys(staticPages) as StaticPage[]) {
    const publicSlug = staticPages[page][locale];
    if (segment === publicSlug) return publicSlug === page ? { type: "none" } : { type: "rewrite", page };
    if (segment === page || locales.some((other) => staticPages[page][other] === segment))
      return { type: "redirect", page };
  }
  return { type: "none" };
}

/**
 * Translates a public pathname into the equivalent page in another locale.
 * Unknown paths fall back to the target locale's home page.
 */
export function translatePathname(pathname: string, to: Locale, tree: SlugTree): string {
  const [from, first, second, ...rest] = pathname.split("/").filter(Boolean);
  if (!isLocale(from) || !first) return paths.home(to);

  for (const page of Object.keys(staticPages) as StaticPage[]) {
    if (staticPages[page][from] === first && !second) return paths.page(to, page);
  }

  if (first === "legal") {
    const policy = second ? findLegalPolicy(from, second) : undefined;
    return policy && rest.length === 0 ? paths.legal(to, policy) : paths.home(to);
  }

  const division = tree.find((item) => item.slug[from] === first);
  if (!division) return paths.home(to);
  if (!second) return paths.division(to, division);
  const category = division.categories.find((item) => item.slug[from] === second);
  return category && rest.length === 0 ? paths.category(to, division, category) : paths.division(to, division);
}
