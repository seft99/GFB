import type { DivisionId } from "../content/types.ts";
import type { LocalizedText } from "../i18n/config.ts";

/**
 * Page identity of every legacy (Wix) public path, independent of component filenames.
 *
 * - `redesigned`: the path is the public canonical of a redesigned page (Home, About, a
 *   division or a category); the proxy renders that page at the legacy URL.
 * - `redirect`: Wix already redirected this sitemap entry to another legacy page; it keeps a
 *   one-to-one permanent redirect to the same page in the same language.
 * - `detail`: a product, specification or subcategory page rendered by the data-driven legacy
 *   detail template from its crawled content, inside a family with a parent category.
 */

export type RedesignedTarget =
  { page: "home" } | { page: "about" } | { division: DivisionId } | { division: DivisionId; category: string };

/** Public paths of redesigned pages. Keys are exact, case-sensitive legacy paths. */
export const redesignedPaths: Record<string, RedesignedTarget> = {
  "/": { page: "home" },
  "/about-us": { page: "about" },
  "/packaging-solutions": { division: "packaging-solutions" },
  "/cans": { division: "packaging-solutions", category: "cans" },
  "/bottles": { division: "packaging-solutions", category: "bottles" },
  "/closures": { division: "packaging-solutions", category: "closures" },
  "/labels": { division: "packaging-solutions", category: "labels" },
  "/raw-materials": { division: "raw-materials" },
  "/fruits-concentrates": { division: "raw-materials", category: "fruit-concentrates" },
  "/plant-based-concentrate": { division: "raw-materials", category: "plant-based-concentrates" },
  "/frozen-fruits": { division: "raw-materials", category: "iqf-frozen-fruits" },
  "/flavours-and-aromas": { division: "flavours-aromas" },
  "/sweets": { division: "flavours-aromas", category: "sweet-applications" },
  "/beverages": { division: "flavours-aromas", category: "beverage-applications" },
  "/savoury": { division: "flavours-aromas", category: "savoury-applications" },
  "/consulting-solutions": { division: "industrial-consulting" }
};

/**
 * Sitemap entries that Wix itself answers with a 301 to another legacy page (observed
 * 2026-10-27/28). Kept as one-to-one permanent redirects; the Spanish request keeps `lang=es`.
 */
export const legacyRedirects: Record<string, string> = {
  "/frozen-orange": "/iqf-orange",
  "/frozen-grapefruit": "/iqf-grapefruit",
  "/frozen-lime": "/iqf-lime"
};

export type FamilyParent = { division: DivisionId; category?: string };

export type Family = {
  id: string;
  label: LocalizedText;
  parent: FamilyParent;
  /** Overview page of the family, when one exists. */
  hub?: string;
  /** Exact legacy paths, in display order. */
  paths: string[];
  /** Business/content review required before the page is considered final. */
  review?: string;
};

const concentrates = (folder: string, slugs: string[]) => slugs.map((slug) => `/${folder}/${slug}`);

export const families: Family[] = [
  {
    id: "aluminium-cans",
    label: { en: "Aluminium cans", es: "Latas de aluminio" },
    parent: { division: "packaging-solutions", category: "cans" },
    hub: "/aluminium-cans",
    paths: [
      "/aluminium-cans",
      "/aluminum-cans/std-can-d66mm",
      "/aluminum-cans/sleek-can-d57mm",
      "/aluminum-cans/slim-can-d53mm",
      "/std-can-d66mm",
      "/sleek-can-d57mm",
      "/slim-can-d53mm"
    ]
  },
  {
    id: "can-ends",
    label: { en: "Aluminium can ends", es: "Tapas para latas de aluminio" },
    parent: { division: "packaging-solutions", category: "cans" },
    hub: "/aluminum-cans-ends",
    paths: [
      "/aluminum-cans-ends",
      "/aluminium-can-ends/52mm-(202)-dia-aluminium-end",
      "/aluminium-can-ends/52mm-(202)-dia-ise-aluminium-end",
      "/aluminum-can-end-52mm-202-std-sot",
      "/aluminum-can-end-52mm-202-ise-sot"
    ]
  },
  {
    id: "bottle-formats",
    label: { en: "Bottle formats by beverage", es: "Formatos de botella por bebida" },
    parent: { division: "packaging-solutions", category: "bottles" },
    paths: ["/soft-drinks", "/alcoholic-beverage", "/water"]
  },
  {
    id: "crown-corks",
    label: { en: "Crown corks and RipCaps", es: "Tapas corona y RipCaps" },
    parent: { division: "packaging-solutions", category: "closures" },
    hub: "/crown-corks",
    paths: [
      "/crown-corks",
      "/crown-corks-caps",
      "/ripcap/crown-cork-bottle-caps",
      "/ripcap/26-mm-ripcap",
      "/ripcap/26-mm-ring-crown-cap",
      "/ripcap/42-mm-ripcap",
      "/26mm-ripcap",
      "/26mm-ring-crown-cap",
      "/42mm-ripcap"
    ]
  },
  {
    id: "label-types",
    label: { en: "Label types", es: "Tipos de etiqueta" },
    parent: { division: "packaging-solutions", category: "labels" },
    paths: ["/shrink-sleeve-labels", "/washoff-labels", "/wet-glue-labels"]
  },
  {
    id: "citrus-concentrates",
    label: { en: "Citrus concentrates", es: "Concentrados cítricos" },
    parent: { division: "raw-materials", category: "fruit-concentrates" },
    paths: concentrates("citrics", [
      "orange-concentrate",
      "white-grapefruit-concentrate",
      "lime-concentrate",
      "blood-orange-concentrate",
      "lemon-concentrate",
      "pink-grapefruit-concentrate",
      "tangerine-concentrate"
    ])
  },
  {
    id: "mediterranean-concentrates",
    label: { en: "Mediterranean concentrates", es: "Concentrados mediterráneos" },
    parent: { division: "raw-materials", category: "fruit-concentrates" },
    paths: concentrates("mediterranean", [
      "apple",
      "white-grape",
      "persimmon",
      "red-grape",
      "peach",
      "watermelon",
      "pear",
      "pomegranate",
      "apricot",
      "melon"
    ])
  },
  {
    id: "tropical-concentrates",
    label: { en: "Tropical concentrates", es: "Concentrados tropicales" },
    parent: { division: "raw-materials", category: "fruit-concentrates" },
    paths: concentrates("tropical", [
      "passion-fruit",
      "white-guava",
      "pineapple",
      "tamarind",
      "pink-guava",
      "banana",
      "mango",
      "coconut"
    ])
  },
  {
    id: "red-fruit-concentrates",
    label: { en: "Red fruit concentrates", es: "Concentrados de frutos rojos" },
    parent: { division: "raw-materials", category: "fruit-concentrates" },
    paths: concentrates("red-fruits", ["cranberry", "blueberry", "cherry", "raspberry", "blackberry", "strawberry"])
  },
  {
    id: "vegetable-concentrates",
    label: { en: "Vegetable concentrates", es: "Concentrados de vegetales" },
    parent: { division: "raw-materials", category: "fruit-concentrates" },
    paths: concentrates("vegetables", [
      "turnip",
      "pumpkin",
      "tomato",
      "beet",
      "pepper",
      "spinach",
      "celery",
      "cucumber",
      "broccoli",
      "carrot",
      "asparagus",
      "ginger"
    ])
  },
  {
    id: "red-grape-concentrates",
    label: { en: "Red grape juice concentrates", es: "Concentrados de zumo de uva tinta" },
    parent: { division: "raw-materials", category: "fruit-concentrates" },
    hub: "/red-grape-concentrate",
    paths: [
      "/red-grape-concentrate",
      "/fruit-concentrates",
      "/red-grape-juice/merlot",
      "/red-grape-juice/rgjc-r-600",
      "/red-grape-juice/malbec",
      "/red-grape-juice/red-800",
      "/red-grape-juice/cabernet-sauvignon",
      "/red-grape-juice/red-1000",
      "/red-grape-juice/tintorera-r-4000",
      "/merlot",
      "/rgjc-red-600",
      "/malbec",
      "/red-800",
      "/cabernet-sauvignon",
      "/red-1000",
      "/tintorera-red-4000"
    ]
  },
  {
    id: "plant-based-concentrates",
    label: { en: "Plant-based concentrates", es: "Concentrados de origen vegetal" },
    parent: { division: "raw-materials", category: "plant-based-concentrates" },
    paths: ["/plant-based-concentrate-1/oat-concentrate", "/plant-based-concentrate-1/almond-concentrate"]
  },
  {
    id: "iqf-lemon",
    label: { en: "IQF lemon", es: "Limón IQF" },
    parent: { division: "raw-materials", category: "iqf-frozen-fruits" },
    hub: "/iqf-lemon",
    paths: [
      "/iqf-lemon",
      "/frozen-lemon",
      "/iqf-lemon-slices/iqf-lemon-slices",
      "/iqf-lemon-slices/iqf-lemon-half-slices",
      "/iqf-lemon-slices/iqf-lemon-one-fourths-cut",
      "/iqf-lemon-slices/iqf-lemon-one-eights-cut",
      "/iqf-lemon-slices/iqf-lemon-sticks",
      "/iqf-lemon-peel-zest/iqf-lemon-zest",
      "/iqf-lemon-peel-zest/frozen-block-lemon-zest",
      "/iqf-lemon-peel-zest/iqf-lemon-peel-shells",
      "/iqf-lemon-peel-zest/iqf-lemon-peel-square"
    ]
  },
  {
    id: "iqf-orange",
    label: { en: "IQF orange", es: "Naranja IQF" },
    parent: { division: "raw-materials", category: "iqf-frozen-fruits" },
    hub: "/iqf-orange",
    paths: [
      "/iqf-orange",
      "/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm",
      "/iqf-orange-frozen/iqf-orange-half-slices-6-%2F-9-mm",
      "/iqf-orange-frozen/iqf-orange-1%2F4--cut",
      "/iqf-orange-frozen/iqf-orange-1%2F8-cut",
      "/iqf-orange-frozen/iqf-orange-13-x-13-sticks",
      "/iqf-orange-frozen/iqf-orange-julienne-cut",
      "/iqf-orange-frozen/iqf-orange-zest",
      "/iqf-orange-frozen/frozen-block-orange-zest",
      "/iqf-orange-frozen/iqf-orange-peel-shells",
      "/iqf-orange-frozen/iqf-orange-peel-square"
    ]
  },
  {
    id: "iqf-lime",
    label: { en: "IQF lime", es: "Lima IQF" },
    parent: { division: "raw-materials", category: "iqf-frozen-fruits" },
    hub: "/iqf-lime",
    paths: [
      "/iqf-lime",
      "/iqf-lime-slices/iqf-lime-slice--6-%2F-9-mm",
      "/iqf-lime-slices/iqf-lime-half-slices-6-%2F-9-mm",
      "/iqf-lime-slices/iqf-lime-1%2F4-cut",
      "/iqf-lime-slices/iqf-lime-1%2F8-cut",
      "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
      "/iqf-lime-slices/iqf-lime-zest"
    ]
  },
  {
    id: "iqf-grapefruit",
    label: { en: "IQF grapefruit", es: "Pomelo IQF" },
    parent: { division: "raw-materials", category: "iqf-frozen-fruits" },
    hub: "/iqf-grapefruit",
    paths: [
      "/iqf-grapefruit",
      "/iqf-grapefruit-frozen/iqf-grapefruit-slices",
      "/iqf-grapefruit-frozen/iqf-grapefruit-half-slices",
      "/iqf-grapefruit-frozen/iqf-grapefruit-one-fourths-cut",
      "/iqf-grapefruit-frozen/iqf-grapefruit-one-eights-cut"
    ]
  },
  {
    id: "legacy-overviews",
    label: { en: "Additives and ingredients", es: "Aditivos e ingredientes" },
    parent: { division: "raw-materials" },
    paths: ["/additives", "/ingredients-and-materials"],
    review:
      "Older overview content with offers that are not part of the current verified scope (for example manufacturing claims). Retained at 200 with unsupported claims filtered; needs a business decision."
  }
];

/**
 * Internal URLs linked from official pages but absent from the sitemaps, observed as 301 to
 * the slash-less path and then 404. No verified destination exists, so they stay 404.
 */
export const brokenHistoricalLinks = [
  "/engineering-and-machinery/",
  "/food-tech-solutions/",
  "/ingredients-and-chemicals/"
];

const familyByPath = new Map(families.flatMap((family) => family.paths.map((path) => [path, family] as const)));

export function familyOf(path: string): Family | undefined {
  return familyByPath.get(path);
}

export type LegacyKind = "redesigned" | "redirect" | "detail";

export function legacyKind(path: string): LegacyKind | undefined {
  if (path in redesignedPaths) return "redesigned";
  if (path in legacyRedirects) return "redirect";
  if (familyByPath.has(path)) return "detail";
  return undefined;
}

/** Filesystem- and URL-safe key of a legacy detail path (base64url), used by its internal route. */
export function legacyKey(path: string): string {
  return Buffer.from(path, "utf8").toString("base64url");
}

export function pathFromKey(key: string): string {
  return Buffer.from(key, "base64url").toString("utf8");
}
