# Architecture

## Rendering

- Next.js 16 App Router, React 19, strict TypeScript.
- Every content route is statically generated with `generateStaticParams`. Only the contact page renders per request (it reads inquiry context from the query string).
- Server Components by default. Client components: `HeaderNavigation` (active state, mega menus, mobile menu), `LanguageSwitcher`, `ContactForm` and the localized 404 picker. Each receives only the strings it needs as props; dictionaries never ship whole to the browser.

## Internationalization

| Concern           | Where                                   | Notes                                                                                  |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| Locales           | `src/i18n/config.ts`                    | `en` (default) and `es`.                                                               |
| UI and page copy  | `src/i18n/dictionaries/{en,es}.ts`      | `es` is typed against `en`; a missing or extra key fails `typecheck`.                  |
| Catalog copy      | `src/content/catalog.ts`                | `LocalizedText` per field, including **localized slugs**. Stable `id`s never change.   |
| URLs              | `src/i18n/routes.ts` (`paths.*`)        | The only place URLs are built. Never hand-write `/${locale}/...` in components.        |
| Locale detection  | `proxy.ts` + `src/i18n/negotiate.ts`    | Cookie (last locale visited), then `Accept-Language`, then `en`.                       |
| Static page slugs | `staticPages` in `routes.ts`            | `/es/sobre-gfb` rewrites to the `about` folder; `/es/about` 308-redirects to the slug. |
| Legacy Wix URLs   | `src/i18n/legacy-redirects.ts`          | Wired into `next.config.ts` `redirects()`; `?lang=es` resolves to Spanish pages.       |
| SEO               | `src/lib/metadata.ts`, `app/sitemap.ts` | Canonical, hreflang (`x-default` → `en`) and sitemap alternates use localized paths.   |

`<html lang>` is set by `app/[locale]/layout.tsx`. `app/layout.tsx` is a deliberate pass-through: when the dynamic `[locale]` layout is itself the root layout, `notFound()` from a page renders a blank document in production builds. With a static root above it, `app/[locale]/not-found.tsx` renders the localized 404 inside the site chrome. `app/not-found.tsx` covers URLs outside any locale.

## Recipes

- **Add or change copy:** edit both dictionaries. Unit tests check that keys, non-empty values and `{placeholders}` match.
- **Add a category:** append it to the division in `catalog.ts` with `id`, `slug` (both locales), copy and an image in `public/images`. Routes, sitemap, navigation, the language switcher and tests pick it up automatically.
- **Add a static page:** create `app/[locale]/<name>/page.tsx`, add `<name>` to `staticPages` with its Spanish slug, and use `paths.page(locale, "<name>")` for links.
- **Link to the contact form with context:** `paths.contact(locale, { interest: division.id, category })`.

## Components

- `components/ui`: `ButtonLink`, `TextLink`, `Eyebrow`, `SectionHeading`, `Icon`, `JsonLd`.
- `components/layout`: `SiteHeader`, `HeaderNavigation`, `LanguageSwitcher`, `SiteFooter`, `Breadcrumbs` (also emits `BreadcrumbList` JSON-LD).
- `components/sections`: `CtaBand` (`feature` and `compact`), 404 views.
- `components/cards`: `DivisionCard`, `CategoryCard`.

## Contact flow

`ContactForm` (client) → shared validation in `src/features/contact/schema.ts` → `submitInquiry` Server Action (`actions.ts`) → rate limiter → re-validation → `deliverInquiry` (`delivery.ts`). Validation returns error **codes**; the form maps them to localized messages. Values are echoed back so nothing is lost on errors or without JavaScript.

## Security headers

Defined in `next.config.ts`: CSP (no `unsafe-eval` in production, `object-src 'none'`, `form-action 'self'`), HSTS (production), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `COOP` and `Permissions-Policy`. Inline scripts still require `'unsafe-inline'` because pages are static; nonce-based CSP would force dynamic rendering of every page.

## Design language (unchanged in phase 1; to be revisited in phase 2)

- Midnight navy `#020216`, brand blue `#1457D9` / `#246EE9`, lime accent `#96D814` / `#B9EE43`, neutral `#F3F4F7`, ink `#11152A`.
- Motion is limited to navigation, links and image scale; `prefers-reduced-motion` removes transitions.
- Colour pairs are checked by the axe suite (WCAG 2.2 AA) on desktop and mobile.

## Desktop scale and container

- Tokens in `globals.css` `:root`: `--type-h1`, `--type-h2`, `--type-h2-feature` (the signature headlines and closing CTAs), `--type-h3`, `--type-lead`, `--type-eyebrow` / `--tracking-eyebrow`, `--space-section` / `--space-section-compact`, and `--container-desktop` (the header and footer width), used by every redesigned Home and About section from 1100 px. The concentrate feature is the one deliberate full-bleed exception.
- Decoration keeps the connection motif in selected places (hero arcs, connection diagram, globe, CTA curve and the Home footer on Home; orbit, map and CTA curve on About), without looping glows.

## Header and footer

- Logo: `public/brand/gfb-logo.png`, the official 782 × 324 PNG from the GFB website (the old 187 × 77 `gfb-logo.avif` remains only as the favicon). It keeps its original proportions; no SVG source was available.
- Primary CTA label everywhere: `common.inquire` ("Discuss your project"). The raw materials area is named "Raw materials" in the navigation (`shortTitle`), cards and footer.
- Footer (`components/layout/site-footer.tsx`, `app/styles/footer.css`): identity (logo and a one-line descriptor), company links, the four solution areas, contact details and legal links, with no second contact invitation. Home has a desktop variant (see below).

## Homepage hero

- Component: `components/home/home-hero.tsx`; styles: `app/styles/home-hero.css`; header styles: `app/styles/header.css`.
- Background: `public/images/home/hero-background.webp` (approved photo, 1584 × 993, unmodified). The approved design reference lives in `docs/design/references/` and is never rendered.
- The photo sits in a "stage" with its exact aspect ratio, filling the hero height and anchored right. Callouts (the four solution areas, each linking to its page) are placed by their circle centre as a percentage of the photo and sized in stage container units, so they stay on the printed arcs at every size.
- The lower strip carries trust information (experience, personalized service, international supply), distinct from the callouts. From 1100 px the lime accent continues the headline instead of starting its own line.
- Layouts: desktop ≥ 1280 px (composition), 900–1279 px (two columns, no callouts), ≤ 899 px (copy, then a crop of the product group); callouts are hidden ≤ 640 px.

## Homepage "The value of connection"

- Component: `components/home/home-connection.tsx`; styles: `app/styles/home-connection.css`; copy: `home.connection`. It explains how the four areas relate to a requirement; the cards below are the portfolio navigation.
- The network is an aspect-locked box (840 × 590) shared by the SVG `viewBox` and the percentage-positioned cards, so paths, nodes, hub and cards scale together. Card photos are listed in `disciplines` (packaging uses `packaging/can-detail.webp`, consulting `consulting/production-line.webp`); the hub uses the official logo PNG.
- Desktop refinements (≥ 1100 px, end of the stylesheet): shared content width, H2 below the hero H1, indicators that wrap so a long value never reaches the drawing, cards that enter by position only (fading them with the scroll left the diagram looking empty) and no looping node glow.

## Homepage "Four solution areas"

- Components: `components/home/home-divisions.tsx`, `components/cards/division-editorial-card.tsx` and the client `components/home/pointer-parallax-list.tsx`; styles: `app/styles/home-divisions.css`.
- Desktop (≥ 1100 px) shows the editorial bento grid (12 columns, 7/5 then 5/7). Below 1100 px the previous stacked `DivisionCard` list is rendered unchanged until the mobile redesign; only one variant is displayed, so the hidden one's lazy images are never requested.
- Card titles come from the catalog; descriptions from `home.solutions.cards`. Card photos differ from the division heroes where needed (`tiles` in the component): `packaging/can-detail.webp` (official GFB website, brand-free can detail) and `consulting/production-line.webp` (Wikimedia Commons, "Francis Ford Coppola Winery bottling plant, near Geyserville, 2011" by DimiTalen, CC0). Neither is presented as a GFB facility.
- The whole card is the link; numbering and the arrow are decorative children. Reduced motion removes every transform.

## Homepage concentrate feature

- Component: `components/home/home-showcase.tsx`; desktop styles: `app/styles/home-showcase.css` (≥ 1100 px). The markup keeps the previous `showcase-*` classes for tablet and mobile.
- Desktop: full-bleed grid with the photo at 53.5 % from the viewport edge; the headline is one sentence balanced over two lines; one CTA to the fruit concentrate category.

## Homepage "Start with your application"

- Components: `components/home/home-process.tsx` and the client `components/home/reveal-list.tsx`; desktop styles: `app/styles/home-process.css` (≥ 1100 px). Four informational items (product, application, requirements, options) with icon nodes and connectors: guidance for preparing a conversation, not a form or a company methodology.
- The heading and lead stay in the left 44 %, clear of the honey photograph (`public/images/home/process-honey.webp`, decorative).
- Entrance: `RevealList` marks a block that starts below the fold as `data-reveal="pending"`, then `"in"` as soon as its top is 10 % inside the viewport, so scrolling never passes a blank area; content is visible without JavaScript and under reduced motion.

## Homepage "International presence"

- Components: `components/home/home-world.tsx` (with `RevealList as="div"`); desktop styles: `app/styles/home-world.css` (≥ 1100 px). Below 1100 px the original copy and elliptical location map are kept.
- Globe: `public/images/home/globe-dots.svg` is generated by `npm run generate:globe` (`scripts/generate-globe.ts`) from the coastline polygons in `scripts/land.ts` on a regular lat/lon grid. `src/lib/globe.ts` holds the orthographic view shared by the generator and the markers.
- Murcia and Dubai are city coordinates; Türkiye is a country-level marker at the country's geographic centre. Labels: Spain · Murcia, Türkiye · Presence, Dubai · Presence. One indicator: 3 locations.
- Motion: globe fade/scale, staggered markers and drawn arcs once on reveal; hovering a place lights its arc. No looping animation; all motion is off under reduced motion.

## Homepage closing CTA

- Component: `components/home/home-cta.tsx`; desktop styles: `app/styles/home-cta.css` (≥ 1100 px). It keeps the shared `cta-section` / `cta-panel` markup, so tablet and mobile match `CtaBand`. The supporting line is desktop-only.
- Photo: `public/images/home/cta-droplet.webp` (approved asset), decorative and anchored right; the lime curve and node are an SVG above it.

## Site footer (Home variant)

- On the Home page from 1100 px (`body:has(.home-hero)` in `app/styles/footer.css`), the identity column shows a positioning headline (`footer.homeTitleLines`, `footer.homeTagline`) instead of the descriptor, and the brand decoration returns in the page margins from 1500 px. About and every other page keep the plain footer.

## About GFB hero

- Markup: `app/[locale]/about/page.tsx`; desktop styles: `app/styles/about-hero.css` (≥ 1100 px, imported by the About page only). Below 1100 px the dark hero from `globals.css` is unchanged; the photo, trust row and orbit are desktop-only.
- Photo: `public/images/about/grapes-still-life.webp` (official GFB website, 6048 × 4032 source, 2400 px WebP): a broader product image than the earlier packaging close-up.
- Entrance on load is transform-only (no opacity), so it never delays the first paint; off under reduced motion.

## About GFB · How GFB works

- Markup: `app/[locale]/about/page.tsx` (`story-section`); desktop styles: `app/styles/about-story.css` (≥ 1100 px). Below 1100 px the light layout from `globals.css` is unchanged; the "Personalized service" label (plain text, not a button) is desktop-only.
- Photo: `public/images/about/collaboration.webp` (official GFB website, 7500 × 4219 source): a team meeting, illustrating the working relationship rather than a product.
- The headline size follows its column (`cqi`), so each line fits on one row from 1280 px. The scroll-driven entrance is transform-only.

## About GFB · Mission & Vision

- Markup: `app/[locale]/about/page.tsx` (`mission-section`); desktop styles: `app/styles/about-mission.css`. Card headings are H3 under the section H2 (sized as before below 1100 px). Desktop: intro aligned with the card copy, two equal cards with outlined icons (`target`, `growth`); the cards enter once via `RevealList`.

## About GFB · International presence

- Component: `components/about/about-presence.tsx`; desktop styles: `app/styles/about-presence.css` (≥ 1100 px, imported by the About page only). Below 1100 px the heading and location list from `globals.css` are unchanged; the map, pin icons and the "Presence" labels for Türkiye and Dubai are desktop-only.
- Map: `public/images/about/world-dots.svg`, generated by `npm run generate:world-map` (`scripts/generate-world-map.ts`) on an even grid in a Miller projection (`src/lib/world-map.ts`), which the markers and route arcs share. Coastlines come from `scripts/land.ts` plus a few regions defined in the generator.
- Murcia and Dubai are city coordinates; Türkiye is the country's centre, not an office. Murcia is the headquarters; Türkiye and Dubai are labelled only "Presence".
- The map is `aria-hidden`; the location list carries the information. Hovering a location highlights its marker and route (and the reverse) with `:has()`, no client JavaScript; routes draw and markers appear once via `RevealList`, never under reduced motion.

## About GFB · Closing CTA

- Component: `components/sections/closing-cta.tsx`; desktop styles: `app/styles/closing-cta.css` (≥ 1100 px, imported by the About page). It keeps the shared `cta-section` / `cta-panel` markup, so below 1100 px it matches `CtaBand`; the supporting copy is desktop-only. One lime curve, scaled by the section height and set in from the right edge, keeps its node clear of the button.

## Service page hero (packaging, raw materials, flavours, consulting)

- Component: `components/sections/service-hero.tsx`, used by `app/[locale]/[division]/page.tsx`; styles: `app/styles/service-hero.css` (imported by the division page only). Data per service in `division.hero` (`src/content/catalog.ts`): description, CTA label, photo, desktop focal point (`focus`) and overlay strength (`standard` or `deep`); title, eyebrow and breadcrumb come from the division.
- Below 1100 px the existing full-bleed `page-hero` layout applies unchanged (the CTA is desktop-only). From 1100 px: navy text area in the site shell, photo on the right 62 % below the header fading into the navy, a 3 px accent line 1.75rem inside the content beside the title and description, and a CTA to `#categories` (the category section, with a scroll margin for the fixed header). Content starts at the same height on every service page.
- Photos: packaging `packaging/service-hero.webp` (cropped from the approved mockup photograph, 969 × 700, no text; to be replaced by a higher-resolution text-free original), raw materials `raw-materials/service-hero.webp` (grapes on the vine, official GFB website), flavours `flavours/service-hero.webp` (spices, official GFB website, 1200 × 900 source), consulting `consulting/production-line.webp` (Wikimedia Commons, CC0). All are decorative (`alt=""`).

## Division page overview

- Component: `components/sections/division-overview.tsx`, used by `app/[locale]/[division]/page.tsx`; styles: `app/styles/division-overview.css` (imported by the division page only). Content per division in `division.overview` (`src/content/catalog.ts`): headline and highlighted ending, framework label and two or three criteria (title, text, typed icon). The description is `division.description`; the eyebrow is a shared dictionary entry. The former commercial-review note was removed as unverified.
- Below 1100 px the intro keeps the `split-intro` layout; the criteria row and curves are desktop-only. The grid column count follows `--criteria`, so a division with two verified criteria renders a balanced two-card row.
- Criteria are informational (no links); they enter once via `RevealList` and lift 4 px on hover, both off under reduced motion.
- Sources: packaging (cans, bottles, closures, labels; brand and category needs), raw materials (fruit, grape and vegetable concentrates, plant concentrates, IQF fruit, compound formulation; beverages, confectionery, bakery, desserts), flavours (sweet, beverage and savoury groups with their listed products) and consulting (machinery and production processes in the food, industrial, environmental and pharmaceutical sectors), from the official GFB division pages.

## Division page category showcase

- Component: `components/sections/division-category-showcase.tsx` (featured and secondary card subcomponents inside), used by `app/[locale]/[division]/page.tsx`; styles: `app/styles/division-showcase.css` (imported by the division page only). Heading copy per division in `division.showcase`; card photos for the showcase in `category.showcase` (the category pages keep `category.image`).
- Desktop (≥ 1100 px): editorial intro, then the first category as a featured full-bleed card beside `--secondary` equal rows (three for packaging and consulting, two for raw materials and flavours) in one fixed-height grid. Below 1100 px the previous heading and two-column category grid render unchanged; only one variant is displayed, so the hidden one never loads its lazy images.
- Each card is one link to the category page (arrow and number are decorative children). Hover (hover-capable devices only) zooms the photo inside the card, lifts it 3 px and fills the arrow with lime; keyboard focus shares the lift. Off under reduced motion.
- Showcase photos: packaging cans `packaging/can-detail.webp` and labels `packaging/labels-wash-off.webp`; raw materials `grapes` (Wikimedia Commons, "Dew-Kissed Delicacy Pink Muscatel Grapes Still-Life" by Raju C Reddy, CC0), `oat-almond`, `citrus`; flavours `sweet-ice-cream`, `beverage-citrus`, `savoury-board` (all from the official GFB website); consulting food sector `consulting/production-line.webp` (Wikimedia Commons, CC0). Industrial sector `consulting/industrial-robotics.webp` (Wikimedia Commons, "Factory Automation Robotics Palettizing Bread", public domain) and environmental sector `consulting/environmental-treatment.webp` (Wikimedia Commons, "2024 Oczyszczalnia ścieków w Kłodzku (4)" by Jacek Halicki, CC0); neither is a GFB facility. The pharmaceutical sector keeps a neutral navy panel with an icon (`placeholder`) until a suitable photograph exists.
- The closing contact band uses the shared `CtaBand` with the eyebrow `division.ctaEyebrow` and a per-division heading (`division.ctaTitle` in the catalog); its link keeps the `interest` query parameter.
- `division.hero.mediaOffset` adds space between the header and the photo (used by packaging, whose bottle tops reach the image edge); the photo then fades in at its top edge.

## Category detail hero

- Component: `components/sections/category-hero.tsx`, used by `app/[locale]/[division]/[category]/page.tsx` for every category of the four divisions; styles: `app/styles/detail-hero.css` (imported by the category page only).
- Below 1100 px the dark `detail-hero` layout from `globals.css` applies unchanged. From 1100 px the photo is one continuous background layer behind the whole hero (below the navy header, breadcrumb included): it occupies the right 64 %, fades into white on its left and bottom edges, and a white-to-transparent veil keeps the copy (left 46 % of the shell) readable. No image card, corners or shadow. The blue pill keeps the contact `interest` and `category` parameters.
- The secondary link goes to `#families` when the category has product families, otherwise to `#scope`; its label is `category.heroSecondary` (e.g. "Explore formats" for cans) or the division default `division.detailSecondary`.
- Photo: `category.showcase.image` when set (sharper, category-specific), otherwise `category.image`, framed by `category.heroFocus` (falls back to the showcase focus); categories with a `placeholder` icon show a pale blue field with the icon. Light studio photos blend best; dark or close-up photos (bottles, closures, savoury board) are interim until dedicated panoramic assets with clean space on the left exist.
- `category.heroPanorama` (cans: `packaging/cans-panorama.png`; bottles: `packaging/bottles-panorama.png`; closures: `packaging/closures-panorama.png`; IQF citrus: `raw-materials/iqf-citrus-panorama.png`; pharmaceutical sector: `consulting/pharmaceutical-filling-panorama.png`, illustrative and not a GFB facility; all supplied 1914 × 822 photos) replaces the photo on desktop only, through an art-directed `<picture>` built with `getImageProps` (`sizes="100vw"`); below 1100 px the regular photo still loads. It fills the whole background without veil or fades, and the hero keeps roughly the photo proportions (`100vw / 2.45` plus the header) so the products stay whole; each panorama has its own `focus`.
- A placeholder category can also have a panorama (pharmaceutical sector): below 1100 px the icon panel stays and the picture falls back to a transparent pixel, so nothing extra loads; from 1100 px the panorama replaces the panel.

## Category scope section

- Markup in `app/[locale]/[division]/[category]/page.tsx` (`#scope`, labelled by its H2); desktop styles in `app/styles/detail-scope.css` (imported by the category page only). Below 1100 px the stacked layout from `globals.css` applies (heading, description, check list, context note as a cloud box); the "Project context" label is desktop-only.
- From 1100 px: white section (80–96 px top padding), 35/65 grid with the blue "Scope" eyebrow and a navy H2 (48–56 px) on the left and the description (20–22 px) on the right; then, only when `category.features` has items, a full-width strip with one column per feature (`--feature-count`), rules above and below and vertical dividers; the section ends with a full-width pale-blue band (content aligned to the shell, short blue accent and the "Project context" label on the left, a navy prompt and one sentence on the right). No button or form.
- Content per category in the catalog: `category.detail` (description, without operational promises), `category.scope.title` (concise heading) and `category.scope.context` (prompt and sentence; the four consulting sectors ask about the process, the challenge and the objectives). Only cans has features ("Standard, slim and sleek profiles", "Easy-open can ends", "Beverage packaging options"). The label is `category.contextLabel` in the dictionaries.

## Concentrate family explorer

- Component: `components/sections/concentrate-explorer.tsx` (client; `ConcentrateExplorer` with `ConcentrateFamilyTabs`, `ConcentrateFamilyPanel`, `ConcentrateProductList` and `ConcentrateProductRow`), styles `app/styles/concentrate-explorer.css`. It renders inside `#families` of the category page for categories with `category.explorer` (only fruit & vegetable concentrates). Below 1100 px it is hidden and the existing family grid (`.concentrates__legacy`) shows unchanged; from 1100 px the grid is hidden. Both render from the same catalog groups.
- Desktop: ~1280 px container on a tinted section. The intro shares the five-column tab grid (heading over three columns, text from the fourth) with a short lime rule before the eyebrow. Tabs sit on a hairline: thumbnail, name and a count derived from `items.length`; the active tab is pale blue with a growing blue underline and a lime ring on its thumbnail. The 46/54 panel follows its content height with a floor (`min-height`), so 6–8 entries do not leave blank space and the height varies by at most ~60 px between families.
- Product rows: numbered (`01`…), two balanced columns filled top to bottom (`ol`, DOM order = visual order), stable ids from the English name. Rows are plain text: no product has a page on this site; `ConcentrateProductRow` renders a link with an arrow only when an entry has an `href`. `highlights` (White grape, Red grape) are cobalt and bold, not links; `note` ("A particular focus on grape.") only for Mediterranean. The CTA links to the contact page with `interest` and `category` ("Fruit & vegetable concentrates – <family>", prefilled in the form).
- WAI-ARIA tabs: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`/`aria-labelledby`, roving tabindex; arrow keys (wrapping), Home and End select and focus. Motion: tab state 280 ms, photo crossfade 450 ms (the new photo fades in over the previous one once loaded; the previous one is then unmounted, so at most two are mounted), content reveal 380 ms; easing `cubic-bezier(.16,1,.3,1)`; none under reduced motion.
- Photos: licensed Unsplash photographs per family (`raw-materials/concentrates/*-sliced|still-life|market|mixed|roots.webp`, 2000 px WebP from the original files) and the official GFB studio cut-outs as thumbnails. Sources, creators, licence verification and open points: `docs/asset-provenance.md`. The 43 entries match gfb-solutions.com/fruits-concentrates (unit test); the official Spanish page lists the products in English, so the Spanish names are the repository's own translations.

## Public URLs and the SEO migration

- Legacy Wix URLs are the public canonicals: clean path = English, same path + `?lang=es` = Spanish. `proxy.ts` rewrites them to the internal localized routes (redesigned pages) or to `app/[locale]/legacy/[key]` (124 product/specification pages rendered from `src/migration/legacy-content.json`); the `/en/...` and `/es/...` URLs of redesigned pages are 308 aliases. Pages without a legacy equivalent (contact, consulting sectors, product index, legal) keep localized URLs.
- One resolver: `paths.*` (`src/i18n/routes.ts`) returns the public URL; `routes.*` the internal one. Identity and families: `src/migration/families.ts`; redesigned ↔ legacy ↔ internal: `src/migration/public-paths.ts`.
- Category pages add a "Product and specification pages" link section (`components/sections/legacy-catalogue.tsx`), outside the concentrate portfolio. Footer links the product index.
- Indexing: `X-Robots-Tag: noindex, follow` on every host except `www.gfb-solutions.com` in a production deployment; canonical origin fixed in `src/lib/metadata.ts`. Sitemaps `/sitemap.xml` and `/es_es-sitemap.xml` from `src/migration/sitemap.ts`.
- Data pipeline and verification: `npm run crawl:migration`, `npm run build:migration`, `npm run test:migration`. Full contract, results and launch/rollback runbook: `docs/seo-migration-runbook.md`.

## Technical product library (shared: concentrates and frozen fruits)

- One shared component, `components/sections/technical-library.tsx` (client) + `app/styles/technical-library.css`, driven by a `LibraryConfig` (`src/migration/library-search.ts`): intro copy, groups (`slug` for the URL, eyebrow, localized count label), the hint for groups without technical sheets and an optional contextual banner. `categoryLibrary(categoryId, locale)` in `src/migration/technical-library.ts` returns the config of a category page — `concentratesLibrary` for `/fruits-concentrates`, `frozenFruitsLibrary` for `/frozen-fruits` — and the category page renders `LegacyCatalogue` when there is none. No library-specific code lives in the component: the resource-type filters render only when a config mixes product pages and technical sheets, the banner only when the config defines one, and element ids are prefixed with the config id.
- Concentrates sits below the concentrate portfolio and does not change it; it has the red grape banner.
- Frozen fruits: four IQF groups (lemon 11, orange 11, lime 7, grapefruit 5 = 34 published pages, every page of the four IQF families incl. the `/iqf-*` hubs and `/frozen-lemon`). None has analysis/microbiology tables, so all are product pages: no type filter and no banner. Counts are commercial: "9 formats" (9/10/6/4, as listed on the official hubs); the hubs and `/frozen-lemon` are range overviews (`isOverview`), listed as "Explore range" links in the panel head, not as numbered formats. Cut names are displayed consistently as "1/4 cut" / "1/8 cut" (`displayProductName`; the published "one fourths/one eights" wording stays in URLs and stays searchable). Thumbnails: `public/images/raw-materials/iqf/`.
- Data: `src/migration/technical-library.ts` builds the six groups (five portfolio families + "Red grape specifications") from the migration families and crawled content — no separate dataset. Resource type comes from page content (pages with Analysis/Microbiology tables are technical sheets: the 7 flat red grape pages); the 43 concentrate pages are product pages only, so no technical-sheet links exist for them. Red grape: 7 products · 7 specifications (16 pages incl. the 2 range overviews); each variety pairs its product page (`/red-grape-juice/*`) with its sheet (flat path), verified by tests (same °Brix range). Counts never mix units: a product with a product page and a specification is one product; search announces "N results" (cards).
- Search (`src/migration/library-search.ts`, client-safe): partial, case/accent-insensitive, all words must match; codes also match without spaces/hyphens (`red800` → RED-800). A new query searches all families; choosing a family narrows it; "Show matches in all families" widens it again; Escape clears.
- Single-choice controls are native radio groups (`fieldset` + `legend`): the family navigator and the All / Products / Specifications type filter (arrow keys move the selection). Actions read "View product", "View specifications", "Explore range" (no document/PDF icon: none of the destinations is a download). Empty states explain missing specifications or no matches, with a reset.
- State in the URL: `family` and `type` (pushState → Back/Forward), `q` (replaceState, no history per keystroke); restored after hydration. All family panels are server-rendered as real links (inactive ones `hidden`), so every product/technical page stays crawlable from this page.
- One family for the whole page (`src/lib/family-url.ts`): the concentrate explorer and the library both read and write the `family` slug (citrus, mediterranean, tropical, red-fruits, vegetables, red-grape). Changes are announced by the writer (`writeFamilyParam` / the library's `writeUrl`), by Back/Forward and, for same-page client navigations such as header family links, by `FamilyUrlSync` (`useSearchParams` behind its own Suspense boundary). Without a parameter both show Mediterranean (`defaultFamilyId` = the explorer's `defaultGroup`); the red grape group selects Mediterranean in the explorer (`aliases`). The explorer panel links to its family in the library ("View products and specifications"). The language switch carries `family`, `type` and `q` to the other language.

## Catalogue content integrity (concentrates and frozen fruits)

- `processBlocks` keeps raw-material wording ("healthy, hand-selected grapes") out of the health-claim filter, and with `dropEmpty` (concentrate and frozen-fruit pages only) removes empty headings: a heading the original page linked to a page of the same family (verified in the crawl's outbound links and that page's H1) becomes a `links` item or a section `link`; a lone "Frozen Fruits" label becomes the eyebrow.
- `src/migration/corrections.ts`: exact-text editorial corrections (wrong fruit names), applied to both languages by the build, which fails if a source text no longer matches.
- Audit: `node scripts/catalogue-audit.ts` → `docs/migration-data/catalogue-audit.csv`; findings and items for GFB review: `docs/catalogue-qa-audit.md`.

## Product-resource sections (`compact-groups`, `visual-cards`)

Reusable presentations for product collections. `src/migration/category-resources.ts` holds the explicit presentation of each category (`assignments`, with `selectionReason`) and the canonical inventory (`categoryAudit`: unique products — a product page and its technical sheet, or two pages of one product, count once; overview pages are not products — resources, technical sheets, groups):

| Route                      | Products | Resources | Technical | Groups | Variant                                      |
| -------------------------- | -------: | --------: | --------: | -----: | -------------------------------------------- |
| `/fruits-concentrates`     |       50 |        59 |         7 |      6 | technical-library                            |
| `/frozen-fruits`           |       29 |        34 |         0 |      4 | technical-library                            |
| `/cans`                    |        5 |        12 |         5 |      2 | compact-groups (override: technical density) |
| `/closures`                |        4 |         9 |         3 |      1 | compact-groups (override: technical density) |
| `/bottles`                 |        3 |         3 |         0 |      1 | visual-cards                                 |
| `/labels`                  |        3 |         3 |         0 |      1 | visual-cards                                 |
| `/plant-based-concentrate` |        2 |         2 |         0 |      1 | visual-cards                                 |

Other categories have no product pages and keep `LegacyCatalogue` (which renders nothing without families). The category page keeps its own closing CTA, so these sections have no section CTA.

- Section copy per category (`resourceSections` dictionary block): category-specific eyebrow, heading ("Explore can formats and ends", "Explore bottle applications", "Explore closure formats", "Explore label solutions", "Explore oat and almond concentrates") and intro, without implementation wording such as "published product pages".
- One product = one compact row or card, with one action per destination ("View product", "View specifications"); both hrefs are kept. A family hub is the group's "Explore range" link, not a numbered product. Counts read "3 products · 3 specifications". Equivalence of a product page and a flat page is detected by content (`specificationPairs`) or listed in `verifiedSpecificationPairs` when the flat page repeats the product page's text (`/std-can-d66mm`, checked by a unit test) — never from similar names alone.
- Display names and texts (`titles`, `descriptions`, `groupDescription` per group in `assignments`) replace inconsistent or ungrammatical published copy ("WashOff Labels", "GFB have different solutions…") with text condensed from the same pages; bottle descriptions are counted from each page's specification tables. Product pages keep their published H1 (their identity); these names are catalogue-only.
- Layout: two products render as two wide horizontal cards across the content width; a single compact group spans the width with its header beside the rows; label types without a licensed photograph show a designed line illustration (`LabelIllustration`).
- Category scope (`scopeGroups` in the catalogue): titled lists condensed from the official pages (flavour applications, development and logistics capabilities; consulting focus; IQF citrus and formats; plant-based formats and packaging). Pages without a catalogue (flavours, consulting) also link to their sibling categories and the division overview. Shown stacked below 1100 px with the default styling.

- Entry point: `components/sections/product-resources/product-resource-section.tsx` → `<ProductResourceSection config={config} locale={locale} />`. `config.variant` is `"compact-groups"` (white group panels with numbered rows and resource-type badges) or `"visual-cards"` (photographic product cards). Styles: `app/styles/product-resources.css`.
- Contract and logic (client-safe): `src/migration/resource-section.ts` — `ResourceSectionConfig` (id, variant, eyebrow, title, description?, groups, showSearch?, showResourceFilters?, cta?), `ProductResourceGroup`, `ProductResourceItem`, `ResourceLink` (kind `product` | `technical`), plus the shared `filterResourceGroups` (search reuses the library normalisation: case/accent-insensitive, partial, compact identifiers) and `displayIndexes`.
- Rendering: the section, CTA and variant markup (`resource-views.tsx`) are server components; `resource-browser.tsx` is the only client island and is used only when search or filters are enabled. Type filters appear only when the data has both product pages and technical sheets.
- Data: `familyResourceGroup(familyId, locale, { photos, image, eyebrow })` in `src/migration/product-resources.ts` builds a group from a migration family: every page once at its public URL, titles from the page H1, descriptions as the first sentence of the page's own text (omitted on Spanish pages whose text is still English). Technical sheets are only verified pairs (`specificationPairs`): a flat page without prose, with ≥ 3 attribute sections, named like a nested product page of the family (packaging: 7 pairs).
- Preview: `/en/component-preview` and `/es/component-preview` (`app/[locale]/component-preview`; the live category configs plus edge cases, `src/migration/resource-previews.ts`) — only under `next dev` or with `GFB_COMPONENT_PREVIEW=1` (set for the e2e server); 404 otherwise, `noindex`, not linked or in sitemaps.
- Changing a category's variant: edit its entry in `assignments` (`src/migration/category-resources.ts`) — variant, family groups, optional group image and product photos, search/filters; add an entry (and a `resourceIntro` text) to give another category a section. `suggestedVariant(uniqueProducts)` gives the advisory default (1–5 visual-cards, 6–12 compact-groups, 13+ technical library); the explicit entry always decides. Images: only licensed or approved assets listed in `docs/asset-provenance.md`; without one a card shows the neutral fallback.

## Product detail hero

- Every product-detail page (`app/[locale]/legacy/[key]/page.tsx`, 124 pages × EN/ES) renders `<ProductDetailHero config locale />` (`components/sections/product-detail-hero.tsx`, server component; styles in `app/styles/product-detail-hero.css`). Only the hero changed: content sections, related links and the closing CTA are as before; the product index keeps the previous `legacy-detail__hero` styles.
- Config from the existing data: title = page H1, eyebrow = page eyebrow or family label, lead = page description without its leading "<name> from GFB Solutions," (omitted when it repeats the first paragraph or the eyebrow), breadcrumbs = the existing trail, actions = the inquiry route and "Back to <parent category>" from the route hierarchy, identifier = "Product / <library group or family>".
- Variants: `product` (photograph in the arc), the same without a photograph (neutral panel), and `technical-document` for technical specification pages (`isTechnicalResource`: the 7 analysis sheets and 7 packaging specification pages), compact with a technical grid and no photography.
- Photographs: `productHeroImage(path)` (`src/migration/product-hero-images.ts`) maps each page to a subject photograph in `public/images/products/hero/` (licensed, documented in `docs/asset-provenance.md`) or an approved packaging image; zest/peel, RipCaps and a few fruits without a suitable photograph use the image-free layout. The hero image loads eagerly with `fetchPriority="high"` (LCP); motion is CSS only and off under reduced motion.
- Identity: the H1 is the published page H1, verbatim (the page identity that
  `scripts/verify-seo-migration.mjs` checks). When it carries a code or format (lines after the first, or the part after " / "),
  that part is shown as a smaller second line (`product-hero__code`), same text content. The eyebrow is the published
  identifier or "Technical specification"; the lead is availability/application. Catalogue display names (labels, crown
  caps, cut wording) are used in the category catalogues and the library only.
- Language link: `translatePathname` maps the internal `/{locale}/legacy/{key}` route (what `usePathname()` reports during
  the server render of a rewritten legacy URL) back to its legacy path, so the server HTML already links the same product in
  the other language (previously the home page until hydration).
- Hero photos are sized for the rendered media box (about 774 × 750 CSS px at 1440 px): sources are ≥ 2000 px on the long side or 2571 × 2160 for the can scenes; four approved repository images remain softer on 2× screens (crown cork panorama, wash-off labels, beer bottle, beet) and are listed in docs/asset-provenance.md.

## Product detail content (section below the hero)

- Entry point: `components/sections/product-detail-content.tsx` (server component) + `app/styles/product-detail-content.css`, rendered by `app/[locale]/legacy/[key]` between the hero and "More in this family". Data: `productContent(path, sections)` in `src/migration/product-content.ts` arranges the crawled page content into typed blocks for one of four layouts; it never adds or rewrites text.
- Layouts (explicit mapping `productContentVariant`, documented per route in `docs/product-detail-content-audit.md` and `docs/migration-data/product-detail-content.json`, regenerated by `node scripts/build-product-content-audit.ts`):
  - `formats-overview` (45 pages: concentrates, plant-based): formats panel (rows with non-interactive chips; long cells such as "Oat Benefits" become text, not chips) + editorial overview.
  - `facts-applications` (29: individual IQF formats): intro + fact cards from the published table + uses/handling panel.
  - `technical-specification` (15: analysis sheets, packaging specification pages): identifier chips (headings published without text, e.g. "D57.4 mm") + grouped semantic tables (`th scope`, Parameter/Specification headers; value-only rows stay plain cells) and lists.
  - `product-range-features` (35): `reference-collection` (bottle models under their published group labels) or `feature-editorial` (packaging products, labels, red grape varieties, range overviews with their product links).
- Preservation: `tests/unit/product-content.test.ts` checks for all 248 pages that the arranged content holds exactly the published strings; `tests/e2e/product-detail-content.spec.ts` checks the served HTML of every page. No placeholder values, methods, images, downloads or extra calls to action. English blocks on Spanish pages keep `lang="en"`.
- Flagged source issues (kept as published, listed in the audit): Mango "Valencia Orange" wording, IQF orange half slices described with lemon wording, the standard 52 mm end page introducing the ISE end, oat/almond health text inside the formats table, soft drinks/water contamination wording.

## Header mega navigation

- Config: `primaryNavigation(locale)` (`src/lib/navigation.ts`) adds a `MegaMenuConfig` to each division, built only from the catalogue, route helpers and dictionaries (`common.megaMenu`), so every link is an existing public URL in the current language. Layouts: `three-column` (Raw materials: categories · concentrate families · quick access), `two-column` (Packaging: categories · quick access to the cans, can ends and crown corks hubs) and `compact` (Flavours, Consulting: categories only). Each panel ends with "Explore all <division>" → the division page.
- Family links are deep links into the concentrates technical library: `<category URL>?family=<slug>#concentrates-library-title` (slugs = the library's `family` URL state). The library reads the URL on load, on Back/Forward and, for same-page links, through a tiny `useSearchParams` listener behind its own Suspense boundary (the library itself stays prerendered). The concentrate explorer is not URL-driven and is unchanged.
- Component: `components/layout/header-navigation.tsx` (client), icons in `mega-menu-icons.tsx` (inline SVG, `aria-hidden`), styles in `app/styles/mega-menu.css`. Each division keeps its label as a real link; a separate disclosure button (`aria-expanded`, `aria-controls`) toggles the panel. No `role="menu"`: panels are plain lists of links grouped under headings.
- Behaviour: hover on mouse pointers (60 ms open, 180 ms close, a hover bridge lets the pointer travel into the panel), one panel at a time, Escape closes and returns focus to the chevron, clicks outside the header, a destination link or any navigation close it. Raw materials is centred under the header; the other panels are anchored under their trigger and clamped 24 px from the viewport edges.
- SEO/performance: all panels are in the server HTML (closed ones `inert` and hidden), menu links do not prefetch, no new dependencies. `NavItem.route` holds the internal route because `usePathname()` reports it on rewritten legacy URLs; it marks a division current on its own pages and categories (e.g. `/cans` → Packaging).
- Mobile (≤ 1180 px): the existing full-screen menu with an accordion per division (link + separate expand button) listing categories, quick access and "Explore all"; family deep links are desktop-only.
