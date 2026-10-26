import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { Icon } from "@/components/icon";
import { company, ui } from "@/src/content/site-content";
import { isLocale } from "@/src/lib/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<{ interest?: string; category?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, "/contact", locale === "es" ? "Contacto comercial" : "Commercial contact", locale === "es" ? "Comparta los requisitos de su proyecto con el equipo de GFB Solutions." : "Share your project requirements with the GFB Solutions team.");
}

export default async function ContactPage({ params, searchParams }: PageProps) {
  const { locale: value } = await params;
  const query = await searchParams;
  if (!isLocale(value)) notFound();
  const locale = value;
  const es = locale === "es";
  return (
    <main id="main-content" className="contact-page section-dark">
      <div className="shell contact-layout">
        <div className="contact-copy"><Breadcrumbs locale={locale} items={[{ label: ui[locale].contact }]} /><p className="eyebrow eyebrow--lime">{es ? "Consulta B2B" : "B2B inquiry"}</p><h1>{es ? "Hablemos de la aplicación, no solo del producto." : "Let's discuss the application, not just the product."}</h1><p className="lead">{es ? "Cuanto más contexto comparta, mejor podrá el equipo orientar la categoría, el formato y los próximos pasos." : "The more context you share, the better the team can guide category, format and next steps."}</p><div className="direct-contact"><a href={`mailto:${company.email}`}><Icon name="mail"/><span><small>Email</small>{company.email}</span></a><a href={`tel:${company.phonePrimary.replace(/\s/g, "")}`}><Icon name="phone"/><span><small>{es ? "Teléfono" : "Phone"}</small>{company.phonePrimary}</span></a><p><Icon name="pin"/><span><small>{es ? "Oficina" : "Office"}</small>{company.address}</span></p></div><p className="contact-note">{es ? "No se activan cookies analíticas ni de marketing en esta versión. Los datos del formulario se utilizarán únicamente para responder a la consulta, sujeto al aviso de privacidad aprobado." : "No analytics or marketing cookies are enabled in this version. Form data is intended only to respond to the inquiry, subject to the approved privacy notice."}</p></div>
        <div className="contact-form-panel"><div className="form-panel-heading"><span>{es ? "01 — Datos del proyecto" : "01 — Project details"}</span><p>{es ? "Los campos marcados con * son obligatorios." : "Fields marked * are required."}</p></div><ContactForm locale={locale} initialInterest={query.interest || ""} /></div>
      </div>
    </main>
  );
}
