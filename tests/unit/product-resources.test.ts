import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { families } from "../../src/migration/families.ts";
import { legacyPage } from "../../src/migration/manifest.ts";
import { categoryAudit, categoryResources, resourceAssignments } from "../../src/migration/category-resources.ts";
import { familyResourceGroup, isSpecificationPage, specificationPairs } from "../../src/migration/product-resources.ts";
import { publicUrl } from "../../src/migration/public-paths.ts";
import { componentPreviewEnabled, resourcePreviews } from "../../src/migration/resource-previews.ts";
import {
  displayIndexes,
  filterResourceGroups,
  hasResourceFilters,
  itemCount,
  resourceCount,
  suggestedVariant,
  type ProductResourceGroup
} from "../../src/migration/resource-section.ts";

const family = (id: string) => families.find((item) => item.id === id)!;
const cans = familyResourceGroup("aluminium-cans", "en");
const ends = familyResourceGroup("can-ends", "en");
const crowns = familyResourceGroup("crown-corks", "en");
const labels = familyResourceGroup("label-types", "en");
const titles = (groups: ProductResourceGroup[]) => groups.flatMap((group) => group.items.map((item) => item.title));

test("packaging specification pages are paired only with their own product page", () => {
  const pairs = ["aluminium-cans", "can-ends", "crown-corks", "label-types", "bottle-formats"].flatMap((id) =>
    specificationPairs(family(id))
  );
  assert.deepEqual(pairs, [
    { product: "/aluminum-cans/sleek-can-d57mm", technical: "/sleek-can-d57mm" },
    { product: "/aluminum-cans/slim-can-d53mm", technical: "/slim-can-d53mm" },
    { product: "/aluminium-can-ends/52mm-(202)-dia-aluminium-end", technical: "/aluminum-can-end-52mm-202-std-sot" },
    {
      product: "/aluminium-can-ends/52mm-(202)-dia-ise-aluminium-end",
      technical: "/aluminum-can-end-52mm-202-ise-sot"
    },
    { product: "/ripcap/26-mm-ripcap", technical: "/26mm-ripcap" },
    { product: "/ripcap/26-mm-ring-crown-cap", technical: "/26mm-ring-crown-cap" },
    { product: "/ripcap/42-mm-ripcap", technical: "/42mm-ripcap" }
  ]);
  // A flat page repeating the product prose is not a specification page.
  assert.equal(isSpecificationPage("/std-can-d66mm"), false);
  assert.equal(isSpecificationPage("/crown-corks-caps"), false);
  // The nested Std end page is paired with the Std (Korinthos) sheet, not the ISE one.
  assert.equal(
    legacyPage("/aluminium-can-ends/52mm-(202)-dia-aluminium-end")!.en.eyebrow,
    "SOT - Std Aperture (Korinthos)"
  );
});

test("every family page appears once, at its public URL, with a verified type", () => {
  for (const locale of ["en", "es"] as const)
    for (const id of ["aluminium-cans", "can-ends", "crown-corks", "label-types"]) {
      const group = familyResourceGroup(id, locale);
      const links = group.items.flatMap((item) => item.resources);
      assert.deepEqual(
        links.map((link) => link.href).sort(),
        family(id)
          .paths.map((path) => publicUrl(path, locale))
          .sort()
      );
      assert.equal(new Set(links.map((link) => link.id)).size, links.length);
      const technical = links.filter((link) => link.kind === "technical").map((link) => link.href);
      const expected = specificationPairs(family(id)).map((pair) => publicUrl(pair.technical, locale));
      assert.deepEqual(technical.sort(), expected.sort(), `${id} (${locale})`);
      // A technical sheet is always shown with its product page.
      for (const item of group.items)
        if (item.resources.some((link) => link.kind === "technical"))
          assert.equal(item.resources[0].kind, "product", item.title);
    }
  assert.deepEqual([resourceCount([cans]), itemCount([cans])], [7, 5]);
  assert.deepEqual([resourceCount([ends]), itemCount([ends])], [5, 3]);
  assert.deepEqual([resourceCount([crowns]), itemCount([crowns])], [9, 6]);
});

test("titles and descriptions come from the pages themselves", () => {
  assert.deepEqual(titles([cans]), [
    "Aluminium cans",
    "Standard can",
    "Sleek can",
    "Slim can",
    "Standard can D66 mm 202# cap/lid"
  ]);
  assert.ok(titles([crowns]).includes("Crown Cork Bottle Caps: Characteristics"));
  assert.equal(new Set(titles([crowns])).size, crowns.items.length);
  for (const locale of ["en", "es"] as const)
    for (const id of ["aluminium-cans", "can-ends", "crown-corks", "label-types"])
      for (const item of familyResourceGroup(id, locale).items) {
        if (!item.description) continue;
        const path = family(id).paths.find((candidate) => publicUrl(candidate, locale) === item.resources[0].href)!;
        const text = JSON.stringify(legacyPage(path)![locale].sections);
        assert.ok(text.includes(item.description.replace(/…$/, "")), `${item.title}: description not on its page`);
      }
  // Spanish pages whose text is still English get no description instead of English text.
  assert.ok(familyResourceGroup("label-types", "es").items.every((item) => !item.description));
  assert.equal(familyResourceGroup("aluminium-cans", "es").title, "Latas de aluminio");
});

test("search is partial, accent-insensitive and matches identifiers and measurements", () => {
  const groups = [cans, ends];
  assert.deepEqual(titles(filterResourceGroups(groups, "  SLEEK ", "all")), ["Sleek can"]);
  assert.deepEqual(titles(filterResourceGroups(groups, "d66", "all")), ["Standard can D66 mm 202# cap/lid"]);
  assert.deepEqual(titles(filterResourceGroups(groups, "52mm 202 ise", "all")), ["52mm (202) Dia ISE Aluminium End"]);
  assert.deepEqual(titles(filterResourceGroups(groups, "korinthos", "all")), ["52mm (202) Dia Aluminium End"]);
  assert.deepEqual(titles(filterResourceGroups([crowns], "ripcap26", "all")), ["26 mm RipCap"]);
  const spanish = [familyResourceGroup("aluminium-cans", "es")];
  assert.deepEqual(titles(filterResourceGroups(spanish, "estandar", "all")), [
    "Lata estándar",
    "Lata estándar D66 mm 202# tapa/tapa"
  ]);
  assert.deepEqual(filterResourceGroups(groups, "no such reference", "all"), []);
});

test("resource-type filtering combines with search and never invents sheets", () => {
  const technical = filterResourceGroups([cans, ends], "", "technical");
  assert.equal(resourceCount(technical), 4);
  assert.ok(
    technical.every((group) => group.items.every((item) => item.resources.every((l) => l.kind === "technical")))
  );
  assert.deepEqual(titles(filterResourceGroups([cans], "slim", "technical")), ["Slim can"]);
  assert.deepEqual(filterResourceGroups([cans], "standard", "technical"), []);
  assert.equal(resourceCount(filterResourceGroups([cans, ends], "", "product")), 8);
  // Filtered views keep the numbering of the full collection.
  const indexes = displayIndexes([cans]);
  assert.equal(indexes["aluminium-cans/aluminum-cans--slim-can-d53mm"], 4);
});

test("filters appear only when the data has both resource types", () => {
  const base = { id: "t", variant: "compact-groups" as const, eyebrow: "", title: "", showResourceFilters: true };
  assert.equal(hasResourceFilters({ ...base, groups: [cans] }), true);
  assert.equal(hasResourceFilters({ ...base, groups: [labels] }), false);
  assert.equal(hasResourceFilters({ ...base, groups: [cans], showResourceFilters: false }), false);
});

test("variant suggestion is advisory only", () => {
  assert.deepEqual([1, 5, 6, 12, 13].map(suggestedVariant), [
    "visual-cards",
    "visual-cards",
    "compact-groups",
    "compact-groups",
    "technical-library"
  ]);
});

test("preview fixtures use local assets, existing routes and an explicit gate", () => {
  for (const locale of ["en", "es"] as const)
    for (const config of resourcePreviews(locale)) {
      const images = [
        ...config.groups.flatMap((group) => [group.image, ...group.items.map((item) => item.image)]),
        config.cta?.image
      ].filter(Boolean) as string[];
      for (const image of images) {
        assert.ok(image.startsWith("/images/"), image);
        assert.ok(existsSync(`public${image}`), image);
      }
      if (config.cta) assert.match(config.cta.href, locale === "en" ? /^\/en\/contact\?/ : /^\/es\/contacto\?/);
      for (const group of config.groups)
        for (const item of group.items) if (item.image) assert.ok(item.imageAlt, `${item.title}: alt text`);
    }
  assert.equal(componentPreviewEnabled({ NODE_ENV: "production" }), false);
  assert.equal(componentPreviewEnabled({ NODE_ENV: "production", GFB_COMPONENT_PREVIEW: "1" }), true);
  assert.equal(componentPreviewEnabled({ NODE_ENV: "development" }), true);
});

test("category assignments are explicit and keep every family page", () => {
  assert.deepEqual(resourceAssignments, {
    "fruit-concentrates": "technical-library",
    "iqf-frozen-fruits": "technical-library",
    cans: "compact-groups",
    closures: "compact-groups",
    bottles: "visual-cards",
    labels: "visual-cards",
    "plant-based-concentrates": "visual-cards"
  });
  assert.equal(categoryResources("fruit-concentrates", "en"), undefined);
  assert.equal(categoryResources("iqf-frozen-fruits", "en"), undefined);
  for (const locale of ["en", "es"] as const)
    for (const categoryId of Object.keys(resourceAssignments).filter(
      (id) => resourceAssignments[id] !== "technical-library"
    )) {
      const config = categoryResources(categoryId, locale)!;
      const expected = families
        .filter((item) => item.parent.category === categoryId)
        .flatMap((item) => item.paths.map((path) => publicUrl(path, locale)));
      const hrefs = config.groups.flatMap((group) => group.items.flatMap((item) => item.resources.map((l) => l.href)));
      assert.deepEqual(hrefs.sort(), expected.sort(), `${categoryId} (${locale})`);
      assert.equal(config.cta, undefined);
      for (const image of config.groups.flatMap((group) => [group.image, ...group.items.map((item) => item.image)]))
        if (image) assert.ok(existsSync(`public${image}`), image);
    }
});

test("category audit separates unique products from published resources", () => {
  const rows = Object.fromEntries(
    Object.keys(resourceAssignments).map((id) => {
      const audit = categoryAudit(id);
      return [id, [audit.uniqueProductCount, audit.resourceCount, audit.technicalResourceCount, audit.groupCount]];
    })
  );
  assert.deepEqual(rows, {
    "fruit-concentrates": [50, 59, 7, 6],
    "iqf-frozen-fruits": [29, 34, 0, 4],
    cans: [5, 12, 4, 2],
    closures: [4, 9, 3, 1],
    bottles: [3, 3, 0, 1],
    labels: [3, 3, 0, 1],
    "plant-based-concentrates": [2, 2, 0, 1]
  });
  // Explicit overrides of the advisory heuristic are documented.
  for (const id of ["cans", "closures"]) {
    assert.equal(suggestedVariant(categoryAudit(id).uniqueProductCount), "visual-cards");
    assert.equal(resourceAssignments[id], "compact-groups");
    assert.match(categoryAudit(id).selectionReason, /technical sheet/);
  }
});

test("only licensed or approved images are used by category pages", () => {
  const approved = new Set([
    "/images/packaging/resources/aluminium-cans-group.webp",
    "/images/packaging/resources/can-ends-group.webp",
    "/images/packaging/closures-card.webp",
    "/images/packaging/resources/bottles-soft-drinks-card.webp",
    "/images/packaging/resources/bottles-alcoholic-card.webp",
    "/images/packaging/resources/bottles-water-card.webp",
    "/images/packaging/labels-wash-off.webp",
    "/images/raw-materials/resources/oat-card.webp",
    "/images/raw-materials/resources/almond-card.webp"
  ]);
  const used = Object.keys(resourceAssignments).flatMap((id) =>
    (categoryResources(id, "en")?.groups ?? []).flatMap((group) => [
      group.image,
      ...group.items.map((item) => item.image)
    ])
  );
  for (const image of used.filter(Boolean)) assert.ok(approved.has(image!), `${image} is not in the provenance list`);
  // Withdrawn: photographs taken from the GFB website without confirmed reuse rights.
  assert.equal(existsSync("public/images/packaging/resources/standard-can-card.webp"), false);
});
