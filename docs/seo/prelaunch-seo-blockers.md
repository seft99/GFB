# Pre-launch SEO blockers

Evidence timestamp: `2026-10-31T00:46:23.031Z`; executed origin: `https://gfb-solutions.vercel.app`.

## Discrepancy matrix

| Priority | Finding | Confirmed state | Remediation and validation criterion |
| --- | --- | --- | --- |
| P0 | Official production host not exercised | Preview correctly returns `X-Robots-Tag: noindex, follow`; this does not prove intended `www` indexability | After authorized cutover, run the verifier against `https://www.gfb-solutions.com`; require no production `noindex`, zero route/canonical/hreflang/sitemap failures |
| P0 | Search Console baseline unavailable | No indexing, traffic, ranking, selected-canonical or backlink evidence is available | Export the authorized pre-cutover baseline before making ranking or consolidation decisions |
| P1 | Seven Product schema descriptions are not sufficiently represented by visible content | 7 failed structured-data assertions: 3 nested aluminium cans and 4 IQF routes | Business/content owner must either substantiate and expose the descriptors visibly or approve a metadata/schema description aligned to existing visible facts; rerun until all 7 pass |
| P1 | Four review records require commercial approval | `/additives` and `/ingredients-and-materials` in EN/ES remain `review` | Confirm commercial scope and withheld manufacturing claims before production indexing |
| P1 | Legacy robots/hreflang evidence absent | Legacy crawl schema did not capture these fields; exporter now marks them unavailable | Recrawl legacy responses with these fields before claiming legacy parity, or document source unavailability explicitly |
| P2 | 32 redesigned routes lack a block-level Product Information contract | `contentBlocksUnavailable`: 32 explicit skips | Add a scoped legacy-to-redesign topic contract if exact content parity is a launch requirement |
| P2 | Three historical URLs remain true 404 chains | Preserved documented behavior; no canonical or sitemap membership | Keep 404 unless business/backlink evidence supports a redirect destination |

## Verifier result

- HTTP requests: 771 total — 631 page requests, 2 crawler-user-agent requests and 138 image requests.
- Assertions: 15,121 executed — 15,114 passed, 7 failed — plus 744 skipped checks.
- Skips: 712 explicit decorative `alt=""` contracts and 32 redesigned routes without a block-level content contract.
- Route coverage: all 289 manifest entries; 280 retained/review, 6 redirects and 3 historical 404s.
- Supporting coverage: 3,207 content blocks; 744 metadata-contract assertions; 4,118 structured-data assertions; 948 image-alt assertions; 568 internal links; 138 image responses; 280 orphan checks; 292 sitemap URLs.

The verifier exits non-zero because the seven schema/visible-content inconsistencies are confirmed. Coconut EN/ES passes block-scoped semantic validation and has no stale `missing source format sentence` error.

## Launch readiness

**Not ready.** Production-host/Search Console evidence is still unavailable, and seven structured-data description inconsistencies remain unresolved. No DNS, route, canonical, redirect, content or deployment change was made by this audit.
