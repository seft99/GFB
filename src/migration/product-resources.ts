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
 * prose (no paragraph over 140 characters; a one-sentence note such as the FDA lacquer treatment
 * is not prose), (2) at least two of its sections are headed lists or tables of attributes (the
 * 42 mm RipCap sheet has two once its duplicated block is shown once), and (3) the family has a nested product page with the same product
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
/** Eyebrows that are identifiers (sizes, apertures), not marketing labels such as "Ring Pull Closure". */
const IDENTIFIER = /\d|aperture/i;

/** Content test (1)+(2) above, on the English page. */
export function isSpecificationPage(path: string): boolean {
  const page = legacyPage(path)?.en;
  if (!page || !isFlat(path)) return false;
  const items = page.sections.flatMap((section) => section.items);
  const prose = items.some((item) => item.type === "p" && item.text.length > 140);
  const attributes = page.sections.filter(
    (section) => section.heading && section.items.some((item) => item.type === "specs" || item.type === "ul")
  ).length;
  return !prose && attributes >= 2;
}

/**
 * Pairs verified by content rather than by name: the flat page publishes the same text as the
 * nested product page (tests/unit/product-resources.test.ts compares them), so it is that
 * product's specification page, not a second product.
 */
export const verifiedSpecificationPairs: { product: string; technical: string; reason: string }[] = [
  {
    product: "/aluminum-cans/std-can-d66mm",
    technical: "/std-can-d66mm",
    reason: 'Same "Standard Can Specifications" text (66 mm diameter, 202# cap/lid, fill volumes and heights).'
  }
];

/** Nested product page → its flat specification page, per family (test (3) above). */
export function specificationPairs(family: Family): { product: string; technical: string }[] {
  const detected = family.paths.filter(isSpecificationPage).flatMap((technical) => {
    const names = flatNames(technical);
    const product = family.paths.find(
      (path) => path !== family.hub && !isFlat(path) && productNames(path).some((name) => names.includes(name))
    );
    return product ? [{ product, technical }] : [];
  });
  const verified = verifiedSpecificationPairs
    .filter((pair) => family.paths.includes(pair.product) && family.paths.includes(pair.technical))
    .filter((pair) => !detected.some((item) => item.technical === pair.technical))
    .map(({ product, technical }) => ({ product, technical }));
  return [...detected, ...verified];
}

const kindOf = (path: string, paired: Set<string>) =>
  paired.has(path) || documentType(path) === "technical" ? "technical" : "product";

/**
 * A sentence (first by default) of the page's first paragraph in that language, if it has one.
 * `index` selects a later sentence of the same published paragraph.
 */
function firstSentence(path: string, locale: Locale, index = 0): { text: string; lang?: "en" } | undefined {
  for (const section of legacyPage(path)?.[locale].sections ?? [])
    for (const item of section.items) {
      if (item.type !== "p" || item.text.length <= 60) continue;
      // English text left untranslated on a Spanish page is not used as a Spanish description.
      if (locale === "es" && item.lang === "en") return undefined;
      // Sentence ends are punctuation followed by a space, so "57.4 mm" stays in one sentence.
      const sentences = item.text.split(/(?<=[.!?])\s+/);
      const sentence = sentences[index];
      return sentence ? { text: truncate(sentence, 180) } : undefined;
    }
  return undefined;
}

export type ResourcePhoto = { src: string; alt: LocalizedText; position?: string };

export type FamilyGroupOptions = {
  eyebrow?: LocalizedText;
  /** Group text replacing the hub's first sentence (e.g. when the published one is ungrammatical). */
  groupDescription?: LocalizedText;
  /** Display names by legacy path, where the page H1 is inconsistent or ambiguous. */
  titles?: Record<string, LocalizedText>;
  /** Card descriptions by legacy path, condensed from that page's own content. */
  descriptions?: Record<string, LocalizedText>;
  /** Designed illustrations by legacy path, for products without a suitable photograph. */
  illustrations?: Record<string, ProductResourceItem["illustration"]>;
  /** Representative image of the group (header thumbnail). */
  image?: ResourcePhoto;
  /** Product photographs by legacy path (licensed or published images, see docs/asset-provenance.md). */
  photos?: Record<string, ResourcePhoto>;
  /**
   * Sentence of the page's first paragraph used as the card description, by legacy path, when
   * the first one does not describe that page (e.g. /soft-drinks opens with a sentence about water).
   */
  descriptionSentence?: Record<string, number>;
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
      const curated = options.descriptions?.[path]?.[locale];
      const description =
        path === family.hub
          ? undefined
          : curated
            ? { text: curated }
            : firstSentence(path, locale, options.descriptionSentence?.[path]);
      const photo = options.photos?.[path];
      // Nested product pages publish a factual identifier as their eyebrow ("D66 mm | 202# cap/lid").
      const eyebrow = !isFlat(path) && path !== family.hub ? legacyPage(path)?.[locale].eyebrow : undefined;
      const illustration = options.illustrations?.[path];
      return {
        id: path.split("/").filter(Boolean).join("--"),
        title: options.titles?.[path]?.[locale] ?? pageTitle(path, locale),
        ...(path === family.hub ? { overview: true } : {}),
        ...(eyebrow && IDENTIFIER.test(eyebrow) ? { meta: eyebrow } : {}),
        ...(description ? { description: description.text } : {}),
        ...(photo ? { image: photo.src, imageAlt: photo.alt[locale], imagePosition: photo.position } : {}),
        ...(illustration && !photo ? { illustration } : {}),
        keywords: paths.flatMap((item) => [pageTitle(item, "en"), pageTitle(item, "es")]).join(" "),
        resources: paths.map(link)
      };
    });

  // Items with the same name: the nested product page keeps it; the others are told apart by
  // their first section heading (e.g. "Crown Cork Bottle Caps: Characteristics").
  const pathOf = (item: ProductResourceItem) =>
    family.paths.find((candidate) => publicUrl(candidate, locale) === item.resources[0].href)!;
  for (const item of items) {
    if (options.titles?.[pathOf(item)]) continue;
    const twins = items.filter((other) => other.title === item.title);
    if (twins.length < 2) continue;
    const keeper = twins.find((other) => !isFlat(pathOf(other))) ?? twins[0];
    if (item === keeper) continue;
    const heading = legacyPage(pathOf(item))?.[locale].sections.find((section) => section.heading)?.heading;
    if (heading) item.title = `${item.title}: ${heading}`;
  }

  const hubSentence = options.groupDescription
    ? { text: options.groupDescription[locale] }
    : family.hub
      ? firstSentence(family.hub, locale)
      : undefined;
  return {
    id: family.id,
    title: family.label[locale],
    ...(options.eyebrow ? { eyebrow: options.eyebrow[locale] } : {}),
    ...(hubSentence ? { description: hubSentence.text } : {}),
    ...(options.image ? { image: options.image.src, imageAlt: options.image.alt[locale] } : {}),
    items
  };
}

/** Technical specification pages: analysis sheets and paired specification pages of every family. */
const technicalPaths = new Set([
  ...families.flatMap((family) => family.paths.filter((path) => documentType(path) === "technical")),
  ...families.flatMap((family) => specificationPairs(family).map((pair) => pair.technical))
]);
export const isTechnicalResource = (path: string) => technicalPaths.has(path);
