import type { Locale } from "../i18n/config.ts";
import { categoryResources } from "./category-resources.ts";
import { familyResourceGroup } from "./product-resources.ts";
import type { ResourceSectionConfig } from "./resource-section.ts";

/**
 * Development preview of the two product-resource variants (app/[locale]/component-preview):
 * the live category configurations plus two edge cases (a single group without images, and the
 * same data in the other variant). Real data and approved images only.
 */

/**
 * The preview route exists only under `next dev` or a server started with
 * GFB_COMPONENT_PREVIEW=1 (the e2e server); any other deployment answers 404.
 */
export const componentPreviewEnabled = (env: Record<string, string | undefined> = process.env) =>
  env.NODE_ENV === "development" || env.GFB_COMPONENT_PREVIEW === "1";

export function resourcePreviews(locale: Locale): ResourceSectionConfig[] {
  const live = ["cans", "closures", "bottles", "labels", "plant-based-concentrates"].map((id) => ({
    ...categoryResources(id, locale)!,
    id: `preview-${id}`
  }));
  const cans = live[0];
  return [
    ...live,
    // Edge cases: the cans data as cards (mixed images and fallbacks), and one group, no image.
    { ...cans, id: "preview-cans-as-cards", variant: "visual-cards", showSearch: false },
    {
      ...cans,
      id: "preview-single-group",
      groups: [familyResourceGroup("can-ends", locale)],
      showSearch: false
    }
  ];
}
