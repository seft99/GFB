import Image from "next/image";
import Link from "next/link";
import type { Division, Locale } from "@/src/content/types";
import { ui } from "@/src/content/site-content";
import { Icon } from "./icon";

export function DivisionCard({ division, locale, index }: { division: Division; locale: Locale; index: number }) {
  return (
    <article className="division-card" style={{ "--accent": division.accent } as React.CSSProperties}>
      <div className="division-card__media"><Image src={division.heroImage} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
      <div className="division-card__body">
        <div className="division-card__number">0{index + 1}</div>
        <p className="eyebrow">{division.eyebrow[locale]}</p>
        <h3>{division.title[locale]}</h3>
        <p>{division.summary[locale]}</p>
        <Link className="text-link" href={`/${locale}/${division.slug}`}>{ui[locale].viewDivision}<Icon name="arrow" /></Link>
      </div>
    </article>
  );
}
