import Image from "next/image";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Division } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";

/** Id of the category section each service hero CTA scrolls to. */
export const serviceCategoriesId = "categories";

/**
 * Hero of the four service (division) pages, driven by `division.hero` in the catalog. It
 * keeps the `page-hero` markup and classes, so below 1100px the existing full-bleed layout
 * from globals.css applies; the desktop composition (navy text area, photo on the right,
 * accent line inside the content, in-page CTA) is in app/styles/service-hero.css.
 */
export function ServiceHero({ division, locale }: { division: Division; locale: Locale }) {
  const { hero } = division;
  const style = {
    "--accent": division.accent,
    "--hero-focus": hero.focus,
    "--hero-media-offset": hero.mediaOffset ?? "0px"
  } as CSSProperties;

  return (
    <section className="page-hero service-hero section-dark" data-overlay={hero.overlay} style={style}>
      <div className="page-hero__image service-hero__media">
        {/* Decorative: the heading names the service. */}
        <Image src={hero.image} alt="" fill priority sizes="(max-width: 1099px) 100vw, 62vw" />
      </div>
      <div className="page-hero__overlay" />
      <div className="shell page-hero__content service-hero__content">
        <Breadcrumbs locale={locale} items={[{ label: division.title[locale] }]} />
        <Eyebrow onDark>{division.eyebrow[locale]}</Eyebrow>
        <div className="service-hero__message">
          <h1>{division.title[locale]}</h1>
          <p className="service-hero__text">{hero.text[locale]}</p>
        </div>
        <ButtonLink href={`#${serviceCategoriesId}`} variant="lime" className="service-hero__cta">
          {hero.cta[locale]}
        </ButtonLink>
      </div>
    </section>
  );
}
