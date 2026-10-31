# SEO-preserving migration — contract, verification and launch runbook

Observation dates: audit 2026-10-27 UTC (docs/migration-data/audit-2026-10-27/), public re-crawl
2026-10-28 UTC (docs/migration-data/legacy-crawl.json). Production canonical origin:
`https://www.gfb-solutions.com`. The domain does not change, so no Search Console Change of Address.

## 1. Contract (implemented)

Public URL model: **the legacy Wix URLs remain the public canonicals**. The clean path is English;
the same path with `?lang=es` is Spanish. Both are independently addressable, with their own
canonical and a reciprocal `en-US` / `es-ES` / `x-default` (English) cluster, as on the legacy site.

| Legacy URLs (143 paths × 2 languages = 286)                                                                     | Disposition                                                                             | Count (URLs) |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -----------: |
| Home, About, 4 divisions, 10 categories                                                                         | `retain_200`: the redesigned page is rendered at the legacy URL (proxy rewrite)         |           32 |
| Product / specification / subcategory pages                                                                     | `retain_200`: data-driven legacy detail template with the crawled content               |          244 |
| `/additives`, `/ingredients-and-materials`                                                                      | `review`: retained at 200, unsupported claims withheld, business decision pending       |            4 |
| `/frozen-orange`, `/frozen-grapefruit`, `/frozen-lime`                                                          | `redirect_301`: Wix already redirected them to `/iqf-*`; kept one-to-one, same language |            6 |
| Broken historical links (`/engineering-and-machinery/`, `/food-tech-solutions/`, `/ingredients-and-chemicals/`) | `review`: 308 (trailing slash) → 404, as on Wix; no evidence of an equivalent page      |            3 |

New canonical pages without a legacy equivalent keep localized URLs: contact (`/en/contact`,
`/es/contacto`), the four consulting sectors and the new product index (`/en/product-index`,
`/es/indice-de-productos`) — 14 URLs. Legal drafts stay `noindex, follow`.

The localized implementation URLs of redesigned pages (`/en`, `/es`, `/en/about`, `/es/sobre-gfb`,
`/en/packaging-solutions/cans`, …) are **aliases**: one server-side 308 to the legacy URL, same
language, keeping tracking/lead parameters, same origin (preview testers stay on the preview).

Files:

- `docs/migration-data/migration-manifest.json` / `.csv` — one row per observed URL (289): source
  URL and query, provenance, sitemap and lastmod, status and redirect chain, observed canonical,
  title, description, H1, key content, inbound/outbound internal links, language partner, page
  kind, family, implementation page ID and internal route, final public canonical, new
  title/description/H1, withheld blocks, untranslated blocks, action, reason, audit disposition,
  evidence.
- `docs/migration-data/content-matrix.csv` — source → target content coverage per page/locale.
- `docs/migration-data/routing-before-after.csv` — audit preview result vs this implementation.
- `docs/migration-data/verification-results*.json` — last verifier runs (preview / production host).
- `src/migration/families.ts` — page identity of every legacy path (redesigned / redirect / family).
- `src/migration/public-paths.ts` — redesigned page ↔ legacy URL ↔ internal route; aliases.
- `src/migration/legacy-content.json` — render data of the 124 detail pages (generated).
- `docs/migration-data/superseded/` — the first draft (header-based route and heading-only
  manifest), kept for traceability; not compiled.

## 2. Routing implementation

`proxy.ts` (Node runtime), in order:

1. Alias of a redesigned page → 308 to its legacy URL.
2. Percent-encoded parentheses (`%28`/`%29`) of a legacy slug → 301 to the canonical spelling. An
   encoded slash (`%2F`, IQF slugs) is never decoded.
3. Wix-observed redirect source → 301 to the same page in the same language.
4. Redesigned legacy path → rewrite to the internal localized route (`/cans?lang=es` →
   `/es/soluciones-de-embalaje/latas`), address bar unchanged.
5. Legacy detail path → rewrite to `/{locale}/legacy/{base64url(path)}` (statically generated, so
   the cache key always contains the language; direct requests to `/…/legacy/…` return 404).
6. Everything else falls through; unknown paths get a true 404. No cookie or Accept-Language
   redirects (an explicit URL always wins). Paths are case-sensitive; `/cans/` → 308 `/cans`.

All internal links come from one resolver: `paths.*` in `src/i18n/routes.ts` returns the legacy
public URL for every redesigned page (menus, footer, cards, breadcrumbs, CTAs, language switcher,
sitemap, metadata). Retained product pages are linked from their category ("Product and
specification pages"), their family ("More in this family") and the footer's product index.

Known Wix child sitemaps (32) → 301 to `/sitemap.xml` or `/es_es-sitemap.xml` (`next.config.ts`).

### Redirect exceptions (documented)

| Source                              | Target                           | Evidence                                                           |
| ----------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `/frozen-orange` (+ `?lang=es`)     | `/iqf-orange` (+ `?lang=es`)     | Wix 301 observed 2026-10-27/28 (Wix dropped `lang=es`; we keep it) |
| `/frozen-grapefruit` (+ `?lang=es`) | `/iqf-grapefruit` (+ `?lang=es`) | idem                                                               |
| `/frozen-lime` (+ `?lang=es`)       | `/iqf-lime` (+ `?lang=es`)       | idem                                                               |

Keep these permanent redirects for at least a year, and longer while links or traffic remain. No
product family is redirected to Home or a broad category.

### Overlapping pages (retained, flagged for review)

Flat legacy sheets and nested dynamic pages describe the same products (e.g. `/malbec` and
`/red-grape-juice/malbec`, `/std-can-d66mm` and `/aluminum-cans/std-can-d66mm`, `/26mm-ripcap`
and `/ripcap/26-mm-ripcap`). Both are retained with their own canonical and distinct titles
("(technical sheet)"); consolidate only with Search Console evidence. `/fruit-concentrates`
(red-grape page) and `/fruits-concentrates` (concentrate catalogue) are different pages and are not
merged.

## 3. Content, metadata and structured data

- Detail pages render the crawled content in order: specification tables (`<table>`, `<th
scope="row">`), lists and paragraphs, plus breadcrumbs, family links and the contextual CTA.
  One H1 per page; H2/H3 from the source headings.
- Withheld for review (507 blocks on 130 localized rows, listed per page in the content matrix): health/benefit claims
  ("Benefits" sections, nutrition claims) and manufacturing claims (GFB is not a manufacturer).
  Nothing is dropped silently.
- Visible typos fixed: `GBF`, "Alluminium", "Sof Drinks", "suvignon", "Corona corchos".
- Titles: unique, `{name} – {family}`; descriptions: legacy description when real, otherwise
  facts from the page (formats table) or a factual template. No UUID/empty descriptions.
- Spanish: pages Wix translated keep that translation. Concentrate formats and IQF/can/closure
  product names use a closed glossary (`src/migration/glossary-es.ts`); commercial names and codes
  stay unchanged. The current manifest reports zero untranslated blocks; the earlier 494-item
  count is obsolete.
- JSON-LD: Organization and WebSite (stable `@id`s, no Wix social profiles) on Home;
  BreadcrumbList on every page with breadcrumbs; Product (name, description, category, url —
  no offers, prices, GTINs or ratings) on leaf product pages; CollectionPage on family hubs.
- Open Graph/Twitter: title, description, production canonical URL, local image.

## 4. Indexing and environments

| Host                                       | Environment                          | Canonical / hreflang / sitemap | Indexing                        |
| ------------------------------------------ | ------------------------------------ | ------------------------------ | ------------------------------- |
| `www.gfb-solutions.com`                    | production (`VERCEL_ENV=production`) | production URLs                | indexable                       |
| `www.gfb-solutions.com`                    | preview / non-production             | production URLs                | `X-Robots-Tag: noindex, follow` |
| `gfb-solutions.vercel.app`, `*.vercel.app` | any (also production)                | production URLs                | `X-Robots-Tag: noindex, follow` |
| localhost / unknown hosts                  | any                                  | production URLs                | `X-Robots-Tag: noindex, follow` |

Outside Vercel, production means `NODE_ENV=production`. The canonical origin is fixed in
`src/lib/metadata.ts` (not taken from an env variable). `robots.txt` allows crawling everywhere so
crawlers can read the noindex header, and lists both sitemaps.

## 5. Verification

| Command                                                                                                                           | Result                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run check` (format, lint, typecheck, unit tests, build)                                                                      | pass; 29 unit tests                                                                      |
| `npx playwright test`                                                                                                             | 56 passed, 2 skipped (desktop + mobile; axe on 10 pages incl. detail template and index) |
| `MIGRATION_TEST_ORIGIN=https://gfb-solutions.vercel.app npm run test:migration` (2026-10-31 UTC)                                  | 771 HTTP requests; 15,121 assertions: 15,114 passed, 7 structured-data consistency failures, 744 skipped |
| `MIGRATION_TEST_ORIGIN=https://www.gfb-solutions.com npm run test:migration`                                                       | Not executed; required after authorised cutover                                           |
| Browser check (scratchpad script): language switch after hydration on 4 pages × 2 viewports, client navigation category ↔ product | 21/21                                                                                    |
| Concentrate portfolio QA at `/fruits-concentrates` (EN 1366/1440/1920, ES 1440)                                                   | unchanged: 43 entries, counts, panel heights, keyboard, CTA                              |

The verifier covers every manifest row (status, single hop for redirects, canonical, HTML lang, one
H1 and its text, hreflang cluster, title/description quality, JSON-LD parse, noindex/indexable,
all source-derived Product Information blocks present in their scoped section), 18 edge cases (aliases, trailing slash, case, encoded
characters, unknown URLs, child sitemaps), query-order variants, alternating-language requests,
crawler user agent, sitemap equality with the manifest, 568 internal links, 138 images and orphans.

Lab performance (local Chromium, 10 Mbps / 40 ms): CLS 0 on Home, a service page, the concentrate
catalogue, two technical pages and the index; LCP 0.3–0.8 s; ~150 KB compressed JS. These are lab
numbers, not field Core Web Vitals.

Not verifiable here: live deployment behaviour (Vercel host headers, TLS, apex/HTTP redirects),
Google's selected canonicals, Rich Results Test / URL Inspection, Search Console data.

### Revalidation (2026-10-31 UTC)

- The official English and Spanish sitemap roots were crawled again: 34 sitemap files, 286
  localized URLs (143 per locale), all 200, with three additional historical internal links.
- The manifest was regenerated: 289 rows (276 retained 200 pages, four retained review pages,
  six permanent redirects and three broken historical links).
- The hardened verifier against the public Vercel preview made 771 HTTP requests and executed
  15,121 assertions. Seven Product schema-description/visible-content consistency assertions
  failed; all 3,207 scoped content blocks and 744 candidate metadata-contract assertions passed.
  The raw result is `docs/migration-data/verification-results.json`.
- The verifier now treats only the actual production hostname as indexable. A forwarded-host
  override simulates production only on localhost because Vercel strips that header on remote
  preview requests.

## 6. Launch checklist (requires explicit approval; not done in this task)

1. Record the release SHA; export/back up the Wix site and its current settings (robots,
   redirects, verification tags, analytics/tag-manager IDs).
2. Deploy to a Vercel preview; run `npm run test:migration` against the preview origin and confirm
   `noindex` on every response.
3. Verification continuity: the legacy site publishes `google-site-verification`,
   `msvalidate.01` (Bing) and `yandex-verification` meta tags; the same public values are rendered
   on every page by `app/[locale]/layout.tsx`. No verification files and no Google Analytics /
   Tag Manager IDs were found in the legacy HTML (2026-10-28); if GFB uses Wix's built-in
   analytics, decide the replacement before cutover to keep measurement continuity.
4. Confirm TLS on `www`, apex → `www` and HTTP → HTTPS in a single hop each.
5. Approve the review items in §8.
6. Point the domain to the new deployment (only after approval). Immediately run
   `MIGRATION_TEST_ORIGIN=https://www.gfb-solutions.com npm run test:migration` and confirm no
   `X-Robots-Tag: noindex` on production.
7. Submit `/sitemap.xml` (and keep `/es_es-sitemap.xml`) in Search Console only after step 6 passes.

## 7. Rollback

1. Keep the previous DNS/hosting values and the Wix site unpublished-but-intact until stable.
2. On sustained 5xx, wrong language/canonical, broad 404s or a noindex on production, restore the
   previous target immediately; do not patch DNS and application routing at the same time.
3. Keep the failed release for diagnosis; re-crawl the full manifest after rollback.

## 8. Open business / data items

- **Private data not available**: Search Console (28/90 days, prior-year context: pages, queries,
  devices, countries, indexing, selected canonicals, sitemaps, links), analytics organic landing
  pages and conversions, backlink exports, server logs. Needed to prioritise overlapping pages
  and measure the migration; public crawling cannot establish traffic or rankings.
- `/additives` and `/ingredients-and-materials`: confirm whether these offers are current.
- The three broken historical links: confirm intended destinations, if any.
- Spanish source blocks: the current manifest reports zero untranslated blocks.
- Withheld claims/placeholders (507 blocks): confirm which, if any, can be supported; do not
  restore health, benefits or manufacturing claims without evidence.
- Overlapping flat/nested product pages: consolidate only with Search Console evidence.
- No PDF/downloadable files were linked from the crawled HTML; Wix-hosted images are not
  republished (the templates use text content and local assets only).
- Rights to the official GFB images used as portfolio thumbnails/Home photo (see
  docs/asset-provenance.md).

## 9. Monitoring after an authorised cutover

Day 0: full manifest crawl, URL Inspection of priority pages, sitemap status. Daily for the first
week, weekly for 8–12 weeks, then monthly: 404/5xx, crawl/indexing issues, Google-selected
canonicals, organic landing-page and query performance per page against seasonality and sitewide
trends. Short-term fluctuation is possible; identical rankings cannot be promised.

## Commands

```bash
npm run crawl:migration        # re-crawl the public Wix site (network)
npm run build:migration        # manifest, content matrix, routing table, detail content
npm run check                  # format, lint, typecheck, unit tests, build
npm run test:e2e               # browser suite (desktop + mobile, axe)
MIGRATION_TEST_ORIGIN=http://localhost:3000 npm run test:migration
MIGRATION_TEST_ORIGIN=http://localhost:3000 MIGRATION_TEST_HOST=www.gfb-solutions.com npm run test:migration
```
