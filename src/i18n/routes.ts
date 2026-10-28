import { publicPathFor, publicUrl } from "../migration/public-paths.ts";
import { isLocale, locales, type Locale, type LocalizedText } from "./config.ts";

/**
 * Single source of truth for public URLs.
 *
 * Static pages live in English-named route folders (`app/[locale]/about`), while each locale
 * exposes its own public slug (`/es/sobre-gfb`). The proxy rewrites public slugs to the folder
 * and permanently redirects folder names that are not the public slug for that locale.
 * Division and category slugs are resolved directly by their dynamic segments.
 *
 * Pages that replace a legacy (Wix) page keep the legacy URL as their public canonical
 * (`/cans`, `/cans?lang=es`, see src/migration/public-paths.ts); `paths` returns that URL, so
 * every internal link, alternate and sitemap entry points at the final canonical. The
 * localized folders remain the internal routes (`routes`).
 *
 * This module is pure and client-safe: it never imports the content catalog.
 */

export const staticPages = {
  about: { en: "about", es: "sobre-gfb" },
  contact: { en: "contact", es: "contacto" },
  "product-index": { en: "product-index", es: "indice-de-productos" }
} as const satisfies Record<string, LocalizedText>;

export type StaticPage = keyof typeof staticPages;

export const legalPolicies = {
  privacy: { en: "privacy", es: "privacidad" },
  cookies: { en: "cookies", es: "cookies" }
} as const satisfies Record<string, LocalizedText>;

export type LegalPolicy = keyof typeof legalPolicies;

/** Minimal slug tree needed to translate catalog URLs between locales. */
export type SlugTree = { id?: string; slug: LocalizedText; categories: { id?: string; slug: LocalizedText }[] }[];

type DivisionRef = { id?: string; slug: LocalizedText };
type CategoryRef = { id?: string; slug: LocalizedText };

/** Localized App Router paths (internal routes; also the public URL of pages without a legacy URL). */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  page: (locale: Locale, page: StaticPage) => `/${locale}/${staticPages[page][locale]}`,
  division: (locale: Locale, division: DivisionRef) => `/${locale}/${division.slug[locale]}`,
  category: (locale: Locale, division: DivisionRef, category: CategoryRef) =>
    `/${locale}/${division.slug[locale]}/${category.slug[locale]}`
};

const legacyOr = (key: string, locale: Locale, fallback: string) => {
  const path = publicPathFor(key);
  return path ? publicUrl(path, locale) : fallback;
};

export const paths = {
  home: (locale: Locale) => legacyOr("home", locale, routes.home(locale)),
  page: (locale: Locale, page: StaticPage) => legacyOr(`page:${page}`, locale, routes.page(locale, page)),
  legal: (locale: Locale, policy: LegalPolicy) => `/${locale}/legal/${legalPolicies[policy][locale]}`,
  division: (locale: Locale, division: DivisionRef) =>
    legacyOr(`division:${division.id}`, locale, routes.division(locale, division)),
  category: (locale: Locale, division: DivisionRef, category: CategoryRef) =>
    legacyOr(`category:${division.id}/${category.id}`, locale, routes.category(locale, division, category)),
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
 * Legacy public paths (no locale prefix) keep their path and switch the `lang` query; the
 * address bar of a rewritten legacy page shows that path. Unknown localized paths fall back
 * to the target locale's home page.
 */
export function translatePathname(pathname: string, to: Locale, tree: SlugTree): string {
  const [from, first, second, ...rest] = pathname.split("/").filter(Boolean);
  if (!isLocale(from)) return publicUrl(pathname.split("?")[0] || "/", to);
  if (!first) return paths.home(to);

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
