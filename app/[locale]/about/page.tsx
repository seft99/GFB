import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { company, ui } from "@/src/content/site-content";
import { isLocale } from "@/src/lib/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, "/about", locale === "es" ? "Sobre GFB" : "About GFB", locale === "es" ? "Conozca el enfoque, la misión y la presencia internacional documentada de GFB Solutions." : "Learn about GFB Solutions' approach, mission and documented international presence.");
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value;
  const es = locale === "es";
  return (
    <main id="main-content">
      <section className="about-hero section-dark"><div className="shell"><Breadcrumbs locale={locale} items={[{ label: ui[locale].about }]} /><div className="about-hero__grid"><div><p className="eyebrow eyebrow--lime">{es ? "Una empresa, varias disciplinas" : "One company, several disciplines"}</p><h1>{es ? "Conectar el detalle técnico con el objetivo comercial." : "Connecting technical detail to the commercial goal."}</h1></div><p className="lead">{es ? "GFB se presenta como un socio multisolución para la industria de alimentación y bebidas, con más de una década de experiencia declarada y un servicio adaptado a cada proyecto." : "GFB presents itself as a multi-solution partner for the food and beverage industry, with more than a decade of stated experience and a service adapted to each project."}</p></div></div></section>
      <section className="section story-section"><div className="shell story-grid"><div className="story-image"><Image src="/images/home/global-sourcing.avif" alt={es ? "Cadena internacional de suministro de alimentos" : "International food supply chain"} fill sizes="(max-width: 900px) 100vw, 50vw" /></div><div><p className="eyebrow">{es ? "Cómo trabaja GFB" : "How GFB works"}</p><h2>{es ? "Abastecimiento local. Coordinación global. Atención personal." : "Local sourcing. Global coordination. Personal attention."}</h2><p>{es ? "Los materiales actuales de la empresa describen un modelo que trabaja con productores y fabricantes especializados para suministrar internacionalmente, seleccionando la ruta más adecuada para cada necesidad." : "The company's current materials describe a model that works with specialized producers and manufacturers to supply internationally, selecting the most suitable route for each requirement."}</p><p>{es ? "Este nuevo sitio diferencia de forma explícita entre productos suministrados, soluciones desarrolladas y servicios de consultoría, evitando atribuir a GFB capacidades de fabricación no verificadas." : "This new site explicitly distinguishes supplied products, developed solutions and consulting services, avoiding attribution of unverified manufacturing capabilities to GFB."}</p></div></div></section>
      <section className="section mission-section"><div className="shell mission-grid"><article><span>01</span><p className="eyebrow">{es ? "Misión" : "Mission"}</p><h2>{es ? "Aportar el producto y la solución adecuados en cada etapa." : "Bring the right product and solution to each stage."}</h2><p>{es ? "Coordinar soluciones personalizadas que apoyen la satisfacción y relaciones comerciales duraderas." : "Coordinate tailored solutions that support satisfaction and long-term commercial relationships."}</p></article><article><span>02</span><p className="eyebrow">{es ? "Visión" : "Vision"}</p><h2>{es ? "Ser un socio multisolución confiable y de largo plazo." : "Be a trusted, long-term multi-solution partner."}</h2><p>{es ? "Adaptar el portafolio y los servicios a medida que evoluciona el mercado de alimentos y bebidas." : "Adapt the portfolio and services as the food and beverage market evolves."}</p></article></div></section>
      <section className="section presence-section section-dark"><div className="shell"><p className="eyebrow eyebrow--lime">{es ? "Presencia referenciada" : "Referenced presence"}</p><div className="presence-heading"><h2>{es ? "Desde España hacia mercados internacionales." : "From Spain to international markets."}</h2><p>{es ? "El sitio corporativo actual identifica España, Türkiye y Dubái. La dirección pública verificada se encuentra en Murcia, España." : "The current corporate site identifies Spain, Türkiye and Dubai. The verified public address is in Murcia, Spain."}</p></div><div className="presence-list">{company.locations.map((location, index) => <div key={location}><span>0{index + 1}</span><strong>{location}</strong>{index === 0 && <small>HQ · Murcia</small>}</div>)}</div></div></section>
      <section className="section cta-section"><div className="shell cta-panel"><div><p className="eyebrow">{es ? "Una conversación práctica" : "A practical conversation"}</p><h2>{es ? "Cuéntenos qué necesita resolver." : "Tell us what you need to solve."}</h2></div><Link href={`/${locale}/contact`} className="button button--dark">{ui[locale].inquire}<Icon name="arrow" /></Link></div></section>
    </main>
  );
}
