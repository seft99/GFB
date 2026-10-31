# Legacy SEO parity and content-delta audit

Evidence timestamp: `2026-10-31T00:46:23.031Z`. Legacy evidence comes from the official crawl in `docs/migration-data/legacy-crawl.json` (observed 2026-10-29). Candidate evidence comes from server-returned HTML at `https://gfb-solutions.vercel.app`. No Search Console, ranking or traffic claim is made.

## Coverage and method

- Manifest contract: 289 entries — 280 retained/review routes, 6 permanent redirects and 3 historical 404s.
- Source-derived Product Information coverage: 248 localized routes, 3,207 published blocks, 3,207 semantic matches and 0 missing blocks.
- The verifier now enumerates every published paragraph, list member and technical-table cell. It searches only the Product Information section and accepts structured equivalents such as reordered dimension/value pairs and list members rendered as chips. It no longer samples the first six facts or accepts unrelated page-wide text.
- 32 redesigned landing/category records do not have a Product Information render contract in `legacy-content.json`. Their content-parity assertion is explicitly skipped as `contentBlocksUnavailable`; metadata, canonical, hreflang, status, sitemap and schema checks still run. These are the EN/ES variants of `/`, `/about-us`, `/packaging-solutions`, `/cans`, `/bottles`, `/closures`, `/labels`, `/raw-materials`, `/fruits-concentrates`, `/plant-based-concentrate`, `/frozen-fruits`, `/flavours-and-aromas`, `/savoury`, `/sweets`, `/beverages` and `/consulting-solutions`.

## Coconut reconciliation

| Route | Legacy concept | Candidate evidence | Result |
| --- | --- | --- | --- |
| `/tropical/coconut` | Diced; coconut cream; coconut water | Initial HTML contains one screen-reader summary (`Diced, coconut cream, coconut water`) and three visual chips | Semantic PASS; no missing sentence finding |
| `/tropical/coconut?lang=es` | En dados; crema de coco; agua de coco | Equivalent Spanish screen-reader summary and three visual chips | Semantic PASS; no missing sentence finding |

The hidden summary is justified by accessibility: the visual chip list is marked `aria-hidden="true"`, so the visually-hidden text is its single accessible representation. Removing it would remove the formats from the accessibility tree. It is not additional SEO-only copy and was retained unchanged.

## Withheld source material

`withheldForReview` and `untranslatedBlocks` are independent metrics. The current manifest contains 507 withheld blocks on 130 localized rows and **0 untranslated blocks on 0 rows**; the older figure of 494 untranslated blocks is stale.

| Source classification | Blocks | Localized URLs | Audit disposition |
| --- | ---: | ---: | --- |
| `health-claim` | 312 | 118 | Unsupported health/nutrition/sustainability assertions; do not restore without evidence and legal/business approval |
| `benefits-section` | 172 | 86 | Benefits sections withheld as unsupported claim clusters; do not restore automatically |
| `manufacturing-claim` | 7 | 6 | Requires business validation of GFB's actual manufacturing role/capability |
| `not-available` | 12 | 12 | “Not apply” placeholders; redundant, not valuable content loss |
| `duplicate-section` | 2 | 2 | Redundant source material |
| `empty-heading` | 2 | 2 | Formatting-only source artifacts |

Every omitted block, its text and its reason are retained in `src/migration/legacy-content.json`; route-level counts/reasons are exported to `legacy-parity.csv`, while raw block objects are in `verification-results.json`. No potentially valuable factual product block was confirmed missing from the 248 Product Information render contracts. No withheld claim was restored.

## Metadata parity

The CSV records raw legacy and candidate values, then normalized comparisons. Among the 280 retained/review responses:

| Field | Equal | Normalized-equal | Changed |
| --- | ---: | ---: | ---: |
| Title | 0 | 2 | 278 |
| Description | 2 | 7 | 271 |
| H1 | 35 | 93 | 152 |
| Canonical | 280 | 0 | 0 |

The high title/description delta is expected evidence of the approved metadata rewrite: legacy descriptions frequently contain UUIDs or thin text, and candidate titles add family/brand context. It is not silently treated as parity. Separately, all 744 available candidate-to-manifest title/description/H1 contract assertions passed; title comparison ignores only the layout-added `| GFB Solutions` suffix.

The legacy crawl did not capture robots or hreflang tags. Those legacy cells are exported as unavailable and comparisons as `not-captured-in-legacy-crawl`, rather than being filled with manifest assumptions. Candidate robots, `X-Robots-Tag`, hreflang and sitemap membership are actual response values.

## Image alternatives and structured data

- Image alternative checks are independent from the 138 image HTTP checks. Across server HTML, 948 executed alt assertions passed: no missing attributes, generic/filename alternatives or conflicting duplicated non-empty alternatives were found. A further 712 explicit `alt=""` instances were classified separately as decorative and skipped from descriptive-alt assertions; they were not confused with missing attributes.
- Schema inventory: 230 Product, 278 BreadcrumbList, 18 CollectionPage, 2 Organization and 2 WebSite nodes. Parsing, required properties, breadcrumb sequence/visible names, Product name/H1, Product URL/canonical and Product description/meta/visible-context consistency produced 4,118 assertions.
- Seven Product description consistency defects remain. The affected pages are the three nested aluminium can pages (`std`, `sleek`, `slim`) and four IQF pages (lemon peel shells; orange slices; orange half-slices; orange peel shells). Their schema/meta descriptions contain claims or descriptors not represented by sufficient visible page content. They were not rewritten because doing so would change the approved metadata contract without business/content approval.

## Evidence limitations

- The 32 redesigned landing/category routes have no block-level Product Information contract; this is an explicit skip, not a pass.
- Legacy robots/hreflang were not captured in the source crawl.
- Preview `noindex` is verified; production-host indexability is an intended contract until the actual `www` origin is tested after authorized cutover.
- Seven schema/visible-description assertions fail and are migration risks, not reporting omissions.
