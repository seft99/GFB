/**
 * Configuration contract, search and filtering of the product-resource sections
 * (components/sections/product-resources). Client-safe and dependency-free: it never imports the
 * crawled content, so it can run in the browser. Search reuses the normalisation of the
 * technical product library (src/migration/library-search.ts).
 */
import { compactSearch, normalizeSearch, type DocumentType } from "./library-search.ts";

/**
 * Presentation variants. `technical-library` (components/sections/technical-library.tsx) stays
 * the separate component for extensive catalogues and is not rendered through this contract.
 */
export type ResourceVariant = "compact-groups" | "visual-cards";

/** Same resource types as the technical library: product page or technical specification page. */
export type ResourceKind = DocumentType;

export type ResourceIllustration = "shrink-sleeve" | "wet-glue";

export type ResourceLink = {
  id: string;
  /** Title of the destination page (its H1), used for search and the accessible name. */
  label: string;
  href: string;
  kind: ResourceKind;
};

export type ProductResourceItem = {
  id: string;
  title: string;
  /** Factual identifier from the item's own page (e.g. "D66 mm | 202# cap/lid"). */
  meta?: string;
  /** The family's range overview page (shown as "Explore range", not as a product). */
  overview?: boolean;
  /** Designed illustration used when no suitable photograph exists (see resource-views.tsx). */
  illustration?: ResourceIllustration;
  /** Verbatim from the item's own page; omitted when that page has no usable text. */
  description?: string;
  /** Set when the description is English text shown on a Spanish page. */
  descriptionLang?: "en";
  image?: string;
  imageAlt?: string;
  /** CSS object-position of the image (focal point), e.g. "50% 40%". */
  imagePosition?: string;
  /** Extra searchable text that exists in the data (other-language names, page titles). */
  keywords?: string;
  resources: ResourceLink[];
};

export type ProductResourceGroup = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  descriptionLang?: "en";
  /** Small representative photograph or cut-out shown in the group header. */
  image?: string;
  imageAlt?: string;
  items: ProductResourceItem[];
};

export type ResourceSectionCta = {
  eyebrow?: string;
  title: string;
  description?: string;
  label: string;
  /** An existing route (e.g. the contact page with its context parameters). */
  href: string;
  image?: string;
  imageAlt?: string;
};

export type ResourceSectionConfig = {
  /** Unique per page: prefixes element ids. */
  id: string;
  variant: ResourceVariant;
  eyebrow: string;
  title: string;
  description?: string;
  groups: ProductResourceGroup[];
  showSearch?: boolean;
  /** Shown only when the data has both product pages and technical sheets. */
  showResourceFilters?: boolean;
  cta?: ResourceSectionCta;
};

export type ResourceFilter = "all" | ResourceKind;

export const resourceCount = (groups: ProductResourceGroup[]) =>
  groups.reduce((sum, group) => sum + group.items.reduce((total, item) => total + item.resources.length, 0), 0);

/** Products (range overviews excluded): what visible and announced counts refer to. */
export const itemCount = (groups: ProductResourceGroup[]) =>
  groups.reduce((sum, group) => sum + group.items.filter((item) => !item.overview).length, 0);

/** Product and specification counts of one group, e.g. "4 products · 2 specifications". */
export function groupCounts(group: ProductResourceGroup) {
  const products = group.items.filter((item) => !item.overview);
  return {
    products: products.length,
    specifications: products.reduce(
      (sum, item) => sum + item.resources.filter((link) => link.kind === "technical").length,
      0
    )
  };
}

/** Resource types present in the data. */
export function resourceKinds(groups: ProductResourceGroup[]): Set<ResourceKind> {
  return new Set(groups.flatMap((group) => group.items.flatMap((item) => item.resources.map((link) => link.kind))));
}

/** Type filters are meaningful only when the configured data mixes both resource types. */
export const hasResourceFilters = (config: ResourceSectionConfig) =>
  Boolean(config.showResourceFilters) && resourceKinds(config.groups).size > 1;

/**
 * Partial, case- and accent-insensitive match on the item title, its resource titles, its
 * keywords and the group title. Every word must appear; a compact comparison (≥ 3 characters)
 * matches identifiers and measurements written with or without spaces and hyphens.
 */
export function matchesResourceItem(item: ProductResourceItem, groupTitle: string, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  const haystack = normalizeSearch(
    [item.title, ...item.resources.map((link) => link.label), item.keywords ?? "", groupTitle].join(" ")
  );
  if (needle.split(" ").every((word) => haystack.includes(word))) return true;
  const compactNeedle = compactSearch(query);
  return compactNeedle.length >= 3 && compactSearch(haystack).includes(compactNeedle);
}

/**
 * Groups narrowed by query and resource type. An item keeps only the resources of the selected
 * type; items and groups left without resources are removed. Indexes are not renumbered here,
 * so each item keeps its position in the full collection.
 */
export function filterResourceGroups(
  groups: ProductResourceGroup[],
  query: string,
  type: ResourceFilter
): ProductResourceGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => matchesResourceItem(item, group.title, query))
        .map((item) =>
          type === "all" ? item : { ...item, resources: item.resources.filter((link) => link.kind === type) }
        )
        .filter((item) => item.resources.length > 0)
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * 1-based display index of every product in its group (range overviews are not numbered), from
 * the full (unfiltered) data, so filtered views keep the same numbers. Key: `group/item`.
 */
export function displayIndexes(groups: ProductResourceGroup[]): Record<string, number> {
  const indexes: Record<string, number> = {};
  for (const group of groups) {
    let index = 0;
    for (const item of group.items) if (!item.overview) indexes[`${group.id}/${item.id}`] = ++index;
  }
  return indexes;
}

/**
 * Advisory default from the number of unique products (never applied automatically): 1–5 →
 * visual-cards, 6–12 → compact-groups, 13+ → the technical library. The explicit per-category
 * assignment (src/migration/category-resources.ts) decides, e.g. a few products with many
 * technical sheets use compact-groups.
 */
export function suggestedVariant(uniqueProducts: number): ResourceVariant | "technical-library" {
  if (uniqueProducts <= 5) return "visual-cards";
  if (uniqueProducts <= 12) return "compact-groups";
  return "technical-library";
}
