import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductIndex, type IndexDivision } from "@/components/sections/product-index";
import { divisions } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import { families } from "@/src/migration/families";
import { legacyLinkLabel } from "@/src/migration/manifest";
import { familyResources } from "@/src/migration/related-resources";
import "../../styles/legacy-detail.css";
import "../../styles/product-index.css";

type Props = PageProps<"/[locale]/product-index">;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { legacy } = getDictionary(locale);
  return pageMetadata({
    locale,
    paths: localizedPaths((item) => paths.page(item, "product-index")),
    title: legacy.indexTitle,
    description: legacy.indexMeta
  });
}

/**
 * New page (no legacy equivalent): an HTML index of every retained product, specification and
 * application page, one row per product identity (src/migration/related-resources.ts: the same
 * grouping as the category pages) with its pages as explicit actions, grouped by division and
 * family, so each page has a crawlable internal link in addition to its category and family links.
 */
export default async function ProductIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { legacy } = getDictionary(locale);
  const index: IndexDivision[] = divisions
    .map((division) => ({
      id: division.id,
      title: division.title[locale],
      href: paths.division(locale, division),
      families: families
        .filter((family) => family.parent.division === division.id)
        .map((family) => {
          const category = division.categories.find((item) => item.id === family.parent.category);
          return {
            id: family.id,
            title: `${category ? `${category.title[locale]} · ` : ""}${family.label[locale]}`,
            entries: (familyResources(family.paths[0], locale)?.entries ?? []).map((entry) => ({
              id: entry.id,
              title: entry.title,
              keywords: entry.resources
                .flatMap((resource) => [legacyLinkLabel(resource.path, "en"), legacyLinkLabel(resource.path, "es")])
                .join(" "),
              actions: entry.resources.map((resource) => ({ kind: resource.kind, href: resource.href }))
            }))
          };
        })
    }))
    .filter((division) => division.families.length > 0);

  return (
    <main id="main-content" className="legacy-detail">
      <section className="legacy-detail__hero">
        <div className="shell">
          <Breadcrumbs locale={locale} items={[{ label: legacy.indexTitle }]} />
          <h1>{legacy.indexTitle}</h1>
          <p className="legacy-detail__lead">{legacy.indexText}</p>
        </div>
      </section>
      <ProductIndex divisions={index} labels={legacy.index} />
    </main>
  );
}
