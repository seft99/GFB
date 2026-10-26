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

## Homepage hero

- Component: `components/home/home-hero.tsx`; styles: `app/styles/home-hero.css`; header styles: `app/styles/header.css`.
- Background: `public/images/home/hero-background.webp` (approved photo, 1584 × 993, unmodified). The approved design reference lives in `docs/design/references/` and is never rendered.
- The photo sits in a "stage" with its exact aspect ratio, filling the hero height and anchored right. Callouts are placed by their circle centre as a percentage of the photo (`callouts` in the component) and sized in stage container units, so they stay on the printed arcs at every size. To move one, change its `x`/`y` percentages.
- Layouts: desktop ≥ 1100 px (composition), 900–1099 px (two columns, no callouts), ≤ 899 px (copy, then a crop of the product group); callouts are hidden ≤ 640 px.
- Typeface: Noto Sans (variable, `wdth` 92 %) via `next/font`, scoped to the header and hero through `--font-brand`.

## Homepage "The value of connection"

- Component: `components/home/home-connection.tsx`; styles: `app/styles/home-connection.css`; copy: `home.connection` in the dictionaries.
- The network is an aspect-locked box (840 × 590) shared by the SVG `viewBox` and the percentage-positioned cards, so paths, nodes, hub and cards scale together. Path coordinates live in `links` in the component; cards fill the corners in `disciplines` order.
- Card photos reuse the division images listed in `disciplines`; the hub uses `public/brand/gfb-logo.avif`.
- Layouts: two columns ≥ 1100 px, stacked drawing 760–1099 px, hub plus card grid ≤ 759 px (one column ≤ 559 px).
- Motion: scroll-driven entrance (`animation-timeline`, no JavaScript) and a slow glow on the hub nodes, both inside `prefers-reduced-motion: no-preference`. The section uses `overflow: clip` because `hidden` would make it a scroll container and break the view timeline.

## Homepage "Four divisions"

- Components: `components/home/home-divisions.tsx`, `components/cards/division-editorial-card.tsx` and the client `components/home/pointer-parallax-list.tsx`; styles: `app/styles/home-divisions.css`.
- Desktop (≥ 1100 px) shows the editorial bento grid (12 columns, 7/5 then 5/7, cards 458 px tall). Below 1100 px the previous stacked `DivisionCard` list is rendered unchanged until the mobile redesign; only one variant is displayed, so the hidden one's lazy images are never requested. Remove `.divisions__legacy` when the mobile design lands.
- Card data comes from the catalog (title, short title, eyebrow, summary, hero image). The lighter on-dark accent tints and per-card crop (`focus`) live in the components.
- Pointer parallax writes `--mx`/`--my` on the hovered card once per animation frame, mouse only; there are no React state updates. Hover and `:focus-visible` share one state, and reduced motion removes every transform.
