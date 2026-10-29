import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { families } from "../../src/migration/families.ts";
import { heroImageFiles, productHeroImage } from "../../src/migration/product-hero-images.ts";
import { isTechnicalResource } from "../../src/migration/product-resources.ts";

const allPaths = families.flatMap((family) => family.paths);

test("every hero image exists locally, is documented and has EN/ES alt text", () => {
  const rightsAudit = readFileSync("docs/product-image-audit.md", "utf8");
  for (const src of new Set(heroImageFiles)) {
    assert.ok(src.startsWith("/images/"), src);
    assert.ok(existsSync(`public${src}`), `${src} missing`);
    const filename = src.split("/").pop()!;
    assert.ok(rightsAudit.includes(filename), `${src} not in docs/product-image-audit.md`);
    assert.match(
      rightsAudit,
      new RegExp(`${filename.replace(".", "\\.")}.*(?:verified-commercial|generated-commercial)`)
    );
  }
  for (const path of allPaths) {
    const photo = productHeroImage(path);
    if (photo) assert.ok(photo.alt.en && photo.alt.es, path);
  }
});

test("hero visuals match the product family; unresolved business overviews get none", () => {
  const subject = (path: string) => productHeroImage(path)?.src.split("/").pop();
  assert.equal(subject("/citrics/orange-concentrate"), "orange.webp");
  assert.equal(subject("/mediterranean/apple"), "apple-studio.webp");
  assert.equal(subject("/mediterranean/pear"), "pear-studio.webp");
  assert.equal(subject("/mediterranean/melon"), "melon-studio.webp");
  assert.equal(subject("/tropical/passion-fruit"), "passion-fruit-studio.webp");
  assert.equal(subject("/tropical/pink-guava"), "pink-guava-studio.webp");
  assert.equal(subject("/tropical/mango"), "mango-studio.webp");
  assert.equal(subject("/vegetables/turnip"), "turnip-studio.webp");
  assert.equal(subject("/vegetables/asparagus"), "asparagus.webp");
  assert.equal(subject("/red-grape-juice/merlot"), "red-grape.webp");
  assert.equal(subject("/frozen-lemon"), "iqf-lemon-formats.webp");
  // IQF family hubs show the assortment. Product routes show one isolated presentation only.
  assert.equal(subject("/iqf-orange"), "iqf-orange-formats.webp");
  assert.equal(subject("/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm"), "orange-slices.webp");
  assert.equal(subject("/iqf-lemon-slices/iqf-lemon-slices"), "lemon-slices.webp");
  assert.equal(subject("/plant-based-concentrate-1/oat-concentrate"), "oat.webp");
  assert.equal(subject("/soft-drinks"), "soft-drinks.webp");
  assert.equal(subject("/aluminum-cans/sleek-can-d57mm"), "slim-can.webp");
  assert.equal(subject("/aluminum-cans/std-can-d66mm"), "cans-pair.webp");
  assert.equal(subject("/aluminium-can-ends/52mm-(202)-dia-aluminium-end"), "can-ends.webp");
  assert.equal(subject("/tropical/white-guava"), "white-guava.webp");
  assert.equal(subject("/tropical/tamarind"), "tamarind.webp");
  assert.equal(subject("/iqf-lemon-peel-zest/iqf-lemon-zest"), "lemon-zest.webp");
  assert.equal(subject("/iqf-orange-frozen/iqf-orange-peel-shells"), "orange-peel-shells.webp");
  assert.equal(subject("/citrics/white-grapefruit-concentrate"), "white-grapefruit.webp");
  assert.equal(subject("/iqf-lemon-peel-zest/iqf-lemon-peel-square"), "lemon-peel-squares.webp");
  assert.equal(subject("/iqf-orange-frozen/iqf-orange-zest"), "orange-zest.webp");
  assert.equal(subject("/iqf-lime-slices/iqf-lime-zest"), "lime-zest.webp");
  assert.equal(subject("/ripcap/26-mm-ripcap"), "bottle-closures.webp");
  assert.equal(subject("/shrink-sleeve-labels"), "label-types.webp");
  assert.equal(productHeroImage("/additives"), undefined);
});

test("every IQF product route has a distinct visual for its exact cut or presentation", () => {
  const expected: Record<string, string> = {
    "/iqf-lemon-slices/iqf-lemon-slices": "lemon-slices.webp",
    "/iqf-lemon-slices/iqf-lemon-half-slices": "lemon-half-slices.webp",
    "/iqf-lemon-slices/iqf-lemon-one-fourths-cut": "lemon-quarter-cuts.webp",
    "/iqf-lemon-slices/iqf-lemon-one-eights-cut": "lemon-eighth-cuts.webp",
    "/iqf-lemon-slices/iqf-lemon-sticks": "lemon-sticks-13x13.webp",
    "/iqf-lemon-peel-zest/iqf-lemon-zest": "lemon-zest.webp",
    "/iqf-lemon-peel-zest/frozen-block-lemon-zest": "lemon-zest-block.webp",
    "/iqf-lemon-peel-zest/iqf-lemon-peel-shells": "lemon-peel-shells.webp",
    "/iqf-lemon-peel-zest/iqf-lemon-peel-square": "lemon-peel-squares.webp",
    "/iqf-orange-frozen/iqf-orange-slices--6-%2F-9-mm": "orange-slices.webp",
    "/iqf-orange-frozen/iqf-orange-half-slices-6-%2F-9-mm": "orange-half-slices.webp",
    "/iqf-orange-frozen/iqf-orange-1%2F4--cut": "orange-quarter-cuts.webp",
    "/iqf-orange-frozen/iqf-orange-1%2F8-cut": "orange-eighth-cuts.webp",
    "/iqf-orange-frozen/iqf-orange-13-x-13-sticks": "orange-sticks-13x13.webp",
    "/iqf-orange-frozen/iqf-orange-julienne-cut": "orange-julienne.webp",
    "/iqf-orange-frozen/iqf-orange-zest": "orange-zest.webp",
    "/iqf-orange-frozen/frozen-block-orange-zest": "orange-zest-block.webp",
    "/iqf-orange-frozen/iqf-orange-peel-shells": "orange-peel-shells.webp",
    "/iqf-orange-frozen/iqf-orange-peel-square": "orange-peel-squares.webp",
    "/iqf-lime-slices/iqf-lime-slice--6-%2F-9-mm": "lime-slices.webp",
    "/iqf-lime-slices/iqf-lime-half-slices-6-%2F-9-mm": "lime-half-slices.webp",
    "/iqf-lime-slices/iqf-lime-1%2F4-cut": "lime-quarter-cuts.webp",
    "/iqf-lime-slices/iqf-lime-1%2F8-cut": "lime-eighth-cuts.webp",
    "/iqf-lime-slices/iqf-lime-13-x-13-sticks": "lime-sticks-13x13.webp",
    "/iqf-lime-slices/iqf-lime-zest": "lime-zest.webp",
    "/iqf-grapefruit-frozen/iqf-grapefruit-slices": "grapefruit-slices.webp",
    "/iqf-grapefruit-frozen/iqf-grapefruit-half-slices": "grapefruit-half-slices.webp",
    "/iqf-grapefruit-frozen/iqf-grapefruit-one-fourths-cut": "grapefruit-quarter-cuts.webp",
    "/iqf-grapefruit-frozen/iqf-grapefruit-one-eights-cut": "grapefruit-eighth-cuts.webp"
  };

  const actual = Object.fromEntries(
    Object.keys(expected).map((path) => [path, productHeroImage(path)?.src.split("/").pop()])
  );
  assert.deepEqual(actual, expected);
  assert.equal(new Set(Object.values(actual)).size, Object.keys(expected).length);
});

test("technical specification pages are told apart from product pages", () => {
  const technical = allPaths.filter(isTechnicalResource).sort();
  assert.deepEqual(technical, [
    "/26mm-ring-crown-cap",
    "/26mm-ripcap",
    "/42mm-ripcap",
    "/aluminum-can-end-52mm-202-ise-sot",
    "/aluminum-can-end-52mm-202-std-sot",
    "/cabernet-sauvignon",
    "/malbec",
    "/merlot",
    "/red-1000",
    "/red-800",
    "/rgjc-red-600",
    "/sleek-can-d57mm",
    "/slim-can-d53mm",
    "/std-can-d66mm",
    "/tintorera-red-4000"
  ]);
});
