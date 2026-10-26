import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { siteOrigin } from "@/src/lib/metadata";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getDictionary(locale);
  return {
    metadataBase: new URL(siteOrigin),
    title: { default: meta.siteTitle, template: "%s | GFB Solutions" },
    description: meta.siteDescription,
    applicationName: "GFB Solutions",
    icons: { icon: "/brand/gfb-logo.avif" }
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { common } = getDictionary(locale);
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          {common.skipToContent}
        </a>
        <SiteHeader locale={locale} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
