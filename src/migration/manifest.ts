import type { Locale } from "../i18n/config.ts";
import { siteOrigin } from "../lib/metadata.ts";
import type { Processed } from "./content.ts";
import { families, familyOf, type Family } from "./families.ts";
import content from "./legacy-content.json" with { type: "json" };
import { publicUrl } from "./public-paths.ts";

/**
 * Runtime view of the migration contract for the legacy detail pages. The full evidence
 * (status, chains, inbound links, audit dispositions) is in docs/migration-data/
 * migration-manifest.json, built by scripts/build-migration-manifest.ts from the crawl.
 */

export type LegacyLocalizedPage = Processed & {
  metaTitle: string;
  metaDescription: string;
  /** Hero lead: complete sentences (formats or first paragraph); absent when there is none. */
  summary?: string;
  untranslatedItems: number;
};

export type LegacyPage = {
  key: string;
  family: string;
  review?: string;
  lastmod: string | null;
  en: LegacyLocalizedPage;
  es: LegacyLocalizedPage;
};

const pages = content as unknown as Record<string, LegacyPage>;

export const productionOrigin = siteOrigin;

export function legacyPage(path: string): LegacyPage | undefined {
  return pages[path];
}

/** Every legacy detail path, in family display order. */
export const detailPaths: string[] = families.flatMap((family) => family.paths);

export function legacyCanonical(path: string, locale: Locale): string {
  return `${siteOrigin}${publicUrl(path, locale)}`;
}

/** Reciprocal, self-inclusive hreflang cluster (legacy regional codes). */
export function legacyAlternates(path: string) {
  return {
    "en-US": legacyCanonical(path, "en"),
    "es-ES": legacyCanonical(path, "es"),
    "x-default": legacyCanonical(path, "en")
  };
}

/** Display name of a legacy detail page (its H1) in a locale. */
export function legacyName(path: string, locale: Locale): string {
  return pages[path]?.[locale].h1 ?? path;
}

/**
 * Descriptive anchor text: the page name, plus "(technical sheet)" for a flat legacy sheet that
 * shares its name with another page of the same family, so no two links read the same.
 */
export function legacyLinkLabel(path: string, locale: Locale): string {
  const name = legacyName(path, locale);
  const family = familyOf(path);
  const twins = family?.paths.filter((other) => other !== path && legacyName(other, locale) === name) ?? [];
  const isFlat = (item: string) => item.split("/").length === 2;
  if (twins.length === 0 || !isFlat(path) || family?.hub === path) return name;
  if (twins.some((twin) => !isFlat(twin)))
    return `${name} ${locale === "es" ? "(ficha técnica)" : "(technical sheet)"}`;
  const heading = pages[path]?.[locale].sections.find((section) => section.heading)?.heading;
  return heading ? `${name}: ${heading}` : name;
}

export function familyOfPath(path: string): Family | undefined {
  return familyOf(path);
}
