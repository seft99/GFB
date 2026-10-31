# Migration risk register

| Priority | Dependency / risk | Evidence | Owner / required check | Exit criterion |
| --- | --- | --- | --- | --- |
| P0 | Actual www host may retain `noindex` or serve wrong deployment | `proxy.ts:10-28` is host/environment dependent; preview result is not production proof | Hosting owner | `www` returns 200, correct canonical/hreflang, no X-Robots noindex |
| P0 | Search Console baseline unavailable | No authorised integration/export | SEO owner | Exports for Performance, Page Indexing, Sitemaps, CWV and Links retained before DNS change |
| P0 | DNS/TLS normalization unknown | Not configured in repository | DNS/hosting owner | HTTP→HTTPS and apex→www each have one canonical hop |
| P1 | Review URLs lack current business confirmation | `/additives`, `/ingredients-and-materials` × EN/ES marked `review` | GFB commercial owner | Retain, redirect, or noindex decision documented with source evidence |
| P1 | Verification continuity | Legacy verification values documented in launch runbook | SEO owner | Google/Bing/Yandex ownership verified on new host before launch |
| P1 | Preview indexing exposure | Vercel aliases depend on proxy header execution | Hosting owner | Preview/alias response has `X-Robots-Tag: noindex, follow` |
| P2 | Flat/nested technical duplicates | Manifest preserves legacy URLs | SEO owner | Search Console/backlink evidence determines whether any consolidation is worthwhile |
| P1 | Product schema descriptions exceed visible support | 7 confirmed failures: 3 nested aluminium cans and 4 IQF routes | Content/SEO owner | Align visible facts or metadata/schema description with approved evidence; hardened verifier passes |
| P2 | Redesigned content parity is unverified at block level | 32 explicit `contentBlocksUnavailable` skips | Content/SEO owner | Add scoped source-to-redesign topic contracts or accept/document the limitation |
| P3 | Field CWV unknown | No CrUX/RUM access | Analytics owner | Post-launch CWV baseline and alerting configured |
| P1 | Audit exporter could misclassify source vs target routes | Reconciled 2026-10-30; redirects/broken links now use source URL | SEO owner | Use corrected `route-inventory.csv` and manifest as the authoritative route contract |

## Launch and rollback controls

Do not alter DNS until the seven remote-preview verifier failures are resolved and the P0 checks above have named owners. On broad 404s, wrong canonical/language, 5xx, or production noindex, restore the prior DNS/hosting target first; preserve the failed release for diagnosis and re-run the manifest crawl after rollback.
