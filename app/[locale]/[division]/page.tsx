import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/cards/category-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CtaBand } from "@/components/sections/cta-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions, getDivisionBySlug } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { accentStyle } from "@/src/lib/format";
import { pageMetadata } from "@/src/lib/metadata";

type Props = PageProps<"/[locale]/[division]">;

export function generateStaticParams() {
  return locales.flatMap((locale) => divisions.map((division) => ({ locale, division: division.slug[locale] })));
}

async function resolve(params: Props["params"]) {
  const { locale, division: slug } = await params;
  if (!isLocale(locale)) return null;
  const division = getDivisionBySlug(locale, slug);
  return division ? { locale, division } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, division } = resolved;
  return pageMetadata({
    locale,
    paths: localizedPaths((item) => paths.division(item, division)),
    title: division.title[locale],
    description: division.summary[locale]
  });
}

export default async function DivisionPage({ params }: Props) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, division } = resolved;
  const { division: copy, common } = getDictionary(locale);

  return (
    <main id="main-content">
      <section className="page-hero section-dark" style={accentStyle(division.accent)}>
        <div className="page-hero__image">
          <Image src={division.heroImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className="page-hero__overlay" />
        <div className="shell page-hero__content">
          <Breadcrumbs locale={locale} items={[{ label: division.title[locale] }]} />
          <Eyebrow onDark>{division.eyebrow[locale]}</Eyebrow>
          <h1>{division.title[locale]}</h1>
          <p>{division.summary[locale]}</p>
        </div>
      </section>

      <section className="section division-intro">
        <div className="shell split-intro">
          <div>
            <Eyebrow>{copy.overviewEyebrow}</Eyebrow>
            <h2>{copy.overviewTitle}</h2>
          </div>
          <div>
            <p className="lead">{division.description[locale]}</p>
            <p className="content-note">{copy.note}</p>
          </div>
        </div>
      </section>

      <section className="section category-section">
        <div className="shell">
          <SectionHeading eyebrow={copy.exploreEyebrow} title={copy.exploreTitle} />
          <div className="category-grid">
            {division.categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                href={paths.category(locale, division, category)}
                title={category.title[locale]}
                summary={category.summary[locale]}
                image={category.image}
                index={index}
                linkLabel={common.learnMore}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        variant="compact"
        eyebrow={copy.ctaEyebrow}
        title={copy.ctaTitle}
        href={paths.contact(locale, { interest: division.id })}
        label={common.inquire}
      />
    </main>
  );
}
