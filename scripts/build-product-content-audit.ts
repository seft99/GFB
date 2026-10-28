/**
 * Product-detail content audit: every detail route (EN + ES) with its family, page kind,
 * published content blocks, links, selected layout and source issues. Writes
 * docs/migration-data/product-detail-content.json and docs/product-detail-content-audit.md.
 * Run: node scripts/build-product-content-audit.ts
 */
import { writeFileSync } from "node:fs";
import type { Item } from "../src/migration/content.ts";
import { familyOf } from "../src/migration/families.ts";
import { detailPaths, legacyPage } from "../src/migration/manifest.ts";
import {
  contentStrings,
  productContent,
  productContentVariant,
  sourceStrings
} from "../src/migration/product-content.ts";
import { productHeroImage } from "../src/migration/product-hero-images.ts";
import { isTechnicalResource } from "../src/migration/product-resources.ts";
import { publicUrl } from "../src/migration/public-paths.ts";
import { isOverview } from "../src/migration/technical-library.ts";

/** Source issues found while auditing (left as published; flagged for GFB to confirm). */
const sourceIssues: Record<string, string> = {
  "/tropical/mango":
    'Overview says "At Valencia Orange we have the varieties of mango…" (wording copied from another page/supplier). Kept as published; to confirm.',
  "/iqf-orange-frozen/iqf-orange-half-slices-6-%2F-9-mm":
    'Describes orange as "a very strong acidic citrus fruit with a bright yellow skin" (lemon wording). Kept as published; correction to confirm (the lime pages had the same issue and were corrected in src/migration/corrections.ts).',
  "/aluminium-can-ends/52mm-(202)-dia-aluminium-end":
    'The standard (Korinthos) end page introduces "the 52mm (202) Dia ISE Aluminium End SOT - Large Aperture (Botcherby)". Kept as published; to confirm which values apply.',
  "/plant-based-concentrate-1/oat-concentrate":
    'The "Available formats" table also publishes "Oat Benefits" health text. Shown apart from the formats as published text, not as product facts; claims not verified.',
  "/plant-based-concentrate-1/almond-concentrate":
    'The "Available formats" table also publishes "Almond Benefits" health text. Shown apart from the formats as published text, not as product facts; claims not verified.',
  "/soft-drinks":
    "The opening paragraph is about filtered water (copied from /water) and claims glass avoids chemical contamination. Kept as published; to confirm.",
  "/water":
    'States glass bottles keep water "avoiding chemical contamination" (absolute claim). Kept as published; to confirm.'
};

const kindOf = (path: string) => (isTechnicalResource(path) ? "technical" : isOverview(path) ? "overview" : "product");

const blockKinds = (items: Item[]) =>
  items.map((item) =>
    item.type === "specs"
      ? `specs×${item.rows.length}`
      : item.type === "ul"
        ? `list×${item.items.length}`
        : item.type === "links"
          ? `links×${item.paths.length}`
          : item.type
  );

const rows = detailPaths.flatMap((path) =>
  (["en", "es"] as const).map((locale) => {
    const page = legacyPage(path)![locale];
    const family = familyOf(path)!;
    const decision = productContentVariant(path);
    const content = productContent(path, page.sections);
    const items = page.sections.flatMap((section) => section.items);
    const links = [
      ...page.sections.flatMap((section) => (section.link ? [section.link] : [])),
      ...items.flatMap((item) => (item.type === "links" ? item.paths : []))
    ];
    const lossless = JSON.stringify(contentStrings(content)) === JSON.stringify(sourceStrings(page.sections));
    return {
      route: publicUrl(path, locale),
      locale,
      canonicalId: path,
      division: family.parent.division,
      family: family.id,
      pageKind: kindOf(path),
      contentBlocks: page.sections.map((section) => ({
        heading: section.heading ?? null,
        blocks: blockKinds(section.items)
      })),
      counts: {
        sections: page.sections.length,
        paragraphs: items.filter((item) => item.type === "p").length,
        specRows: items.reduce((sum, item) => sum + (item.type === "specs" ? item.rows.length : 0), 0),
        listEntries: items.reduce((sum, item) => sum + (item.type === "ul" ? item.items.length : 0), 0),
        excludedByMigration: page.excluded?.length ?? 0
      },
      links: links.map((link) => publicUrl(link, locale)),
      selectedVariant: decision.variant,
      arrangement: content.variant === "product-range-features" ? content.arrangement : null,
      reason: decision.reason,
      heroImage: productHeroImage(path)?.src ?? null,
      sourceIssue: sourceIssues[path] ?? null,
      migrationStatus:
        page.sections.length === 0
          ? "no product-information content (section not rendered)"
          : lossless
            ? "migrated (lossless)"
            : "CHECK"
    };
  })
);

writeFileSync("docs/migration-data/product-detail-content.json", `${JSON.stringify(rows, null, 2)}\n`);

const en = rows.filter((row) => row.locale === "en");
const count = (key: (row: (typeof rows)[number]) => string) =>
  Object.entries(
    en.reduce<Record<string, number>>((acc, row) => ({ ...acc, [key(row)]: (acc[key(row)] ?? 0) + 1 }), {})
  )
    .map(([name, n]) => `| ${name} | ${n} |`)
    .join("\n");

const table = en
  .map(
    (row) =>
      `| \`${row.canonicalId}\` | ${row.family} | ${row.pageKind} | ${row.contentBlocks
        .map((section) => section.blocks.join("+") || "heading")
        .join(
          " · "
        )} | ${row.links.length} | ${row.selectedVariant}${row.arrangement ? ` (${row.arrangement})` : ""} | ${
        row.heroImage ? "photo" : "image-free"
      } | ${row.sourceIssue ? "⚠ see below" : "—"} | ${row.migrationStatus} |`
  )
  .join("\n");

const md = `# Product-detail content audit

Generated by \`node scripts/build-product-content-audit.ts\` from the crawled page content
(\`src/migration/legacy-content.json\`) and the layout mapping (\`src/migration/product-content.ts\`).
Machine-readable inventory (both locales, with block structure, counts and links):
\`docs/migration-data/product-detail-content.json\`.

## Scope

- **In scope:** the ${en.length} legacy detail routes rendered by \`app/[locale]/legacy/[key]\` (each in EN at its
  legacy path and ES with \`?lang=es\`, ${rows.length} rendered pages). They are every individual product,
  specification and range-overview page of the site; aliases and redirects resolve to them and are
  not separate pages (docs/migration-data/migration-manifest.json).
- **Out of scope (no product-information section of their own):** home, About, division and
  category landing pages (their catalogues are the technical library, concentrate explorer and
  resource sections), contact, legal, product index. Flavour applications and consulting sectors
  are category pages without individual product pages.
- **Section boundaries:** the content section sits between the product hero and "More in this
  family"; hero, family links, CTA and footer are unchanged.

## Variant mapping (explicit, by canonical family and page kind)

| Variant | Pages (EN) |
| --- | ---: |
${count((row) => row.selectedVariant)}

Rules, in order: specification pages (\`isTechnicalResource\`: analysis/microbiology sheets and
verified packaging specification pairs) → \`technical-specification\`; concentrate families and
plant-based → \`formats-overview\`; individual IQF formats → \`facts-applications\`; everything else
(bottle applications as \`reference-collection\`, packaging products, labels, red grape varieties
and range overviews as \`feature-editorial\`) → \`product-range-features\`.

| Page kind | Pages (EN) |
| --- | ---: |
${count((row) => row.pageKind)}

## Content preservation

Each layout only re-arranges the published blocks. \`tests/unit/product-content.test.ts\` proves, for
all ${rows.length} pages, that the arranged content holds exactly the published strings (headings, paragraphs,
list entries, table cells, links). Two presentational merges, both lossless in the data model:
Wix repeats a bottle group label ("Beer") after each model — shown once as the group heading; a
single-entry list under a heading on concentrate pages ("Deionized concentrates") is shown as one
more format row. Long table cells (over 140 characters, e.g. "Oat Benefits") are shown as text, not
as format chips. Nothing is invented: no placeholder values, methods, images, downloads or
calls to action; technical pages are HTML pages, not PDFs. Text the migration had already
excluded (health/manufacturing claims, ${en.reduce((sum, row) => sum + row.counts.excludedByMigration, 0)} blocks on EN pages) stays excluded.

## Source issues (flagged, not guessed)

${Object.entries(sourceIssues)
  .map(([path, issue]) => `- \`${path}\`: ${issue}`)
  .join("\n")}

## Routes (EN; ES mirrors each with \`?lang=es\`)

| Route | Family | Kind | Published blocks | Links | Variant | Hero image | Issue | Status |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
${table}
`;
writeFileSync("docs/product-detail-content-audit.md", md);
console.log(`${rows.length} rows; ${rows.filter((row) => row.migrationStatus === "CHECK").length} to check`);
