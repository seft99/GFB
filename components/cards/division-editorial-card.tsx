import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import type { Division, DivisionId } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { paths } from "@/src/i18n/routes";
import { ordinal } from "@/src/lib/format";
import { cx } from "@/src/lib/cx";

/**
 * Lighter tints of the division accents, tuned for text and rules on the dark photo
 * gradient. The catalog accents stay as they are for light surfaces.
 */
const onDarkAccent: Record<DivisionId, string> = {
  "packaging-solutions": "#b8ef3b",
  "raw-materials": "#ffd26c",
  "flavours-aromas": "#77d9ff",
  "industrial-consulting": "#8aea9b"
};

type DivisionEditorialCardProps = {
  division: Division;
  locale: Locale;
  index: number;
  total: number;
  span: "wide" | "narrow";
  /** CSS object-position for the photo crop. */
  focus?: string;
  /** Card photo, when it should differ from the division hero. */
  image?: string;
  /** Card description, when it should differ from the division summary. */
  text?: string;
};

/** Full-bleed photo card for the homepage divisions grid; the whole card links to the division. */
export function DivisionEditorialCard({
  division,
  locale,
  index,
  total,
  span,
  focus,
  image,
  text
}: DivisionEditorialCardProps) {
  const [firstWord, ...rest] = division.title[locale].split(" ");

  return (
    <li
      className={cx("division-tile", `division-tile--${span}`)}
      style={{ "--accent": onDarkAccent[division.id] } as CSSProperties}
    >
      <Link href={paths.division(locale, division)} className="division-tile__link" data-parallax>
        <span className="division-tile__media" aria-hidden="true">
          <Image
            src={image ?? division.heroImage}
            alt=""
            fill
            // Cover-cropped into a 458px-tall card, the ~2.2:1 photo renders about 1040px wide.
            sizes="1040px"
            style={focus ? { objectPosition: focus } : undefined}
          />
        </span>
        <span className="division-tile__top" aria-hidden="true">
          <span className="division-tile__number">
            {ordinal(index)} / {ordinal(total - 1)}
          </span>
        </span>
        <span className="division-tile__bottom">
          <span className="division-tile__titleline">
            <span>
              <h3 className="division-tile__title">
                <span>{firstWord}</span> {rest.join(" ")}
              </h3>
              <p className="division-tile__text">{text ?? division.summary[locale]}</p>
            </span>
            <span className="division-tile__arrow" aria-hidden="true">
              <Icon name="arrow" strokeWidth={1.7} />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
