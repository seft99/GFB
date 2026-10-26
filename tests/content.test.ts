import assert from "node:assert/strict";
import test from "node:test";
import { divisions } from "../src/content/site-content.ts";
import { locales } from "../src/content/types.ts";

test("all divisions and categories have complete bilingual content", () => {
  for (const division of divisions) {
    for (const locale of locales) {
      assert.ok(division.title[locale]);
      assert.ok(division.summary[locale]);
      assert.ok(division.description[locale]);
    }
    for (const category of division.categories) {
      for (const locale of locales) {
        assert.ok(category.title[locale]);
        assert.ok(category.summary[locale]);
        assert.ok(category.detail[locale]);
      }
    }
  }
});

test("route slugs are unique within their scope", () => {
  assert.equal(new Set(divisions.map((item) => item.slug)).size, divisions.length);
  for (const division of divisions) {
    assert.equal(new Set(division.categories.map((item) => item.slug)).size, division.categories.length);
  }
});

test("every content image uses a local absolute path", () => {
  for (const division of divisions) {
    assert.match(division.heroImage, /^\/images\//);
    for (const category of division.categories) assert.match(category.image, /^\/images\//);
  }
});
