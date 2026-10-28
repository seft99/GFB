import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { divisions } from "../../src/content/catalog.ts";
import { paths } from "../../src/i18n/routes.ts";
import { usableDescription } from "../../src/migration/content.ts";
import {
  families,
  familyOf,
  legacyKey,
  legacyKind,
  legacyRedirects,
  pathFromKey,
  redesignedPaths
} from "../../src/migration/families.ts";
import { productNameEs } from "../../src/migration/glossary-es.ts";
import { detailPaths, legacyAlternates, legacyCanonical, legacyPage } from "../../src/migration/manifest.ts";
import { aliasTargets, publicUrl, redesignedRoutes } from "../../src/migration/public-paths.ts";
import { sitemapEntries } from "../../src/migration/sitemap.ts";

type ManifestRow = {
  locale: "en" | "es";
  sourceUrl: string;
  provenance: string;
  pageKind: string;
  action: string;
  finalPublicCanonicalUrl: string | null;
  alternateLanguagePartner?: string | null;
};

const manifest: ManifestRow[] = JSON.parse(
  readFileSync(new URL("../../docs/migration-data/migration-manifest.json", import.meta.url), "utf8")
);
const sitemapRows = manifest.filter((row) => row.provenance === "official sitemap");
const legacyPaths = [...new Set(sitemapRows.map((row) => new URL(row.sourceUrl).pathname))];
const normalize = (url: string) => {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}${parsed.search}`;
};

test("the manifest covers the 286 official sitemap URLs (143 per language) plus 3 broken links", () => {
  assert.equal(sitemapRows.length, 286);
  assert.equal(sitemapRows.filter((row) => row.locale === "en").length, 143);
  assert.equal(sitemapRows.filter((row) => row.locale === "es").length, 143);
  assert.equal(legacyPaths.length, 143);
  assert.equal(manifest.filter((row) => row.pageKind === "broken-historical-link").length, 3);
});

test("every legacy path has exactly one explicit disposition", () => {
  for (const path of legacyPaths) assert.ok(legacyKind(path), `${path} has no disposition`);
  const classified = [
    ...Object.keys(redesignedPaths),
    ...Object.keys(legacyRedirects),
    ...families.flatMap((family) => family.paths)
  ];
  assert.equal(classified.length, new Set(classified).size, "a path is classified twice");
  assert.deepEqual([...classified].sort(), [...legacyPaths].sort());
  for (const row of sitemapRows) assert.match(row.action, /^(retain_200|redirect_301|review)$/, row.sourceUrl);
});

test("retained pages keep their own legacy URL as canonical, in their language", () => {
  for (const row of sitemapRows.filter((item) => item.action !== "redirect_301")) {
    assert.equal(normalize(row.finalPublicCanonicalUrl!), normalize(row.sourceUrl), row.sourceUrl);
    assert.ok(row.alternateLanguagePartner, `${row.sourceUrl} lacks its language partner`);
  }
});

test("redirects are one-to-one, same language and target a retained page (never a category)", () => {
  for (const [source, target] of Object.entries(legacyRedirects)) {
    assert.equal(legacyKind(target), "detail", `${source} → ${target}`);
    assert.equal(familyOf(target)?.hub, target);
  }
  for (const row of sitemapRows.filter((item) => item.action === "redirect_301")) {
    const target = new URL(row.finalPublicCanonicalUrl!);
    assert.equal(target.searchParams.get("lang") === "es", row.locale === "es", row.sourceUrl);
  }
});

test("Spanish canonicals keep the significant lang query; hreflang clusters are reciprocal", () => {
  assert.equal(
    legacyCanonical("/citrics/orange-concentrate", "es"),
    "https://www.gfb-solutions.com/citrics/orange-concentrate?lang=es"
  );
  assert.equal(
    legacyCanonical("/iqf-lime-slices/iqf-lime-1%2F4-cut", "en"),
    "https://www.gfb-solutions.com/iqf-lime-slices/iqf-lime-1%2F4-cut"
  );
  assert.equal(publicUrl("/", "es"), "/?lang=es");
  const cluster = legacyAlternates("/cans");
  assert.deepEqual(cluster, {
    "en-US": "https://www.gfb-solutions.com/cans",
    "es-ES": "https://www.gfb-solutions.com/cans?lang=es",
    "x-default": "https://www.gfb-solutions.com/cans"
  });
});

test("internal routes of redesigned pages match the catalogue slugs", () => {
  for (const [path, route] of Object.entries(redesignedRoutes)) {
    const target = redesignedPaths[path];
    assert.ok(target, `${path} is not a redesigned path`);
    if ("division" in target) {
      const division = divisions.find((item) => item.id === target.division)!;
      const category =
        "category" in target ? division.categories.find((item) => item.id === target.category) : undefined;
      if ("category" in target) assert.ok(category, `${path}: unknown category`);
      for (const locale of ["en", "es"] as const) {
        const expected = category
          ? `/${locale}/${division.slug[locale]}/${category.slug[locale]}`
          : `/${locale}/${division.slug[locale]}`;
        assert.equal(route.route[locale], expected, `${path} (${locale})`);
        const publicPath = category ? paths.category(locale, division, category) : paths.division(locale, division);
        assert.equal(publicPath, publicUrl(path, locale));
      }
    }
  }
  for (const [alias, target] of aliasTargets) assert.ok(redesignedRoutes[target.path], alias);
});

test("encoded slugs survive the internal route key", () => {
  for (const path of detailPaths) assert.equal(pathFromKey(legacyKey(path)), path);
  assert.match(legacyKey("/iqf-lime-slices/iqf-lime-1%2F4-cut"), /^[A-Za-z0-9_-]+$/);
});

test("legacy detail pages have content, unique titles and real descriptions in both languages", () => {
  for (const locale of ["en", "es"] as const) {
    const titles = new Set<string>();
    for (const path of detailPaths) {
      const page = legacyPage(path)![locale];
      assert.ok(page.h1, `${path} (${locale}) has no H1`);
      assert.ok(!titles.has(page.metaTitle), `duplicate title ${page.metaTitle}`);
      titles.add(page.metaTitle);
      assert.ok(page.metaDescription.length >= 30 && page.metaDescription.length <= 160, `${path} description`);
      assert.ok(!/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(page.metaDescription), `${path} UUID description`);
      assert.ok(!/\bGBF\b/.test(page.metaTitle + page.metaDescription));
      assert.ok(page.sections.length > 0, `${path} (${locale}) renders no content`);
    }
  }
  assert.equal(usableDescription("bb609439-92b8-491d-89b7-5eb9b22bd7fd"), undefined);
});

test("Spanish names come from a closed glossary; codes stay unchanged", () => {
  assert.equal(productNameEs("IQF lemon slices"), "Rodajas de limón IQF");
  assert.equal(
    productNameEs("IQF ORANGE SLICES 6 / 9 mm".replace("ORANGE SLICES", "orange slices")),
    "Rodajas de naranja IQF 6 / 9 mm"
  );
  assert.equal(productNameEs("Frozen block lemon zest"), "Bloque congelado de ralladura de limón");
  assert.equal(productNameEs("Merlot"), undefined);
  assert.equal(legacyPage("/citrics/orange-concentrate")!.es.h1, "Concentrado de naranja");
});

test("the sitemap lists each intended canonical once and no alias, redirect or broken link", () => {
  const entries = sitemapEntries();
  const urls = entries.map((entry) => entry.url);
  assert.equal(urls.length, new Set(urls).size);
  assert.equal(entries.length, (Object.keys(redesignedPaths).length + detailPaths.length) * 2 + 2 * 2 + 4 * 2);
  for (const url of urls) {
    assert.match(url, /^https:\/\/www\.gfb-solutions\.com\//);
    const path = new URL(url).pathname;
    assert.ok(!(path in legacyRedirects), url);
    assert.ok(!/^\/(en|es)\/(legacy|about|sobre-gfb)\b/.test(path), url);
    assert.ok(!aliasTargets.has(path), `${url} is an alias`);
  }
  for (const entry of entries) assert.equal(Object.keys(entry.languages).length, 3);
});
