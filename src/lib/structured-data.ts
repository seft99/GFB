import { company } from "../content/company.ts";
import { absoluteUrl, siteOrigin } from "./metadata.ts";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: siteOrigin,
    logo: absoluteUrl("/brand/gfb-logo.avif"),
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
