import { DivisionCard } from "@/components/cards/division-card";
import { DivisionEditorialCard } from "@/components/cards/division-editorial-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions } from "@/src/content/catalog";
import type { DivisionId } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { PointerParallaxList } from "./pointer-parallax-list";

/** Desktop bento layout: 7/5 then 5/7 columns, plus the photo crop for each card. */
const tiles: Record<DivisionId, { span: "wide" | "narrow"; focus?: string }> = {
  "packaging-solutions": { span: "wide", focus: "center 52%" },
  "raw-materials": { span: "narrow", focus: "center 46%" },
  "flavours-aromas": { span: "narrow", focus: "center 48%" },
  "industrial-consulting": { span: "wide" }
};

/**
 * Homepage divisions. The editorial bento grid is the desktop design (≥ 1100px); below
 * that the previous stacked cards are kept unchanged until the mobile redesign lands.
 * Only one variant is displayed at a time, so the other is out of the accessibility tree
 * and its lazy images are not requested.
 */
export function HomeDivisions({ locale }: { locale: Locale }) {
  const { home, common } = getDictionary(locale);
  const copy = home.solutions;

  return (
    <section id="solutions" className="section solutions-section divisions">
      <div className="divisions__legacy">
        <div className="shell">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} text={copy.text} />
        </div>
        <div className="shell division-list">
          {divisions.map((division, index) => (
            <DivisionCard
              key={division.id}
              division={division}
              locale={locale}
              index={index}
              linkLabel={common.viewDivision}
            />
          ))}
        </div>
      </div>

      <div className="divisions__bento">
        <p className="divisions__eyebrow">
          {copy.eyebrow} <span>/ {copy.eyebrowContext}</span>
        </p>
        <header className="divisions__intro">
          <h2 className="divisions__title">
            {copy.titleLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
            <span className="divisions__accent">{copy.titleAccent}</span>
          </h2>
          <div className="divisions__aside">
            <p>{copy.text}</p>
            <p className="divisions__tagline">{copy.tagline}</p>
          </div>
        </header>
        <p className="divisions__rail" aria-hidden="true">
          <span>{copy.explore}</span>
          <span>
            01 <i /> {String(divisions.length).padStart(2, "0")}
          </span>
        </p>
        <PointerParallaxList className="divisions__grid">
          {divisions.map((division, index) => (
            <DivisionEditorialCard
              key={division.id}
              division={division}
              locale={locale}
              index={index}
              total={divisions.length}
              {...tiles[division.id]}
            />
          ))}
        </PointerParallaxList>
        <p className="divisions__closing">
          <strong>GFB Solutions</strong> <i aria-hidden="true" /> {copy.closing}
        </p>
      </div>
    </section>
  );
}
