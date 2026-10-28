import type { Locale, LocalizedText } from "../i18n/config.ts";
import { getDictionary } from "../i18n/dictionaries/index.ts";
import { families, familyOf, type Family } from "./families.ts";
import type { DocumentType, LibraryConfig, LibraryFamily, LibraryProduct, LibraryResource } from "./library-search.ts";
import { legacyLinkLabel, legacyPage } from "./manifest.ts";
import { publicUrl } from "./public-paths.ts";

/**
 * Catalogue configurations of the shared technical product library
 * (components/sections/technical-library.tsx), one per page. Built from the migration families
 * and crawled page content — no separate product dataset, no invented routes or documents.
 *
 * - Resource type comes from the published page content: a page with "Analysis" /
 *   "Microbiology" specification tables is a technical sheet; every other page is a product
 *   page (a product page with storage or presentation details is still a product page).
 * - Concentrates: the five portfolio families plus the red grape document group, whose variety
 *   overviews are paired with their technical sheets only where the pair is explicit below
 *   (verified by tests: same variety, same °Brix range). It has the red grape banner.
 * - Frozen fruits: the four IQF fruits of the official catalogue (lemon, orange, lime,
 *   grapefruit), one product page per reference, no technical sheets and no banner.
 */

const TECHNICAL_HEADING = /^(analysis|análisis|microbiology|microbiología)$/i;

/** Document type from the page content: analysis/microbiology tables make a technical sheet. */
export function documentType(path: string): DocumentType {
  const page = legacyPage(path);
  const technical = page?.en.sections.some(
    (section) =>
      section.heading && TECHNICAL_HEADING.test(section.heading) && section.items.some((item) => item.type === "specs")
  );
  return technical ? "technical" : "product";
}

/** Display name: single-line page H1 (Wix sometimes breaks codes over two lines). */
const pageName = (path: string, locale: Locale) => (legacyPage(path)?.[locale].h1 ?? path).replace(/\s*\n\s*/g, " ");

/**
 * Display wording of published cut names: Wix writes "one fourths cut" / "one eights cut" on
 * some IQF pages and "1/4 cut" / "1/8 cut" on others. Display only: URLs, page titles and the
 * crawled content keep the published text, and the old wording stays searchable (cutAliases).
 */
export const displayProductName = (name: string) =>
  name.replace(/\bone fourths cut\b/gi, "1/4 cut").replace(/\bone eights cut\b/gi, "1/8 cut");

/**
 * General pages that are not one product reference: each family hub plus the two other overview
 * pages of the catalogue (/frozen-lemon lists the lemon range and its features; /fruit-concentrates
 * introduces the red grape concentrates).
 */
const OVERVIEW_PAGES = new Set(["/frozen-lemon", "/fruit-concentrates"]);
export const isOverview = (path: string) => familyOf(path)?.hub === path || OVERVIEW_PAGES.has(path);

function resource(path: string, locale: Locale): LibraryResource {
  return {
    id: `${locale}:${path}`,
    type: documentType(path),
    title: pageName(path, locale),
    href: publicUrl(path, locale),
    path,
    ...(isOverview(path) ? { overview: true } : {})
  };
}

const keywordsFor = (paths: string[], extra: string[] = []) =>
  [...paths.flatMap((path) => [pageName(path, "en"), pageName(path, "es")]), ...extra].join(" ");

function familyById(id: string): Family {
  const family = families.find((item) => item.id === id);
  if (!family) throw new Error(`Unknown library family ${id}`);
  return family;
}

type GroupSource = {
  id: string;
  slug: string;
  title: LocalizedText;
  heading: LocalizedText;
  thumb: string;
  description: LocalizedText;
  products: (locale: Locale) => LibraryProduct[];
  /** Groups whose records combine product overviews and technical sheets. */
  documentGroup?: boolean;
  /** Noun of the group's product records ("formats" for IQF cuts, "products" otherwise). */
  unit?: "products" | "formats";
};

/**
 * Counts in commercial terms: product records (not range overviews) and, where published, their
 * specification sheets, e.g. "7 products · 7 specifications" or "9 formats". A product with a
 * product page and a technical sheet counts once as a product.
 */
function buildGroup(source: GroupSource, locale: Locale): LibraryFamily {
  const { library } = getDictionary(locale);
  const products = source.products(locale);
  const resourceCount = products.reduce((sum, product) => sum + product.resources.length, 0);
  const productCount = products.filter((product) => !product.resources.every((item) => item.overview)).length;
  const technicalCount = products.reduce(
    (sum, product) => sum + product.resources.filter((item) => item.type === "technical").length,
    0
  );
  const unit = library.units[source.unit ?? "products"];
  return {
    id: source.id,
    slug: source.slug,
    title: source.title[locale],
    heading: source.heading[locale],
    eyebrow: source.documentGroup ? library.groupEyebrow : library.familyEyebrow,
    description: source.description[locale],
    thumb: source.thumb,
    productCount,
    resourceCount,
    countLabel: `${productCount} ${productCount === 1 ? unit.one : unit.other}${
      technicalCount ? ` · ${technicalCount} ${library.specifications}` : ""
    }`,
    countNoun: unit.other,
    products
  };
}

/** One record per legacy page of a family (one product-page resource each). */
const pagesOf =
  (familyId: string, aliases: (name: string) => string[] = () => []) =>
  (locale: Locale): LibraryProduct[] =>
    familyById(familyId).paths.map((path) => ({
      id: path.split("/").filter(Boolean).join("--"),
      // Descriptive, unique label (two Wix pages can share a translated title).
      name: displayProductName(legacyLinkLabel(path, locale)),
      keywords: keywordsFor([path], aliases(pageName(path, "en"))),
      resources: [resource(path, locale)]
    }));

// ---------- Concentrates ----------

const CONCENTRATE_DESCRIPTION: LocalizedText = {
  en: "Open a concentrate to see the formats in which it is supplied.",
  es: "Abra un concentrado para ver los formatos en los que se suministra."
};

const concentrateFamily = (id: string, slug: string, title: LocalizedText, thumb: string): GroupSource => ({
  id,
  slug,
  title,
  heading: familyById(id).label,
  thumb: `/images/raw-materials/concentrates/${thumb}.webp`,
  description: CONCENTRATE_DESCRIPTION,
  products: (locale) =>
    pagesOf(id)(locale).map((product) => ({ ...product, keywords: `${product.keywords} ${title.en} ${title.es}` }))
});

/**
 * Red grape records. `product` is the variety overview (nested Wix page), `technical` the
 * analysis sheet (flat Wix page). Overviews of the whole group have no technical sheet.
 */
export const redGrapeRecords: {
  id: string;
  product: string;
  technical?: string;
  codes?: string[];
  /** Name of a group overview (the Spanish Wix title of /fruit-concentrates is inaccurate). */
  name?: LocalizedText;
}[] = [
  {
    id: "red-grape-juice-concentrate",
    product: "/red-grape-concentrate",
    name: { en: "Red grape juice concentrate", es: "Concentrado de zumo de uva tinta" }
  },
  {
    id: "red-grape-concentrates",
    product: "/fruit-concentrates",
    name: { en: "Red grape concentrates", es: "Concentrados de uva tinta" }
  },
  { id: "merlot", product: "/red-grape-juice/merlot", technical: "/merlot" },
  { id: "rgjc-r-600", product: "/red-grape-juice/rgjc-r-600", technical: "/rgjc-red-600", codes: ["RGJC R-600"] },
  { id: "malbec", product: "/red-grape-juice/malbec", technical: "/malbec" },
  { id: "red-800", product: "/red-grape-juice/red-800", technical: "/red-800", codes: ["RED-800"] },
  { id: "cabernet-sauvignon", product: "/red-grape-juice/cabernet-sauvignon", technical: "/cabernet-sauvignon" },
  { id: "red-1000", product: "/red-grape-juice/red-1000", technical: "/red-1000", codes: ["RED-1000"] },
  {
    id: "tintorera-r-4000",
    product: "/red-grape-juice/tintorera-r-4000",
    technical: "/tintorera-red-4000",
    codes: ["Tintorera R-4000"]
  }
];

const RED_GRAPE_TITLE: LocalizedText = { en: "Red grape specifications", es: "Especificaciones de uva tinta" };

const concentrateGroups: GroupSource[] = [
  concentrateFamily("citrus-concentrates", "citrus", { en: "Citrus", es: "Cítricos" }, "citrus-thumb"),
  concentrateFamily(
    "mediterranean-concentrates",
    "mediterranean",
    { en: "Mediterranean", es: "Mediterráneos" },
    "mediterranean-thumb"
  ),
  concentrateFamily("tropical-concentrates", "tropical", { en: "Tropical", es: "Tropicales" }, "tropical-thumb"),
  concentrateFamily(
    "red-fruit-concentrates",
    "red-fruits",
    { en: "Red fruits", es: "Frutos rojos" },
    "red-fruits-thumb"
  ),
  concentrateFamily("vegetable-concentrates", "vegetables", { en: "Vegetables", es: "Vegetales" }, "vegetables-thumb"),
  {
    id: "red-grape-concentrates",
    slug: "red-grape",
    title: RED_GRAPE_TITLE,
    heading: RED_GRAPE_TITLE,
    thumb: "/images/raw-materials/concentrates/red-grape-thumb.webp",
    description: {
      en: "Red grape juice concentrate varieties, each with its product page and its specifications (analysis and microbiology).",
      es: "Variedades de concentrado de zumo de uva tinta, cada una con su ficha de producto y sus especificaciones (análisis y microbiología)."
    },
    documentGroup: true,
    products: (locale) =>
      redGrapeRecords.map((record) => {
        const paths = [record.product, ...(record.technical ? [record.technical] : [])];
        return {
          id: record.id,
          // Commercial names and codes come from the English page: Wix translated some codes.
          name: record.name?.[locale] ?? record.codes?.[0] ?? pageName(record.product, "en"),
          keywords: keywordsFor(paths, [
            ...(record.codes ?? []),
            ...(record.name ? [record.name.en, record.name.es] : []),
            RED_GRAPE_TITLE.en,
            RED_GRAPE_TITLE.es
          ]),
          resources: paths.map((path) => resource(path, locale))
        };
      })
  }
];

// ---------- Frozen fruits (IQF) ----------

/**
 * Search aliases for published cut names: Wix writes the same cut as "one fourths cut" (lemon,
 * grapefruit) or "1/4 cut" (orange, lime), and lime slices as "slice". Aliases only help
 * matching; names stay as published.
 */
export function cutAliases(name: string): string[] {
  const aliases: string[] = [];
  if (/\bslice\b/i.test(name)) aliases.push("slices");
  if (/one fourths|1\/4/i.test(name)) aliases.push("1/4 cut", "one fourths cut", "quarter cut", "cuartos");
  if (/one eights|1\/8/i.test(name)) aliases.push("1/8 cut", "one eights cut", "eighth cut", "octavos");
  return aliases;
}

const IQF_DESCRIPTION: LocalizedText = {
  en: "Start with the range overview, or open a format for its presentation and storage details.",
  es: "Empiece por la presentación de la gama o abra un formato para ver su presentación y conservación."
};

const iqfGroup = (id: string, slug: string, title: LocalizedText): GroupSource => ({
  id,
  slug,
  title,
  heading: familyById(id).label,
  thumb: `/images/raw-materials/iqf/${id}-thumb.webp`,
  description: IQF_DESCRIPTION,
  unit: "formats",
  products: (locale) =>
    pagesOf(
      id,
      cutAliases
    )(locale).map((product) => ({
      ...product,
      keywords: `${product.keywords} ${title.en} ${title.es} IQF`
    }))
});

const frozenGroups: GroupSource[] = [
  iqfGroup("iqf-lemon", "lemon", { en: "Lemon", es: "Limón" }),
  iqfGroup("iqf-orange", "orange", { en: "Orange", es: "Naranja" }),
  iqfGroup("iqf-lime", "lime", { en: "Lime", es: "Lima" }),
  iqfGroup("iqf-grapefruit", "grapefruit", { en: "Grapefruit", es: "Pomelo" })
];

// ---------- Configurations ----------

export function concentratesLibrary(locale: Locale): LibraryConfig {
  const { library } = getDictionary(locale);
  return {
    id: "concentrates",
    intro: { eyebrow: library.eyebrow, title: library.title, text: library.text },
    families: concentrateGroups.map((group) => buildGroup(group, locale)),
    // Same family as the explorer's default (catalog `explorer.defaultGroup`), so both
    // components agree on a page without a `family` parameter.
    defaultFamilyId: "mediterranean-concentrates",
    noTechnicalHint: library.noTechnicalHint,
    banner: {
      groupId: "red-grape-concentrates",
      eyebrow: library.grapeEyebrow,
      title: library.grapeTitle,
      text: library.grapeText,
      action: library.grapeAction,
      image: "/images/raw-materials/concentrates/red-grape-thumb.webp"
    }
  };
}

export function frozenFruitsLibrary(locale: Locale): LibraryConfig {
  const { libraryFrozen } = getDictionary(locale);
  return {
    id: "frozen-fruits",
    intro: { eyebrow: libraryFrozen.eyebrow, title: libraryFrozen.title, text: libraryFrozen.text },
    families: frozenGroups.map((group) => buildGroup(group, locale)),
    noTechnicalHint: libraryFrozen.noTechnicalHint
  };
}

/** Library of a category page, when it has one. */
export function categoryLibrary(categoryId: string, locale: Locale): LibraryConfig | undefined {
  if (categoryId === "fruit-concentrates") return concentratesLibrary(locale);
  if (categoryId === "iqf-frozen-fruits") return frozenFruitsLibrary(locale);
  return undefined;
}
