# Technical catalogue QA & content integrity — 2026-10-28

Scope: `/fruits-concentrates`, `/frozen-fruits`, and their 93 linked product, overview and
technical pages (59 concentrate + 34 frozen), in English and Spanish.
Source: the public GFB site (https://www.gfb-solutions.com), crawled on 2026-10-28
(`docs/migration-data/legacy-crawl.json`, spot-checked live for Merlot, RED-800, IQF lime
slice and `/iqf-lemon`).

Per-page audit (identity, original/new route, classification, content coverage, restored
links, withheld blocks, corrections, review notes): `docs/migration-data/catalogue-audit.csv`,
regenerated with `node scripts/catalogue-audit.ts`.

## Confirmed defects and corrections

| #   | Defect                                                                                                                                                                                                                 | Cause                                                                                                                           | Correction                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Merlot, RGJC R-600, Malbec, RED-800, Cabernet Sauvignon, RED-1000 and Tintorera R-4000 showed an empty "… Product Overview" heading.                                                                                   | The health-claim filter read "healthy, hand-selected grapes" (sound raw material) as a health claim and withheld the paragraph. | Raw-material wording is ignored by the filter (`src/migration/content.ts`, `SOUND_FRUIT`); the published overview text is restored verbatim. The real health claims are still withheld.                                                                 |
| 2   | `/red-grape-concentrate` and `/fruit-concentrates`: introductory paragraph withheld for the same reason.                                                                                                               | Same as 1.                                                                                                                      | Restored.                                                                                                                                                                                                                                               |
| 3   | IQF hubs (`/iqf-lemon`, `/iqf-orange`, `/iqf-lime`, `/iqf-grapefruit`) rendered each product name as an empty H2; the original links to cuts, slices, sticks, zest and peel were lost.                                 | Wix product cards carry a heading and a link, but no body text.                                                                 | Headings whose page the original hub really linked (verified against its outbound links and H1) become compact link rows: 9 / 10 / 6 / 4 references. The "More in this family" list no longer repeats them.                                             |
| 4   | `/red-grape-concentrate`: variety summaries without a link to the variety page, plus an empty "Red Grape Juice Concentrate" heading.                                                                                   | Same as 3.                                                                                                                      | Each variety section links its page ("View product page"); the empty heading is removed.                                                                                                                                                                |
| 5   | IQF grapefruit pages: lone "Frozen Fruits" heading with no content.                                                                                                                                                    | Product-type label repeated by Wix.                                                                                             | Used as the eyebrow; no empty heading.                                                                                                                                                                                                                  |
| 6   | `/tropical/coconut`: "Available formats" eaten as eyebrow and five "Not apply" rows as empty headings.                                                                                                                 | The format-pairs parser only knew pages starting with "Concentrate".                                                            | Published formats shown ("Diced, coconut cream and coconut water."); "Not apply" rows are skipped like on other concentrates.                                                                                                                           |
| 7   | Copy-paste errors: IQF lime pages calling the product lemon (slice "cut from the lemon fruit … yellow skin", lemon wedges / sticks / peel, ingredient "IQF Lemon 1/8 Cut"); lemon 1/4 cut "the grapefruit is rotated". | Inherited copy.                                                                                                                 | 11 exact-text corrections in `src/migration/corrections.ts`, applied in both languages; the build fails if a source text changes. No technical value, size or specification is changed.                                                                 |
| 8   | Frozen library counted every page as a product ("11 products").                                                                                                                                                        | Overview pages counted as products.                                                                                             | Frozen groups show references and pages ("9 references · 11 pages"); overview pages are labelled "Overview page" / "Página general". Reference counts match the lists on the official hubs: lemon 9, orange 10, lime 6, grapefruit 4. All 34 URLs kept. |
| 9   | Reload after a search "in all families" narrowed the results to one family.                                                                                                                                            | The URL kept `family` while searching all families.                                                                             | All-family searches write only `q`; the scope survives a reload.                                                                                                                                                                                        |

Meta descriptions of the 7 red grape variety pages and `/red-grape-concentrate` (EN) now use the
restored overview sentence instead of the Brix sentence; titles, H1s, canonicals and URLs are
unchanged. Empty-heading cleanup and restored links apply to the concentrate and frozen-fruit
pages only; other catalogue pages are unchanged.

## Verified, no change needed

- Technical sheets: exactly 7 (`/merlot`, `/malbec`, `/red-800`, `/cabernet-sauvignon`,
  `/red-1000`, `/rgjc-red-600`, `/tintorera-red-4000`), classified from their Analysis /
  Microbiology tables; tables and units match the source pages. 9 red grape references / 16
  pages preserved. Frozen fruits have no technical sheets; none were created.
- No "PDF" or "download" wording for HTML specification pages.
- `/fruits-concentrates` and `/fruits-concentrates?family=citrus` return identical server HTML
  (same library, 111 resource links) and identical hydrated state on fresh production loads; no
  hydration or console errors. A different rendering seen in production comes from an external
  cache (the HTML is served with `s-maxage=31536000`, so a CDN or crawler cache can keep the
  plain URL from an earlier deployment while `?family=` is a new cache key), not from the app.
- URL state: family/type deep links, reload, Back/Forward, invalid values fallback, hash
  anchors (`#families`, `#scope`), EN/ES switching; 206 internal links of both libraries and the
  restored hubs answer 200; CLS 0 on both category pages, Merlot and `/iqf-lemon`; axe 0
  violations; no horizontal overflow at 1280–1920, 768 and 390.

## Needs confirmation from GFB

1. `/red-grape-concentrate` summary vs variety pages: RGJC R-600 shows 800-900 nm / < 100 NTU /
   SO2 < 50 (its sheet and overview: 500-600 / < 50 NTU / SO2 < 10 — the summary repeats RED-800);
   Cabernet Sauvignon SO2 < 5 (sheet and overview: < 10). Kept as published.
2. IQF lime 1/8 cut ingredient (corrected to lime) and "can be stored in the fridge for several
   days" on a frozen product.
3. `/frozen-lemon` lists "IQF Lemon Slice 6/9 mm" and "IQF Lemon 13x13 Sticks"; the lemon product
   pages give no sizes. The original page has no product links, so none were added.
4. Lime sticks "absorb odors in the house" (non-food use) and the coconut heading "natural source
   of fiber" (nutrition claim).
5. Published names "one eights cut" (eighths) are kept as product names and URLs.
6. Five concentrate pages (white guava, blueberry, pumpkin, spinach, ginger) are thin once the
   benefit/health copy is withheld; new descriptive copy needs GFB input.
7. Spanish pages of the IQF and red grape products are largely English on the source (marked
   `lang="en"`); the Spanish H1 of `/red-grape-concentrate` ("jugo de uva roja") differs from the
   library name ("zumo de uva tinta").
8. Usage rights of the IQF thumbnails (official site images).

## Limitations

- Switching language resets the selected family: the switcher is part of the protected global
  navigation, which was not changed.
- The same empty-heading and missing-link pattern exists on some packaging pages
  (e.g. `/aluminium-cans`, `/crown-corks`, labels); out of scope, not changed.
