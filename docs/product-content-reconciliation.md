# Product content reconciliation (internal review report)

Not published. Record of how the content of every product-detail page (124 pages × EN/ES)
relates to its counterpart on https://www.gfb-solutions.com/ and `?lang=es`, and of the questions
that need a business answer. Per-field records:
`docs/migration-data/product-content-reconciliation.json` (source URL → field → status, and
whether the field is still on the live page). Regenerate with
`node scripts/reconcile-product-content.ts` (add `--offline` to skip the live fetch).

## Method

- Source: the crawl of the official site (`docs/migration-data/legacy-crawl.json`), re-checked
  against the live pages on 2026-10-28 (247 of 248 pages answered; the other one timed out and keeps
  the crawl as reference).
- Each published line of a page is classified: **retained** (shown, units normalised),
  **translated** (the official ES page shows English format names; the ES page shows them in
  Spanish), **corrected** (an entry of `src/migration/corrections.ts`), **withheld** (claim policy
  or an empty layout heading, recorded in the page's `excluded` list), **not-available** ("Not
  apply" formats, as the format tables already did) or **missing**.

## Result (248 pages)

| Status        | Fields |
| ------------- | -----: |
| retained      |   2943 |
| translated    |    227 |
| corrected     |     74 |
| withheld      |    732 |
| not-available |    496 |
| **missing**   |  **0** |

No product reference, technical value, link or localized destination was dropped. Formats,
codes, ranges, limits, units and measurement conditions are kept; units are only normalised in
presentation (330 ml, 66 mm, 20 °C, °Brix, SO₂), never in codes, H1s or metadata.

## Corrections applied (source-supported)

- **Grape specification sheets** (Merlot, Malbec, Cabernet Sauvignon, RED-800, RED-1000, RGJC
  R-600, Tintorera R-4000; EN and ES): "Viscous red liquid without additives" + "Flavourings or
  colourings of any kind" was one negative statement split by the layout; now "Viscous red
  liquid" + "No additives, flavourings or colourings of any kind" (the red grape overview
  publishes the full sentence).
- **"Valencia Orange" attribution** (another company's copy) removed from Tamarind, Mango, Peach,
  Pomegranate, Melon and Coconut. The supported concentrate/purée formats stay.
- **Orange**: consumer energy/well-being copy replaced by the uses it states ("can be mixed with
  water for drinks, blended into smoothies or used as an ingredient in culinary preparations");
  promotional heading replaced by "Applications"/"Aplicaciones".
- **Pepper**: stray backtick; **Ginger**: truncated sentence removed.
- **Claim policy (fruit, vegetable and plant concentrates)**: nutrition, health, disease,
  composition and energy statements describe the fresh fruit, not a substantiated property of
  the concentrate, and are withheld (as other health claims already were). The usage sentences
  ("can be consumed in juices, concentrates or purées") stay. The oat and almond "Benefits" text
  published inside the formats table is withheld; their meta descriptions no longer list it.

## Open items (business confirmation needed)

| Page                                                                 | Item                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tamarind                                                             | The official page says "Not apply" for organic formats but its text mentions organic tamarind (sentence removed with the Valencia Orange attribution). Is organic tamarind offered?        |
| Mango, Peach, Pomegranate, Melon                                     | Varieties were stated by another company's copy (totapuri, alphonso…; freestone, clingstone…; mollar, wonderful; cantaloupe, honeydew). Are they GFB's varieties?                          |
| Coconut                                                              | "Diced, coconut cream and coconut water" availability came with the Valencia Orange sentence; the formats line is kept as published. Confirm.                                              |
| Orange                                                               | "Spanish oranges" origin claim removed with the promotional copy. Confirm origin if it should be stated.                                                                                   |
| Fruit/vegetable concentrates                                         | Nutrition/health statements withheld; reinstate only with product-specific evidence.                                                                                                       |
| Standard can end (Korinthos), `/aluminum-can-end-52mm-202-std-sot`   | Both measurements are labelled "Curl External Diameter" (59.44 mm and 57.66 mm). Kept as published; the ISE page labels its pair outside/inside. Which label is right?                     |
| Standard can end, `/aluminium-can-ends/52mm-(202)-dia-aluminium-end` | Its overview text introduces the ISE (Botcherby) end. Which values apply?                                                                                                                  |
| Sleek can, `/sleek-can-d57mm`                                        | Fill volumes list 270 ml; the height table says "122 mm for 269 ml".                                                                                                                       |
| IQF orange half slices                                               | Described with lemon wording ("bright yellow skin").                                                                                                                                       |
| Soft drinks, Water                                                   | Opening text about filtered water and chemical contamination (copied between pages).                                                                                                       |
| 26 mm ring crown cap, grape sheets (ES)                              | 7 fields not found on the live page at the time of the check (tin coating "5,6g/m2/5,6g/m2"; ES "Concentrado de Jugo de Uva Roja"): possible change of the official page or of its markup. |

## Assets

No new photographs in this pass. Missing product imagery remains as reported in
`docs/asset-provenance.md` (white grapefruit, IQF peel squares, block zest, orange and lime zest,
RipCaps and ring crown caps, shrink sleeve and wet-glue labels): those heroes use the deliberate
image-free layout. Technical specification pages use the compact technical-document hero.
