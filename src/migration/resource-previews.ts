import { getDivisionById } from "../content/catalog.ts";
import type { Locale } from "../i18n/config.ts";
import { getDictionary } from "../i18n/dictionaries/index.ts";
import { paths } from "../i18n/routes.ts";
import { familyResourceGroup, type ResourcePhoto } from "./product-resources.ts";
import type { ResourceSectionConfig, ResourceSectionCta } from "./resource-section.ts";

/**
 * Development preview fixtures of the two product-resource variants
 * (app/[locale]/component-preview). Real data only: packaging families of the migration, their
 * published pages and official photographs. They are not assigned to any category page; that
 * is decided page by page later (see docs/architecture.md, "Product-resource sections").
 */

/**
 * The preview route exists only under `next dev` or a server started with
 * GFB_COMPONENT_PREVIEW=1 (the e2e server); any other deployment answers 404.
 */
export const componentPreviewEnabled = (env: Record<string, string | undefined> = process.env) =>
  env.NODE_ENV === "development" || env.GFB_COMPONENT_PREVIEW === "1";

const IMG = "/images/packaging/resources";

/** Official product photographs, keyed by the page that publishes them (docs/asset-provenance.md). */
const photos: Record<string, ResourcePhoto> = {
  "/aluminum-cans/std-can-d66mm": {
    src: `${IMG}/standard-can-card.webp`,
    alt: { en: "Two plain aluminium cans", es: "Dos latas de aluminio lisas" }
  },
  "/aluminum-cans/sleek-can-d57mm": {
    src: `${IMG}/sleek-can-card.webp`,
    alt: { en: "Two tall plain aluminium cans", es: "Dos latas de aluminio altas y lisas" }
  },
  "/aluminum-cans/slim-can-d53mm": {
    src: `${IMG}/slim-can-card.webp`,
    alt: { en: "Plain aluminium can with condensation", es: "Lata de aluminio lisa con condensación" }
  },
  "/aluminium-can-ends/52mm-(202)-dia-aluminium-end": {
    src: `${IMG}/can-end-52mm-card.webp`,
    alt: { en: "Aluminium can end seen from above", es: "Tapa de lata de aluminio vista desde arriba" }
  },
  "/aluminium-can-ends/52mm-(202)-dia-ise-aluminium-end": {
    src: `${IMG}/can-end-52mm-ise-card.webp`,
    alt: { en: "Aluminium can end with a blue tab", es: "Tapa de lata de aluminio con anilla azul" }
  }
};

const groupImages: Record<string, ResourcePhoto> = {
  "aluminium-cans": { src: `${IMG}/aluminium-cans-thumb.webp`, alt: { en: "", es: "" } },
  "can-ends": { src: `${IMG}/can-ends-thumb.webp`, alt: { en: "", es: "" } }
};

/** CTA from the category's existing copy and its contact route (same as the category page). */
function categoryCta(locale: Locale, categoryId: string, image?: ResourceSectionCta["image"]): ResourceSectionCta {
  const division = getDivisionById("packaging-solutions")!;
  const category = division.categories.find((item) => item.id === categoryId)!;
  const { category: copy, common } = getDictionary(locale);
  return {
    eyebrow: copy.ctaEyebrow,
    title: category.scope.context.title[locale],
    description: category.scope.context.text[locale],
    label: common.inquire,
    href: paths.contact(locale, { interest: division.id, category: category.title[locale] }),
    ...(image
      ? { image, imageAlt: locale === "es" ? "Latas y tapas de aluminio lisas" : "Plain aluminium cans and can ends" }
      : {})
  };
}

export function resourcePreviews(locale: Locale): ResourceSectionConfig[] {
  const { library, legacy } = getDictionary(locale);
  const intro = { eyebrow: library.eyebrow, title: library.title, description: legacy.allProductsText };
  const group = (id: string, withPhotos = false) =>
    familyResourceGroup(id, locale, { image: groupImages[id], ...(withPhotos ? { photos } : {}) });

  return [
    {
      id: "preview-cans-groups",
      variant: "compact-groups",
      ...intro,
      groups: [group("aluminium-cans"), group("can-ends")],
      showSearch: true,
      showResourceFilters: true,
      cta: categoryCta(locale, "cans", "/images/packaging/cans-card.webp")
    },
    {
      id: "preview-closures-group",
      variant: "compact-groups",
      ...intro,
      groups: [group("crown-corks")],
      showResourceFilters: true
    },
    {
      id: "preview-cans-cards",
      variant: "visual-cards",
      ...intro,
      groups: [group("aluminium-cans", true), group("can-ends", true)],
      showSearch: true,
      showResourceFilters: true
    },
    {
      id: "preview-labels-cards",
      variant: "visual-cards",
      ...intro,
      groups: [group("label-types")],
      cta: categoryCta(locale, "labels")
    }
  ];
}
