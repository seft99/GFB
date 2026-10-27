import { RevealList } from "@/components/home/reveal-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";

type ClosingCtaProps = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  label: string;
};

/**
 * Closing call to action of Home and About. It keeps the shared `cta-section` / `cta-panel`
 * markup, so tablet and mobile match the CtaBand used on other pages; the desktop composition
 * (≥ 1100px) adds the supporting copy and one lime curve with a node, styled in
 * app/styles/closing-cta.css.
 */
export function ClosingCta({ eyebrow, title, text, href, label }: ClosingCtaProps) {
  return (
    <section className="section cta-section closing-cta">
      {/*
        The curve is drawn in a 789-unit-high box scaled by the section height and set in
        from the right edge, so its node stays clear of the button at any width.
      */}
      <svg
        className="closing-cta__art closing-cta__art--right"
        viewBox="1100 0 893 789"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M1993 0C1950 110 1840 160 1700 182C1580 202 1460 250 1398 322C1320 410 1300 560 1180 690" />
        <circle className="closing-cta__halo" cx="1398" cy="322" r="22" />
        <circle className="closing-cta__node" cx="1398" cy="322" r="11" />
      </svg>

      <RevealList as="div" className="shell cta-panel closing-cta__panel">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2>{title}</h2>
          <p className="closing-cta__text">{text}</p>
        </div>
        <ButtonLink href={href} variant="dark" className="closing-cta__button">
          {label}
        </ButtonLink>
      </RevealList>
    </section>
  );
}
