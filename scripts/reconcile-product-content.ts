/**
 * Product-content reconciliation: for every product-detail page (EN and ES), compares the
 * published content blocks of the official page (live fetch of https://www.gfb-solutions.com,
 * falling back to the crawl snapshot when unreachable) with what the new page shows:
 * retained, corrected (src/migration/corrections.ts), withheld (claim policy / not available),
 * normalised (units) or missing. Writes docs/migration-data/product-content-reconciliation.json
 * and the summary in docs/product-content-reconciliation.md (with the open review items).
 * Run: node scripts/reconcile-product-content.ts [--offline]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { cleanText, normalizeUnits } from "../src/migration/content.ts";
import { blockCorrections, corrections } from "../src/migration/corrections.ts";
import { displayProductName } from "../src/migration/technical-library.ts";
import { detailPaths, legacyPage } from "../src/migration/manifest.ts";

type CrawlRow = { locale: "en" | "es"; sourceUrl: string; contentBlocks: { tag: string; text: string }[] };
const crawl: CrawlRow[] = JSON.parse(readFileSync("docs/migration-data/legacy-crawl.json", "utf8"));
const offline = process.argv.includes("--offline");
const ORIGIN = "https://www.gfb-solutions.com";

const squash = (text: string) =>
  normalizeUnits(cleanText(text)).replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

const decode = (html: string) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"');

async function live(url: string): Promise<string | null> {
  if (offline) return null;
  try {
    const response = await fetch(url, { headers: { "user-agent": "GFB content reconciliation" } });
    return response.ok ? squash(decode(await response.text())) : null;
  } catch {
    return null;
  }
}

/** All text the new page shows for its content, flattened and squashed. */
function shown(path: string, locale: "en" | "es") {
  const page = legacyPage(path)![locale];
  const parts = page.sections.flatMap((section) => [
    section.heading ?? "",
    ...section.items.flatMap((item) =>
      item.type === "specs"
        ? item.rows.flat()
        : item.type === "ul"
          ? item.items
          : item.type === "links"
            ? item.paths.map((linked) => legacyPage(linked)?.[locale].h1 ?? "")
            : [item.text]
    )
  ]);
  // The H1 and the eyebrow (published product-type label or identifier) are shown by the hero.
  const hero = [page.h1, page.eyebrow ?? ""];
  return { text: squash([...parts, ...hero].join(" \n ")), excluded: page.excluded ?? [] };
}

type Status = "retained" | "corrected" | "translated" | "withheld" | "not-available" | "missing";
const records: object[] = [];
const summary: Record<string, number> = { pages: 0, liveChecked: 0, sourceChanged: 0 };
for (const path of detailPaths)
  for (const locale of ["en", "es"] as const) {
    const source = crawl.find((row) => row.locale === locale && new URL(row.sourceUrl).pathname === path);
    if (!source) continue;
    summary.pages++;
    const url = `${ORIGIN}${path}${locale === "es" ? "?lang=es" : ""}`;
    const livePage = await live(url);
    if (livePage) summary.liveChecked++;
    const page = shown(path, locale);
    // Spanish formats are published in English on the official ES pages and translated here.
    const english = locale === "es" ? shown(path, "en").text : "";
    const excluded = page.excluded.map((item) => squash(item.text));
    const lines = source.contentBlocks
      .filter((block) => block.tag !== "h1" && cleanText(block.text).length > 3)
      .flatMap((block) => cleanText(block.text).split("\n"))
      .map((line) => line.trim().replace(/^[-•–]\s*/, ""))
      .filter((line) => line.length > 3);
    const fields = lines.map((line, index) => {
      const text = squash(line);
      const parts = line.includes(":") ? line.split(":").map(squash).filter(Boolean) : [];
      const has = (haystack: string) =>
        haystack.includes(text) || (parts.length > 1 && parts.every((part) => haystack.includes(part)));
      const correction =
        corrections.find(
          (item) =>
            item.path === path &&
            (!item.locale || item.locale === locale) &&
            (item.find.includes(line) || line.includes(item.find.trim()))
        ) ??
        // Field boundaries rebuilt (src/migration/corrections.ts `blockCorrections`): the line was
        // part of a replaced run of blocks.
        blockCorrections.find(
          (item) =>
            item.path === path &&
            (item.locale ?? "en") === locale &&
            item.blocks.some((block) => {
              // A prefix names a long published paragraph: its whole text is the replaced block.
              const full =
                item.match === "prefix"
                  ? source.contentBlocks.find((candidate) => candidate.text.trim().startsWith(block))?.text
                  : block;
              return Boolean(full && (cleanText(full).includes(line) || full.includes(line)));
            })
        );
      // "Not apply" (and the format label it answers) means the format is not offered.
      const notOffered =
        /^(not apply|no aplica)$/i.test(line) || /^(not apply|no aplica)$/i.test(lines[index + 1] ?? "");
      // IQF cut names are displayed in one notation ("one eights cut" → "1/8 cut").
      const renamed =
        displayProductName(line) !== line &&
        [page.text, english].some((text) => text.includes(squash(displayProductName(line))));
      const status: Status =
        correction || renamed
          ? "corrected"
          : has(page.text)
            ? "retained"
            : notOffered
              ? "not-available"
              : excluded.some((item) => item.includes(text) || text.includes(item))
                ? "withheld"
                : english && has(english)
                  ? "translated"
                  : "missing";
      summary[status] = (summary[status] ?? 0) + 1;
      const inLive = livePage ? livePage.includes(text) : null;
      if (inLive === false) summary.sourceChanged++;
      return {
        field: line.slice(0, 160),
        status,
        ...(correction ? { reason: correction.reason } : renamed ? { reason: "IQF cut name notation" } : {}),
        inLiveSource: inLive
      };
    });
    records.push({ sourceUrl: url, path, locale, fields });
  }

writeFileSync("docs/migration-data/product-content-reconciliation.json", `${JSON.stringify(records, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
