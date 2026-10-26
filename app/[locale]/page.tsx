import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DivisionCard } from "@/components/division-card";
import { Icon } from "@/components/icon";
import { company, divisions, ui } from "@/src/content/site-content";
import { isLocale } from "@/src/lib/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, "", locale === "es" ? "Soluciones para la industria alimentaria y de bebidas" : "Food & beverage industry solutions", locale === "es" ? "Embalaje, materias primas, sabores y consultoría industrial coordinados para compradores B2B." : "Packaging, raw materials, flavours and industrial consulting coordinated for B2B buyers.");
}

export default async function HomePage({ params }: PageProps) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value;
  const es = locale === "es";
  const copy = ui[locale];

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.gfb-solutions.com",
    email: company.email,
    telephone: company.phonePrimary,
    address: { "@type": "PostalAddress", streetAddress: "Avda. Teniente Montesinos 8, Torre Z, Planta 4, Izquierda", postalCode: "30100", addressLocality: "Murcia", addressCountry: "ES" }
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <section className="hero section-dark">
        <div className="hero-orbit hero-orbit--one" /><div className="hero-orbit hero-orbit--two" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow--lime">{es ? "Soluciones B2B para alimentación y bebidas" : "B2B solutions for food & beverage"}</p>
            <h1>{es ? <>Una cadena de suministro.<br/><em>Mejor conectada.</em></> : <>One supply chain.<br/><em>Better connected.</em></>}</h1>
            <p className="hero-intro">{es ? "GFB coordina embalaje, ingredientes, sabores y conocimiento industrial para convertir necesidades complejas en decisiones comerciales claras." : "GFB coordinates packaging, ingredients, flavours and industrial know-how to turn complex requirements into clear commercial decisions."}</p>
            <div className="button-row"><Link href={`/${locale}/contact`} className="button button--lime">{copy.inquire}<Icon name="arrow" /></Link><Link href="#solutions" className="button button--ghost">{copy.explore}</Link></div>
          </div>
          <div className="hero-visual" aria-label={es ? "Portafolio de soluciones GFB" : "GFB solutions portfolio"}>
            <div className="hero-image hero-image--main"><Image src="/images/home/food-industry.avif" alt={es ? "Ingredientes frescos para aplicaciones alimentarias" : "Fresh ingredients for food applications"} fill priority sizes="(max-width: 800px) 92vw, 45vw" /></div>
            <div className="hero-image hero-image--secondary"><Image src="/images/packaging/cans.avif" alt={es ? "Soluciones de envase para bebidas" : "Beverage packaging solutions"} fill sizes="(max-width: 800px) 45vw, 18vw" /></div>
            <div className="hero-index"><strong>04</strong><span>{es ? "divisiones conectadas" : "connected divisions"}</span></div>
          </div>
        </div>
        <div className="capability-rail" aria-label={es ? "Capacidades principales" : "Core capabilities"}>
          <div>{divisions.map((division) => <span key={division.slug}>{division.shortTitle[locale]}<i>✦</i></span>)}</div>
        </div>
      </section>

      <section className="section intro-section">
        <div className="shell split-intro">
          <div><p className="eyebrow">{es ? "El valor de la conexión" : "The value of connection"}</p><h2>{es ? "Un interlocutor. Múltiples puntos críticos resueltos." : "One conversation. Multiple critical points resolved."}</h2></div>
          <div><p className="lead">{es ? "Desde la selección del envase hasta la materia prima, el perfil de sabor o el proceso industrial, el enfoque de GFB parte de la aplicación y coordina la solución alrededor de ella." : "From packaging selection to raw material, flavour profile or industrial process, GFB starts with the application and coordinates the solution around it."}</p><p>{es ? "La empresa trabaja con productores y fabricantes especializados para abastecer proyectos internacionales. GFB no se presenta como fabricante de toda la gama: su papel combina abastecimiento, desarrollo, coordinación y consultoría según la categoría." : "The company works with specialized producers and manufacturers to support international projects. GFB is not presented as the manufacturer of its entire range: its role combines sourcing, development, coordination and consulting by category."}</p></div>
        </div>
      </section>

      <section id="solutions" className="section solutions-section">
        <div className="shell section-heading"><div><p className="eyebrow">{es ? "Cuatro divisiones" : "Four divisions"}</p><h2>{es ? "Una respuesta más completa al brief industrial." : "A more complete answer to the industrial brief."}</h2></div><p>{es ? "Explore cada área y llegue rápidamente a la categoría que necesita." : "Explore each area and move quickly to the category you need."}</p></div>
        <div className="shell division-list">{divisions.map((division, index) => <DivisionCard key={division.slug} division={division} locale={locale} index={index} />)}</div>
      </section>

      <section className="section showcase-section section-dark">
        <div className="shell showcase-grid">
          <div className="showcase-image"><Image src="/images/raw-materials/fruit-concentrates.avif" alt={es ? "Selección de frutas para concentrados" : "Fruit selection for concentrates"} fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <div className="showcase-copy"><p className="eyebrow eyebrow--lime">{es ? "Descubrimiento por portafolio" : "Portfolio discovery"}</p><h2>{es ? "Concentrados organizados como compra la industria." : "Concentrates organized the way industry buys."}</h2><p>{es ? "Cítricos, mediterráneos, tropicales, frutos rojos y vegetales en una arquitectura preparada para crecer sin convertir la navegación en una lista interminable." : "Citrus, Mediterranean, tropical, red-fruit and vegetable families in an architecture built to grow without turning navigation into an endless list."}</p><Link href={`/${locale}/raw-materials/fruit-concentrates`} className="button button--light">{es ? "Ver familias de concentrados" : "View concentrate families"}<Icon name="arrow" /></Link></div>
        </div>
      </section>

      <section className="section application-section">
        <div className="shell"><div className="section-heading"><div><p className="eyebrow">{es ? "Partir de la aplicación" : "Start with the application"}</p><h2>{es ? "La solución correcta empieza por las preguntas correctas." : "The right solution starts with the right questions."}</h2></div></div>
          <div className="process-grid">
            {[
              [es ? "Descubrir" : "Discover", es ? "Producto, proceso, mercado y objetivo comercial." : "Product, process, market and commercial objective."],
              [es ? "Definir" : "Define", es ? "Formato, compatibilidad, perfil y requisitos técnicos." : "Format, compatibility, profile and technical requirements."],
              [es ? "Coordinar" : "Coordinate", es ? "Origen, desarrollo, documentación y logística." : "Source, development, documentation and logistics."],
              [es ? "Acompañar" : "Support", es ? "Seguimiento comercial y técnico durante el proyecto." : "Commercial and technical follow-through during the project."]
            ].map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section world-section section-dark">
        <div className="shell world-grid">
          <div><p className="eyebrow eyebrow--lime">{es ? "Coordinación internacional" : "International coordination"}</p><h2>{es ? "Con base en Murcia y una mirada global." : "Based in Murcia. Built with a global outlook."}</h2><p>{es ? "Los materiales corporativos actuales de GFB identifican presencia en España, Türkiye y Dubái, y un modelo que conecta productores locales con necesidades internacionales." : "GFB's current corporate materials identify a presence in Spain, Türkiye and Dubai, with a model connecting local producers to international requirements."}</p><Link href={`/${locale}/about`} className="text-link text-link--light">{es ? "Conocer GFB" : "Meet GFB"}<Icon name="arrow" /></Link></div>
          <div className="location-map" aria-label={es ? "Presencia referenciada por GFB" : "Presence referenced by GFB"}><div className="map-grid" />{company.locations.map((location, index) => <div className={`location location--${index + 1}`} key={location}><i/><span>{location}</span></div>)}</div>
        </div>
      </section>

      <section className="section cta-section"><div className="shell cta-panel"><div><p className="eyebrow">{es ? "Hablemos de su proyecto" : "Let's discuss your project"}</p><h2>{es ? "Traiga el reto. Construyamos la ruta." : "Bring the challenge. We'll build the path."}</h2></div><Link href={`/${locale}/contact`} className="button button--dark">{copy.inquire}<Icon name="arrow" /></Link></div></section>
    </main>
  );
}
