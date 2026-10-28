import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { divisions } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import { families } from "@/src/migration/families";
import { legacyLinkLabel } from "@/src/migration/manifest";
import { publicUrl } from "@/src/migration/public-paths";
import "../../styles/legacy-detail.css";

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
 * application page, grouped by division, category and family, so each one has a crawlable
 * internal link in addition to its category and family links.
 */
export default async function ProductIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { legacy } = getDictionary(locale);

  return (
    <main id="main-content" className="legacy-detail">
      <section className="legacy-detail__hero">
        <div className="shell">
          <Breadcrumbs locale={locale} items={[{ label: legacy.indexTitle }]} />
          <h1>{legacy.indexTitle}</h1>
          <p className="legacy-detail__lead">{legacy.indexText}</p>
        </div>
      </section>
      {divisions.map((division) => {
        const groups = families.filter((family) => family.parent.division === division.id);
        if (groups.length === 0) return null;
        return (
          <section key={division.id} className="section legacy-catalogue" aria-labelledby={`index-${division.id}`}>
            <div className="shell">
              <h2 id={`index-${division.id}`}>
                <Link href={paths.division(locale, division)}>{division.title[locale]}</Link>
              </h2>
              {groups.map((family) => {
                const category = division.categories.find((item) => item.id === family.parent.category);
                return (
                  <div key={family.id} className="legacy-catalogue__family">
                    <h3>
                      {category ? `${category.title[locale]} · ` : ""}
                      {family.label[locale]}
                    </h3>
                    <ul className="legacy-catalogue__links">
                      {family.paths.map((path) => (
                        <li key={path}>
                          <Link href={publicUrl(path, locale)} prefetch={false}>
                            <span>{legacyLinkLabel(path, locale)}</span>
                            <Icon name="arrow" strokeWidth={1.6} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
