import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { divisions, getDivision, ui } from "@/src/content/site-content";
import { locales } from "@/src/content/types";
import { isLocale } from "@/src/lib/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type PageProps = { params: Promise<{ locale: string; division: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => divisions.map((division) => ({ locale, division: division.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, division: slug } = await params;
  const division = getDivision(slug);
  if (!isLocale(locale) || !division) return {};
  return pageMetadata(locale, `/${slug}`, division.title[locale], division.summary[locale]);
}

export default async function DivisionPage({ params }: PageProps) {
  const { locale: value, division: slug } = await params;
  const division = getDivision(slug);
  if (!isLocale(value) || !division) notFound();
  const locale = value;
  const es = locale === "es";
  return (
    <main id="main-content">
      <section className="page-hero section-dark" style={{ "--accent": division.accent } as React.CSSProperties}>
        <div className="page-hero__image"><Image src={division.heroImage} alt="" fill priority sizes="100vw" /></div>
        <div className="page-hero__overlay" />
        <div className="shell page-hero__content"><Breadcrumbs locale={locale} items={[{ label: division.title[locale] }]} /><p className="eyebrow eyebrow--lime">{division.eyebrow[locale]}</p><h1>{division.title[locale]}</h1><p>{division.summary[locale]}</p></div>
      </section>
      <section className="section division-intro"><div className="shell split-intro"><div><p className="eyebrow">{es ? "Visión general" : "Overview"}</p><h2>{es ? "Opciones estructuradas alrededor de la necesidad." : "Options structured around the requirement."}</h2></div><div><p className="lead">{division.description[locale]}</p><p className="content-note">{es ? "La disponibilidad, las especificaciones y la idoneidad final se confirman durante la consulta comercial." : "Availability, specifications and final suitability are confirmed during commercial review."}</p></div></div></section>
      <section className="section category-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow">{es ? "Explorar la división" : "Explore the division"}</p><h2>{es ? "Encuentre la categoría adecuada." : "Find the relevant category."}</h2></div></div><div className="category-grid">
        {division.categories.map((category, index) => <article className="category-card" key={category.slug}><Link href={`/${locale}/${division.slug}/${category.slug}`} className="category-card__image"><Image src={category.image} alt="" fill sizes="(max-width: 720px) 100vw, 50vw" /><span>0{index + 1}</span></Link><div><h3>{category.title[locale]}</h3><p>{category.summary[locale]}</p><Link href={`/${locale}/${division.slug}/${category.slug}`} className="text-link">{ui[locale].learnMore}<Icon name="arrow" /></Link></div></article>)}
      </div></div></section>
      <section className="section compact-cta section-dark"><div className="shell compact-cta__inner"><div><p className="eyebrow eyebrow--lime">{es ? "Revisión comercial" : "Commercial review"}</p><h2>{es ? "¿Tiene un formato o aplicación en mente?" : "Have a format or application in mind?"}</h2></div><Link href={`/${locale}/contact?interest=${division.slug}`} className="button button--lime">{ui[locale].inquire}<Icon name="arrow" /></Link></div></section>
    </main>
  );
}
