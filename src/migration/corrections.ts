/**
 * Editorial corrections of demonstrable errors in the crawled legacy copy, applied by
 * scripts/build-migration-manifest.ts to the raw blocks before processing — of both languages,
 * or of one (`locale`) when the two pages publish different text.
 * Scope: wrong fruit names left by copy-paste between product pages (several IQF lime pages
 * were written from the lemon pages), another company's name inherited from copied copy,
 * statements split by the page layout into fragments that change their meaning, and
 * consumer-marketing wording replaced by the product information it contains. Technical values,
 * sizes and specifications are never changed here. Each `find` must still exist on its page
 * (the English one unless `locale` says otherwise), or the build fails, so a correction never
 * silently outlives a change of the source page. Open questions are listed in
 * docs/product-content-reconciliation.md.
 */
import type { Locale } from "../i18n/config.ts";

export type Correction = { path: string; find: string; replace: string; reason: string; locale?: Locale };

/** "Viscous red liquid without additives" + "Flavourings or colourings of any kind": one negative statement, split by the layout. */
const GRAPE_SHEETS = [
  "/merlot",
  "/malbec",
  "/cabernet-sauvignon",
  "/red-800",
  "/red-1000",
  "/rgjc-red-600",
  "/tintorera-red-4000"
];
const grapeCharacteristics: Correction[] = GRAPE_SHEETS.flatMap((path): Correction[] => [
  {
    path,
    find: "Viscous red liquid without additives",
    replace: "Viscous red liquid",
    reason:
      'The layout split one negative statement in two and the second fragment read as an affirmative claim; the list now reads "Viscous red liquid" + "No additives, flavourings or colourings of any kind" (the red grape overview publishes the full sentence).'
  },
  {
    path,
    find: "Flavourings or colourings of any kind",
    replace: "No additives, flavourings or colourings of any kind",
    reason: "Second half of the same statement, restored as a complete negative."
  },
  {
    path,
    locale: "es",
    find: "Líquido rojo viscoso sin aditivos",
    replace: "Líquido rojo viscoso",
    reason: "Same split statement on the Spanish page."
  },
  {
    path,
    locale: "es",
    find: "Saborizantes o colorantes de cualquier tipo",
    replace: "Sin aditivos, saborizantes ni colorantes de ningún tipo",
    reason: "Second half of the same statement, restored as a complete negative."
  }
]);

/** Sentences naming another company ("Valencia Orange"), copied from its website. */
const VALENCIA_ORANGE: [string, string][] = [
  ["/tropical/tamarind", " Furthermore in Valencia Orange we also have organic tamarind."],
  [
    "/tropical/mango",
    "At Valencia Orange we have the varieties of mango totapuri, alphonso, kent, magdalena river and tommy. "
  ],
  ["/mediterranean/peach", "At Valencia Orange we have the varieties of peach freestone, clingstone and white peach. "],
  [
    "/mediterranean/pomegranate",
    "At Valencia Orange we work with different types of pomegranate, such as the mollar pomegranate or the wonderful pomegranate. "
  ],
  [
    "/tropical/coconut",
    "Coconut is a tropical fruit available in Valencia Orange, diced, coconut cream and coconut water."
  ],
  ["/mediterranean/melon", "At Valencia Orange we have the varieties of cantaloupe melon and honeydew melon. "]
];
const valenciaOrange: Correction[] = VALENCIA_ORANGE.map(([path, find]) => ({
  path,
  find,
  replace: "",
  reason:
    "Inherited from another company's copy; the availability it states (varieties, organic) is not confirmed for GFB and is flagged for review."
}));

const ORANGE_COPY =
  "Versatile and Convenient: Whether mixed with water for a revitalizing drink, blended into smoothies for a nutritious boost, or used as a flavorful ingredient in culinary creations, our orange concentrate adds a touch of Mediterranean sunshine to any occasion.\nNaturally Energizing: Experience a natural energy boost with every glass of Spanish orange concentrate, revitalizing your body and replenishing your spirit with the invigorating essence of freshly squeezed oranges.\nDiscover the vibrant flavors and healthful benefits of Spanish orange concentrate – a pure taste of Spain in every drop.";
const orange: Correction[] = [
  {
    path: "/citrics/orange-concentrate",
    locale: "en",
    find: ORANGE_COPY,
    replace:
      "Orange concentrate can be mixed with water for drinks, blended into smoothies or used as an ingredient in culinary preparations.",
    reason:
      "Consumer energy/well-being wording; kept only the uses it states. The origin claim (Spanish oranges) is flagged for review."
  },
  {
    path: "/citrics/orange-concentrate",
    locale: "es",
    find: ORANGE_COPY,
    replace:
      "El concentrado de naranja puede mezclarse con agua para bebidas, añadirse a batidos o usarse como ingrediente en preparaciones culinarias.",
    reason: "The Spanish page publishes the same English copy; same correction, in Spanish."
  },
  {
    path: "/citrics/orange-concentrate",
    locale: "en",
    find: "Discover the Pure Essence of Spanish Orange Concentrate",
    replace: "Applications",
    reason: "Promotional heading (with an unconfirmed origin claim) replaced by a functional one."
  },
  {
    path: "/citrics/orange-concentrate",
    locale: "es",
    find: "Discover the Pure Essence of Spanish Orange Concentrate",
    replace: "Aplicaciones",
    reason: "Same heading on the Spanish page."
  }
];

export const corrections: Correction[] = [
  {
    path: "/vegetables/ginger",
    find: "\nAdditionally, it should be noted that ginger is used.",
    replace: "",
    reason: "Truncated sentence (the source page ends it mid-statement)."
  },
  {
    path: "/vegetables/pepper",
    find: "concentrate, juice or puree.`",
    replace: "concentrate, juice or puree.",
    reason: "Stray backtick in the published sentence."
  },
  ...grapeCharacteristics,
  ...valenciaOrange,
  ...orange,
  {
    path: "/iqf-lemon-slices/iqf-lemon-one-fourths-cut",
    find: "then the grapefruit is rotated 90 degrees",
    replace: "then the lemon is rotated 90 degrees",
    reason: "The lemon 1/4 cut page describes rotating a grapefruit."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-slice--6-%2F-9-mm",
    find: "Lime Slice is a slice cut from the lemon fruit, which is a very sharp, acidic citrus fruit with a shiny yellow skin and bitter but zingy flavour.",
    replace:
      "Lime Slice is a slice cut from the lime fruit, a very sharp, acidic citrus fruit with a bitter but zingy flavour.",
    reason: "Describes lime as a slice of lemon with yellow skin (copied from the lemon page)."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-half-slices-6-%2F-9-mm",
    find: "Lime Half Slice is a slice cut from the lemon fruit and additionally cut in half, which is a very strong acidic citrus fruit with a bright yellow skin and a bitter but pungent taste.",
    replace:
      "Lime Half Slice is a slice cut from the lime fruit and additionally cut in half, a very strong acidic citrus fruit with a bitter but pungent taste.",
    reason: "Describes lime as a slice of lemon with yellow skin (copied from the lemon page)."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F4-cut",
    find: "then the lemon is rotated 90 degrees",
    replace: "then the lime is rotated 90 degrees",
    reason: "The lime 1/4 cut page describes rotating a lemon."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: "These lemon wedges can be added",
    replace: "These lime wedges can be added",
    reason: "The lime 1/8 cut page calls the product lemon wedges."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: "Cut lemon wedges can be stored",
    replace: "Cut lime wedges can be stored",
    reason: "The lime 1/8 cut page calls the product lemon wedges."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-1%2F8-cut",
    find: "Ingredients: IQF Lemon 1/8 Cut",
    replace: "Ingredients: IQF Lime 1/8 Cut",
    reason: "The ingredient of the lime 1/8 cut is given as lemon (product label to confirm with GFB)."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
    find: "Lemon sticks are ideal",
    replace: "Lime sticks are ideal",
    reason: "The lime sticks page calls the product lemon sticks."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
    find: "Lemon sticks are excellent",
    replace: "Lime sticks are excellent",
    reason: "The lime sticks page calls the product lemon sticks."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-13-x-13-sticks",
    find: "Lemon sticks also serve",
    replace: "Lime sticks also serve",
    reason: "The lime sticks page calls the product lemon sticks."
  },
  {
    path: "/iqf-lime-slices/iqf-lime-zest",
    find: "The lemon peel is washed",
    replace: "The lime peel is washed",
    reason: "The lime zest process describes lemon peel."
  }
];

/** Applies the corrections of one page and language to a text block; returns the text and those applied. */
export function correctText(
  path: string,
  text: string,
  locale: Locale = "en"
): { text: string; applied: Correction[] } {
  const applied: Correction[] = [];
  let result = text;
  for (const correction of corrections) {
    if (correction.path !== path || (correction.locale && correction.locale !== locale)) continue;
    if (!result.includes(correction.find)) continue;
    result = result.replaceAll(correction.find, correction.replace);
    applied.push(correction);
  }
  return { text: result, applied };
}
