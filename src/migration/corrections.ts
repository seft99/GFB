/**
 * Editorial corrections of demonstrable errors in the crawled legacy copy, applied by
 * scripts/build-migration-manifest.ts to the raw blocks of both languages before processing.
 * Scope: wrong fruit names left by copy-paste between product pages (several IQF lime pages
 * were written from the lemon pages). Technical values, sizes and specifications are never
 * changed here. Each `find` must still exist on the English page, or the build fails, so a
 * correction never silently outlives a change of the source page.
 */
export type Correction = { path: string; find: string; replace: string; reason: string };

export const corrections: Correction[] = [
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

/** Applies the corrections of one page to a text block; returns the text and how many applied. */
export function correctText(path: string, text: string): { text: string; applied: Correction[] } {
  const applied: Correction[] = [];
  let result = text;
  for (const correction of corrections) {
    if (correction.path !== path || !result.includes(correction.find)) continue;
    result = result.replaceAll(correction.find, correction.replace);
    applied.push(correction);
  }
  return { text: result, applied };
}
