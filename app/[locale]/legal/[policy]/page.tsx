import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { company } from "@/src/content/company";
import { isLocale, locales } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { findLegalPolicy, legalPolicies, localizedPaths, paths, type LegalPolicy } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";

type Props = PageProps<"/[locale]/legal/[policy]">;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    (Object.keys(legalPolicies) as LegalPolicy[]).map((policy) => ({ locale, policy: legalPolicies[policy][locale] }))
  );
}

async function resolve(params: Props["params"]) {
  const { locale, policy: slug } = await params;
  if (!isLocale(locale)) return null;
  const policy = findLegalPolicy(locale, slug);
  return policy ? { locale, policy } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, policy } = resolved;
  const { legal } = getDictionary(locale);
  return {
    ...pageMetadata({
      locale,
      paths: localizedPaths((item) => paths.legal(item, policy)),
      title: legal[policy].title,
      description: legal.metaDescription
    }),
    // Drafts stay out of search results until legal approval.
    robots: { index: false, follow: true }
  };
}

export default async function LegalPage({ params }: Props) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { locale, policy } = resolved;
  const { legal, common } = getDictionary(locale);
  const content = legal[policy];

  return (
    <main id="main-content" className="legal-page">
      <div className="shell legal-shell">
        <Breadcrumbs locale={locale} items={[{ label: content.title }]} />
        <p className="draft-badge">{common.legalDraft}</p>
        <h1>{content.title}</h1>
        <p className="lead">{legal.intro}</p>
        <h2>{content.heading}</h2>
        <p>{content.text}</p>
        <h2>{legal.contactHeading}</h2>
        <p>
          {legal.contactText} <a href={`mailto:${company.email}`}>{company.email}</a>.
        </p>
      </div>
    </main>
  );
}
