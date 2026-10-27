import type { LocalizedText } from "../i18n/config.ts";

export type DivisionId = "packaging-solutions" | "raw-materials" | "flavours-aromas" | "industrial-consulting";

export type CategoryGroup = { title: LocalizedText; items: LocalizedText[] };

/**
 * How a category appears in the division page showcase. `image` overrides the category photo
 * there only (the category page keeps its own); `placeholder` shows a neutral panel with that
 * icon when no relevant approved photograph exists.
 */
export type CategoryShowcase = { image?: string; focus?: string; placeholder?: OverviewIcon };

export type Category = {
  /** Stable identifier, independent of the public slug; used in inquiries and tests. */
  id: string;
  slug: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  detail: LocalizedText;
  image: string;
  showcase?: CategoryShowcase;
  features?: LocalizedText[];
  groups?: CategoryGroup[];
};

/** Service page hero: copy, CTA to the page's category section, photo and its desktop treatment. */
export type ServiceHero = {
  text: LocalizedText;
  cta: LocalizedText;
  image: string;
  /** CSS object-position of the photo on desktop, keeping the subject on the right. */
  focus: string;
  /** "deep" adds a darker navy tint for bright or busy photographs. */
  overlay: "standard" | "deep";
};

/** Icons available to overview criteria and showcase placeholders (a subset of components/ui/icon.tsx). */
export type OverviewIcon =
  "bottle" | "gear" | "cube" | "leaf" | "target" | "nodes" | "sweet" | "drop" | "bowl" | "document" | "capsule";

export type OverviewCriterion = { id: string; title: LocalizedText; text: LocalizedText; icon: OverviewIcon };

/** Division page overview: headline with a highlighted ending and the criteria row. */
export type DivisionOverview = {
  title: LocalizedText;
  highlight: LocalizedText;
  frameworkLabel: LocalizedText;
  criteria: OverviewCriterion[];
};

/** Heading of the division page category showcase: text before, highlighted phrase, text after. */
export type DivisionShowcase = {
  before: LocalizedText;
  highlight: LocalizedText;
  after: LocalizedText;
  countLabel: LocalizedText;
  text: LocalizedText;
};

export type Division = {
  id: DivisionId;
  slug: LocalizedText;
  title: LocalizedText;
  shortTitle: LocalizedText;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  heroImage: string;
  hero: ServiceHero;
  overview: DivisionOverview;
  showcase: DivisionShowcase;
  accent: string;
  categories: Category[];
};
