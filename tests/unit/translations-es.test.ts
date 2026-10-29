import assert from "node:assert/strict";
import test from "node:test";
import { detailPaths, legacyPage } from "../../src/migration/manifest.ts";
import { esTranslationKeys, translateEs } from "../../src/migration/translations-es.ts";

test("no Spanish detail page keeps an English block", () => {
  const left = detailPaths.flatMap((path) =>
    legacyPage(path)!.es.sections.flatMap((section) => [
      ...(section.headingLang === "en" ? [`${path}: ${section.heading}`] : []),
      ...section.items.filter((item) => "lang" in item && item.lang === "en").map(() => `${path}: block`)
    ])
  );
  assert.deepEqual(left, []);
});

test("every translation is used by a page", () => {
  const english = JSON.stringify(detailPaths.map((path) => legacyPage(path)!.en));
  const spanishSource = JSON.stringify(detailPaths.map((path) => legacyPage(path)!.es));
  const unused = esTranslationKeys.filter((key) => {
    const encoded = JSON.stringify(key).slice(1, -1);
    return !english.includes(encoded) && !spanishSource.includes(encoded);
  });
  assert.deepEqual(unused, []);
});

test("codes, values and methods are kept as published", () => {
  assert.equal(translateEs("Soft Drinks - 455020"), "Refrescos - 455020");
  assert.equal(translateEs("28 MCA 2"), "28 MCA 2");
  assert.equal(translateEs("< 10 By Monier Williams"), undefined);
  assert.equal(translateEs("182.7 mm"), "182.7 mm");
  assert.equal(translateEs("Turbidity < 150 NTU"), "Turbidez < 150 NTU");
});
