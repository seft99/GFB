import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import ctaDroplet from "@/public/images/home/cta-droplet.webp";
import { paths } from "@/src/i18n/routes";
import { RevealList } from "./reveal-list";

/**
 * Homepage closing call to action. It keeps the shared `cta-section` / `cta-panel` markup, so
 * tablet and mobile match the CtaBand used on other pages; the desktop composition (≥ 1100px)
 * adds the pipette-and-droplet photograph on the right and a lime curve with its node above
 * it, styled in app/styles/home-cta.css.
 */
export function HomeCta({ locale }: { locale: Locale }) {
  const { home, common } = getDictionary(locale);
  const copy = home.cta;

  return (
    <section className="section cta-section home-cta">
      <div className="home-cta__photo" aria-hidden="true">
        <Image src={ctaDroplet} alt="" fill quality={90} placeholder="blur" sizes="(min-width: 1100px) 60vw, 1px" />
      </div>
      <svg
        className="home-cta__art"
        viewBox="0 0 2000 711"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        focusable="false"
      >
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
