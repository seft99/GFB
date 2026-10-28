import type { Locale } from "../i18n/config.ts";
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
 * the neutral fallback.
 */

export type ProductPresentationVariant = ResourceVariant | "technical-library";

type Assignment = {
  variant: ProductPresentationVariant;
  selectionReason: string;
  /** Key of the `resourceIntro` dictionary block (resource-section variants only). */
  intro?: "cans" | "bottles" | "closures" | "labels" | "plantBased";
  groups?: ({ family: string } & Pick<FamilyGroupOptions, "image" | "photos" | "descriptionSentence">)[];
  showSearch?: boolean;
  showResourceFilters?: boolean;
};

const PKG = "/images/packaging/resources";
const RAW = "/images/raw-materials/resources";
const decorative = (src: string): ResourcePhoto => ({ src, alt: { en: "", es: "" } });

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
      { family: "aluminium-cans", image: decorative(`${PKG}/aluminium-cans-group.webp`) },
      { family: "can-ends", image: decorative(`${PKG}/can-ends-group.webp`) }
    ],
    showSearch: true,
    showResourceFilters: true
  },
  closures: {
    variant: "compact-groups",
    selectionReason:
      "4 products but 9 resources: 3 RipCap / ring crown cap products each with a product page and a technical sheet.",
    intro: "closures",
    groups: [{ family: "crown-corks", image: decorative("/images/packaging/closures-card.webp") }],
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
        // The page's first sentence is about filtered water (copied from /water); its second
        // sentence describes the glass bottles.
        descriptionSentence: { "/soft-drinks": 1 }
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
        photos: {
          "/washoff-labels": {
            src: "/images/packaging/labels-wash-off.webp",
            alt: {
              en: "Glass bottles with wash-off labels peeling away in water",
              es: "Botellas de vidrio con etiquetas wash-off despegándose en el agua"
            },
            position: "60% 50%"
          }
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
  const { library, resourceIntro } = getDictionary(locale);
  return {
    id: categoryId,
    variant: assignment.variant,
    eyebrow: library.eyebrow,
    title: library.title,
    description: resourceIntro[assignment.intro],
    groups: assignment.groups.map(({ family, ...options }) => familyResourceGroup(family, locale, options)),
    showSearch: assignment.showSearch,
    showResourceFilters: assignment.showResourceFilters
  };
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
