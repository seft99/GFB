import { DivisionCard } from "@/components/cards/division-card";
import { DivisionEditorialCard } from "@/components/cards/division-editorial-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions } from "@/src/content/catalog";
import type { DivisionId } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { PointerParallaxList } from "./pointer-parallax-list";

/**
 * Desktop bento layout: 7/5 then 5/7 columns, the photo crop for each card, and card photos
 * that differ from the division page heroes: a brand-free can detail for packaging (official
 * GFB site) and a bottling line for consulting (Wikimedia Commons, CC0), so each card shows
 * the area it opens.
 */
const tiles: Record<DivisionId, { span: "wide" | "narrow"; focus?: string; image?: string }> = {
  "packaging-solutions": { span: "wide", focus: "center 38%", image: "/images/packaging/can-detail.webp" },
  "raw-materials": { span: "narrow", focus: "center 46%" },
  "flavours-aromas": { span: "narrow", focus: "center 48%" },
  "industrial-consulting": { span: "wide", focus: "center 58%", image: "/images/consulting/production-line.webp" }
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
        <p className="divisions__eyebrow">{copy.eyebrow}</p>
        <header className="divisions__intro">
          <h2 className="divisions__title">{copy.title}</h2>
          <div className="divisions__aside">
            <p>{copy.text}</p>
          </div>
        </header>
        <PointerParallaxList className="divisions__grid">
          {divisions.map((division, index) => (
            <DivisionEditorialCard
              key={division.id}
              division={division}
              locale={locale}
              index={index}
              total={divisions.length}
              text={copy.cards[division.id]}
              {...tiles[division.id]}
            />
          ))}
        </PointerParallaxList>
      </div>
    </section>
  );
}
