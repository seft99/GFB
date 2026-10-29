import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryHero, categorySectionIds } from "@/components/sections/category-hero";
import { ConcentrateExplorer } from "@/components/sections/concentrate-explorer";
import { CtaBand } from "@/components/sections/cta-band";
import { LegacyCatalogue } from "@/components/sections/legacy-catalogue";
import { ProductResourceSection } from "@/components/sections/product-resources/product-resource-section";
import { TechnicalLibrary } from "@/components/sections/technical-library";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions, getCategoryBySlug, getDivisionBySlug } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import Link from "next/link";
import { familyLibraryHref } from "@/src/lib/family-url";
import { pageMetadata } from "@/src/lib/metadata";
import { categoryResources } from "@/src/migration/category-resources";
import { categoryLibrary } from "@/src/migration/technical-library";
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
  const library = categoryLibrary(category.id, locale);
  // Extensive catalogues keep the technical library; other assigned categories use a variant.
  const resources = library ? undefined : categoryResources(category.id, locale);
  // Pages without a catalogue (flavour applications, consulting sectors) link to their siblings
  // and back to the division overview.
  const siblings = !library && !resources ? division.categories.filter((item) => item.id !== category.id) : [];
  const divisionName = division.shortTitle[locale];

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
            <ul className="check-list detail-scope__features">
              {category.features.map((feature) => (
                <li key={feature.en}>
                  <Icon name="check" />
                  {feature[locale]}
                </li>
              ))}
            </ul>
          )}
          {category.scopeGroups && (
            <div className="detail-scope__groups" data-count={category.scopeGroups.length}>
              {category.scopeGroups.map((group) => (
                <div key={group.title.en} data-items={group.items.length}>
                  <h3>{group.title[locale]}</h3>
                  <ul className="check-list">
                    {group.items.map((item) => (
                      <li key={item.en}>
                        <Icon name="check" />
                        {item[locale]}
                      </li>
                    ))}
                  </ul>
                  {group.note && <p className="detail-scope__note">{group.note[locale]}</p>}
                </div>
              ))}
            </div>
          )}
          {siblings.length > 0 && (
            <nav className="detail-scope__related" aria-label={copy.relatedLabel.replace("{division}", divisionName)}>
              <p>{copy.relatedLabel.replace("{division}", divisionName)}</p>
              <ul>
                {siblings.map((item) => (
                  <li key={item.id}>
                    <Link href={paths.category(locale, division, item)}>
                      {item.title[locale]}
                      <Icon name="arrow" strokeWidth={1.8} />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={paths.division(locale, division)} className="detail-scope__overview">
                    {copy.relatedOverview.replace("{division}", divisionName)}
                    <Icon name="arrow" strokeWidth={1.8} />
                  </Link>
                </li>
              </ul>
            </nav>
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
              // The library's red grape group belongs to the Mediterranean family of the explorer.
              aliases={library ? { "red-grape": "mediterranean" } : undefined}
              labels={{
                count: copy.explorerCount,
                cta: copy.explorerCta,
                tabs: copy.explorerTabs,
                library: copy.explorerLibrary
              }}
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
                }),
                // Only families the library has (same slug), so the link never lands on a fallback.
                ...(library?.families.some((family) => family.slug === slugify(group.title.en))
                  ? {
                      libraryHref: familyLibraryHref(
                        paths.category(locale, division, category),
                        slugify(group.title.en)
                      )
                    }
                  : {})
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

      {library ? (
        <TechnicalLibrary config={library} labels={getDictionary(locale).library} />
      ) : resources ? (
        <ProductResourceSection config={resources} locale={locale} />
      ) : (
        <LegacyCatalogue locale={locale} parent={{ division: division.id, category: category.id }} />
      )}

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
