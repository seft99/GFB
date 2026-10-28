import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { families } from "../../src/migration/families.ts";
import { heroImageFiles, productHeroImage } from "../../src/migration/product-hero-images.ts";
import { isTechnicalResource } from "../../src/migration/product-resources.ts";

const allPaths = families.flatMap((family) => family.paths);

test("every hero photograph exists locally, is documented and has EN/ES alt text", () => {
  const provenance = readFileSync("docs/asset-provenance.md", "utf8");
  for (const src of new Set(heroImageFiles)) {
    assert.ok(src.startsWith("/images/"), src);
    assert.ok(existsSync(`public${src}`), `${src} missing`);
    assert.ok(provenance.includes(src.split("/").pop()!), `${src} not in docs/asset-provenance.md`);
  }
  for (const path of allPaths) {
    const photo = productHeroImage(path);
    if (photo) assert.ok(photo.alt.en && photo.alt.es, path);
  }
});

test("photographs match the product; presentations without one get none", () => {
  const subject = (path: string) => productHeroImage(path)?.src.split("/").pop();
  assert.equal(subject("/citrics/orange-concentrate"), "orange.webp");
  assert.equal(subject("/vegetables/asparagus"), "asparagus.webp");
  assert.equal(subject("/red-grape-juice/merlot"), "red-grape.webp");
  assert.equal(subject("/frozen-lemon"), "iqf-lemon.webp");
  assert.equal(subject("/iqf-orange-frozen/iqf-orange-13-x-13-sticks"), "iqf-orange.webp");
  assert.equal(subject("/plant-based-concentrate-1/oat-concentrate"), "oat.webp");
  assert.equal(subject("/soft-drinks"), "soft-drinks.webp");
  assert.equal(subject("/aluminum-cans/sleek-can-d57mm"), "slim-can.webp");
  assert.equal(subject("/aluminum-cans/std-can-d66mm"), "cans-pair.webp");
  assert.equal(subject("/aluminium-can-ends/52mm-(202)-dia-aluminium-end"), "can-ends.webp");
  assert.equal(subject("/tropical/white-guava"), "white-guava.webp");
  assert.equal(subject("/tropical/tamarind"), "tamarind.webp");
  assert.equal(subject("/iqf-lemon-peel-zest/iqf-lemon-zest"), "lemon-zest.webp");
  assert.equal(subject("/iqf-orange-frozen/iqf-orange-peel-shells"), "citrus-peel.webp");
  for (const path of [
    "/citrics/white-grapefruit-concentrate",
    "/iqf-lemon-peel-zest/iqf-lemon-peel-square",
    "/iqf-lemon-peel-zest/frozen-block-lemon-zest",
    "/iqf-orange-frozen/iqf-orange-zest",
    "/iqf-lime-slices/iqf-lime-zest",
    "/ripcap/26-mm-ripcap",
    "/shrink-sleeve-labels",
    "/additives"
  ])
    assert.equal(productHeroImage(path), undefined, path);
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
