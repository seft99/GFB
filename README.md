# GFB Solutions website

Independent, bilingual corporate website for GFB Solutions. The implementation uses Next.js App Router, strict TypeScript, React Server Components by default, local optimized imagery, structured content and a minimal dependency surface.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/es`.

## Quality commands

```powershell
npm run typecheck
npm test
npm run build
```

## Contact integration

The form validates in the browser and on the server, includes a honeypot and a simple per-process rate limit, and preserves inquiry context. Delivery is intentionally disabled until GFB approves the email provider, recipient, privacy notice and credentials. The endpoint returns an accurate `503` response and directs the visitor to `info@gfb-solutions.com`.

## Deployment

- Runtime: Node.js 22.12 or newer.
- Build: `npm run build`.
- Start: `npm start`.
- Compatible with conventional Next.js hosting. Vercel is the most direct path; Cloudflare requires a maintained Next.js adapter and validation of the route handler runtime.
- Set `NEXT_PUBLIC_SITE_URL` to the production origin before generating canonical URLs and the sitemap.
- Do not switch DNS until redirects, legal copy, contact delivery and stakeholder acceptance are complete.

See `docs/` for the audit, architecture, content inventory and approval register.
