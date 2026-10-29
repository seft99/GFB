import assert from "node:assert/strict";
import test from "node:test";
import { locales } from "../../src/i18n/config.ts";
import { families } from "../../src/migration/families.ts";
import { detailPaths } from "../../src/migration/manifest.ts";
import { publicUrl } from "../../src/migration/public-paths.ts";
import { familyResources, relatedEntries } from "../../src/migration/related-resources.ts";
import { redGrapeRecords } from "../../src/migration/technical-library.ts";

test("every page of a family is a resource of exactly one identity, at its public URL", () => {
  for (const family of families)
    for (const locale of locales) {
      const config = familyResources(family.paths[0], locale)!;
      const resources = config.entries.flatMap((entry) => entry.resources);
      assert.deepEqual(resources.map((item) => item.path).sort(), [...family.paths].sort(), family.id);
      for (const item of resources) assert.equal(item.href, publicUrl(item.path, locale));
    }
});

test("red grape varieties pair their product page and specification in one card", () => {
  const config = familyResources("/merlot", "en")!;
  assert.equal(config.entries.length, redGrapeRecords.length);
  const merlot = config.entries.find((entry) => entry.id === "merlot")!;
  assert.deepEqual(
    merlot.resources.map((item) => [item.path, item.kind]),
    [
      ["/red-grape-juice/merlot", "product"],
      ["/merlot", "technical"]
    ]
  );
  assert.deepEqual(
    config.entries.slice(0, 2).map((entry) => entry.resources.map((item) => item.kind)),
    [["overview"], ["overview"]]
  );
});

test("the current page is never linked; its identity stays only for its other page", () => {
  for (const path of detailPaths)
    for (const locale of locales) {
      const config = familyResources(path, locale)!;
      const shown = relatedEntries(config, path);
      assert.ok(
        shown.every((entry) => entry.resources.every((item) => item.path !== path)),
        path
      );
      assert.ok(
        shown.every((entry) => entry.resources.length > 0),
        path
      );
    }
  const product = relatedEntries(familyResources("/red-grape-juice/merlot", "en")!, "/red-grape-juice/merlot");
  assert.deepEqual(
    product.find((entry) => entry.id === "merlot")!.resources.map((item) => item.path),
    ["/merlot"]
  );
  const technical = relatedEntries(familyResources("/merlot", "en")!, "/merlot");
  assert.deepEqual(
    technical.find((entry) => entry.id === "merlot")!.resources.map((item) => item.path),
    ["/red-grape-juice/merlot"]
  );
  // An identity with only the current page is left out (Orange concentrate on its own page).
  const orange = relatedEntries(familyResources("/citrics/orange-concentrate", "en")!, "/citrics/orange-concentrate");
  assert.equal(orange.length, 6);
});

test("packaging cards group a product page with its verified specification page", () => {
  const config = familyResources("/slim-can-d53mm", "es")!;
  const slim = config.entries.find((entry) => entry.resources.some((item) => item.path === "/slim-can-d53mm"))!;
  assert.deepEqual(
    slim.resources.map((item) => [item.path, item.kind]),
    [
      ["/aluminum-cans/slim-can-d53mm", "product"],
      ["/slim-can-d53mm", "technical"]
    ]
  );
});

test("directory links open the family on its category page, in the same language", () => {
  assert.equal(
    familyResources("/merlot", "en", "/fruits-concentrates")!.directoryHref,
    "/fruits-concentrates?family=red-grape#concentrates-library-title"
  );
  assert.equal(
    familyResources("/iqf-lime-slices/iqf-lime-1%2F4-cut", "es", "/frozen-fruits?lang=es")!.directoryHref,
    "/frozen-fruits?lang=es&family=lime#frozen-fruits-library-title"
  );
  assert.equal(familyResources("/water", "en", "/bottles")!.directoryHref, "/bottles#bottles-resources-title");
  assert.equal(familyResources("/additives", "en")!.directoryHref, undefined);
});
