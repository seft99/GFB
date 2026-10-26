import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { company, ui } from "@/src/content/site-content";
import { isLocale } from "@/src/lib/i18n";
import { pageMetadata } from "@/src/lib/metadata";

type PageProps = { params: Promise<{ locale: string; policy: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, policy } = await params;
  if (!isLocale(locale) || !["privacy", "cookies"].includes(policy)) return {};
  const title = policy === "privacy" ? (locale === "es" ? "Privacidad" : "Privacy") : "Cookies";
  return pageMetadata(locale, `/legal/${policy}`, title, locale === "es" ? "Borrador informativo pendiente de aprobación legal." : "Informational draft pending legal approval.");
}

export default async function LegalPage({ params }: PageProps) {
  const { locale: value, policy } = await params;
  if (!isLocale(value) || !["privacy", "cookies"].includes(policy)) notFound();
  const locale = value;
  const es = locale === "es";
  const privacy = policy === "privacy";
  const title = privacy ? (es ? "Privacidad" : "Privacy") : "Cookies";
  return <main id="main-content" className="legal-page"><div className="shell legal-shell"><Breadcrumbs locale={locale} items={[{ label: title }]} /><p className="draft-badge">{ui[locale].legalDraft}</p><h1>{title}</h1><p className="lead">{es ? "Esta página es un borrador técnico para revisión por el responsable legal de GFB y no sustituye un aviso jurídico aprobado." : "This page is a technical draft for review by GFB's legal owner and does not replace an approved legal notice."}</p>{privacy ? <><h2>{es ? "Datos tratados" : "Data handled"}</h2><p>{es ? "El formulario solicita nombre, empresa, email corporativo y detalles voluntarios del proyecto. La finalidad prevista es responder a la consulta comercial. La base jurídica, los periodos de conservación, los destinatarios y los derechos del interesado deben ser confirmados por asesoría legal antes de producción." : "The form requests name, company, business email and voluntary project details. Its intended purpose is to respond to the commercial inquiry. Legal basis, retention periods, recipients and data-subject rights must be confirmed by legal counsel before production."}</p></> : <><h2>{es ? "Estado de medición" : "Measurement status"}</h2><p>{es ? "Esta implementación no activa analítica, publicidad ni cookies no esenciales. Cualquier herramienta futura de medición debe incorporarse detrás de un mecanismo de consentimiento aprobado." : "This implementation does not enable analytics, advertising or non-essential cookies. Any future measurement tool must be placed behind an approved consent mechanism."}</p></>}<h2>{es ? "Contacto" : "Contact"}</h2><p>{es ? "Las solicitudes relacionadas con privacidad deben dirigirse a" : "Privacy-related requests should be directed to"} <a href={`mailto:${company.email}`}>{company.email}</a>.</p></div></main>;
}
