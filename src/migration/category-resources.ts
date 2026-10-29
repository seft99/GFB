import type { Locale, LocalizedText } from "../i18n/config.ts";
import { getDictionary } from "../i18n/dictionaries/index.ts";
import { legacyPage } from "./manifest.ts";
import { familyResourceGroup, type FamilyGroupOptions, type ResourcePhoto } from "./product-resources.ts";
import { categoryLibrary, isOverview } from "./technical-library.ts";
import type { ResourceSectionConfig, ResourceVariant } from "./resource-section.ts";

/**
 * Presentation of each category page's product resources, chosen explicitly per category.
 * `technical-library` (fruit concentrates, frozen fruits) is the existing library
 * (src/migration/technical-library.ts) and is rendered by the category page itself; the other
 * two variants render through ProductResourceSection. Categories not listed keep the plain
 * product index. The category page ends with its own call to action, so sections have none.
 * Images: licensed or approved assets only (docs/asset-provenance.md); without one, a card shows
 * a designed illustration (labels) or the neutral fallback.
 * Copy: group and card texts are condensed from the pages' own content (no new claims); card
 * names replace inconsistent H1s ("WashOff Labels") in the catalogue only — the product pages
 * keep their published H1 (their identity, checked by scripts/verify-seo-migration.mjs).
 */

export type ProductPresentationVariant = ResourceVariant | "technical-library";

type Assignment = {
  variant: ProductPresentationVariant;
  selectionReason: string;
  /** Key of the `resourceSections` dictionary block (resource-section variants only). */
  intro?: "cans" | "bottles" | "closures" | "labels" | "plantBased";
  groups?: ({ family: string } & Omit<FamilyGroupOptions, "eyebrow">)[];
  showSearch?: boolean;
  showResourceFilters?: boolean;
};

const PKG = "/images/packaging/resources";
const RAW = "/images/raw-materials/resources";
const decorative = (src: string): ResourcePhoto => ({ src, alt: { en: "", es: "" } });
const t = (en: string, es: string): LocalizedText => ({ en, es });

/**
 * "12 bottle references, from 200 cc to 1000 cc": counted from the capacity rows of the page's
 * own specification tables, so the card text cannot drift from the published references.
 */
function capacityRange(path: string) {
  const values = (legacyPage(path)?.en.sections ?? []).flatMap((section) =>
    section.items.flatMap((item) =>
      item.type === "specs"
        ? item.rows.filter((row) => /capacity/i.test(row[0])).map((row) => Number.parseInt(row[1], 10))
        : []
    )
  );
  const valid = values.filter((value) => Number.isFinite(value));
  return { count: valid.length, min: Math.min(...valid), max: Math.max(...valid) };
}
const bottleText = (path: string, en: string, es: string): LocalizedText => {
  const { count, min, max } = capacityRange(path);
  const fill = (text: string, locale: Locale) =>
    text
      .replace("{count}", String(count))
      .replace("{min}", min.toLocaleString(locale === "es" ? "es-ES" : "en-GB"))
      .replace("{max}", max.toLocaleString(locale === "es" ? "es-ES" : "en-GB"));
  return { en: fill(en, "en"), es: fill(es, "es") };
};

export const assignments: Record<string, Assignment> = {
  "fruit-concentrates": {
    variant: "technical-library",
    selectionReason: "Extensive catalogue: 5 families + red grape document group, 59 pages, 7 technical sheets."
  },
  "iqf-frozen-fruits": {
    variant: "technical-library",
    selectionReason: "Extensive catalogue: 4 IQF groups, 34 pages, 29 references."
  },
  cans: {
    variant: "compact-groups",
    selectionReason:
      "5 products in 2 groups but 12 resources with 4 technical sheets and long identifiers (52mm (202) Dia ISE…): technical navigation first.",
    intro: "cans",
    groups: [
      {
        family: "aluminium-cans",
        image: decorative("/images/products/hero/cans-pair.webp"),
        // The hub's published sentence reads "GFB have different solutions of types of aluminum cans…".
        groupDescription: t(
          "Standard, sleek and slim aluminium can formats for the beverage industry, made from AA3104 alloy and BPA free.",
          "Formatos de lata de aluminio estándar, sleek y slim para la industria de bebidas, de aleación AA3104 y sin BPA."
        ),
        titles: {
          "/aluminum-cans/std-can-d66mm": t("Standard can", "Lata estándar"),
          "/aluminum-cans/sleek-can-d57mm": t("Sleek can", "Lata sleek"),
          "/aluminum-cans/slim-can-d53mm": t("Slim can", "Lata slim")
        }
      },
      {
        family: "can-ends",
        image: decorative("/images/products/hero/can-ends.webp"),
        groupDescription: t(
          "52 mm (202) aluminium SOT ends, with standard aperture (Korinthos) or large aperture (Botcherby).",
          "Tapas de aluminio SOT de 52 mm (202), con apertura estándar (Korinthos) o grande (Botcherby)."
        ),
        titles: {
          "/aluminium-can-ends/52mm-(202)-dia-aluminium-end": t(
            "52 mm (202) aluminium end",
            "Tapa de aluminio de 52 mm (202)"
          ),
          "/aluminium-can-ends/52mm-(202)-dia-ise-aluminium-end": t(
            "52 mm (202) ISE aluminium end",
            "Tapa de aluminio ISE de 52 mm (202)"
          )
        }
      }
    ],
    showSearch: true,
    showResourceFilters: true
  },
  closures: {
    variant: "compact-groups",
    selectionReason:
      "4 products but 9 resources: 3 RipCap / ring crown cap products each with a product page and a technical sheet.",
    intro: "closures",
    groups: [
      {
        family: "crown-corks",
        image: decorative("/images/generated/bottle-closures.webp"),
        groupDescription: t(
          "Steel crown caps for glass bottles, one-piece aluminium RipCaps and steel ring crown caps with a pull ring.",
          "Tapas corona de acero para botellas de vidrio, RipCaps de aluminio de una pieza y tapas corona de acero con anilla."
        ),
        // Two pages share the name "Crown Cork Bottle Caps"; their content tells them apart.
        titles: {
          "/ripcap/crown-cork-bottle-caps": t("Crown caps, 26 and 42 mm", "Tapas corona de 26 y 42 mm"),
          "/crown-corks-caps": t("Crown caps 26 mm: characteristics", "Tapas corona de 26 mm: características"),
          "/ripcap/26-mm-ripcap": t("26 mm RipCap", "RipCap de 26 mm"),
          "/ripcap/26-mm-ring-crown-cap": t("26 mm ring crown cap", "Tapa corona con anilla de 26 mm"),
          "/ripcap/42-mm-ripcap": t("42 mm RipCap", "RipCap de 42 mm")
        }
      }
    ],
    showSearch: true,
    showResourceFilters: true
  },
  bottles: {
    variant: "visual-cards",
    selectionReason: "3 independent product pages (soft drinks, alcoholic beverages, water), no technical sheets.",
    intro: "bottles",
    groups: [
      {
        family: "bottle-formats",
        photos: {
          "/soft-drinks": {
            src: `${PKG}/bottles-soft-drinks-card.webp`,
            alt: {
              en: "Clear swing-top glass bottle beside a glass of orange drink",
              es: "Botella de vidrio transparente con cierre mecánico junto a un vaso de bebida de naranja"
            }
          },
          "/alcoholic-beverage": {
            src: `${PKG}/bottles-alcoholic-card.webp`,
            alt: {
              en: "Amber glass beer bottle with condensation",
              es: "Botella de cerveza de vidrio ámbar con condensación"
            }
          },
          "/water": {
            src: `${PKG}/bottles-water-card.webp`,
            alt: {
              en: "Clear swing-top glass bottle of water beside a glass",
              es: "Botella de agua de vidrio transparente con cierre mecánico junto a un vaso"
            }
          }
        },
        // Counted from each page's specification tables. The pages' opening sentences are about
        // filtered water (copied between pages) and are not used.
        descriptions: {
          "/soft-drinks": bottleText(
            "/soft-drinks",
            "{count} glass bottle references for soft drinks, from {min} to {max} cc.",
            "{count} referencias de botella de vidrio para refrescos, de {min} a {max} cc."
          ),
          "/alcoholic-beverage": bottleText(
            "/alcoholic-beverage",
            "{count} glass bottle references for spirits, wine and beer, from {min} to {max} cc.",
            "{count} referencias de botella de vidrio para destilados, vino y cerveza, de {min} a {max} cc."
          ),
          "/water": bottleText(
            "/water",
            "{count} glass bottle references for water, from {min} to {max} cc.",
            "{count} referencias de botella de vidrio para agua, de {min} a {max} cc."
          )
        }
      }
    ]
  },
  labels: {
    variant: "visual-cards",
    selectionReason: "3 independent label types, one product page each, no technical sheets.",
    intro: "labels",
    groups: [
      {
        family: "label-types",
        titles: {
          "/shrink-sleeve-labels": t("Shrink sleeve labels", "Etiquetas de manga retráctil"),
          "/washoff-labels": t("Wash-off labels", "Etiquetas wash-off"),
          "/wet-glue-labels": t("Wet-glue labels", "Etiquetas de cola húmeda")
        },
        descriptions: {
          "/shrink-sleeve-labels": t(
            "Custom printed sleeves that can be tailored to the shape and size of the container.",
            "Mangas impresas a medida que se adaptan a la forma y el tamaño del envase."
          ),
          "/washoff-labels": t(
            "Labels that keep their print and adhesion in use and come off cleanly in the washing process.",
            "Etiquetas que mantienen la impresión y la adherencia durante el uso y se retiran limpiamente en el lavado."
          ),
          "/wet-glue-labels": t(
            "Labels for beverage applications in large-scale production, with high print quality.",
            "Etiquetas para bebidas en producción a gran escala, con alta calidad de impresión."
          )
        },
        // The cards keep code-authored diagrams because one family image cannot identify each
        // label technology as clearly as the tailored line work.
        illustrations: {
          "/shrink-sleeve-labels": "shrink-sleeve",
          "/washoff-labels": "wash-off",
          "/wet-glue-labels": "wet-glue"
        }
      }
    ]
  },
  "plant-based-concentrates": {
    variant: "visual-cards",
    selectionReason: "2 independent product pages (oat, almond), no technical sheets.",
    intro: "plantBased",
    groups: [
      {
        family: "plant-based-concentrates",
        photos: {
          "/plant-based-concentrate-1/oat-concentrate": {
            src: `${RAW}/oat-card.webp`,
            alt: { en: "Rolled oats in a bowl", es: "Copos de avena en un cuenco" }
          },
          "/plant-based-concentrate-1/almond-concentrate": {
            src: `${RAW}/almond-card.webp`,
            alt: { en: "Almonds in a white bowl", es: "Almendras en un cuenco blanco" }
          }
        },
        // From each page's "Available formats" table (the pages have no opening paragraph).
        descriptions: {
          "/plant-based-concentrate-1/oat-concentrate": t(
            "Oat juice concentrate, available cloudy or clear.",
            "Concentrado de zumo de avena, disponible turbio o clarificado."
          ),
          "/plant-based-concentrate-1/almond-concentrate": t(
            "Almond juice concentrate, available cloudy or clear.",
            "Concentrado de zumo de almendra, disponible turbio o clarificado."
          )
        }
      }
    ]
  }
};

/** Resource section of a category page, when its presentation is one of the two variants. */
export function categoryResources(categoryId: string, locale: Locale): ResourceSectionConfig | undefined {
  const assignment = assignments[categoryId];
  if (!assignment || assignment.variant === "technical-library" || !assignment.intro || !assignment.groups)
    return undefined;
  const intro = getDictionary(locale).resourceSections[assignment.intro];
  return {
    id: categoryId,
    variant: assignment.variant,
    eyebrow: intro.eyebrow,
    title: intro.title,
    description: intro.text,
    groups: assignment.groups.map(({ family, ...options }) => familyResourceGroup(family, locale, options)),
    showSearch: assignment.showSearch,
    showResourceFilters: assignment.showResourceFilters
  };
}

/**
 * One family's resource group as its category page builds it (same names, overviews and
 * product/specification pairs), with where that group sits on the page: the heading id of its
 * group, so links can point at it. Undefined for families shown by the technical library.
 */
export function categoryFamilyGroup(familyId: string, locale: Locale) {
  for (const [categoryId, assignment] of Object.entries(assignments)) {
    const source = assignment.groups?.find((group) => group.family === familyId);
    if (!source || assignment.variant === "technical-library") continue;
    const { family, ...options } = source;
    const group = familyResourceGroup(family, locale, options);
    // Same ids as components/sections/product-resources (`${config.id}-resources` prefix): the
    // group heading, or the section heading when a visual-cards page has one untitled group.
    const prefix = `${categoryId}-resources`;
    const anchor =
      assignment.variant === "compact-groups"
        ? `${prefix}-group-${group.id}`
        : (assignment.groups?.length ?? 0) > 1
          ? `${prefix}-cards-${group.id}`
          : `${prefix}-title`;
    return { categoryId, group, anchor };
  }
  return undefined;
}

/** Selected presentation per category (tests and docs). */
export const resourceAssignments = Object.fromEntries(
  Object.entries(assignments).map(([id, assignment]) => [id, assignment.variant])
);

export type CategoryAudit = {
  categoryId: string;
  uniqueProductCount: number;
  overviewPageCount: number;
  resourceCount: number;
  productPageCount: number;
  technicalResourceCount: number;
  groupCount: number;
  selectedVariant: ProductPresentationVariant;
  selectionReason: string;
};

/**
 * Canonical counts per category from the configured records (src/migration families): a record
 * pairs a product page with its technical sheet; overview pages (family hubs and the two overview
 * pages) are not products; two records with the same product name (e.g. /aluminum-cans/std-can-d66mm
 * and /std-can-d66mm) are one product. Resources are distinct URLs.
 */
export function categoryAudit(categoryId: string): CategoryAudit {
  const assignment = assignments[categoryId];
  const library = categoryLibrary(categoryId, "en");
  const section = categoryResources(categoryId, "en");
  const records = library
    ? library.families.flatMap((family) =>
        family.products.map((product) => product.resources.map((link) => ({ path: link.path, kind: link.type })))
      )
    : (section?.groups ?? []).flatMap((group) =>
        group.items.map((item) => item.resources.map((link) => ({ path: pathFromHref(link.href), kind: link.kind })))
      );
  const resources = records.flat();
  const productName = (path: string) =>
    (legacyPage(path)?.en.h1 ?? path)
      .split("\n")[0]
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  const products = new Set(
    records
      .filter((record) => !record.every((link) => isOverview(link.path)))
      .map((record) => productName(record[0].path))
  );
  const technical = resources.filter((link) => link.kind === "technical").length;
  return {
    categoryId,
    uniqueProductCount: products.size,
    overviewPageCount: resources.filter((link) => isOverview(link.path)).length,
    resourceCount: new Set(resources.map((link) => link.path)).size,
    productPageCount: resources.length - technical,
    technicalResourceCount: technical,
    groupCount: library?.families.length ?? section?.groups.length ?? 0,
    selectedVariant: assignment?.variant ?? "compact-groups",
    selectionReason: assignment?.selectionReason ?? ""
  };
}

const pathFromHref = (href: string) => href.replace(/\?lang=es$/, "");
