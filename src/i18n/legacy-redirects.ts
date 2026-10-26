import { divisions } from "../content/catalog.ts";
import type { DivisionId } from "../content/types.ts";
import type { Locale } from "./config.ts";
import { paths, type StaticPage } from "./routes.ts";

/**
 * Permanent redirects from the legacy Wix site. Wix serves Spanish on the same path with
 * `?lang=es`, so every legacy path gets a Spanish rule (matched first) and an English fallback.
 */
type LegacyTarget = { page: StaticPage } | { division: DivisionId } | { division: DivisionId; category: string };

export const legacyPaths: Record<string, LegacyTarget> = {
  "/about-us": { page: "about" },
  "/contact": { page: "contact" },
  "/packaging-solutions": { division: "packaging-solutions" },
  "/cans": { division: "packaging-solutions", category: "cans" },
  "/aluminium-cans": { division: "packaging-solutions", category: "cans" },
  "/aluminum-cans/std-can-d66mm": { division: "packaging-solutions", category: "cans" },
  "/aluminum-cans/sleek-can-d57mm": { division: "packaging-solutions", category: "cans" },
  "/bottles": { division: "packaging-solutions", category: "bottles" },
  "/closures": { division: "packaging-solutions", category: "closures" },
  "/crown-corks": { division: "packaging-solutions", category: "closures" },
  "/ripcap/crown-cork-bottle-caps": { division: "packaging-solutions", category: "closures" },
  "/labels": { division: "packaging-solutions", category: "labels" },
  "/wet-glue-labels": { division: "packaging-solutions", category: "labels" },
  "/raw-materials": { division: "raw-materials" },
  "/fruits-concentrates": { division: "raw-materials", category: "fruit-concentrates" },
  "/plant-based-concentrate": { division: "raw-materials", category: "plant-based-concentrates" },
  "/frozen-fruits": { division: "raw-materials", category: "iqf-frozen-fruits" },
  "/frozen-lemon": { division: "raw-materials", category: "iqf-frozen-fruits" },
  "/iqf-orange": { division: "raw-materials", category: "iqf-frozen-fruits" },
  "/flavours-and-aromas": { division: "flavours-aromas" },
  "/sweets": { division: "flavours-aromas", category: "sweet-applications" },
  "/beverages": { division: "flavours-aromas", category: "beverage-applications" },
  "/savoury": { division: "flavours-aromas", category: "savoury-applications" },
  "/consulting-solutions": { division: "industrial-consulting" }
};

export function resolveLegacyTarget(target: LegacyTarget, locale: Locale): string {
  if ("page" in target) return paths.page(locale, target.page);
  const division = divisions.find((item) => item.id === target.division);
  if (!division) throw new Error(`Unknown legacy division: ${target.division}`);
  if (!("category" in target)) return paths.division(locale, division);
  const category = division.categories.find((item) => item.id === target.category);
  if (!category) throw new Error(`Unknown legacy category: ${target.category}`);
  return paths.category(locale, division, category);
}

const matchOrder: Locale[] = ["es", "en"];

type Redirect = {
  source: string;
  destination: string;
  permanent: true;
  has?: { type: "query"; key: string; value: string }[];
};

export function legacyRedirects(): Redirect[] {
  const spanishRoot: Redirect = {
    source: "/",
    has: [{ type: "query", key: "lang", value: "es" }],
    destination: paths.home("es"),
    permanent: true
  };
  return [
    spanishRoot,
    ...Object.entries(legacyPaths).flatMap(([source, target]) =>
      // Query-matched (Spanish) rules must precede the unconditional English fallback.
      matchOrder.map((locale): Redirect => ({
        source,
        destination: resolveLegacyTarget(target, locale),
        permanent: true,
        ...(locale === "es" ? { has: [{ type: "query" as const, key: "lang", value: "es" }] } : {})
      }))
    )
  ];
}
