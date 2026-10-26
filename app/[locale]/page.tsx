import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeConnection } from "@/components/home/home-connection";
import { HomeCta } from "@/components/home/home-cta";
import { HomeDivisions } from "@/components/home/home-divisions";
import { HomeHero } from "@/components/home/home-hero";
import { HomeProcess } from "@/components/home/home-process";
import { HomeShowcase } from "@/components/home/home-showcase";
import { HomeWorld } from "@/components/home/home-world";
import { JsonLd } from "@/components/ui/json-ld";
import { isLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import { organizationSchema } from "@/src/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { home } = getDictionary(locale);
  return pageMetadata({
    locale,
    paths: localizedPaths(paths.home),
    title: home.metaTitle,
    description: home.metaDescription
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main id="main-content">
      <JsonLd data={organizationSchema()} />

      <HomeHero locale={locale} />

      <HomeConnection locale={locale} />

      <HomeDivisions locale={locale} />

      <HomeShowcase locale={locale} />

      <HomeProcess locale={locale} />

      <HomeWorld locale={locale} />

      <HomeCta locale={locale} />
    </main>
  );
}
