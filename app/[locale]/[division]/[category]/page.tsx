import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { divisions, getCategory, getDivision, ui } from "@/src/content/site-content";
import { locales } from "@/src/content/types";
import { isLocale } from "@/src/lib/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type PageProps = { params: Promise<{ locale: string; division: string; category: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => divisions.flatMap((division) => division.categories.map((category) => ({ locale, division: division.slug, category: category.slug }))));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, division, category } = await params;
  const item = getCategory(division, category);
  if (!isLocale(locale) || !item) return {};
  return pageMetadata(locale, `/${division}/${category}`, item.title[locale], item.summary[locale]);
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale: value, division: divisionSlug, category: categorySlug } = await params;
  const division = getDivision(divisionSlug);
  const category = getCategory(divisionSlug, categorySlug);
  if (!isLocale(value) || !division || !category) notFound();
  const locale = value;
  const es = locale === "es";
  const breadcrumbJson = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: ui[locale].home, item: `/${locale}` },
    { "@type": "ListItem", position: 2, name: division.title[locale], item: `/${locale}/${division.slug}` },
    { "@type": "ListItem", position: 3, name: category.title[locale] }
  ] };
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <section className="detail-hero section-dark"><div className="shell"><Breadcrumbs locale={locale} items={[{ label: division.title[locale], href: `/${locale}/${division.slug}` }, { label: category.title[locale] }]} /><div className="detail-hero__grid"><div><p className="eyebrow eyebrow--lime">{division.title[locale]}</p><h1>{category.title[locale]}</h1><p>{category.summary[locale]}</p><Link href={`/${locale}/contact?interest=${division.slug}&category=${category.slug}`} className="button button--lime">{ui[locale].inquire}<Icon name="arrow" /></Link></div><div className="detail-hero__image"><Image src={category.image} alt="" fill priority sizes="(max-width: 900px) 100vw, 48vw" /></div></div></div></section>
      <section className="section detail-content"><div className="shell detail-content__grid"><div><p className="eyebrow">{es ? "Alcance verificado" : "Verified scope"}</p><h2>{es ? "Lo que presenta el portafolio actual." : "What the current portfolio presents."}</h2></div><div><p className="lead">{category.detail[locale]}</p>{category.features && <ul className="check-list">{category.features.map((feature) => <li key={feature[locale]}><Icon name="check" />{feature[locale]}</li>)}</ul>}<div className="verification-box"><strong>{es ? "Antes de cotizar" : "Before quotation"}</strong><p>{es ? "Confirme aplicación, formato, volumen, destino, condiciones de proceso y documentación requerida." : "Confirm application, format, volume, destination, processing conditions and required documentation."}</p></div></div></div></section>
      {category.groups && <section className="section portfolio-groups"><div className="shell"><div className="section-heading"><div><p className="eyebrow">{es ? "Familias del portafolio" : "Portfolio families"}</p><h2>{es ? "Un catálogo preparado para crecer." : "A catalog ready to grow."}</h2></div></div><div className="group-grid">{category.groups.map((group) => <article key={group.title[locale]}><h3>{group.title[locale]}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></div></section>}
      <section className="section compact-cta section-dark"><div className="shell compact-cta__inner"><div><p className="eyebrow eyebrow--lime">{es ? "Consulta contextual" : "Contextual inquiry"}</p><h2>{es ? "Comparta los requisitos de esta categoría." : "Share the requirements for this category."}</h2></div><Link href={`/${locale}/contact?interest=${division.slug}&category=${category.slug}`} className="button button--lime">{ui[locale].inquire}<Icon name="arrow" /></Link></div></section>
    </main>
  );
}
