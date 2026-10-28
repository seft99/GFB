import type { Locale, LocalizedText } from "../i18n/config.ts";
import { truncate } from "./content.ts";
import { families, type Family } from "./families.ts";
import { legacyPage } from "./manifest.ts";
import { publicUrl } from "./public-paths.ts";
import type { ProductResourceGroup, ProductResourceItem, ResourceLink } from "./resource-section.ts";
import { documentType } from "./technical-library.ts";

/**
 * Builds product-resource groups (src/migration/resource-section.ts) from the migration
 * families and the crawled page content — no separate dataset, no invented routes, names or
 * documents. Every legacy page of the family appears exactly once, at its public URL.
 *
 * Technical specification pages: besides the analysis sheets of the technical library
 * (`documentType`), a flat legacy page is a specification page of a product when (1) it has no
 * prose (no paragraph over 100 characters), (2) at least three of its sections are headed lists
 * or tables of attributes, and (3) the family has a nested product page with the same product
 * name (the nested page's H1, or H1 + eyebrow such as "52mm (202) Dia Aluminium End" + "SOT - Std
 * Aperture (Korinthos)"; on the flat page, its first H1 line or its whole H1). Such a page is shown next to that product page as its "Technical sheet". A flat page
 * that repeats the product page's prose (e.g. /std-can-d66mm) stays a product page of its own.
 */

const pageTitle = (path: string, locale: Locale) => (legacyPage(path)?.[locale].h1 ?? path).replace(/\s*\n\s*/g, " ");
const compactName = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
/** Names a flat specification page may carry: its first H1 line or its whole H1. */
function flatNames(path: string) {
  const h1 = legacyPage(path)?.en.h1 ?? "";
  return [h1.split("\n")[0], h1].map(compactName);
}
/** Names of a nested product page: its H1, alone or followed by its eyebrow. */
function productNames(path: string) {
  const page = legacyPage(path)?.en;
  return [page?.h1 ?? "", `${page?.h1 ?? ""} ${page?.eyebrow ?? ""}`].map(compactName);
}
const isFlat = (path: string) => path.split("/").length === 2;

/** Content test (1)+(2) above, on the English page. */
export function isSpecificationPage(path: string): boolean {
  const page = legacyPage(path)?.en;
  if (!page || !isFlat(path)) return false;
  const items = page.sections.flatMap((section) => section.items);
  const prose = items.some((item) => item.type === "p" && item.text.length > 100);
  const attributes = page.sections.filter(
    (section) => section.heading && section.items.some((item) => item.type === "specs" || item.type === "ul")
  ).length;
  return !prose && attributes >= 3;
}

/** Nested product page → its flat specification page, per family (test (3) above). */
export function specificationPairs(family: Family): { product: string; technical: string }[] {
  return family.paths.filter(isSpecificationPage).flatMap((technical) => {
    const names = flatNames(technical);
    const product = family.paths.find(
      (path) => path !== family.hub && !isFlat(path) && productNames(path).some((name) => names.includes(name))
    );
    return product ? [{ product, technical }] : [];
  });
}

const kindOf = (path: string, paired: Set<string>) =>
  paired.has(path) || documentType(path) === "technical" ? "technical" : "product";

/** First sentence of the page's first paragraph in that language, if it has one. */
function firstSentence(path: string, locale: Locale): { text: string; lang?: "en" } | undefined {
  for (const section of legacyPage(path)?.[locale].sections ?? [])
    for (const item of section.items) {
      if (item.type !== "p" || item.text.length <= 60) continue;
      // English text left untranslated on a Spanish page is not used as a Spanish description.
      if (locale === "es" && item.lang === "en") return undefined;
      const sentence = item.text.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? item.text;
      return { text: truncate(sentence, 180) };
    }
  return undefined;
}

export type ResourcePhoto = { src: string; alt: LocalizedText; position?: string };

export type FamilyGroupOptions = {
  eyebrow?: LocalizedText;
  /** Representative image of the group (header thumbnail). */
  image?: ResourcePhoto;
  /** Product photographs by legacy path (the page that published the photo). */
  photos?: Record<string, ResourcePhoto>;
};

/** One resource group from a migration family, in the family's display order. */
export function familyResourceGroup(
  familyId: string,
  locale: Locale,
  options: FamilyGroupOptions = {}
): ProductResourceGroup {
  const family = families.find((item) => item.id === familyId);
  if (!family) throw new Error(`Unknown resource family ${familyId}`);
  const pairs = specificationPairs(family);
  const technicalOf = new Map(pairs.map((pair) => [pair.product, pair.technical]));
  const paired = new Set(pairs.map((pair) => pair.technical));

  const link = (path: string): ResourceLink => ({
    id: `${locale}:${path}`,
    label: pageTitle(path, locale),
    href: publicUrl(path, locale),
    kind: kindOf(path, paired)
  });

  const items: ProductResourceItem[] = family.paths
    .filter((path) => !paired.has(path))
    .map((path) => {
      const paths = [path, ...(technicalOf.has(path) ? [technicalOf.get(path)!] : [])];
      // The hub's first sentence describes the whole group, so it is not repeated on its item.
      const description = path === family.hub ? undefined : firstSentence(path, locale);
      const photo = options.photos?.[path];
      return {
        id: path.split("/").filter(Boolean).join("--"),
        title: pageTitle(path, locale),
        ...(description ? { description: description.text } : {}),
        ...(photo ? { image: photo.src, imageAlt: photo.alt[locale], imagePosition: photo.position } : {}),
        keywords: paths.flatMap((item) => [pageTitle(item, "en"), pageTitle(item, "es")]).join(" "),
        resources: paths.map(link)
      };
    });

  // Items with the same name: the nested product page keeps it; the others are told apart by
  // their first section heading (e.g. "Crown Cork Bottle Caps: Characteristics").
  const pathOf = (item: ProductResourceItem) =>
    family.paths.find((candidate) => publicUrl(candidate, locale) === item.resources[0].href)!;
  for (const item of items) {
    const twins = items.filter((other) => other.title === item.title);
    if (twins.length < 2) continue;
    const keeper = twins.find((other) => !isFlat(pathOf(other))) ?? twins[0];
    if (item === keeper) continue;
    const heading = legacyPage(pathOf(item))?.[locale].sections.find((section) => section.heading)?.heading;
    if (heading) item.title = `${item.title}: ${heading}`;
  }

  const hubSentence = family.hub ? firstSentence(family.hub, locale) : undefined;
  return {
    id: family.id,
    title: family.label[locale],
    ...(options.eyebrow ? { eyebrow: options.eyebrow[locale] } : {}),
    ...(hubSentence ? { description: hubSentence.text } : {}),
    ...(options.image ? { image: options.image.src, imageAlt: options.image.alt[locale] } : {}),
    items
  };
}
