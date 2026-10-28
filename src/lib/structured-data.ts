import { company } from "../content/company.ts";
import { absoluteUrl, siteOrigin } from "./metadata.ts";

/** Stable production identities reused across pages. */
export const organizationId = `${siteOrigin}/#organization`;
export const websiteId = `${siteOrigin}/#website`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: company.name,
    url: siteOrigin,
    logo: absoluteUrl("/brand/gfb-logo.png"),
    email: company.email,
    telephone: company.phonePrimary,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.locality,
      addressCountry: company.address.countryCode
    }
  };
}

export function websiteSchema(locale: "en" | "es") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: company.name,
    url: `${siteOrigin}/`,
    inLanguage: locale === "es" ? "es-ES" : "en-US",
    publisher: { "@id": organizationId }
  };
}

export type Crumb = { label: string; href?: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {})
    }))
  };
}

/** Serializes JSON-LD safely for inline `<script>` tags (prevents `</script>` breakouts). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
