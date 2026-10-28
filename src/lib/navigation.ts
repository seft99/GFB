import { divisions } from "../content/catalog.ts";
import type { Category, Division } from "../content/types.ts";
import type { Locale } from "../i18n/config.ts";
import { getDictionary } from "../i18n/dictionaries/index.ts";
import { paths, routes } from "../i18n/routes.ts";
import { familyOf } from "../migration/families.ts";
import { publicUrl } from "../migration/public-paths.ts";

/** `route`: the internal App Router path, which `usePathname()` reports on rewritten legacy URLs. */
export type NavItem = { href: string; label: string; route?: string; menu?: MegaMenuConfig };

/** Line icons drawn by the header (components/layout/mega-menu-icons.tsx). */
export type MegaMenuIcon =
  | "citrus"
  | "leaf"
  | "snowflake"
  | "can"
  | "bottle"
  | "crown"
  | "label"
  | "sweet"
  | "beverage"
  | "savoury"
  | "food"
  | "industry"
  | "environment"
  | "pharma"
  | "orange"
  | "grapes"
  | "lemon";

export type MegaMenuLink = { id: string; label: string; href: string; icon?: MegaMenuIcon };

export type MegaMenuSection = {
  id: string;
  title: string;
  links: MegaMenuLink[];
  /** `featured`: the pale inset column (quick access). */
  variant?: "list" | "featured";
};

export type MegaMenuConfig = {
  id: string;
  layout: "compact" | "two-column" | "three-column";
  sections: MegaMenuSection[];
  footerLabel: string;
  footerHref: string;
};

const CATEGORY_ICONS: Record<string, MegaMenuIcon> = {
  cans: "can",
  bottles: "bottle",
  closures: "crown",
  labels: "label",
  "fruit-concentrates": "citrus",
  "plant-based-concentrates": "leaf",
  "iqf-frozen-fruits": "snowflake",
  "sweet-applications": "sweet",
  "beverage-applications": "beverage",
  "savoury-applications": "savoury",
  "food-sector": "food",
  "industrial-sector": "industry",
  "environmental-sector": "environment",
  "pharmaceutical-sector": "pharma"
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Deep link into the technical library of a category page (`family` URL state + its heading). */
function libraryLink(locale: Locale, division: Division, category: Category, family: string) {
  const href = paths.category(locale, division, category);
  return `${href}${href.includes("?") ? "&" : "?"}family=${family}#concentrates-library-title`;
}

const categoryLinks = (locale: Locale, division: Division): MegaMenuLink[] =>
  division.categories.map((category) => ({
    id: category.id,
    label: category.title[locale],
    href: paths.category(locale, division, category),
    icon: CATEGORY_ICONS[category.id]
  }));

/**
 * Dropdown of each division, built from the catalogue and the route helpers (every link is an
 * existing public URL in the current language). Raw materials uses the three-column reference
 * layout; the other divisions use the same component with only the columns they need.
 */
function megaMenu(locale: Locale, division: Division): MegaMenuConfig {
  const { common, library } = getDictionary(locale);
  const copy = common.megaMenu;
  const name = division.shortTitle[locale];
  const base = {
    id: division.id,
    footerLabel: copy.exploreAll.replace("{name}", name),
    footerHref: paths.division(locale, division)
  };
  const categories: MegaMenuSection = { id: "categories", title: name, links: categoryLinks(locale, division) };

  if (division.id === "raw-materials") {
    const concentrates = division.categories.find((item) => item.id === "fruit-concentrates")!;
    const orange = concentrates.groups?.[0]?.items[0];
    const families: MegaMenuSection = {
      id: "families",
      title: copy.families,
      // Same slugs as the technical library's `family` parameter (citrus, mediterranean, …).
      links: (concentrates.groups ?? []).map((group) => ({
        id: slugify(group.title.en),
        label: group.title[locale],
        href: libraryLink(locale, division, concentrates, slugify(group.title.en))
      }))
    };
    const quick: MegaMenuSection = {
      id: "quick-access",
      title: copy.quickAccess,
      variant: "featured",
      links: [
        ...(orange
          ? [
              {
                id: "orange-concentrate",
                // Same name as the product page (concentrate names come from the catalogue).
                label: locale === "es" ? `Concentrado de ${orange.es.toLowerCase()}` : `${orange.en} concentrate`,
                href: publicUrl("/citrics/orange-concentrate", locale),
                icon: "orange" as const
              }
            ]
          : []),
        {
          id: "red-grape-specifications",
          label: library.grapeEyebrow,
          href: libraryLink(locale, division, concentrates, "red-grape"),
          icon: "grapes"
        },
        {
          id: "iqf-lemon",
          label: familyOf("/iqf-lemon")!.label[locale],
          href: publicUrl("/iqf-lemon", locale),
          icon: "lemon"
        }
      ]
    };
    return { ...base, layout: "three-column", sections: [categories, families, quick] };
  }

  if (division.id === "packaging-solutions") {
    const hub = (path: string, id: string, icon: MegaMenuIcon): MegaMenuLink => ({
      id,
      label: familyOf(path)!.label[locale],
      href: publicUrl(path, locale),
      icon
    });
    const quick: MegaMenuSection = {
      id: "quick-access",
      title: copy.quickAccess,
      variant: "featured",
      links: [
        hub("/aluminium-cans", "aluminium-cans", "can"),
        hub("/aluminum-cans-ends", "can-ends", "can"),
        hub("/crown-corks", "crown-corks", "crown")
      ]
    };
    return { ...base, layout: "two-column", sections: [categories, quick] };
  }

  return { ...base, layout: "compact", sections: [categories] };
}

export function primaryNavigation(locale: Locale): NavItem[] {
  const { common } = getDictionary(locale);
  return [
    { href: paths.page(locale, "about"), label: common.about, route: routes.page(locale, "about") },
    ...divisions.map((division) => ({
      href: paths.division(locale, division),
      label: division.shortTitle[locale],
      route: routes.division(locale, division),
      menu: megaMenu(locale, division)
    })),
    { href: paths.page(locale, "contact"), label: common.contact, route: routes.page(locale, "contact") }
  ];
}
