import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon, type IconName } from "@/components/ui/icon";
import { getDivisionById } from "@/src/content/catalog";
import type { DivisionId } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

type DisciplineKey = keyof ReturnType<typeof getDictionary>["home"]["connection"]["disciplines"];

/** Reading order; on desktop the cards fill the corners around the hub in this order (TL, TR, BL, BR). */
const disciplines: { key: DisciplineKey; division: DivisionId; icon: IconName; image: string }[] = [
  { key: "packaging", division: "packaging-solutions", icon: "cube", image: "/images/packaging/can-detail.webp" },
  { key: "ingredients", division: "raw-materials", icon: "leaf", image: "/images/raw-materials/hero.avif" },
  { key: "flavours", division: "flavours-aromas", icon: "bars", image: "/images/flavours/beverage.avif" },
  {
    key: "consulting",
    division: "industrial-consulting",
    icon: "nodes",
    image: "/images/consulting/production-line.webp"
  }
];

/*
 * Network geometry in a 840 × 590 viewBox that matches the network's aspect ratio, so the
 * SVG and the percentage-positioned cards scale together. Cards are 310 × 194 in the
 * corners; the hub is centred at (420, 295) with its node ring at r = 130.
 */
const links: { discipline: DisciplineKey; d: string; from: [number, number]; to: [number, number] }[] = [
  { discipline: "packaging", d: "M310 80C360 80 388 120 388 169", from: [310, 80], to: [388, 169] },
  { discipline: "ingredients", d: "M530 80C480 80 452 120 452 169", from: [530, 80], to: [452, 169] },
  { discipline: "flavours", d: "M290 295C200 295 156 330 156 396", from: [290, 295], to: [156, 396] },
  { discipline: "consulting", d: "M550 295C640 295 684 330 684 396", from: [550, 295], to: [684, 396] },
  { discipline: "flavours", d: "M420 425C420 470 385 497 310 497", from: [420, 425], to: [310, 497] }
];

export function HomeConnection({ locale }: { locale: Locale }) {
  const { home } = getDictionary(locale);
  const copy = home.connection;

  return (
    <section className="connection" aria-labelledby="connection-title">
      <div className="connection__inner">
        <div className="connection__copy">
          <p className="connection__eyebrow">{copy.eyebrow}</p>
          <h2 id="connection-title" className="connection__title">
            <span className="connection__title-lead">{copy.titleLead}</span> {copy.title}{" "}
            <span className="connection__accent">{copy.titleAccent}</span>
          </h2>
          <p className="connection__text">{copy.text}</p>
          <div className="connection__actions">
            <ButtonLink
              href={paths.page(locale, "about")}
              variant="ghost"
              arrow={false}
              className="connection__button connection__button--outline"
            >
              {copy.approach}
            </ButtonLink>
          </div>
          <ul className="connection__indicators" aria-label={copy.indicatorsLabel}>
            {copy.indicators.map((indicator) => (
              <li key={indicator.label} className="connection__indicator">
                <strong>{indicator.value}</strong> <span>{indicator.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="connection__network">
          <svg className="connection__lines" viewBox="0 0 840 590" aria-hidden="true" focusable="false">
            <circle className="connection__orbit" cx="420" cy="295" r="500" />
            <circle className="connection__orbit connection__orbit--far" cx="560" cy="160" r="720" />
            <circle className="connection__ring connection__ring--halo" cx="420" cy="295" r="148" />
            <circle className="connection__ring" cx="420" cy="295" r="130" />
            {links.map((link) => (
              <g key={link.d} className="connection__link" data-link={link.discipline}>
                <path d={link.d} pathLength={1} />
                <circle className="connection__node" cx={link.from[0]} cy={link.from[1]} r="4.5" />
                <circle className="connection__node" cx={link.to[0]} cy={link.to[1]} r="4.5" />
              </g>
            ))}
          </svg>

          <div className="connection__hub">
            <Image src="/brand/gfb-logo.png" alt="GFB Solutions" width={187} height={77} />
          </div>

          <ul className="connection__cards" aria-label={copy.networkLabel}>
            {disciplines.map((discipline) => {
              const division = getDivisionById(discipline.division);
              if (!division) return null;
              const card = copy.disciplines[discipline.key];
              return (
                <li key={discipline.key} className="connection__card" data-discipline={discipline.key}>
                  <Link href={paths.division(locale, division)} className="connection__card-link">
                    <span className="connection__card-media" aria-hidden="true">
                      <Image
                        src={discipline.image}
                        alt=""
                        fill
                        // Rendered width of the cover-cropped photo in the card media area.
                        sizes="440px"
                      />
                    </span>
                    <span className="connection__card-icon">
                      <Icon name={discipline.icon} strokeWidth={1.6} />
                    </span>
                    <span className="connection__card-title">{card.title}</span>
                    <span className="connection__card-text">{card.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
