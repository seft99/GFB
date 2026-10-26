# Architecture and design system

## Application

- Next.js 16 App Router, React 19 and strict TypeScript.
- Locale-first routing: `/en/...` and `/es/...`; `/` redirects to English.
- Server Components for all content-heavy routes.
- Client Components only for responsive navigation and inquiry form state.
- Business data lives in `src/content/site-content.ts`; UI copy and domain models are not duplicated in page components.
- Dynamic static route templates power the four divisions and their verified categories.
- Native metadata, `robots.ts`, `sitemap.ts`, Organization and Breadcrumb structured data.

## Route families

- `/{locale}` — homepage.
- `/{locale}/about` — corporate profile.
- `/{locale}/{division}` — division overview.
- `/{locale}/{division}/{category}` — category details.
- `/{locale}/contact` — contextual B2B inquiry.
- `/{locale}/legal/{privacy|cookies}` — explicitly labeled legal-review drafts.

## Design language

- Primary: midnight navy `#020216`.
- Brand blue: `#1457D9` / `#246EE9`.
- Brand accent: lime `#96D814` / `#B9EE43`.
- Neutral surface: `#F3F4F7`; body ink: `#11152A`.
- Fluid display typography, editorial split layouts, restrained rounded geometry, 84rem content shell.
- Motion is limited to navigation, links and image scale; `prefers-reduced-motion` removes transitions.
- Responsive layouts are defined for large desktop, tablet, mobile and compact 320–390px widths.

## Contact status

The route handler performs normalization, required-field checks, length limits, honeypot rejection and a best-effort in-memory rate limit. External delivery is intentionally not implemented. Before production, approve the processor, recipient, retention policy, legal notice, secrets and error-monitoring requirements, then add the integration server-side.
