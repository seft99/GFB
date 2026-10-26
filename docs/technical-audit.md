# Technical audit: INCAL reference and GFB baseline

## Repositories checked

- GFB workspace: independent Git repository; it began empty. The existing baseline was committed on `main` before phase 1.
- INCAL reference: `C:\Users\sebas\Downloads\incal webPage`; inspected read-only. No INCAL files were modified or copied into GFB.
- INCAL Git metadata resolves as a non-bare repository and exposes commit `97ea519`, but `git status` fails with `fatal: this operation must be run in a work tree` despite `git rev-parse --is-inside-work-tree` returning `true`. This inconsistency was left untouched.

## INCAL architecture observed

INCAL is a Vite 8 / React 18 SPA using Tailwind 3, custom route parsing, prerender scripts, a Vercel contact function, a typed-by-convention content file, local responsive assets, SEO manifests, cookie consent, analytics adapters and Node test suites. It has no React Router dependency; URLs are parsed in application code and prerendered through custom scripts.

## Decision matrix

| Pattern                                                  | Decision                    | GFB implementation                                                                                           |
| -------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Content separate from view components                    | Reuse                       | Typed bilingual objects in `src/content/`                                                                    |
| Accessible skip link, mobile menu, focus states          | Reuse and strengthen        | Shared layout, keyboard-close menu, visible focus, reduced motion                                            |
| Contextual inquiry routing                               | Reuse                       | Division/category are preserved in contact query parameters                                                  |
| Local optimized visual assets                            | Reuse                       | Official GFB public assets stored locally as AVIF                                                            |
| CSS custom properties and responsive shell               | Adapt                       | GFB-specific navy/blue/lime tokens and fluid layout                                                          |
| Manual SPA route parser                                  | Replace                     | Next.js App Router and statically generated route parameters                                                 |
| Custom SEO prerender pipeline                            | Replace                     | Native metadata, sitemap, robots and structured data                                                         |
| Monolithic content module                                | Adapt                       | Typed domain data with reusable selectors; ready to split or map to a CMS                                    |
| Client-side hydration for all pages                      | Replace                     | Server Components by default; client code only for menu and form                                             |
| Tailwind utility layer                                   | Exclude for this foundation | A small, dependency-free design-system stylesheet is easier to audit and keeps runtime/dependency weight low |
| INCAL branding, product data, analytics and integrations | Exclude                     | No company-specific INCAL content or configuration was transferred                                           |

## Risks not reproduced

- Custom router and prerender scripts add maintenance and redirect complexity.
- The reference app depends on a single large application shell and broad data file.
- Its contact delivery, analytics and consent systems are company-specific and were not transferable.
- INCAL's current Git worktree inconsistency requires separate maintenance but is outside GFB scope.
