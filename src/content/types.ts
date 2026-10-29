import type { LocalizedText } from "../i18n/config.ts";

export type DivisionId = "packaging-solutions" | "raw-materials" | "flavours-aromas" | "industrial-consulting";

/** Photograph of a product family in the family explorer; `focus` is its object-position. */
export type GroupImage = { src: string; alt: LocalizedText; focus?: string };

export type CategoryGroup = {
  title: LocalizedText;
  items: LocalizedText[];
  /** Family explorer only (categories with `explorer`): panel heading, photo and selector thumbnail. */
  heading?: LocalizedText;
  image?: GroupImage;
  thumb?: string;
  /** English names of items shown with emphasis, and a short note below the list. */
  highlights?: string[];
  note?: LocalizedText;
};

/** Desktop family explorer that replaces the family grid; `defaultGroup` is the English title of the initial family. */
export type CategoryExplorer = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  text: LocalizedText;
  defaultGroup: string;
};

/**
 * How a category appears in the division page showcase. `image` overrides the category photo
 * there only (the category page keeps its own); `placeholder` shows a neutral panel with that
 * icon when no relevant approved photograph exists.
 */
export type CategoryShowcase = {
  image?: string;
  focus?: string;
  placeholder?: OverviewIcon;
  /** Desktop showcase card only: its own photo and framing, independent of the hero and mobile views. */
  card?: { image: string; focus?: string };
};

export type ScopeGroup = {
  title: LocalizedText;
  items: LocalizedText[];
  /** Short qualification under the list (e.g. options that vary by product). */
  note?: LocalizedText;
};

export type Category = {
  /** Stable identifier, independent of the public slug; used in inquiries and tests. */
  id: string;
  slug: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  detail: LocalizedText;
  /** Scope section: category-specific heading and the "project context" note below it. */
  scope: { title: LocalizedText; context: { title: LocalizedText; text: LocalizedText } };
  image: string;
  showcase?: CategoryShowcase;
  /**
   * Desktop-only panoramic photo for the detail hero, composed with clean space for the copy on
   * the left. It fills the whole hero background; `focus` is its object-position.
   */
  heroPanorama?: { image: string; width: number; height: number; focus: string };
  /**
   * Desktop-only detail hero photo and/or framing (art-directed from 1100px); below 1100px the
   * hero keeps its regular photo and position.
   */
  heroDesktop?: { image?: { src: string; width: number; height: number }; focus?: string };
  /** Desktop object-position of the photo in the detail hero background (defaults to the showcase focus). */
  heroFocus?: string;
  /** Label of the detail hero's secondary link to the scope section, when more specific than the division's. */
  heroSecondary?: LocalizedText;
  features?: LocalizedText[];
  /**
   * Structured scope content condensed from the official page (application groups, documented
   * capabilities, formats); shown as titled lists after the description. No invented services.
   */
  scopeGroups?: ScopeGroup[];
  groups?: CategoryGroup[];
  explorer?: CategoryExplorer;
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
  /** Extra space between the header and the photo, for subjects that reach the top edge. */
  mediaOffset?: string;
};

/** Icons available to overview criteria and showcase placeholders (a subset of components/ui/icon.tsx). */
export type OverviewIcon =
  | "bottle"
  | "gear"
  | "cube"
  | "leaf"
  | "target"
  | "nodes"
  | "sweet"
  | "drop"
  | "bowl"
  | "document"
  | "capsule"
  | "growth"
  | "search";

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
  /** Heading of the closing contact band on the division page. */
  ctaTitle: LocalizedText;
  /** Default label of the category detail hero's secondary link to the scope section. */
  detailSecondary: LocalizedText;
  accent: string;
  categories: Category[];
};
