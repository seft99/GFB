import { RevealList } from "@/components/home/reveal-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

/**
 * About GFB closing call to action. It keeps the shared `cta-section` / `cta-panel` markup, so
 * tablet and mobile match the CtaBand used on other pages; the desktop composition (≥ 1100px)
 * adds the supporting copy and two lime curves with a node, styled in app/styles/about-cta.css.
 */
export function AboutCta({ locale }: { locale: Locale }) {
  const { about, common } = getDictionary(locale);
  const copy = about.cta;

  return (
    <section className="section cta-section about-cta">
      {/*
        Each curve is drawn in a 789-unit-high box anchored to its own edge and scaled by the
        section height, so the left one stays clear of the copy and the node stays left of the
        button at any width.
      */}
      <svg className="about-cta__art about-cta__art--left" viewBox="0 0 700 789" aria-hidden="true" focusable="false">
        <path d="M0 316C40 520 170 640 330 680C480 715 590 720 690 800" />
      </svg>
      <svg
        className="about-cta__art about-cta__art--right"
        viewBox="1100 0 893 789"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M1993 0C1950 110 1840 160 1700 182C1580 202 1460 250 1398 322C1320 410 1300 560 1180 690" />
        <circle className="about-cta__halo" cx="1398" cy="322" r="22" />
        <circle className="about-cta__node" cx="1398" cy="322" r="11" />
      </svg>

      <RevealList as="div" className="shell cta-panel about-cta__panel">
        <div>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2>{copy.title}</h2>
          <p className="about-cta__text">{copy.text}</p>
        </div>
        <ButtonLink href={paths.page(locale, "contact")} variant="dark" className="about-cta__button">
          {common.inquire}
        </ButtonLink>
      </RevealList>
    </section>
  );
}
