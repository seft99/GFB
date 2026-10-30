/**
 * Builds the SEO migration contract from the public crawl (scripts/seo-migration-crawl.mjs).
 *
 * Usage: node scripts/build-migration-manifest.ts
 *
 * Inputs:  docs/migration-data/legacy-crawl.json, legacy-extra-urls.json,
 *          audit-2026-10-27/GFB_Legacy_Migration_Map.csv (supplied audit disposition)
 * Outputs: docs/migration-data/migration-manifest.json + .csv (one row per observed URL),
 *          docs/migration-data/content-matrix.csv (source → target content coverage),
 *          src/migration/legacy-content.json (render data of the legacy detail pages).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { divisions } from "../src/content/catalog.ts";
import type { Locale } from "../src/i18n/config.ts";
import {
  displayCase,
  firstProse,
  markUntranslated,
  normalizeSections,
  processBlocks,
  summarySentences,
  truncate,
  usableDescription,
  type Processed,
  type RawBlock,
  type Section
} from "../src/migration/content.ts";
import {
  brokenHistoricalLinks,
  familyOf,
  legacyKey,
  legacyKind,
  legacyRedirects,
  redesignedPaths,
  type Family
} from "../src/migration/families.ts";
import {
  blockCorrections,
  correctBlocks,
  correctText,
  corrections,
  type BlockCorrection,
  type Correction
} from "../src/migration/corrections.ts";
import { displayProductName } from "../src/migration/technical-library.ts";
import { exact, localizeSections } from "../src/migration/translations-es.ts";
import { formatLabelEs, formatRowEs, productNameEs } from "../src/migration/glossary-es.ts";
import { publicUrl, redesignedRoutes } from "../src/migration/public-paths.ts";

const origin = "https://www.gfb-solutions.com";
const dir = "docs/migration-data";

type CrawlRow = {
  locale: Locale;
  sourceSitemap: string;
  sourceUrl: string;
  sourceLastmod: string | null;
  observedAt: string;
  provenance: string;
  sourceStatus: number;
  redirectChain: { url: string; status: number }[];
  finalUrl?: string;
  observedCanonical: string | null;
  title: string | null;
  description: string | null;
  h1: string | null;
  ogImage: string | null;
  contentBlocks: RawBlock[];
  images: { src: string; alt: string }[];
  files: string[];
  internalOutboundLinks: string[];
};

const crawl: CrawlRow[] = JSON.parse(readFileSync(`${dir}/legacy-crawl.json`, "utf8"));
const extra = JSON.parse(readFileSync(`${dir}/legacy-extra-urls.json`, "utf8"));
const auditMap = parseCsv(readFileSync(`${dir}/audit-2026-10-27/GFB_Legacy_Migration_Map.csv`, "utf8"));
const auditByUrl = new Map(auditMap.map((row) => [row.legacy_url, row]));

const pathOf = (url: string) => new URL(url).pathname;
const byKey = new Map(crawl.map((row) => [`${pathOf(row.sourceUrl)}|${row.locale}`, row]));

// Inbound internal links per legacy path (from the official pages themselves).
const inbound = new Map<string, Set<string>>();
for (const row of crawl)
  for (const href of row.internalOutboundLinks) {
    const target = pathOf(href);
    if (!inbound.has(target)) inbound.set(target, new Set());
    inbound.get(target)!.add(pathOf(row.sourceUrl));
  }

// Concentrate product names in both languages, from the catalogue (official order).
const concentrateGroups: Record<string, string> = {
  "citrus-concentrates": "Citrus",
  "mediterranean-concentrates": "Mediterranean",
  "tropical-concentrates": "Tropical",
  "red-fruit-concentrates": "Red fruits",
  "vegetable-concentrates": "Vegetables"
};
const groups =
  divisions.find((item) => item.id === "raw-materials")?.categories.find((item) => item.id === "fruit-concentrates")
    ?.groups ?? [];

function concentrateName(family: Family, path: string) {
  if (path === "/tropical/coconut") return { en: "Coconut", es: "Coco", fruit: "coco" };
  const group = groups.find((item) => item.title.en === concentrateGroups[family.id]);
  const item = group?.items[family.paths.indexOf(path)];
  return item
    ? { en: `${item.en} concentrate`, es: `Concentrado de ${item.es.toLowerCase()}`, fruit: item.es.toLowerCase() }
    : undefined;
}

/** Spanish "available formats" table of a concentrate page (closed glossary, see glossary-es.ts). */
function translateFormats(processed: Processed, fruit: string): Processed {
  return {
    ...processed,
    sections: processed.sections.map((section, index) =>
      index === 0 && section.heading === formatsHeading.es
        ? {
            ...section,
            items: section.items.map((item) =>
              item.type === "specs" ? { ...item, rows: item.rows.map((row) => formatRowEs(row, fruit)) } : item
            )
          }
        : section
    )
  };
}

/** Factual description of a concentrate page from its formats table. */
function formatsDescription(processed: Processed, h1: string, locale: Locale) {
  const formats = processed.sections[0]?.items[0];
  if (processed.sections[0]?.heading !== formatsHeading[locale] || formats?.type !== "specs") return undefined;
  const labels = formats.rows.map(([label]) => (locale === "es" ? formatLabelEs(label) : label).toLowerCase());
  const list =
    labels.length > 1
      ? `${labels.slice(0, -1).join(", ")} ${locale === "es" ? "y" : "and"} ${labels.at(-1)}`
      : labels[0];
  return locale === "en"
    ? truncate(`${h1} from GFB Solutions, available as ${list}.`, 160)
    : truncate(`${h1} de GFB Solutions, disponible en ${list}.`, 160);
}

const formatsHeading = { en: "Available formats", es: "Formatos disponibles" };

/** Hero summary: the formats sentence of a concentrate, or whole sentences of the first paragraph. */
function heroSummary(sections: Section[], locale: Locale): string | undefined {
  const formats = sections[0]?.heading === formatsHeading[locale] ? sections[0].items[0] : undefined;
  if (formats?.type === "specs") {
    const labels = formats.rows.map(([label]) => label.toLowerCase());
    const list =
      labels.length > 1
        ? `${labels.slice(0, -1).join(", ")} ${locale === "es" ? "y" : "and"} ${labels.at(-1)}`
        : labels[0];
    return locale === "en" ? `Available as ${list}.` : `Disponible en ${list}.`;
  }
  const prose = firstProse({ h1: "", sections, excluded: [] });
  return prose ? summarySentences(prose) : undefined;
}

type LocalizedPage = Processed & {
  metaTitle: string;
  metaDescription: string;
  summary?: string;
  untranslatedItems: number;
};
const content: Record<
  string,
  { key: string; family: string; review?: string; lastmod: string | null; en: LocalizedPage; es: LocalizedPage }
> = {};

const titles = new Map<string, string[]>();

const TIDY_CATEGORIES = new Set(["fruit-concentrates", "iqf-frozen-fruits"]);
/** Fruit, vegetable and plant concentrates (not the red grape varieties and sheets). */
const STRICT_CLAIM_FAMILIES = new Set([
  "citrus-concentrates",
  "mediterranean-concentrates",
  "tropical-concentrates",
  "red-fruit-concentrates",
  "vegetable-concentrates",
  "plant-based-concentrates"
]);

// Compact names for matching a legacy heading to the H1 of the page it linked to.
const compactName = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const h1Names = (path: string) =>
  (["en", "es"] as const).map((locale) => compactName(byKey.get(`${path}|${locale}`)?.h1 ?? "")).filter(Boolean);

/**
 * Heading → linked page of the same family, only where the original page really linked that
 * page (verified in its outbound links) and the heading is that page's H1.
 */
function linkResolver(path: string, family: Family) {
  const linked = new Set(byKey.get(`${path}|en`)!.internalOutboundLinks.map(pathOf));
  const candidates = family.paths.filter((item) => item !== path && linked.has(item));
  return (heading: string) => candidates.find((item) => h1Names(item).includes(compactName(heading)));
}

/** Raw blocks with the editorial corrections of src/migration/corrections.ts applied. */
const appliedCorrections = new Set<Correction>();
const appliedBlockCorrections = new Set<BlockCorrection>();
function corrected(row: CrawlRow, path: string): RawBlock[] {
  const split = correctBlocks(path, row.contentBlocks, row.locale);
  split.applied.forEach((item) => appliedBlockCorrections.add(item));
  return split.blocks.map((block) => {
    const { text, applied } = correctText(path, block.text, row.locale);
    // A correction counts as found on its own page: English unless it names a locale.
    applied.forEach((item) => (item.locale ?? "en") === row.locale && appliedCorrections.add(item));
    return { ...block, text };
  });
}

for (const family of (await import("../src/migration/families.ts")).families)
  for (const path of family.paths) {
    const en = byKey.get(`${path}|en`)!;
    const es = byKey.get(`${path}|es`)!;
    // Empty-heading cleanup and restored product links: concentrate and frozen-fruit pages only.
    const tidy = TIDY_CATEGORIES.has(family.parent.category ?? "");
    const options = {
      linkFor: tidy ? linkResolver(path, family) : undefined,
      dropEmpty: tidy,
      // Fruit, vegetable and plant-based concentrates: nutrition/health statements are withheld.
      strictClaims: STRICT_CLAIM_FAMILIES.has(family.id),
      keepBenefits: family.parent.division === "packaging-solutions"
    };
    const processedEn = processBlocks(corrected(en, path), { formatsHeading: formatsHeading.en, ...options });
    const processedEsRaw = processBlocks(corrected(es, path), { formatsHeading: formatsHeading.es, ...options });
    const name = concentrateName(family, path);
    const processedEs = markUntranslated(
      name ? translateFormats(processedEsRaw, name.fruit) : processedEsRaw,
      processedEn
    );
    // IQF cut names in one notation ("one eights cut" → "1/8 cut"); URLs keep the published slug.
    const iqf = family.parent.category === "iqf-frozen-fruits";
    const h1En = iqf ? displayProductName(processedEn.h1) : (name?.en ?? processedEn.h1);
    const translatedH1 = processedEsRaw.h1 && processedEsRaw.h1 !== processedEn.h1 ? processedEsRaw.h1 : undefined;
    const h1EsRaw = name?.es ?? translatedH1 ?? productNameEs(processedEn.h1) ?? processedEn.h1;
    const h1Es = iqf ? displayProductName(h1EsRaw) : h1EsRaw;

    const describe = (row: CrawlRow, processed: Processed, h1: string, locale: Locale) => {
      const fromFormats = formatsDescription(processed, h1, locale);
      if (fromFormats) return fromFormats;
      const legacy = usableDescription(row.description);
      const englishLegacy = usableDescription(en.description);
      if (legacy && (locale === "en" || legacy !== englishLegacy)) return legacy;
      const prose = firstProse(processed);
      const proseIsTranslated = locale === "en" || (prose && prose !== firstProse(processedEn));
      if (prose && proseIsTranslated) return truncate(prose, 160);
      return locale === "en"
        ? truncate(
            `${h1}: ${family.label.en.toLowerCase()} from GFB Solutions. Product information and specifications.`,
            160
          )
        : truncate(
            `${h1}: ${family.label.es.toLowerCase()} de GFB Solutions. Información de producto y especificaciones.`,
            160
          );
    };

    const page = (processed: Processed, row: CrawlRow, h1: string, locale: Locale): LocalizedPage => {
      // Units are normalised in the content only: H1, titles and descriptions stay as derived.
      // English text left on the Spanish page is translated field by field (C03).
      const sections =
        locale === "es"
          ? localizeSections(normalizeSections(processed.sections))
          : normalizeSections(processed.sections);
      const summary = heroSummary(sections, locale);
      return {
        ...processed,
        sections,
        h1,
        eyebrow: locale === "es" && processed.eyebrow ? exact(processed.eyebrow) : processed.eyebrow,
        metaTitle: `${h1} – ${family.label[locale]}`,
        metaDescription: describe(row, processed, h1, locale),
        ...(summary ? { summary } : {}),
        untranslatedItems:
          locale === "es"
            ? sections.reduce(
                (sum, section) => sum + section.items.filter((item) => "lang" in item && item.lang === "en").length,
                0
              )
            : 0
      };
    };

    content[path] = {
      key: legacyKey(path),
      family: family.id,
      ...(family.review ? { review: family.review } : {}),
      lastmod: en.sourceLastmod,
      en: page(processedEn, en, h1En, "en"),
      es: page(processedEs, es, h1Es, "es")
    };
    for (const locale of ["en", "es"] as const) {
      const title = content[path][locale].metaTitle;
      titles.set(`${locale}|${title}`, [...(titles.get(`${locale}|${title}`) ?? []), path]);
    }
  }

const staleCorrections = [
  ...corrections.filter((item) => !appliedCorrections.has(item)),
  ...blockCorrections.filter((item) => !appliedBlockCorrections.has(item))
];
if (staleCorrections.length)
  throw new Error(`Corrections no longer found on the source page: ${JSON.stringify(staleCorrections, null, 1)}`);

// Title collisions: a flat technical sheet that shares its name with a nested page gets
// "(technical sheet)"; other same-name pages (e.g. a hub and an overview) are told apart by
// their first section heading. The family hub keeps the plain title.
const isFlat = (path: string) => path.split("/").length === 2;
for (const [key, paths] of titles) {
  if (paths.length < 2) continue;
  const locale = key.split("|")[0] as Locale;
  if (paths.some((path) => !isFlat(path))) {
    for (const path of paths.filter(isFlat))
      content[path][locale].metaTitle += locale === "en" ? " (technical sheet)" : " (ficha técnica)";
    continue;
  }
  for (const path of paths) {
    const page = content[path][locale];
    if (familyOf(path)?.hub === path) continue;
    const heading = page.sections.find((section) => section.heading)?.heading;
    page.metaTitle = `${page.h1}: ${heading ?? path.slice(1)} – ${familyOf(path)?.label[locale]}`;
  }
}

// ---------- Manifest: one row per observed URL ----------
type ManifestRow = Record<string, unknown>;
const manifest: ManifestRow[] = [];

for (const row of crawl) {
  const path = pathOf(row.sourceUrl);
  const kind = legacyKind(path)!;
  const family = familyOf(path);
  const audit = auditByUrl.get(row.sourceUrl);
  const partner = byKey.get(`${path}|${row.locale === "en" ? "es" : "en"}`);
  let action: string;
  let finalPublic: string;
  let implementation: string;
  let route: string;
  let reason: string;
  if (kind === "redirect") {
    action = "redirect_301";
    finalPublic = `${origin}${publicUrl(legacyRedirects[path], row.locale)}`;
    implementation = `redirect:${legacyRedirects[path]}`;
    route = "proxy 301";
    reason =
      "Wix already answered this sitemap URL with a 301 to the equivalent IQF page; kept as a one-to-one permanent redirect in the same language (Wix dropped lang=es).";
  } else if (kind === "redesigned") {
    const target = redesignedRoutes[path];
    action = "retain_200";
    finalPublic = `${origin}${publicUrl(path, row.locale)}`;
    implementation = target.key;
    route = target.route[row.locale];
    reason = "Legacy public URL kept; the redesigned page is rendered at it through a proxy rewrite.";
  } else {
    action = family?.review ? "review" : "retain_200";
    finalPublic = `${origin}${publicUrl(path, row.locale)}`;
    implementation = `legacy:${path}`;
    route = `/${row.locale}/legacy/${legacyKey(path)}`;
    reason = family?.review
      ? `Retained at 200 (filtered) pending business review: ${family.review}`
      : `Retained at 200 with its crawled specifications in the legacy detail template (family: ${family?.label.en}).`;
  }
  const page = content[path]?.[row.locale];
  manifest.push({
    locale: row.locale,
    sourceUrl: row.sourceUrl,
    provenance: row.provenance,
    sourceSitemap: row.sourceSitemap,
    sourceLastmod: row.sourceLastmod,
    observedAt: row.observedAt,
    sourceStatus: row.sourceStatus,
    redirectChain: row.redirectChain,
    sourceFinalUrl: row.finalUrl ?? row.sourceUrl,
    observedCanonical: row.observedCanonical,
    title: row.title,
    description: row.description,
    h1: row.h1,
    keyContent: row.contentBlocks.slice(0, 12).map((block) => block.text.slice(0, 160)),
    contentBlocks: row.contentBlocks.length,
    images: row.images.length,
    files: row.files,
    internalInboundLinks: [...(inbound.get(path) ?? [])].sort(),
    internalOutboundLinks: [...new Set(row.internalOutboundLinks.map(pathOf))].sort(),
    alternateLanguagePartner: partner?.sourceUrl ?? null,
    pageKind: kind,
    family: family?.id ?? null,
    implementationPageId: implementation,
    implementationRoute: route,
    finalPublicCanonicalUrl: finalPublic,
    newTitle: page?.metaTitle ?? null,
    newDescription: page?.metaDescription ?? null,
    newH1: page?.h1 ?? null,
    withheldForReview: page?.excluded.length ?? 0,
    untranslatedBlocks: page?.untranslatedItems ?? 0,
    action,
    reason,
    auditDisposition: audit?.default_action ?? null,
    auditPreviewResult: audit ? `${audit.current_preview_final_status} ${audit.current_preview_final_url}` : null,
    evidence: `Official sitemap ${row.sourceSitemap} (lastmod ${row.sourceLastmod ?? "n/a"}); HTTP ${row.sourceStatus}${
      row.redirectChain.length ? ` after ${row.redirectChain.map((hop) => hop.status).join("→")}` : ""
    } observed ${row.observedAt}`
  });
}

for (const row of extra) {
  manifest.push({
    locale: row.locale,
    sourceUrl: row.sourceUrl,
    provenance: row.provenance,
    linkedFrom: row.linkedFrom,
    observedAt: row.observedAt,
    sourceStatus: row.sourceStatus,
    redirectChain: row.redirectChain,
    sourceFinalUrl: row.finalUrl,
    pageKind: "broken-historical-link",
    implementationPageId: null,
    finalPublicCanonicalUrl: null,
    action: "review",
    reason:
      "Linked from the official Home but not in any sitemap; 301 to the slash-less path, then 404. No page content or destination is established, so it stays 404 until the business confirms an equivalent page.",
    auditDisposition: auditByUrl.get(row.sourceUrl)?.default_action ?? null,
    evidence: `Internal link on ${row.linkedFrom.join(", ")}; HTTP ${row.sourceStatus} observed ${row.observedAt}`
  });
}
if (extra.length !== brokenHistoricalLinks.length) throw new Error("Unexpected historical links; review families.ts");

writeFileSync(`${dir}/migration-manifest.json`, `${JSON.stringify(manifest, null, 1)}\n`);
const columns = [
  "locale",
  "sourceUrl",
  "sourceStatus",
  "sourceFinalUrl",
  "pageKind",
  "family",
  "action",
  "finalPublicCanonicalUrl",
  "implementationPageId",
  "implementationRoute",
  "title",
  "newTitle",
  "description",
  "newDescription",
  "h1",
  "newH1",
  "withheldForReview",
  "untranslatedBlocks",
  "alternateLanguagePartner",
  "auditDisposition",
  "reason",
  "evidence"
];
writeFileSync(`${dir}/migration-manifest.csv`, toCsv(manifest, columns));

// ---------- Content matrix: what each retained page carries over ----------
const matrix = Object.entries(content).flatMap(([path, entry]) =>
  (["en", "es"] as const).map((locale) => {
    const page = entry[locale];
    const items = page.sections.flatMap((section) => section.items);
    return {
      locale,
      path,
      family: entry.family,
      h1: page.h1,
      sections: page.sections.length,
      specRows: items.reduce((sum, item) => sum + (item.type === "specs" ? item.rows.length : 0), 0),
      paragraphs: items.filter((item) => item.type === "p").length,
      listItems: items.reduce((sum, item) => sum + (item.type === "ul" ? item.items.length : 0), 0),
      productLinks: [
        ...new Set(
          page.sections.flatMap((section) => [
            ...(section.link ? [section.link] : []),
            ...section.items.flatMap((item) => (item.type === "links" ? item.paths : []))
          ])
        )
      ].length,
      untranslatedItems: page.untranslatedItems,
      withheld: page.excluded.map((item) => `${item.reason}: ${item.text.slice(0, 80)}`).join(" | "),
      review: entry.review ?? ""
    };
  })
);
const redesignedMatrix = Object.entries(redesignedPaths).flatMap(([path]) =>
  (["en", "es"] as const).map((locale) => {
    const row = byKey.get(`${path}|${locale}`)!;
    return {
      locale,
      path,
      family: "redesigned",
      h1: row.h1 ?? "",
      sections: 0,
      specRows: 0,
      paragraphs: 0,
      listItems: 0,
      productLinks: 0,
      untranslatedItems: 0,
      withheld: "",
      review: `Redesigned page; legacy topics: ${row.contentBlocks
        .filter((block) => /^h[1-3]$/.test(block.tag))
        .map((block) => displayCase(block.text))
        .slice(0, 8)
        .join("; ")}`
    };
  })
);
writeFileSync(
  `${dir}/content-matrix.csv`,
  toCsv([...redesignedMatrix, ...matrix], Object.keys(matrix[0]) as (keyof (typeof matrix)[number])[])
);

writeFileSync("src/migration/legacy-content.json", `${JSON.stringify(content)}\n`);

// ---------- Before/after routing table (audit preview test vs this implementation) ----------
const previewTests = parseCsv(readFileSync(`${dir}/audit-2026-10-27/GFB_Legacy_Preview_HTTP_Tests.csv`, "utf8"));
const previewByUrl = new Map(previewTests.map((row) => [row.legacy_production_url, row]));
const routing = manifest.map((row) => {
  const preview = previewByUrl.get(String(row.sourceUrl));
  const kind = row.pageKind;
  return {
    legacyUrl: row.sourceUrl,
    locale: row.locale,
    beforePreviewFinalStatus: preview?.final_status ?? "",
    beforePreviewFinalUrl: preview?.final_preview_url ?? "",
    afterResponse:
      kind === "broken-historical-link"
        ? "308 (trailing slash) → 404"
        : String(row.action).startsWith("redirect")
          ? `301 → ${row.finalPublicCanonicalUrl}`
          : "200 at the legacy URL",
    afterCanonical: row.finalPublicCanonicalUrl ?? "",
    afterImplementation: row.implementationPageId ?? "",
    action: row.action
  };
});
writeFileSync(
  `${dir}/routing-before-after.csv`,
  toCsv(routing, Object.keys(routing[0]) as (keyof (typeof routing)[number])[])
);

const count = (predicate: (row: ManifestRow) => boolean) => manifest.filter(predicate).length;
console.log(
  JSON.stringify(
    {
      manifestRows: manifest.length,
      retain200: count((row) => row.action === "retain_200"),
      review200: count((row) => row.action === "review" && row.pageKind === "detail"),
      redirects: count((row) => String(row.action).startsWith("redirect")),
      brokenHistorical: count((row) => row.pageKind === "broken-historical-link"),
      detailPages: Object.keys(content).length,
      withheldBlocks: Object.values(content).reduce((sum, entry) => sum + entry.en.excluded.length, 0),
      untranslatedEsItems: Object.values(content).reduce((sum, entry) => sum + entry.es.untranslatedItems, 0)
    },
    null,
    2
  )
);

function toCsv<T extends Record<string, unknown>>(rows: T[], keys: (keyof T)[]) {
  const value = (input: unknown) =>
    `"${String(typeof input === "object" && input !== null ? JSON.stringify(input) : (input ?? "")).replaceAll('"', '""')}"`;
  return `${[keys.join(","), ...rows.map((row) => keys.map((key) => value(row[key])).join(","))].join("\n")}\n`;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;
  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") endField();
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      endRow();
    } else field += char;
  }
  if (field || row.length) endRow();
  const [header, ...body] = rows.filter((item) => item.length > 1);
  const keys = header.map((key) => key.replace(/^﻿/, ""));
  return body.map((values) => Object.fromEntries(keys.map((key, index) => [key, values[index] ?? ""])));
}
