import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { divisions } from "../../src/content/catalog.ts";
import { company } from "../../src/content/company.ts";
import { locales, type LocalizedText } from "../../src/i18n/config.ts";
import { staticPages } from "../../src/i18n/routes.ts";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertLocalized(text: LocalizedText, context: string) {
  for (const locale of locales) assert.ok(text[locale]?.trim(), `${context} is missing "${locale}"`);
}

test("every catalog text is translated", () => {
  for (const division of divisions) {
    for (const key of ["slug", "title", "shortTitle", "eyebrow", "summary", "description"] as const) {
      assertLocalized(division[key], `${division.id}.${key}`);
    }
    for (const category of division.categories) {
      for (const key of ["slug", "title", "summary", "detail"] as const)
        assertLocalized(category[key], `${category.id}.${key}`);
      category.features?.forEach((feature, index) => assertLocalized(feature, `${category.id}.features[${index}]`));
      category.groups?.forEach((group) => {
        assertLocalized(group.title, `${category.id}.group`);
        group.items.forEach((item) => assertLocalized(item, `${category.id}.${group.title.en}`));
      });
    }
  }
  company.locations.forEach((location) => assertLocalized(location, "company.locations"));
});

test("slugs are URL-safe and unique per locale", () => {
  for (const locale of locales) {
    const divisionSlugs = divisions.map((division) => division.slug[locale]);
    const reserved = [...Object.values(staticPages).map((page) => page[locale]), "legal"];
    assert.equal(new Set(divisionSlugs).size, divisionSlugs.length, `duplicate division slug (${locale})`);
    for (const slug of divisionSlugs) {
      assert.match(slug, slugPattern);
      assert.ok(!reserved.includes(slug), `division slug "${slug}" collides with a static page`);
    }
    for (const division of divisions) {
      const categorySlugs = division.categories.map((category) => category.slug[locale]);
      assert.equal(new Set(categorySlugs).size, categorySlugs.length, `duplicate category slug in ${division.id}`);
      categorySlugs.forEach((slug) => assert.match(slug, slugPattern));
    }
  }
});

test("stable ids are unique", () => {
  const ids = divisions.flatMap((division) => [
    division.id,
    ...division.categories.map((category) => `${division.id}/${category.id}`)
  ]);
  assert.equal(new Set(ids).size, ids.length);
});

test("every referenced image exists in /public", () => {
  const images = divisions.flatMap((division) => [
    division.heroImage,
    ...division.categories.map((category) => category.image)
  ]);
  for (const image of images) {
    assert.match(image, /^\/images\//);
    assert.ok(existsSync(new URL(`../../public${image}`, import.meta.url)), `${image} not found`);
  }
});
