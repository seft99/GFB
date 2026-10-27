# Architecture

## Rendering

- Next.js 16 App Router, React 19, strict TypeScript.
- Every content route is statically generated with `generateStaticParams`. Only the contact page renders per request (it reads inquiry context from the query string).
- Server Components by default. Client components: `HeaderNavigation` (active state, mobile menu), `LanguageSwitcher`, `ContactForm` and the localized 404 picker. Each receives only the strings it needs as props; dictionaries never ship whole to the browser.

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

- Component: `components/sections/concentrate-explorer.tsx` (client), styles `app/styles/concentrate-explorer.css`. It renders inside `#families` of the category page for categories with `category.explorer` (only fruit & vegetable concentrates). Below 1100 px it is hidden and the existing family grid (`.concentrates__legacy`) shows unchanged; from 1100 px the grid is hidden.
- Desktop: ~1280 px container on a tinted section; intro (eyebrow, heading, text from `category.explorer`), five family tabs in one row (thumbnail, name, entry count derived from `items.length`) and a 45/55 panel with the active family's photo, heading, two-column list (filled top to bottom), optional note and a "Discuss this family" link to the contact page with `interest` and `category` ("Fruit & vegetable concentrates – <family>", prefilled in the form). Default family: `explorer.defaultGroup` (Mediterranean).
- Data per family in the catalog group: `heading`, `image` (`src`, localized `alt`, `focus`, `fit: "contain"` for studio cut-outs on white), `thumb`, `highlights` (English item names shown in cobalt, not links) and `note` (Mediterranean: "A particular focus on grape."). The 43 entries match gfb-solutions.com/fruits-concentrates (unit test).
- WAI-ARIA tabs: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`/`aria-labelledby`, roving tabindex; arrow keys (wrapping), Home and End select and focus. Only the active photo is rendered; switching fades content and photo (220/240 ms, off under reduced motion). The list and note reserve the rows of the longest family, so the panel height is constant.
- Photos: Citrus `raw-materials/citrus.webp` and Mediterranean `raw-materials/grapes.webp` (existing editorial photos); Tropical (mango), Red fruits (raspberries) and Vegetables (peppers) use official GFB studio cut-outs from gfb-solutions.com as interim, as do all five thumbnails (`raw-materials/concentrates/`). Editorial family photographs for Tropical, Red fruits and Vegetables (and a green/purple grape composition for Mediterranean) are still to be supplied.
