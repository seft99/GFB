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
