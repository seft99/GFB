export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export type LocalizedText = Record<Locale, string>;

export type Category = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  detail: LocalizedText;
  image: string;
  features?: LocalizedText[];
  groups?: { title: LocalizedText; items: string[] }[];
};

export type Division = {
  slug: "packaging-solutions" | "raw-materials" | "flavours-aromas" | "industrial-consulting";
  title: LocalizedText;
  shortTitle: LocalizedText;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  heroImage: string;
  accent: string;
  categories: Category[];
};
