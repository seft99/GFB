# Scope layout audit

## Coverage

The shared Scope section was audited for all 14 category routes in both locales (28
routes total):

| English                                           | Spanish                                            |
| ------------------------------------------------- | -------------------------------------------------- |
| `/en/packaging-solutions/cans`                    | `/es/soluciones-de-embalaje/latas`                 |
| `/en/packaging-solutions/bottles`                 | `/es/soluciones-de-embalaje/botellas`              |
| `/en/packaging-solutions/closures`                | `/es/soluciones-de-embalaje/cierres`               |
| `/en/packaging-solutions/labels`                  | `/es/soluciones-de-embalaje/etiquetas`             |
| `/en/raw-materials/fruit-concentrates`            | `/es/materias-primas/concentrados-de-frutas`       |
| `/en/raw-materials/plant-based-concentrates`      | `/es/materias-primas/concentrados-vegetales`       |
| `/en/raw-materials/iqf-frozen-fruits`             | `/es/materias-primas/citricos-congelados-iqf`      |
| `/en/flavours-aromas/sweet-applications`          | `/es/sabores-y-aromas/aplicaciones-dulces`         |
| `/en/flavours-aromas/beverage-applications`       | `/es/sabores-y-aromas/aplicaciones-para-bebidas`   |
| `/en/flavours-aromas/savoury-applications`        | `/es/sabores-y-aromas/aplicaciones-saladas`        |
| `/en/industrial-consulting/food-sector`           | `/es/consultoria-industrial/sector-alimentario`    |
| `/en/industrial-consulting/industrial-sector`     | `/es/consultoria-industrial/sector-industrial`     |
| `/en/industrial-consulting/environmental-sector`  | `/es/consultoria-industrial/sector-medioambiental` |
| `/en/industrial-consulting/pharmaceutical-sector` | `/es/consultoria-industrial/sector-farmaceutico`   |

## Root causes

- The shared desktop grid was driven by the number of groups instead of each
  group’s intrinsic readable width.
- One-group layouts used an arbitrary split, while every three-item group was
  forcibly distributed across three narrow columns.
- Feature and group dividers introduced unequal edge padding and caused visual
  imbalance as localized strings changed length.
- List icons were not explicitly aligned to the first text line.

## Refactor

- The category page no longer sends presentation counts into the shared Scope
  markup.
- Features and supplementary groups now use intrinsic, wrapping CSS Grid tracks
  with minimum readable measures.
- A one-group layout has a content-driven readable maximum measure.
- Supplementary lists remain vertical, so long or localized content keeps a
  stable reading order.
- List items align their icons to the first text line. The dark palette,
  typography, copy, responsive structure and related navigation remain intact.

## Visual and geometry validation

The Playwright audit script captured the Scope element and geometry for all
routes/locales:

- Desktop baseline: 140 screenshots at 1280, 1366, 1440, 1600 and 1920 px.
- Desktop refactor: 140 screenshots at the same widths; 0 horizontal
  overflows.
- Responsive refactor: 56 screenshots at 390 and 768 px; 0 horizontal
  overflows.

Evidence is stored under
`docs/scope-layout-evidence/{before,after,responsive}/`. The accompanying
`geometry.json` files record section bounds, group/list bounds and icon
offsets.

## Project validation

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed.

## Unresolved issues

None observed in the audited shared Scope layouts. No route-specific CSS was
introduced.
