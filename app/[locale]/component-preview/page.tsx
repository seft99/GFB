import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductResourceSection } from "@/components/sections/product-resources/product-resource-section";
import { isLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { componentPreviewEnabled, resourcePreviews } from "@/src/migration/resource-previews";

type Props = PageProps<"/[locale]/component-preview">;

/**
 * Development-only preview of the product-resource variants (`compact-groups`, `visual-cards`)
 * with real catalogue data. It answers 404 unless the server runs `next dev` or was started
 * with GFB_COMPONENT_PREVIEW=1 (the e2e server does); it is never linked, listed in a sitemap
 * or indexed. It does not assign a variant to any category page.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { resources } = getDictionary(locale);
  return {
    title: resources.previewTitle,
    description: resources.previewMeta,
    robots: { index: false, follow: false }
  };
}

export default async function ComponentPreviewPage({ params }: Props) {
  // Evaluated per request, so a production deployment without the flag never serves it.
  await connection();
  if (!componentPreviewEnabled()) notFound();
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { resources } = getDictionary(locale);

  return (
    <main id="main-content">
      <header className="shell" style={{ paddingBlock: "calc(var(--header-h) + 3rem) 1rem", maxWidth: "80rem" }}>
        <p className="eyebrow">{resources.previewEyebrow}</p>
        <h1 style={{ margin: 0, color: "var(--brand-ink)", fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
          {resources.previewTitle}
        </h1>
        <p style={{ maxWidth: "46rem", color: "#5b6377", lineHeight: 1.55 }}>{resources.previewText}</p>
      </header>
      {resourcePreviews(locale).map((config) => (
        <div key={config.id} data-preview={config.id}>
          <p className="shell" style={{ maxWidth: "80rem", margin: "2.5rem auto 0", color: "#5b6377" }}>
            <strong>{resources.previewVariant}:</strong> <code>{config.variant}</code> · <code>{config.id}</code>
          </p>
          <ProductResourceSection config={config} locale={locale} />
        </div>
      ))}
    </main>
  );
}
