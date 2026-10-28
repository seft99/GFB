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

export const itemCount = (groups: ProductResourceGroup[]) => groups.reduce((sum, group) => sum + group.items.length, 0);

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
 * 1-based display index of every item and resource in its group, from the full (unfiltered)
 * data, so filtered views keep the same numbers. Keys: `group/item` and `group/item/resource`.
 */
export function displayIndexes(groups: ProductResourceGroup[]): Record<string, number> {
  const indexes: Record<string, number> = {};
  for (const group of groups) {
    let resource = 0;
    group.items.forEach((item, index) => {
      indexes[`${group.id}/${item.id}`] = index + 1;
      for (const link of item.resources) indexes[`${group.id}/${item.id}/${link.id}`] = ++resource;
    });
  }
  return indexes;
}

/**
 * Advisory default for a future page assignment (not applied automatically): 1–5 items →
 * compact-groups, 6–12 → visual-cards, 13+ → the technical library. Manual configuration
 * always wins.
 */
export function suggestedVariant(items: number): ResourceVariant | "technical-library" {
  if (items <= 5) return "compact-groups";
  if (items <= 12) return "visual-cards";
  return "technical-library";
}
