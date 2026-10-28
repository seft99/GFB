/**
 * Source-to-destination audit of the concentrate and frozen-fruit catalogue pages.
 *
 * Usage: node scripts/catalogue-audit.ts
 *
 * Reads the public crawl (docs/migration-data/legacy-crawl.json) and the rendered page data
 * (src/migration/legacy-content.json) and writes docs/migration-data/catalogue-audit.csv: one
 * row per page and language with identity, routes, content coverage, classification, restored
 * links, withheld blocks, corrections and review notes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { Item, Section } from "../src/migration/content.ts";
import { corrections } from "../src/migration/corrections.ts";
import { families } from "../src/migration/families.ts";
import { legacyPage } from "../src/migration/manifest.ts";
import { publicUrl } from "../src/migration/public-paths.ts";
import { documentType, isOverview } from "../src/migration/technical-library.ts";

const origin = "https://www.gfb-solutions.com";
const crawl: {
  locale: "en" | "es";
  sourceUrl: string;
  sourceStatus: number;
  h1: string | null;
  internalOutboundLinks: string[];
}[] = JSON.parse(readFileSync("docs/migration-data/legacy-crawl.json", "utf8"));
const row = (path: string, locale: "en" | "es") =>
  crawl.find((item) => item.locale === locale && new URL(item.sourceUrl).pathname === path);

/** Notes for GFB review, found while auditing (see docs/catalogue-qa-audit.md). */
const reviewNotes: Record<string, string> = {
  "/red-grape-concentrate":
    "Summary values differ from the variety sheets: RGJC R-600 shows 800-900 / <100 NTU / SO2 <50 (sheet and overview: 500-600 / <50 NTU / SO2 <10); Cabernet Sauvignon SO2 <5 (sheet and overview: <10). Kept as published.",
  "/rgjc-red-600": "Sheet values differ from the /red-grape-concentrate summary (see that row).",
  "/cabernet-sauvignon": "SO2 <10 here; the /red-grape-concentrate summary says <5.",
  "/frozen-lemon":
    "Lists 'IQF Lemon Slice 6/9 mm' and 'IQF Lemon 13x13 Sticks', sizes not stated on the lemon product pages; no links on the original page.",
  "/iqf-lime-slices/iqf-lime-1%2F8-cut":
    "Ingredient corrected from 'IQF Lemon 1/8 Cut' to lime; 'can be stored in the fridge for several days' is unusual for a frozen product.",
  "/iqf-lime-slices/iqf-lime-13-x-13-sticks": "'Also serve to absorb odors in the house' is a non-food use claim.",
  "/tropical/coconut":
    "Heading 'Coconut is a natural source of fiber' is a nutrition claim (kept as published heading)."
};

const textOf = (item: Item) =>
  item.type === "specs"
    ? item.rows.flat().join(" ")
    : item.type === "ul"
      ? item.items.join(" ")
      : item.type === "links"
        ? ""
        : item.text;
const linksOf = (sections: Section[]) =>
  sections.flatMap((section) => [
    ...(section.link ? [section.link] : []),
    ...section.items.flatMap((item) => (item.type === "links" ? item.paths : []))
  ]);
const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const scope = families.filter((family) =>
  ["fruit-concentrates", "iqf-frozen-fruits"].includes(family.parent.category ?? "")
);
const rows: Record<string, unknown>[] = [];
for (const family of scope)
  for (const path of family.paths)
    for (const locale of ["en", "es"] as const) {
      const source = row(path, locale);
      const page = legacyPage(path)![locale];
      const items = page.sections.flatMap((section) => section.items);
      const reasons = (reason: string) => page.excluded.filter((item) => item.reason === reason).length;
      const sourceH1 = (source?.h1 ?? "").replace(/\s+/g, " ").trim();
      rows.push({
        locale,
        family: family.id,
        originalUrl: source?.sourceUrl ?? `${origin}${path}`,
        sourceStatus: source?.sourceStatus ?? "",
        newRoute: `${origin}${publicUrl(path, locale)}`,
        sourceH1,
        newH1: page.h1,
        identity:
          sourceH1.toUpperCase().replace(/[^A-Z0-9]/g, "") === page.h1.toUpperCase().replace(/[^A-Z0-9]/g, "")
            ? "same"
            : "renamed/translated",
        metaTitle: page.metaTitle,
        classification: isOverview(path)
          ? "overview"
          : documentType(path) === "technical"
            ? "technical sheet"
            : "product page",
        sections: page.sections.length,
        specRows: items.reduce((sum, item) => sum + (item.type === "specs" ? item.rows.length : 0), 0),
        paragraphs: items.filter((item) => item.type === "p").length,
        words: items.map(textOf).join(" ").split(/\s+/).filter(Boolean).length,
        productLinks: linksOf(page.sections).length,
        officialProductLinks: (source?.internalOutboundLinks ?? [])
          .map((href) => new URL(href).pathname)
          .filter((target) => target !== path && family.paths.includes(target)).length,
        emptyHeadingsRemoved: reasons("empty-heading"),
        withheldClaims: reasons("health-claim") + reasons("manufacturing-claim") + reasons("benefits-section"),
        corrections: corrections.filter((item) => item.path === path).length,
        untranslatedEsItems: locale === "es" ? page.untranslatedItems : "",
        review: reviewNotes[path] ?? ""
      });
    }

const columns = Object.keys(rows[0]);
writeFileSync(
  "docs/migration-data/catalogue-audit.csv",
  `${[columns.join(","), ...rows.map((item) => columns.map((column) => csv(item[column])).join(","))].join("\n")}\n`
);
console.log(
  JSON.stringify(
    {
      pages: rows.length / 2,
      rows: rows.length,
      overview: rows.filter((item) => item.classification === "overview").length / 2,
      technical: rows.filter((item) => item.classification === "technical sheet").length / 2,
      product: rows.filter((item) => item.classification === "product page").length / 2,
      sourceNot200: rows.filter((item) => item.sourceStatus !== 200).length,
      renamed: rows.filter((item) => item.identity !== "same").length,
      emptyHeadingsRemoved: rows.reduce((sum, item) => sum + Number(item.emptyHeadingsRemoved), 0),
      linksRestored: rows.reduce((sum, item) => sum + Number(item.productLinks), 0),
      linksMissing: rows
        .filter((item) => Number(item.productLinks) < Number(item.officialProductLinks))
        .map((item) => `${item.locale} ${item.originalUrl} ${item.productLinks}/${item.officialProductLinks}`),
      thinPages: rows
        .filter((item) => Number(item.words) < 40)
        .map((item) => `${item.locale} ${item.originalUrl} ${item.words}`)
    },
    null,
    2
  )
);
