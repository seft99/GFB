import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryHero, categorySectionIds } from "@/components/sections/category-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions, getCategoryBySlug, getDivisionBySlug } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import "../../../styles/detail-hero.css";

type Props = PageProps<"/[locale]/[division]/[category]">;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    divisions.flatMap((division) =>
      division.categories.map((category) => ({
        locale,
        division: division.slug[locale],
        category: category.slug[locale]
      }))
    )
  );
}

async function resolve(params: Props["params"]) {
  const { locale, division: divisionSlug, category: categorySlug } = await params;
  if (!isLocale(locale)) return null;
  const division = getDivisionBySlug(locale, divisionSlug);
  const category = division && getCategoryBySlug(division, locale, categorySlug);
  return division && category ? { locale, division, category } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, division, category } = resolved;
  return pageMetadata({
    locale,
    paths: localizedPaths((item) => paths.category(item, division, category)),
    title: category.title[locale],
    description: category.summary[locale]
  });
}

export default async function CategoryPage({ params }: Props) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, division, category } = resolved;
  const { category: copy, common } = getDictionary(locale);
  const inquiryHref = paths.contact(locale, { interest: division.id, category: category.title[locale] });

  return (
    <main id="main-content">
      <CategoryHero division={division} category={category} locale={locale} inquiryHref={inquiryHref} />

      <section id={categorySectionIds.scope} className="section detail-content">
        <div className="shell detail-content__grid">
          <div>
            <Eyebrow>{copy.scopeEyebrow}</Eyebrow>
            <h2>{copy.scopeTitle}</h2>
          </div>
          <div>
            <p className="lead">{category.detail[locale]}</p>
            {category.features && (
              <ul className="check-list">
                {category.features.map((feature) => (
                  <li key={feature.en}>
                    <Icon name="check" />
                    {feature[locale]}
                  </li>
                ))}
              </ul>
            )}
            <aside className="verification-box">
              <strong>{copy.beforeQuoteTitle}</strong>
              <p>{copy.beforeQuoteText}</p>
            </aside>
          </div>
        </div>
      </section>

      {category.groups && (
        <section id={categorySectionIds.families} className="section portfolio-groups">
          <div className="shell">
            <SectionHeading eyebrow={copy.groupsEyebrow} title={copy.groupsTitle} />
            <div className="group-grid">
              {category.groups.map((group) => (
                <article key={group.title.en}>
                  <h3>{group.title[locale]}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.en}>{item[locale]}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        variant="compact"
        eyebrow={copy.ctaEyebrow}
        title={copy.ctaTitle}
        href={inquiryHref}
        label={common.inquire}
      />
    </main>
  );
}
