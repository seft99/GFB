import type { LocalizedText } from "../i18n/config.ts";

export type DivisionId = "packaging-solutions" | "raw-materials" | "flavours-aromas" | "industrial-consulting";

export type CategoryGroup = { title: LocalizedText; items: LocalizedText[] };

export type Category = {
  /** Stable identifier, independent of the public slug; used in inquiries and tests. */
  id: string;
  slug: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  detail: LocalizedText;
  image: string;
  features?: LocalizedText[];
  groups?: CategoryGroup[];
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
  accent: string;
  categories: Category[];
};
