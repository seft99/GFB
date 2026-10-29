import assert from "node:assert/strict";
import test from "node:test";
import { detailPaths, legacyPage } from "../../src/migration/manifest.ts";
import {
  contentStrings,
  isDefinitions,
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
    "technical-specification": 25,
    "product-range-features": 25
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
  // The "Oat Benefits" health text published in the formats table is withheld at the source.
  assert.deepEqual(oat.notes, []);
  assert.ok(orange.formats.some((row) => row.label === "Deionized concentrates"));
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
    merlot.panels.map((panel) => (isDefinitions(panel) ? "definitions" : panel.heading)),
    ["Analysis", "Microbiology", "Characteristics"]
  );
  // One-value properties are consolidated into one definition list (can end coatings).
  const end = productContent(
    "/aluminum-can-end-52mm-202-ise-sot",
    legacyPage("/aluminum-can-end-52mm-202-ise-sot")!.en.sections
  );
  if (end.variant !== "technical-specification") assert.fail();
  const [coatings] = end.panels;
  assert.ok(isDefinitions(coatings));
  assert.deepEqual(
    coatings.definitions.map((entry) => entry.term),
    ["Internal lacquer specs", "External lacquer specs", "Lining compound specs"]
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

test("measurements split into value, unit and condition without changing the published text", async () => {
  const { parseMeasurement, heightsByVolume, splitReference } = await import("../../src/migration/product-content.ts");
  for (const [cell, expected] of [
    ["67 - 69 @ 20 °C", { value: "67 - 69", condition: "@ 20 °C" }],
    ["< 150 NTU At 16 °Brix", { value: "< 150", unit: "NTU", condition: "At 16 °Brix" }],
    ["2.8 - 3.8 Potentiometry", { value: "2.8 - 3.8", condition: "Potentiometry" }],
    ["< 10 UFC/ grs", { value: "< 10", unit: "UFC/ grs" }],
    ["Negative", { value: "Negative" }]
  ] as const) {
    const parsed = parseMeasurement(cell);
    assert.deepEqual(parsed, expected, cell);
    // Cells read in order give the published text back.
    assert.equal([parsed!.value, parsed!.unit, parsed!.condition].filter(Boolean).join(" "), cell);
  }
  assert.equal(parseMeasurement("Standard Liner | Free - Liner"), undefined);
  assert.deepEqual(heightsByVolume("measuring 92 mm for 250 ml, 115 mm for 330 ml"), [
    { height: "92 mm", volume: "250 ml" },
    { height: "115 mm", volume: "330 ml" }
  ]);
  assert.deepEqual(splitReference("Mineral Water Bottles- 333320"), { type: "Mineral Water Bottles", code: "333320" });
});
