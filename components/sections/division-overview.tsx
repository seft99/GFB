import type { CSSProperties } from "react";
import { RevealList } from "@/components/home/reveal-list";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import type { Division } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { ordinal } from "@/src/lib/format";

/**
 * Overview of the four division pages, driven by `division.overview` in the catalog (headline,
 * highlighted ending, framework label and criteria) plus the division description. The intro keeps the `split-intro` markup, so below 1100px it
 * renders as before; the criteria row, highlight colour and decoration are the desktop design
 * in app/styles/division-overview.css. Criteria are informational, not links.
 */
export function DivisionOverview({ division, locale }: { division: Division; locale: Locale }) {
  const { division: copy } = getDictionary(locale);
  const { overview } = division;

  return (
    <section
      className="section division-intro division-overview"
      aria-labelledby={`overview-title-${division.id}`}
      style={{ "--criteria": overview.criteria.length } as CSSProperties}
    >
      <svg
        className="division-overview__curves"
        viewBox="0 0 1672 773"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M-10 365C80 420 135 520 142 773" />
        <path d="M1672 327C1560 350 1450 420 1388 520" />
      </svg>

      <div className="shell split-intro">
        <div>
          <Eyebrow>{copy.overviewEyebrow}</Eyebrow>
          <h2 id={`overview-title-${division.id}`}>
            {overview.title[locale]} <span className="division-overview__highlight">{overview.highlight[locale]}</span>
          </h2>
        </div>
        <div>
          <p className="lead">{division.description[locale]}</p>
        </div>
      </div>

      <div className="shell division-overview__framework">
        <p className="division-overview__label" id={`overview-framework-${division.id}`}>
          {overview.frameworkLabel[locale]}
        </p>
        <RevealList as="ol" className="division-overview__criteria" labelledBy={`overview-framework-${division.id}`}>
          {overview.criteria.map((criterion, index) => (
            <li key={criterion.id} style={{ "--i": index } as CSSProperties}>
              <span className="division-overview__icon" aria-hidden="true">
                <Icon name={criterion.icon} strokeWidth={1.5} />
              </span>
              <span className="division-overview__number" aria-hidden="true">
                {ordinal(index)}
              </span>
              <h3>{criterion.title[locale]}</h3>
              <p>{criterion.text[locale]}</p>
            </li>
          ))}
        </RevealList>
      </div>
    </section>
  );
}
