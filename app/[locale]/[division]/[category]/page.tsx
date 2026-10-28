import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { CategoryHero, categorySectionIds } from "@/components/sections/category-hero";
import { ConcentrateExplorer } from "@/components/sections/concentrate-explorer";
import { CtaBand } from "@/components/sections/cta-band";
import { LegacyCatalogue } from "@/components/sections/legacy-catalogue";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions, getCategoryBySlug, getDivisionBySlug } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import "../../../styles/detail-hero.css";
import "../../../styles/detail-scope.css";

type Props = PageProps<"/[locale]/[division]/[category]">;

/** Stable id for a family from its English title ("Red fruits" -> "red-fruits"). */
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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

      <section
        id={categorySectionIds.scope}
        className="section detail-content detail-scope"
        aria-labelledby="scope-title"
      >
        <div className="shell">
          <div className="detail-content__grid">
            <div>
              <Eyebrow>{copy.scopeEyebrow}</Eyebrow>
              <h2 id="scope-title">{category.scope.title[locale]}</h2>
            </div>
            <p className="lead">{category.detail[locale]}</p>
          </div>
          {category.features && category.features.length > 0 && (
            <ul
              className="check-list detail-scope__features"
              style={{ "--feature-count": category.features.length } as CSSProperties}
            >
              {category.features.map((feature) => (
                <li key={feature.en}>
                  <Icon name="check" />
                  {feature[locale]}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="detail-scope__context">
          <div className="shell">
            <aside className="verification-box" aria-labelledby="scope-context-title">
              <span className="detail-scope__label">{copy.contextLabel}</span>
              <div>
                <strong id="scope-context-title">{category.scope.context.title[locale]}</strong>
                <p>{category.scope.context.text[locale]}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {category.groups && (
        <section
          id={categorySectionIds.families}
          className={
            category.explorer ? "section portfolio-groups portfolio-groups--explorer" : "section portfolio-groups"
          }
        >
          {category.explorer && (
            <ConcentrateExplorer
              eyebrow={category.explorer.eyebrow[locale]}
              title={category.explorer.title[locale]}
              text={category.explorer.text[locale]}
              defaultId={slugify(category.explorer.defaultGroup)}
              labels={{ count: copy.explorerCount, cta: copy.explorerCta, tabs: copy.explorerTabs }}
              families={category.groups.map((group) => ({
                id: slugify(group.title.en),
                name: group.title[locale],
                heading: (group.heading ?? group.title)[locale],
                items: group.items.map((item) => ({
                  id: slugify(item.en),
                  label: item[locale],
                  highlight: group.highlights?.includes(item.en) ?? false
                })),
                note: group.note?.[locale],
                image: group.image && { ...group.image, alt: group.image.alt[locale] },
                thumb: group.thumb,
                href: paths.contact(locale, {
                  interest: division.id,
                  category: `${category.title[locale]} – ${group.title[locale]}`
                })
              }))}
            />
          )}
          <div className="shell concentrates__legacy">
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

      <LegacyCatalogue locale={locale} parent={{ division: division.id, category: category.id }} />

      <CtaBand
        variant="compact"
        tone="blue"
        eyebrow={copy.ctaEyebrow}
        title={copy.ctaTitle}
        context={{ title: category.scope.context.title[locale], text: category.scope.context.text[locale] }}
        href={inquiryHref}
        label={common.inquire}
      />
    </main>
  );
}
