/**
 * Types and search for the technical product library. Client-safe and dependency-free: it never
 * imports the crawled content, so the explorer bundle stays small.
 */

export type DocumentType = "product" | "technical";

export type LibraryResource = {
  id: string;
  type: DocumentType;
  title: string;
  href: string;
  path: string;
  /** General page of a group (hub or overview), not one product reference. */
  overview?: boolean;
};

export type LibraryProduct = {
  id: string;
  name: string;
  /** Extra searchable text: names in both languages, published codes and their variants. */
  keywords: string;
  resources: LibraryResource[];
};

export type LibraryFamily = {
  id: string;
  /** Stable value of the `family` URL parameter, unique within one library. */
  slug: string;
  /** Short name (navigator) and full panel heading. */
  title: string;
  heading: string;
  eyebrow: string;
  description: string;
  thumb: string;
  /** Product records (range overviews excluded) and published resources (pages). */
  productCount: number;
  resourceCount: number;
  /** Localized counts: the panel pill ("7 products · 7 specifications", "9 formats") and the noun of `productCount`. */
  countLabel: string;
  countNoun: string;
  products: LibraryProduct[];
};

/** One library instance (a page): its catalogue groups and page-specific copy. */
export type LibraryConfig = {
  id: string;
  intro: { eyebrow: string; title: string; text: string };
  families: LibraryFamily[];
  /** Family shown without a `family` URL parameter (defaults to the first). */
  defaultFamilyId?: string;
  /** Explains a family without technical sheets (only relevant when the library has some). */
  noTechnicalHint: string;
  /** Optional contextual banner that opens one group of the same library. */
  banner?: { groupId: string; eyebrow: string; title: string; text: string; action: string; image?: string };
};

/** Combining diacritical marks (U+0300–U+036F), removed after NFD decomposition. */
const DIACRITICS = /\p{M}/gu;

/** Lowercase, accent-free, single-spaced text. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Codes match without spaces or hyphens: "red800" finds "RED-800" and "Red -800". */
export const compactSearch = (value: string) => normalizeSearch(value).replace(/[\s-]+/g, "");

/**
 * Partial, case- and accent-insensitive match on the product name, its keywords and family.
 * Every word of the query must appear; a compact comparison (≥ 3 characters) handles codes
 * written with or without hyphens. No fuzzy matching, so technical references stay precise.
 */
export function matchesQuery(product: LibraryProduct, familyTitle: string, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  const haystack = normalizeSearch(`${product.name} ${product.keywords} ${familyTitle}`);
  if (needle.split(" ").every((word) => haystack.includes(word))) return true;
  const compactNeedle = compactSearch(query);
  return compactNeedle.length >= 3 && compactSearch(haystack).includes(compactNeedle);
}
