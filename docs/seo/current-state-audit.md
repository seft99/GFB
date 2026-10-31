# Current-state technical SEO audit

Audit date: 2026-10-30. Scope is read-only: repository, generated migration contract, and the documented remote Vercel verification run dated 2026-10-29. No production-domain DNS, Search Console, analytics, or deployment change was made.

## Executive summary

**Readiness: not ready.** The implementation is deliberately built to preserve 286 observed official URLs (143 EN and 143 ES), serves product specifications in initial HTML, uses the official `www` origin in canonical signals, and keeps Vercel preview hosts out of the index. The hardened remote-preview run executed 15,121 assertions: 15,114 passed and 7 Product structured-data consistency assertions failed. The official host, DNS normalization, Search Console baseline and launch-day response headers also remain unverified.

## Evidence basis and route inventory

`route-inventory.csv` covers all 289 manifest rows: 276 retained 200 URLs, 4 retained review URLs, 6 observed permanent redirects, and 3 historic broken links. The contract was regenerated from the official sitemap crawl observed 2026-10-29. Detail routes are statically generated through `app/[locale]/legacy/[key]/page.tsx`; public legacy paths are rewritten in `proxy.ts`, so the rendered URL remains stable.

| Finding | Severity | Scope/evidence | Impact / remediation / verification | Confidence |
| --- | --- | --- | --- | --- |
| Essential detail content is server-rendered | P3 | 124 detail paths × EN/ES; `app/[locale]/legacy/[key]/page.tsx`, `components/sections/product-detail-content.tsx`; migration verifier checks body identity in initial HTML | Good crawlability; retain SSR/SSG path and re-run `npm run test:migration` after cutover. | High |
| Canonical host is fixed to official www | P1 | `src/lib/metadata.ts:9-13`; all metadata, sitemap and JSON-LD use `https://www.gfb-solutions.com` | Prevents preview canonical leakage. Confirm actual domain points to this deployment before indexability is enabled. | High |
| Preview host has noindex header policy | P1 | `proxy.ts:10-28`; documented remote `gfb-solutions.vercel.app` verification passes | Avoids preview-domain competition. Verify `X-Robots-Tag: noindex, follow` on every Vercel alias at release. | High for code; medium for current deployment |
| Official host response is not directly verified | P0 | This audit had no production cutover / DNS authority; remote preview is not evidence of `www` production behavior | Do not launch until a live request confirms 200, canonical www URL, and absence of X-Robots noindex. | High |
| Search Console and analytics baseline unavailable | P0 | No authorised integration/export found | Export 28/90-day Performance, Pages, Sitemaps, Page Indexing, CWV and Links reports before cutover. Metrics are **NOT VERIFIED**. | High |
| Four review pages remain business-dependent | P1 | `/additives`, `/ingredients-and-materials` in both locales; manifest action `review` | Confirm current commercial offer before retaining/promoting. Keep indexable only after business approval. | High |
| Flat/nested product duplicates are intentionally retained | P2 | Red grape, cans and RipCap flat sheets vs nested detail URLs; `docs/seo-migration-runbook.md` §2 | Preserves inherited URLs but may split signals. Do not consolidate without Search Console/query and backlink evidence. | High |
| Previous 494 untranslated-block report is stale | P3 | current generated manifest: 0 rows / 0 `untranslatedBlocks` | Reporting inconsistency resolved; preserve codes/units when future source content changes. | High |

## Metadata, indexing and structured data

- `pageMetadata` supplies title, description, canonical, reciprocal `en-US` / `es-ES` / `x-default`, Open Graph and Twitter fields (`src/lib/metadata.ts:28-47`).
- Sitemap uses the canonical URL contract and language alternates (`app/sitemap.ts:10-16`); `robots.txt` permits crawl and declares both language sitemap endpoints (`app/robots.ts:10-14`).
- Breadcrumb JSON-LD is emitted with visible breadcrumbs (`components/layout/breadcrumbs.tsx:8-18`). Product/Collection/Organization schema coverage is verified by the migration verifier; it deliberately excludes price, offer, GTIN and rating claims.
- The verifier checks one H1, title/description quality, canonical, hreflang, JSON-LD parse, internal links, sitemaps, assets, redirects and body identity. This is stronger than source-only inspection, but not a substitute for Google-selected canonical evidence.

## Routing and migration

`proxy.ts:54-88` implements: encoded-parenthesis canonicalization (301), localized implementation aliases (308), documented Wix redirects (301), rewrites for redesigned and legacy detail pages, and true fall-through 404s. It explicitly preserves encoded IQF `%2F` path content. Trailing-slash/case/unknown-route behavior is covered by the verifier’s edge cases. HTTP→HTTPS and apex→www are infrastructure-level **P0 unknowns**, not proven by repository code.

## Product and localization assessment

Every detail URL has a family identity, source-backed H1/title/description, family/category discovery and related-page navigation. Product technical tables use semantic table markup. Product URLs are included in the canonical sitemap unless they are redirects/broken historic paths. Risk concentration: seven Product description/schema-visible-content inconsistencies, review pages, duplicate flat/nested sheets and source-thin legacy pages. No `noindex`, canonical consolidation, or redirect expansion is recommended without Search Console evidence.

## Performance and infrastructure

Code evidence: Next static generation, local AVIF/WebP image configuration (`next.config.ts:39-43`), immutable canonical origin, and production security headers (`next.config.ts:17-36`). The runbook records local synthetic CLS 0 and LCP 0.3–0.8s on selected pages; these are **lab observations**, not CrUX/RUM field data. INP, field LCP/CLS, Vercel cache headers, TTFB, actual image transfer and production font timings are **NOT VERIFIED**.

## Prioritised migration backlog

1. **P0:** Capture Search Console/analytics baseline and confirm ownership/verification continuity.
2. **P0:** On the actual www host, smoke-test all manifest URLs, headers, canonical/hreflang, sitemaps, robots, apex and HTTP normalization before indexing.
3. **P1:** Resolve the four review URLs and three historic broken-link destinations.
4. **P1:** Validate Vercel production environment variables and preview noindex behavior immediately after deployment.
5. **P2:** Resolve the seven schema-description/visible-content inconsistencies and evaluate overlap pages from actual performance/backlink data.
6. **P3:** Add field CWV monitoring and post-launch weekly URL Inspection samples.

## Required launch-day checks

Run `MIGRATION_TEST_ORIGIN=https://www.gfb-solutions.com npm run test:migration`; confirm no noindex header on www, no preview hostname in canonicals/sitemaps, exact sitemap cardinality, one-hop redirects, and live 404 behavior. Submit only the production sitemap after those checks pass. Keep Wix/DNS rollback values available.

## Reconciliation addendum — 2026-10-30

### Discrepancy matrix

| Item | Confirmed state | Previous export issue | Disposition |
| --- | --- | --- | --- |
| `/iqf-orange`, `/iqf-lime`, `/iqf-grapefruit` EN/ES | Retained product hub: `200`, self canonical (Spanish retains `?lang=es`), indexable only on intended www production host, listed in the sitemap | The CSV rendered redirect *targets* as redirect *sources*, creating a false duplicate 301 row at each retained route | CSV corrected to use `sourceUrl` for redirects. The 301 sources are `/frozen-orange`, `/frozen-lime`, `/frozen-grapefruit`, preserving locale. |
| Three broken historical links | `/engineering-and-machinery/`, `/food-tech-solutions/`, `/ingredients-and-chemicals/`: source 301 strips slash, then target is 404; no canonical, no sitemap | CSV used a source row’s inferred 200/default values and final canonical fallback | CSV corrected: `404`, not indexable, no canonical/sitemap, and explicit reason. |
| 32 redesigned records with blank CSV metadata | Their public legacy URLs are rewrites to statically generated localized implementations; source route metadata is present in rendered pages via the localized page template | `newTitle`/`newDescription` are absent on some manifest rows, so the audit exporter emitted blanks | Reporting omission, not confirmed metadata defect. CSV now labels such cells `REPORTING-OMISSION: inspect rendered metadata`. Verify all 32 in the launch verifier. |
| `internal_links = 0` (44 detail records) | This is **legacy-crawl inbound content-link count only**: direct links observed in crawled page HTML to that legacy path | It excludes runtime breadcrumbs, family “More in this family”, category resource links and global navigation rendered by the new application | Reporting-scope limitation, not an orphan verdict. Runtime link coverage is separately exercised by the verifier (568 internal links). |
| `untranslatedBlocks` vs `withheldForReview` | Both are independent. Current manifest: 0 untranslated blocks; 507 withheld blocks on 130 localized rows. | The previous 494 untranslated and 173 withheld totals were stale | CSV now exports both separately. Withheld reasons are claim/benefit, manufacturing, duplicate, placeholder or empty-heading classifications; none implies robots/sitemap exclusion. |

### Verifier evidence

The raw verifier result is retained at `docs/migration-data/verification-results.json`: origin `https://gfb-solutions.vercel.app`, timestamp `2026-10-31T00:46:23.031Z`, expected indexability `false`. It made 771 HTTP requests (631 page, 2 crawler, 138 image) and executed 15,121 assertions (15,114 passed, 7 failed) plus 744 skips. The 3,207 block-scoped content and 744 metadata-contract assertions all passed; seven Product schema descriptions are not sufficiently represented by visible content. It validates preview `noindex`; it does **not** prove indexability on www.

### Effective-indexability definition

CSV `indexable=intended-production-only` means the URL is intended to be indexable on `www.gfb-solutions.com` in a production deployment. It never means that the Vercel preview is indexable. `proxy.ts:10-28` deliberately emits `X-Robots-Tag: noindex, follow` for preview, aliases, localhost and unknown hosts. This distinction is an implementation design, not an observed www response; live www verification remains P0.

