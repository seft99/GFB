import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { RevealList } from "./reveal-list";

const ripples = [70, 150, 245, 350, 470];

/**
 * Homepage closing call to action. It keeps the shared `cta-section` / `cta-panel` markup, so
 * tablet and mobile match the CtaBand used on other pages; the desktop composition (≥ 1100px)
 * adds a liquid-surface artwork drawn in SVG, styled in app/styles/home-cta.css.
 *
 * The approved design uses a pipette-and-droplet photograph; until that original asset is
 * supplied, the artwork stands in for it with light and ripples on a liquid surface only.
 */
export function HomeCta({ locale }: { locale: Locale }) {
  const { home, common } = getDictionary(locale);
  const copy = home.cta;

  return (
    <section className="section cta-section home-cta">
      <svg
        className="home-cta__art"
        viewBox="0 0 2000 711"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="home-cta-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#0b3fb8" stopOpacity="0.85" />
            <stop offset="0.7" stopColor="#164fcc" stopOpacity="0.55" />
            <stop offset="1" stopColor="#2569e8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="home-cta-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="home-cta__pool" cx="1660" cy="560" rx="720" ry="230" fill="url(#home-cta-pool)" />
        <g className="home-cta__ripples">
          {ripples.map((rx, index) => (
            <ellipse key={rx} cx="1665" cy="545" rx={rx} ry={rx * 0.21} style={{ opacity: 0.55 - index * 0.09 }} />
          ))}
        </g>
        <ellipse cx="1665" cy="540" rx="190" ry="34" fill="url(#home-cta-glow)" />
        <path className="home-cta__curve" d="M1190 0C1240 230 1330 300 1410 325S1880 430 2000 700" />
        <circle className="home-cta__node" cx="1410" cy="325" r="15" />
      </svg>

      <RevealList as="div" className="shell cta-panel home-cta__panel">
        <div>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2>{copy.title}</h2>
        </div>
        <ButtonLink href={paths.page(locale, "contact")} variant="dark" className="home-cta__button">
          {common.inquire}
        </ButtonLink>
      </RevealList>
    </section>
  );
}
