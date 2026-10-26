import assert from "node:assert/strict";
import test from "node:test";
import { locales } from "../../src/i18n/config.ts";
import { getDictionary } from "../../src/i18n/dictionaries/index.ts";
import { format } from "../../src/i18n/format.ts";

/** Flattens a dictionary into `path → string` leaves, including array items. */
function leaves(value: unknown, path = ""): Map<string, string> {
  const result = new Map<string, string>();
  if (typeof value === "string") result.set(path, value);
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      for (const [childPath, text] of leaves(child, path ? `${path}.${key}` : key)) result.set(childPath, text);
    }
  }
  return result;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

test("all locales share the same keys, non-empty values and placeholders", () => {
  const reference = leaves(getDictionary("en"));
  for (const locale of locales) {
    const current = leaves(getDictionary(locale));
    assert.deepEqual([...current.keys()].sort(), [...reference.keys()].sort(), `${locale} keys differ from en`);
    for (const [key, text] of current) {
      assert.ok(text.trim(), `${locale}.${key} is empty`);
      assert.deepEqual(
        placeholders(text),
        placeholders(reference.get(key) ?? ""),
        `${locale}.${key} placeholders differ`
      );
    }
  }
});

test("format replaces known tokens and keeps unknown ones", () => {
  assert.equal(format("Max {max} of {unit}", { max: 3 }), "Max 3 of {unit}");
});
