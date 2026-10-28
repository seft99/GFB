import type { Locale, LocalizedText } from "../i18n/config.ts";

/**
 * Public identity of the redesigned pages that replace a legacy (Wix) page.
 *
 * The legacy URL stays the public canonical: the clean path is English and the same path with
 * `?lang=es` is Spanish. `route` is the internal App Router path that renders it (served by a
 * proxy rewrite); the localized `/en/...` and `/es/...` URLs become one-hop 308 aliases.
 * Client-safe and dependency-free (the proxy imports it). `tests/unit/migration.test.ts`
 * checks the internal routes against the content catalog.
 */
export type RedesignedRoute = { key: string; route: LocalizedText; aliases: string[] };

export const redesignedRoutes: Record<string, RedesignedRoute> = {
  "/": { key: "home", route: { en: "/en", es: "/es" }, aliases: ["/en", "/es"] },
  "/about-us": {
    key: "page:about",
    route: { en: "/en/about", es: "/es/about" },
    aliases: ["/en/about", "/es/sobre-gfb", "/es/about", "/en/sobre-gfb"]
  },
  "/packaging-solutions": division("packaging-solutions", "soluciones-de-embalaje"),
  "/cans": category("packaging-solutions", "packaging-solutions", "soluciones-de-embalaje", "cans", "latas"),
  "/bottles": category("packaging-solutions", "packaging-solutions", "soluciones-de-embalaje", "bottles", "botellas"),
  "/closures": category("packaging-solutions", "packaging-solutions", "soluciones-de-embalaje", "closures", "cierres"),
  "/labels": category("packaging-solutions", "packaging-solutions", "soluciones-de-embalaje", "labels", "etiquetas"),
  "/raw-materials": division("raw-materials", "materias-primas"),
  "/fruits-concentrates": category(
    "raw-materials",
    "raw-materials",
    "materias-primas",
    "fruit-concentrates",
    "concentrados-de-frutas"
  ),
  "/plant-based-concentrate": category(
    "raw-materials",
    "raw-materials",
    "materias-primas",
    "plant-based-concentrates",
    "concentrados-vegetales",
    "plant-based-concentrates"
  ),
  "/frozen-fruits": category(
    "raw-materials",
    "raw-materials",
    "materias-primas",
    "iqf-frozen-fruits",
    "citricos-congelados-iqf",
    "iqf-frozen-fruits"
  ),
  "/flavours-and-aromas": division("flavours-aromas", "sabores-y-aromas"),
  "/sweets": category(
    "flavours-aromas",
    "flavours-aromas",
    "sabores-y-aromas",
    "sweet-applications",
    "aplicaciones-dulces"
  ),
  "/beverages": category(
    "flavours-aromas",
    "flavours-aromas",
    "sabores-y-aromas",
    "beverage-applications",
    "aplicaciones-para-bebidas"
  ),
  "/savoury": category(
    "flavours-aromas",
    "flavours-aromas",
    "sabores-y-aromas",
    "savoury-applications",
    "aplicaciones-saladas"
  ),
  "/consulting-solutions": division("industrial-consulting", "consultoria-industrial")
};

function division(slugEn: string, slugEs: string): RedesignedRoute {
  return {
    key: `division:${slugEn}`,
    route: { en: `/en/${slugEn}`, es: `/es/${slugEs}` },
    aliases: [`/en/${slugEn}`, `/es/${slugEs}`]
  };
}

function category(
  divisionId: string,
  divisionEn: string,
  divisionEs: string,
  slugEn: string,
  slugEs: string,
  categoryId = slugEn
): RedesignedRoute {
  return {
    key: `category:${divisionId}/${categoryId}`,
    route: { en: `/en/${divisionEn}/${slugEn}`, es: `/es/${divisionEs}/${slugEs}` },
    aliases: [`/en/${divisionEn}/${slugEn}`, `/es/${divisionEs}/${slugEs}`]
  };
}

const publicPathByKey = new Map(Object.entries(redesignedRoutes).map(([path, route]) => [route.key, path]));

/** Public legacy path of a redesigned page by identity key (`home`, `division:<id>`, ...). */
export function publicPathFor(key: string): string | undefined {
  return publicPathByKey.get(key);
}

/** Public URL (path + significant query) of a legacy path in a locale. */
export function publicUrl(path: string, locale: Locale): string {
  if (locale === "en") return path;
  return path === "/" ? "/?lang=es" : `${path}?lang=es`;
}

/** Localized alias (`/en/...`, `/es/...`) → { legacy path, locale } of the public canonical. */
export const aliasTargets: Map<string, { path: string; locale: Locale }> = new Map(
  Object.entries(redesignedRoutes).flatMap(([path, route]) =>
    route.aliases.map((alias) => [alias, { path, locale: alias.startsWith("/es") ? "es" : "en" }] as const)
  )
);
