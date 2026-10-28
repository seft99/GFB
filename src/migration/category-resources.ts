import type { Locale } from "../i18n/config.ts";
import { getDictionary } from "../i18n/dictionaries/index.ts";
import { familyResourceGroup, type ResourcePhoto } from "./product-resources.ts";
import type { ResourceSectionConfig, ResourceVariant } from "./resource-section.ts";

/**
 * Product-resource section of each category page that uses one, chosen explicitly per
 * category (not from item counts). Categories not listed here keep their current section:
 * the technical product library (fruit concentrates, frozen fruits) or the plain product index.
 * The category page already ends with its own call to action, so these sections have none.
 */

const RES = "/images/packaging/resources";
const decorative = (src: string): ResourcePhoto => ({ src, alt: { en: "", es: "" } });

type Assignment = {
  variant: ResourceVariant;
  /** Key of the `resourceIntro` dictionary block. */
  intro: "cans" | "bottles" | "closures" | "labels" | "plantBased";
  groups: { family: string; image?: ResourcePhoto; photos?: Record<string, ResourcePhoto> }[];
  showSearch?: boolean;
  showResourceFilters?: boolean;
};

const assignments: Record<string, Assignment> = {
  cans: {
    variant: "compact-groups",
    intro: "cans",
    groups: [
      { family: "aluminium-cans", image: decorative(`${RES}/aluminium-cans-thumb.webp`) },
      { family: "can-ends", image: decorative(`${RES}/can-ends-thumb.webp`) }
    ],
    showSearch: true,
    showResourceFilters: true
  },
  closures: {
    variant: "compact-groups",
    intro: "closures",
    groups: [{ family: "crown-corks", image: decorative("/images/packaging/closures-card.webp") }],
    showSearch: true,
    showResourceFilters: true
  },
  bottles: {
    variant: "compact-groups",
    intro: "bottles",
    groups: [{ family: "bottle-formats", image: decorative("/images/packaging/bottles-card.webp") }]
  },
  labels: {
    variant: "visual-cards",
    intro: "labels",
    groups: [
      {
        family: "label-types",
        // The labels category photograph already published on this page (wash-off labels).
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
    variant: "compact-groups",
    intro: "plantBased",
    groups: [{ family: "plant-based-concentrates", image: decorative("/images/raw-materials/oat-almond.webp") }]
  }
};

export function categoryResources(categoryId: string, locale: Locale): ResourceSectionConfig | undefined {
  const assignment = assignments[categoryId];
  if (!assignment) return undefined;
  const { library, resourceIntro } = getDictionary(locale);
  return {
    id: categoryId,
    variant: assignment.variant,
    eyebrow: library.eyebrow,
    title: library.title,
    description: resourceIntro[assignment.intro],
    groups: assignment.groups.map(({ family, image, photos }) =>
      familyResourceGroup(family, locale, { image, photos })
    ),
    showSearch: assignment.showSearch,
    showResourceFilters: assignment.showResourceFilters
  };
}

/** Categories with a product-resource section, and their variant (for tests and docs). */
export const resourceAssignments = Object.fromEntries(
  Object.entries(assignments).map(([id, assignment]) => [id, assignment.variant])
);
