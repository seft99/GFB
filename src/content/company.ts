import type { LocalizedText } from "../i18n/config.ts";

export const company = {
  name: "GFB Solutions",
  email: "info@gfb-solutions.com",
  phonePrimary: "+34 659 38 21 46",
  phoneSecondary: "+34 868 99 22 58",
  address: {
    street: "Avda. Teniente Montesinos 8, Torre Z, Planta 4, Izquierda",
    postalCode: "30100",
    locality: "Murcia",
    countryCode: "ES",
    country: { en: "Spain", es: "España" } satisfies LocalizedText
  },
  locations: [
    { en: "Spain", es: "España" },
    { en: "Türkiye", es: "Türkiye" },
    { en: "Dubai", es: "Dubái" }
  ] satisfies LocalizedText[]
};

export function formatAddress(locale: keyof LocalizedText) {
  const { street, postalCode, locality, country } = company.address;
  return `${street}, ${postalCode} ${locality}, ${country[locale]}`;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}
