import assert from "node:assert/strict";
import test from "node:test";
import { detailPaths, legacyPage } from "../../src/migration/manifest.ts";
import {
  contentStrings,
  productContent,
  productContentVariant,
  sourceStrings,
  type ProductContentVariant
} from "../../src/migration/product-content.ts";

test("every detail page keeps every published string after arrangement (EN and ES)", () => {
  for (const path of detailPaths)
    for (const locale of ["en", "es"] as const) {
      const sections = legacyPage(path)![locale].sections;
      assert.deepEqual(contentStrings(productContent(path, sections)), sourceStrings(sections), `${path} (${locale})`);
    }
});

test("variants are assigned explicitly from the canonical families and page kinds", () => {
  const counts: Record<ProductContentVariant, number> = {
    "formats-overview": 0,
    "facts-applications": 0,
    "technical-specification": 0,
    "product-range-features": 0
  };
  for (const path of detailPaths) counts[productContentVariant(path).variant]++;
  assert.equal(detailPaths.length, 124);
  assert.deepEqual(counts, {
    "formats-overview": 45,
    "facts-applications": 29,
    "technical-specification": 15,
    "product-range-features": 35
  });
  assert.equal(productContentVariant("/citrics/orange-concentrate").variant, "formats-overview");
  assert.equal(productContentVariant("/iqf-lemon-slices/iqf-lemon-slices").variant, "facts-applications");
  assert.equal(productContentVariant("/merlot").variant, "technical-specification");
  assert.equal(productContentVariant("/sleek-can-d57mm").variant, "technical-specification");
  assert.equal(productContentVariant("/soft-drinks").variant, "product-range-features");
  assert.equal(productContentVariant("/iqf-lemon").variant, "product-range-features");
  assert.equal(productContentVariant("/frozen-lemon").variant, "product-range-features");
});

test("formats are format groups; long editorial cells never become chips", () => {
  const orange = productContent("/citrics/orange-concentrate", legacyPage("/citrics/orange-concentrate")!.en.sections);
  assert.equal(orange.variant, "formats-overview");
  if (orange.variant !== "formats-overview") return;
  assert.deepEqual(orange.formats[0], {
    label: "Concentrates",
    values: ["Juice concentrate cloudy", "Juice concentrate clear"]
  });
  assert.equal(orange.formats.length, 6);
  const oat = productContent(
    "/plant-based-concentrate-1/oat-concentrate",
    legacyPage("/plant-based-concentrate-1/oat-concentrate")!.en.sections
  );
  if (oat.variant !== "formats-overview") assert.fail();
  assert.deepEqual(
    oat.formats.map((row) => row.label),
    ["Concentrates"]
  );
  assert.ok(oat.notes.every((note) => note.text.length > 140));
  const cranberry = productContent("/red-fruits/cranberry", legacyPage("/red-fruits/cranberry")!.en.sections);
  if (cranberry.variant !== "formats-overview") assert.fail();
  assert.ok(cranberry.formats.some((row) => row.label === "Deionized concentrates"));
});

test("technical pages keep identifiers apart and bottle models under their published groups", () => {
  const sleek = productContent("/sleek-can-d57mm", legacyPage("/sleek-can-d57mm")!.en.sections);
  if (sleek.variant !== "technical-specification") assert.fail();
  assert.deepEqual(
    sleek.identifiers.map((identifier) => identifier.text),
    ["D57.4 mm", "202# cap/lid", "Aluminium cans"]
  );
  const merlot = productContent("/merlot", legacyPage("/merlot")!.en.sections);
  if (merlot.variant !== "technical-specification") assert.fail();
  assert.deepEqual(
    merlot.panels.map((panel) => panel.heading),
    ["Analysis", "Microbiology", "Characteristics"]
  );
  const spirits = productContent("/alcoholic-beverage", legacyPage("/alcoholic-beverage")!.en.sections);
  if (spirits.variant !== "product-range-features") assert.fail();
  assert.equal(spirits.arrangement, "reference-collection");
  assert.deepEqual(
    spirits.references.map((group) => [group.label, group.models.length]),
    [
      ["Spirits", 1],
      ["Wine", 2],
      ["Beer", 7]
    ]
  );
});
