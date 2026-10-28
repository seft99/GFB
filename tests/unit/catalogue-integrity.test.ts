import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { processBlocks, type Item, type Section } from "../../src/migration/content.ts";
import { corrections } from "../../src/migration/corrections.ts";
import { families } from "../../src/migration/families.ts";
import { detailPaths, legacyPage } from "../../src/migration/manifest.ts";
import { en } from "../../src/i18n/dictionaries/en.ts";
import { es } from "../../src/i18n/dictionaries/es.ts";

/** Catalogue pages in scope of the technical library: concentrates and frozen fruits. */
const scope = families.filter((family) =>
  ["fruit-concentrates", "iqf-frozen-fruits"].includes(family.parent.category ?? "")
);
const scopePaths = scope.flatMap((family) => family.paths);
const crawl: { locale: string; sourceUrl: string; internalOutboundLinks: string[] }[] = JSON.parse(
  readFileSync(new URL("../../docs/migration-data/legacy-crawl.json", import.meta.url), "utf8")
);
const textOf = (item: Item) =>
  item.type === "specs"
    ? item.rows.flat().join(" ")
    : item.type === "ul"
      ? item.items.join(" ")
      : item.type === "links"
        ? ""
        : item.text;
const pageText = (sections: Section[]) =>
  sections.flatMap((section) => [section.heading ?? "", ...section.items.map(textOf)]).join("\n");
const linksOf = (sections: Section[]) =>
  sections.flatMap((section) => [
    ...(section.link ? [section.link] : []),
    ...section.items.flatMap((item) => (item.type === "links" ? item.paths : []))
  ]);

test("catalogue pages have no empty headings", () => {
  for (const path of scopePaths)
    for (const locale of ["en", "es"] as const) {
      const { sections } = legacyPage(path)![locale];
      for (const section of sections) {
        assert.ok(section.items.length > 0, `${path} (${locale}): empty section "${section.heading}"`);
        section.items.forEach((item, index) => {
          const next = section.items[index + 1];
          if (item.type === "h3")
            assert.ok(next && next.type !== "h3", `${path} (${locale}): empty heading "${item.text}"`);
        });
      }
    }
});

test("every red grape variety page keeps its full product overview", () => {
  const varieties = scope
    .find((family) => family.id === "red-grape-concentrates")!
    .paths.filter((path) => path.startsWith("/red-grape-juice/"));
  assert.equal(varieties.length, 7);
  for (const path of varieties) {
    const items = legacyPage(path)!.en.sections.flatMap((section) => section.items);
    const overview = items.findIndex((item) => item.type === "h3" && /product overview$/i.test(item.text));
    assert.ok(overview >= 0, `${path}: no product overview heading`);
    const next = items[overview + 1];
    assert.ok(next?.type === "p" && /100% natural/i.test(next.text), `${path}: overview text missing`);
  }
  // The Merlot and RED-800 overviews as published (paraphrase-free, from the source page).
  assert.match(
    pageText(legacyPage("/red-grape-juice/merlot")!.en.sections),
    /crafted from healthy, hand-selected grapes/
  );
  assert.match(pageText(legacyPage("/red-grape-juice/red-800")!.en.sections), /high-quality red grape extract/);
});

test("health-claim filtering still withholds claims but not the description of sound fruit", () => {
  const processed = processBlocks(
    [
      { tag: "h1", text: "MERLOT" },
      {
        tag: "p",
        text: "Merlot Product Overview\nMerlot is a 100% natural red grape juice concentrate crafted from healthy, hand-selected grapes, with no additives."
      },
      {
        tag: "p",
        text: "Antioxidants in grapes help to prevent cardiovascular diseases and strengthen the immune system."
      }
    ],
    { formatsHeading: "Available formats", dropEmpty: true }
  );
  const kept = pageText(processed.sections);
  assert.match(kept, /hand-selected grapes/);
  assert.doesNotMatch(kept, /cardiovascular/);
  assert.deepEqual(
    processed.excluded.map((item) => item.reason),
    ["health-claim"]
  );
});

test("empty headings are dropped, linked ones become product links", () => {
  const processed = processBlocks(
    [
      { tag: "h1", text: "IQF FROZEN LEMON" },
      { tag: "h2", text: "IQF LEMON SLICES & STICKS" },
      {
        tag: "p",
        text: "We handle the following references: IQF Lemon Slices, IQF Lemon Sticks, and others listed here."
      },
      { tag: "h2", text: "IQF LEMON STICKS" },
      { tag: "h2", text: "IQF LEMON SLICES" },
      { tag: "h2", text: "Frozen Fruits" },
      { tag: "h2", text: "UNLINKED HEADING" }
    ],
    {
      formatsHeading: "Available formats",
      dropEmpty: true,
      linkFor: (heading) => ({ "IQF LEMON STICKS": "/sticks", "IQF LEMON SLICES": "/slices" })[heading]
    }
  );
  assert.equal(processed.sections.length, 1);
  assert.deepEqual(processed.sections[0].items.at(-1), { type: "links", paths: ["/sticks", "/slices"] });
  assert.equal(processed.eyebrow, "Frozen Fruits");
  assert.deepEqual(processed.excluded, [{ text: "Unlinked heading", reason: "empty-heading" }]);
});

test("hub pages link exactly the product pages the official page linked", () => {
  const expected: Record<string, number> = {
    "/iqf-lemon": 9,
    "/iqf-orange": 10,
    "/iqf-lime": 6,
    "/iqf-grapefruit": 4,
    "/red-grape-concentrate": 7
  };
  for (const [hub, count] of Object.entries(expected)) {
    const official = new Set(
      crawl
        .find((row) => row.locale === "en" && new URL(row.sourceUrl).pathname === hub)!
        .internalOutboundLinks.map((href) => new URL(href).pathname)
    );
    for (const locale of ["en", "es"] as const) {
      const links = linksOf(legacyPage(hub)![locale].sections);
      assert.equal(links.length, count, `${hub} (${locale})`);
      assert.equal(new Set(links).size, links.length, `${hub}: duplicate links`);
      for (const link of links) {
        assert.ok(official.has(link), `${hub} → ${link} was not linked by the official page`);
        assert.ok(detailPaths.includes(link), `${hub} → ${link} is not a published page`);
      }
    }
  }
});

test("editorial corrections are applied and no lime page calls its product lemon", () => {
  for (const correction of corrections)
    for (const locale of ["en", "es"] as const) {
      const text = pageText(legacyPage(correction.path)![locale].sections);
      assert.ok(!text.includes(correction.find), `${correction.path} (${locale}) still has "${correction.find}"`);
    }
  for (const path of scope.find((family) => family.id === "iqf-lime")!.paths) {
    const text = pageText(legacyPage(path)!.en.sections);
    assert.doesNotMatch(text, /lemon fruit|yellow skin|lemon (wedges|sticks|peel is)|IQF Lemon/i, path);
  }
  assert.doesNotMatch(pageText(legacyPage("/iqf-lemon-slices/iqf-lemon-one-fourths-cut")!.en.sections), /grapefruit/i);
});

test("technical values are unchanged by corrections", () => {
  for (const correction of corrections)
    assert.doesNotMatch(correction.find + correction.replace, /\d+\s*(mm|°|º|%|mg|NTU|UFC)/);
});

test("coconut shows its published formats instead of empty headings", () => {
  const sections = legacyPage("/tropical/coconut")!.en.sections;
  assert.equal(sections[0].heading, "Available formats");
  assert.deepEqual(sections[0].items, [{ type: "p", text: "Diced, coconut cream and coconut water." }]);
  assert.doesNotMatch(pageText(sections), /Not apply/i);
});

test("specification pages are never presented as downloads", () => {
  for (const copy of [en.library, es.library, en.legacy, es.legacy])
    assert.doesNotMatch(JSON.stringify(copy), /\bpdf\b|download|descarga/i);
});
