import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Division } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { paths } from "@/src/i18n/routes";
import { accentStyle, ordinal } from "@/src/lib/format";

type DivisionCardProps = { division: Division; locale: Locale; index: number; linkLabel: string };

export function DivisionCard({ division, locale, index, linkLabel }: DivisionCardProps) {
  return (
    <article className="division-card" style={accentStyle(division.accent)}>
      <div className="division-card__media">
        <Image src={division.heroImage} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
      </div>
      <div className="division-card__body">
        <div className="division-card__number" aria-hidden="true">
          {ordinal(index)}
        </div>
        <Eyebrow>{division.eyebrow[locale]}</Eyebrow>
        <h3>{division.title[locale]}</h3>
        <p>{division.summary[locale]}</p>
        <TextLink href={paths.division(locale, division)}>
          {linkLabel}
          <span className="visually-hidden">: {division.title[locale]}</span>
        </TextLink>
      </div>
    </article>
  );
}
