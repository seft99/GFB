import type { Locale } from "../i18n/config.ts";
import { FAMILY_PARAM } from "../lib/family-url.ts";
import { categoryFamilyGroup } from "./category-resources.ts";
import { familyOf, type Family } from "./families.ts";
import { legacyLinkLabel } from "./manifest.ts";
import { publicUrl } from "./public-paths.ts";
import { categoryLibrary, displayProductName } from "./technical-library.ts";

/**
 * "More in this family" of a product-detail page (components/sections/family-related.tsx).
 *
 * One entry per product identity, with the published pages of that identity as separate
 * resources. Identities come from the groupings the category pages already use — no second
 * catalogue and no grouping by similar names:
 * - fruit concentrates and IQF: the technical library records (src/migration/technical-library.ts;
 *   red grape varieties pair their product page and specification explicitly, `redGrapeRecords`);
 * - packaging and plant-based: the category resource groups (src/migration/category-resources.ts;
 *   product/specification pairs verified by content, `specificationPairs`);
 * - any other family: one entry per page.
 * Every page of the family is a resource of exactly one entry (tests/unit/related-resources.test.ts).
 */

export type FamilyResourceKind = "overview" | "product" | "technical";

export type FamilyResource = { path: string; kind: FamilyResourceKind; href: string };

export type RelatedProductEntry = { id: string; title: string; resources: FamilyResource[] };

export type RelatedFamilyConfig = {
  familyId: string;
  title: string;
  entries: RelatedProductEntry[];
  /** The family on its category page (library family view or resource group), when it has one. */
  directoryHref?: string;
};

function libraryEntries(family: Family, locale: Locale) {
  const category = family.parent.category;
  const library = category ? categoryLibrary(category, locale) : undefined;
  const group = library?.families.find((item) => item.id === family.id);
  if (!library || !group) return undefined;
  const entries = group.products.map((product) => ({
    id: product.id,
    title: product.name,
    resources: product.resources.map((resource) => ({
      path: resource.path,
      kind: resource.overview ? ("overview" as const) : resource.type,
      href: resource.href
    }))
  }));
  return { entries, slug: group.slug, anchor: `${library.id}-library-title` };
}

function groupEntries(family: Family, locale: Locale) {
  const found = categoryFamilyGroup(family.id, locale);
  if (!found) return undefined;
  const pathOf = (href: string) => family.paths.find((path) => publicUrl(path, locale) === href);
  const entries = found.group.items.map((item) => ({
    id: item.id,
    title: item.title,
    resources: item.resources.map((resource, index) => ({
      path: pathOf(resource.href) ?? resource.href,
      kind: item.overview && index === 0 ? ("overview" as const) : resource.kind,
      href: resource.href
    }))
  }));
  return { entries, anchor: found.anchor };
}

/**
 * The family of `path` with all of its entries (nothing filtered yet). The directory link opens
 * the family on its category page: the library family view (`?family=` + the library heading, as
 * the concentrate explorer links it) or the family's resource group heading.
 */
export function familyResources(path: string, locale: Locale, categoryHref?: string): RelatedFamilyConfig | undefined {
  const family = familyOf(path);
  if (!family) return undefined;
  const library = libraryEntries(family, locale);
  const group = library ? undefined : groupEntries(family, locale);
  const entries: RelatedProductEntry[] =
    library?.entries ??
    group?.entries ??
    family.paths.map((item) => ({
      id: item.split("/").filter(Boolean).join("--"),
      title: displayProductName(legacyLinkLabel(item, locale)),
      resources: [{ path: item, kind: family.hub === item ? "overview" : "product", href: publicUrl(item, locale) }]
    }));
  const directoryHref = !categoryHref
    ? undefined
    : library
      ? `${categoryHref}${categoryHref.includes("?") ? "&" : "?"}${FAMILY_PARAM}=${library.slug}#${library.anchor}`
      : group
        ? `${categoryHref}#${group.anchor}`
        : undefined;
  return {
    familyId: family.id,
    title: family.label[locale],
    entries,
    ...(directoryHref ? { directoryHref } : {})
  };
}

/**
 * Entries recommended on the page at `current`: the current page is never linked; an identity
 * stays only while it has another published resource (e.g. the Merlot product page keeps the
 * Merlot card for its specification). Pages the content already lists (`exclude`, hub pages'
 * product links) are not repeated. Pages are compared by their exact legacy path.
 */
export function relatedEntries(config: RelatedFamilyConfig, current: string, exclude: Set<string> = new Set()) {
  return config.entries
    .map((entry) => ({
      ...entry,
      resources: entry.resources.filter((resource) => resource.path !== current && !exclude.has(resource.path))
    }))
    .filter((entry) => entry.resources.length > 0);
}
