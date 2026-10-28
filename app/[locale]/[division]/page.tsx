import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/sections/cta-band";
import { DivisionCategoryShowcase } from "@/components/sections/division-category-showcase";
import { DivisionOverview } from "@/components/sections/division-overview";
import { ServiceHero } from "@/components/sections/service-hero";
import { divisions, getDivisionBySlug } from "@/src/content/catalog";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";
import "../../styles/service-hero.css";
import "../../styles/division-overview.css";
import "../../styles/division-showcase.css";

type Props = PageProps<"/[locale]/[division]">;

export function generateStaticParams() {
  return locales.flatMap((locale) => divisions.map((division) => ({ locale, division: division.slug[locale] })));
}

async function resolve(params: Props["params"]) {
  const { locale, division: slug } = await params;
  if (!isLocale(locale)) return null;
  const division = getDivisionBySlug(locale, slug);
  return division ? { locale, division } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, division } = resolved;
  return pageMetadata({
    locale,
    paths: localizedPaths((item) => paths.division(item, division)),
    title: division.title[locale],
    description: division.summary[locale]
  });
}

export default async function DivisionPage({ params }: Props) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, division } = resolved;
  const { division: copy, common } = getDictionary(locale);

  return (
    <main id="main-content">
      <ServiceHero division={division} locale={locale} />

      <DivisionOverview division={division} locale={locale} />

      <DivisionCategoryShowcase division={division} locale={locale} />

      <CtaBand
        variant="compact"
        tone="blue"
        eyebrow={copy.ctaEyebrow}
        title={division.ctaTitle[locale]}
        href={paths.contact(locale, { interest: division.id })}
        label={common.inquire}
      />
    </main>
  );
}
