import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { siteOrigin } from "@/src/lib/metadata";
import "../globals.css";
import "../styles/header.css";
import "../styles/footer.css";
import "../styles/home-hero.css";
import "../styles/home-connection.css";
import "../styles/home-divisions.css";
import "../styles/home-showcase.css";
import "../styles/home-process.css";
import "../styles/home-world.css";
import "../styles/home-cta.css";

// Humanist sans closest to the approved reference typography; self-hosted by next/font.
// Only the latin subset is preloaded (~60 KB). latin-ext (~290 KB) is still declared through
// unicode-range and downloads only when a page uses one of its characters.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-noto-sans"
});

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
    // Search engine ownership tags published by the legacy site (public values, kept so the
    // existing Search Console / Bing / Yandex properties stay verified after the cutover).
    verification: {
      google: "7PiVqg96_UzmbwwrXLGTOT9K7aiSCudnN4SN4TUAVLM",
      yandex: "b8ae05bb2eec23a5",
      other: { "msvalidate.01": "F483BC0C4330FDBD41BF5896267891F0" }
    },
    // Favicon: the circular GFB mark (cropped from the logo), not the full horizontal logo.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/brand/gfb-icon-32.png", type: "image/png", sizes: "32x32" },
        { url: "/brand/gfb-icon-192.png", type: "image/png", sizes: "192x192" }
      ],
      apple: { url: "/brand/apple-touch-icon.png", sizes: "180x180" }
    }
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { common } = getDictionary(locale);
  return (
    <html lang={locale} className={notoSans.variable} data-scroll-behavior="smooth">
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
