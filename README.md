# GFB Solutions website

Bilingual (English / Spanish) corporate website for GFB Solutions, built with Next.js 16 (App Router), React 19 and strict TypeScript. Pages are statically generated; client JavaScript is limited to navigation, the language switcher and the inquiry form.

## Requirements

- Node.js 22.18 or newer (see `.nvmrc`).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — the proxy redirects to `/en` or `/es` based on the browser language.

## Quality commands

| Command             | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `npm run lint`      | ESLint (`eslint-config-next` core-web-vitals + TypeScript rules)  |
| `npm run format`    | Prettier (write); `format:check` verifies only                    |
| `npm run typecheck` | Generates route types, then type-checks with TypeScript 7 (`tsc`) |
| `npm test`          | Unit tests (Node test runner) for routing, i18n, content, form    |
| `npm run build`     | Production build                                                  |
| `npm run test:e2e`  | Playwright + axe on desktop and mobile; run `npm run build` first |
| `npm run check`     | Everything except e2e, in CI order                                |

CI (`.github/workflows/ci.yml`) runs all of the above, including e2e and WCAG 2.2 AA checks, on every pull request.

> **TypeScript 6 + 7 side by side.** `tsc` is TypeScript 7 (`@typescript/native`). The `typescript` package is aliased to `@typescript/typescript6` because typescript-eslint still needs the TS 6 API, as recommended in the TypeScript 7 release notes.

## Project structure

```
app/                     Routes. app/layout.tsx is a pass-through; <html> lives in app/[locale]/layout.tsx
components/              ui/ (primitives), layout/ (header, footer, breadcrumbs), sections/, cards/, contact/
src/content/             Catalog (divisions, categories, localized slugs) and company data
src/i18n/                Locale config, negotiation, route table, legacy redirects, dictionaries (en/es)
src/features/contact/    Validation schema, Server Action, rate limiter and delivery seam
src/lib/                 Metadata, structured data and small helpers
proxy.ts                 Locale negotiation, localized slug rewrites and canonical redirects
tests/unit, tests/e2e    Node unit tests and Playwright specs
```

See [docs/architecture.md](docs/architecture.md) for conventions (how to add copy, a page or a category).

## Contact integration

The form validates in the browser and again in a Server Action, includes a honeypot and a rate limiter, and keeps inquiry context (division and category) from the page the visitor came from. It also works without JavaScript.

Delivery is intentionally disabled until GFB approves the email provider, recipient, privacy notice and retention policy: `src/features/contact/delivery.ts` returns `unavailable`, and the visitor is asked to email `info@gfb-solutions.com`. The in-memory rate limiter must be replaced with a shared store before deploying to serverless hosting.

## Deployment

- Vercel is the most direct target (Proxy, Server Actions and static generation work without adapters).
- Set `NEXT_PUBLIC_SITE_URL` to the production origin; it drives canonical URLs, hreflang, the sitemap and structured data.
- Legacy Wix URLs (including `?lang=es` variants) are permanently redirected; the map lives in `src/i18n/legacy-redirects.ts`.
- Do not switch DNS until legal copy, contact delivery and stakeholder acceptance are complete.
