import assert from "node:assert/strict";
import test from "node:test";
import { families } from "../../src/migration/families.ts";
import {
  compactSearch,
  matchesQuery,
  normalizeSearch,
  type LibraryConfig,
  type LibraryFamily
} from "../../src/migration/library-search.ts";
import { legacyPage } from "../../src/migration/manifest.ts";
import { publicUrl } from "../../src/migration/public-paths.ts";
import {
  categoryLibrary,
  concentratesLibrary,
  documentType,
  frozenFruitsLibrary,
  redGrapeRecords
} from "../../src/migration/technical-library.ts";

const library = concentratesLibrary("en").families;
const frozen = frozenFruitsLibrary("en").families;
const byId = (id: string) => library.find((family) => family.id === id)!;
const search = (query: string, pool: LibraryFamily[] = library) =>
  pool.flatMap((family) =>
    family.products.filter((product) => matchesQuery(product, family.title, query)).map((p) => p.name)
  );
const resourcesOf = (config: LibraryConfig) =>
  config.families.flatMap((family) => family.products.flatMap((product) => product.resources));

test("both category pages reuse the one library contract; other categories have none", () => {
  assert.equal(categoryLibrary("fruit-concentrates", "en")?.id, "concentrates");
  assert.equal(categoryLibrary("iqf-frozen-fruits", "es")?.id, "frozen-fruits");
  assert.equal(categoryLibrary("plant-based-concentrates", "en"), undefined);
  for (const locale of ["en", "es"] as const)
    for (const config of [concentratesLibrary(locale), frozenFruitsLibrary(locale)]) {
      const slugs = config.families.map((family) => family.slug);
      assert.equal(new Set(slugs).size, slugs.length, `${config.id}: duplicate family slugs`);
      assert.ok(config.intro.title && config.intro.text && config.noTechnicalHint);
      if (config.banner)
        assert.ok(
          config.families.some((family) => family.id === config.banner!.groupId),
          config.banner.groupId
        );
    }
});

test("the five portfolio families keep their verified counts; red grape is a separate document group", () => {
  assert.deepEqual(
    library.map((family) => [family.id, family.productCount, family.resourceCount]),
    [
      ["citrus-concentrates", 7, 7],
      ["mediterranean-concentrates", 10, 10],
      ["tropical-concentrates", 8, 8],
      ["red-fruit-concentrates", 6, 6],
      ["vegetable-concentrates", 12, 12],
      // Products exclude the two red grape overviews; the 16 pages include them.
      ["red-grape-concentrates", 7, 16]
    ]
  );
  assert.deepEqual(
    library.map((family) => family.slug),
    ["citrus", "mediterranean", "tropical", "red-fruits", "vegetables", "red-grape"]
  );
  assert.equal(byId("red-grape-concentrates").countLabel, "7 products · 7 specifications");
  assert.equal(byId("citrus-concentrates").countLabel, "7 products");
  // Same default family as the concentrate explorer (catalog explorer.defaultGroup).
  assert.equal(concentratesLibrary("en").defaultFamilyId, "mediterranean-concentrates");
  assert.equal(concentratesLibrary("en").banner?.groupId, "red-grape-concentrates");
});

test("every existing family route is represented exactly once, with its public URL", () => {
  for (const locale of ["en", "es"] as const)
    for (const config of [concentratesLibrary(locale), frozenFruitsLibrary(locale)]) {
      const resources = resourcesOf(config);
      const expected = families
        .filter((family) => config.families.some((item) => item.id === family.id))
        .flatMap((family) => family.paths);
      assert.deepEqual(resources.map((resource) => resource.path).sort(), [...expected].sort(), config.id);
      assert.equal(new Set(resources.map((resource) => resource.id)).size, resources.length);
      for (const resource of resources) assert.equal(resource.href, publicUrl(resource.path, locale));
    }
});

test("resource types come from page content: only the 7 analysis sheets are technical", () => {
  const technical = library
    .flatMap((family) => family.products.flatMap((product) => product.resources))
    .filter((resource) => resource.type === "technical")
    .map((resource) => resource.path)
    .sort();
  assert.deepEqual(technical, [
    "/cabernet-sauvignon",
    "/malbec",
    "/merlot",
    "/red-1000",
    "/red-800",
    "/rgjc-red-600",
    "/tintorera-red-4000"
  ]);
  for (const id of [
    "citrus-concentrates",
    "mediterranean-concentrates",
    "tropical-concentrates",
    "red-fruit-concentrates",
    "vegetable-concentrates"
  ])
    assert.ok(
      byId(id).products.every((product) => product.resources.every((resource) => resource.type === "product")),
      id
    );
});

test("each red grape overview/technical pair is the same variety with the same °Brix range", () => {
  const brix = (path: string) => {
    const text = JSON.stringify(legacyPage(path)!.en.sections);
    const match =
      text.match(/(\d{2})\s*-\s*(\d{2})\s*(?:@|º|°|Brix)/i) ?? text.match(/Brix[^0-9]{0,40}(\d{2})\s*-\s*(\d{2})/i);
    return match ? `${match[1]}-${match[2]}` : undefined;
  };
  for (const record of redGrapeRecords.filter((item) => item.technical)) {
    assert.equal(documentType(record.product), "product", record.product);
    assert.equal(documentType(record.technical!), "technical", record.technical);
    const overview = brix(record.product);
    const sheet = brix(record.technical!);
    assert.ok(overview && sheet, `${record.id}: °Brix not found`);
    assert.equal(overview, sheet, `${record.id}: ${overview} ≠ ${sheet}`);
  }
});

test("search is partial, case- and accent-insensitive, and keeps technical codes precise", () => {
  assert.equal(normalizeSearch("  Análisis  CÍTRICOS "), "analisis citricos");
  assert.equal(compactSearch("Red -800"), "red800");
  assert.deepEqual(search("Orange concentrate"), ["Orange concentrate", "Blood orange concentrate"]);
  assert.deepEqual(search("blood orange"), ["Blood orange concentrate"]);
  assert.ok(search("grapefruit").length === 2);
  assert.ok(search("MALBEC").includes("Malbec"));
  assert.ok(search("cabernet sauvignon").includes("Cabernet sauvignon"));
  assert.deepEqual(search("RGJC R-600"), ["RGJC R-600"]);
  assert.deepEqual(search("red800"), ["RED-800"]);
  assert.deepEqual(search("RED-800"), ["RED-800"]);
  assert.deepEqual(search("tintorera"), ["Tintorera R-4000"]);
  assert.deepEqual(search("RED-1000"), ["RED-1000"]);
  const spanish = concentratesLibrary("es").families;
  assert.ok(search("pina", spanish).includes("Concentrado de piña"));
  assert.ok(search("CEREZA", spanish).includes("Concentrado de cereza"));
  assert.deepEqual(search("xyz-no-such-product"), []);
});

test("frozen fruits: four IQF groups with the verified published pages, product pages only", () => {
  assert.deepEqual(
    frozen.map((family) => [family.id, family.slug, family.productCount, family.resourceCount]),
    [
      ["iqf-lemon", "lemon", 9, 11],
      ["iqf-orange", "orange", 10, 11],
      ["iqf-lime", "lime", 6, 7],
      ["iqf-grapefruit", "grapefruit", 4, 5]
    ]
  );
  const resources = resourcesOf(frozenFruitsLibrary("en"));
  assert.equal(new Set(resources.map((resource) => resource.path)).size, 34);
  assert.ok(resources.every((resource) => resource.type === "product" && documentType(resource.path) === "product"));
  for (const family of frozen) {
    assert.equal(family.thumb, `/images/raw-materials/iqf/${family.id}-thumb.webp`);
    assert.equal(family.countLabel, `${family.productCount} formats`);
  }
  // General pages are told apart from product references (hubs + /frozen-lemon).
  assert.deepEqual(
    resources.filter((resource) => resource.overview).map((resource) => resource.path),
    ["/iqf-lemon", "/frozen-lemon", "/iqf-orange", "/iqf-lime", "/iqf-grapefruit"]
  );
});

test("frozen reference counts match the references each official IQF page lists", () => {
  // "We handle the following references: …" on /iqf-lemon, /iqf-orange, /iqf-lime and
  // /iqf-grapefruit ("Slices … and Half Slices …" is two references).
  const listed = { "iqf-lemon": 9, "iqf-orange": 10, "iqf-lime": 6, "iqf-grapefruit": 4 };
  for (const family of frozen) assert.equal(family.productCount, listed[family.id as keyof typeof listed], family.id);
});

test("frozen fruits carry no concentrate or grape content and no banner", () => {
  for (const locale of ["en", "es"] as const) {
    const config = frozenFruitsLibrary(locale);
    assert.equal(config.banner, undefined);
    const text = JSON.stringify(config);
    assert.doesNotMatch(text, /red-grape|uva tinta|red grape|concentrat/i);
    assert.notEqual(config.intro.text, concentratesLibrary(locale).intro.text);
  }
});

test("frozen search finds fruits, formats and cuts written either way", () => {
  const names = (query: string, locale: "en" | "es" = "en") => search(query, frozenFruitsLibrary(locale).families);
  assert.equal(names("lemon").length, 11);
  assert.equal(names("IQF orange").length, 11);
  assert.deepEqual(names("13x13 sticks"), ["IQF orange 13 x 13 sticks", "IQF lime 13 x 13 sticks"]);
  // Displayed as "1/4 cut" everywhere; the published "one fourths" wording still matches.
  assert.deepEqual(names("1/4 cut"), [
    "IQF lemon 1/4 cut",
    "IQF orange 1/4 cut",
    "IQF lime 1/4 cut",
    "IQF grapefruit 1/4 cut"
  ]);
  assert.equal(names("one eights").length, 4);
  assert.equal(names("slices").length, 8);
  assert.ok(names("slices").includes("IQF lime slice 6 / 9 mm"));
  assert.deepEqual(names("zest"), [
    "IQF lemon zest",
    "Frozen block lemon zest",
    "IQF orange zest",
    "Frozen block orange zest",
    "IQF lime zest"
  ]);
  assert.equal(names("peel").length, 4);
  assert.equal(names("limon", "es").length, 11);
  assert.equal(names("pomelo", "es").length, 5);
  assert.equal(names("cuartos", "es").length, 4);
  assert.deepEqual(names("merlot"), []);
});
