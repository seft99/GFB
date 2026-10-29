import assert from "node:assert/strict";
import test from "node:test";
import { contentRegister } from "../../src/migration/content-register.ts";
import { legacyPage } from "../../src/migration/manifest.ts";
import { redGrapeRecords } from "../../src/migration/technical-library.ts";

const pageText = (path: string) => JSON.stringify(legacyPage(path)?.en.sections ?? []).replace(/\s+/g, " ");

test("every value recorded as a conflict is still published on its page", () => {
  for (const entry of contentRegister.filter((item) => item.status === "conflict"))
    for (const source of entry.sources)
      assert.ok(pageText(source.path).includes(source.value.replace(/\s+/g, " ")), `${entry.id}: ${source.path}`);
});

/** Leading limit of a published value: "< 50 NTU At 16 °Brix" → "<50", "500 - 600 By Welch" → "500-600". */
const limit = (value: string) => value.replace(/\s+/g, "").match(/^[<>]?[\d.,-]+/)?.[0];

test("the red grape summary differs from the variety sheets only where the register says so", () => {
  const summary = legacyPage("/red-grape-concentrate")!.en.sections.filter((section) => section.heading);
  const varieties = redGrapeRecords.filter((record) => record.technical);
  assert.equal(summary.length, varieties.length);
  const fields: [string, RegExp][] = [
    ["Color (520 nm)", /^Color \(520 nm\) (.+)$/],
    ["Turbidity", /^Turbidity (.+)$/],
    ["SO₂ Total (mg/kg)", /^SO₂ Total \(mg\/kg\) (.+)$/]
  ];
  const found: string[] = [];
  summary.forEach((section, index) => {
    const lines = section.items.flatMap((item) =>
      item.type === "ul" ? item.items : item.type === "p" ? [item.text] : []
    );
    const sheet = legacyPage(varieties[index].technical!)!.en.sections.flatMap((item) =>
      item.items.flatMap((entry) => (entry.type === "specs" ? entry.rows : []))
    );
    for (const [field, pattern] of fields) {
      const published = lines.map((line) => line.match(pattern)?.[1]).find(Boolean);
      const specified = sheet.find(([label]) => label === field)?.[1];
      assert.ok(published && specified, `${section.heading} ${field}`);
      if (limit(published) !== limit(specified)) found.push(`${varieties[index].id}|${field}`);
    }
  });
  const registered = contentRegister
    .filter((entry) => entry.finding === "C02")
    .map((entry) => `${entry.entity === "Cabernet Sauvignon" ? "cabernet-sauvignon" : "rgjc-r-600"}|${entry.field}`);
  assert.deepEqual(found.sort(), registered.sort());
});

test("register entries are complete", () => {
  const ids = new Set<string>();
  for (const entry of contentRegister) {
    assert.ok(!ids.has(entry.id), entry.id);
    ids.add(entry.id);
    assert.ok(entry.sources.length && entry.action && entry.evidence, entry.id);
  }
});
