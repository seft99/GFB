import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon, type IconName } from "@/components/ui/icon";
import heroBackground from "@/public/images/home/hero-background.webp";
import { getDivisionById } from "@/src/content/catalog";
import type { DivisionId } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

type CalloutKey = keyof ReturnType<typeof getDictionary>["home"]["hero"]["callouts"];

/**
 * Callouts sit on the green arcs printed in the photograph. Coordinates are the circle
 * centre as a percentage of the photo (1584 × 993), so they track the image at any scale.
 */
const callouts: { key: CalloutKey; division: DivisionId; icon: IconName; x: number; y: number }[] = [
  { key: "packaging", division: "packaging-solutions", icon: "cube", x: 47.98, y: 16.62 },
  { key: "ingredients", division: "raw-materials", icon: "leaf", x: 82.07, y: 11.88 },
  { key: "flavours", division: "flavours-aromas", icon: "bars", x: 88.7, y: 24.97 },
  { key: "consulting", division: "industrial-consulting", icon: "nodes", x: 49.87, y: 84.39 }
];

const valueIcons: IconName[] = ["bars", "check", "globe"];

export function HomeHero({ locale }: { locale: Locale }) {
  const { home, common } = getDictionary(locale);
  const copy = home.hero;

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__media">
        <div className="home-hero__stage">
          <Image
            src={heroBackground}
            alt={copy.imageAlt}
            fill
            loading="eager"
            fetchPriority="high"
            placeholder="blur"
            sizes="(max-width: 899px) 155vw, (max-width: 1279px) 72vw, 100vw"
            className="home-hero__image"
          />
          <ul className="home-hero__callouts" aria-label={copy.calloutsLabel}>
            {callouts.map((callout) => {
              const division = getDivisionById(callout.division);
              if (!division) return null;
              const [first, second] = copy.callouts[callout.key];
              return (
                <li
                  key={callout.key}
                  className="home-hero__callout"
                  style={{ "--x": `${callout.x}%`, "--y": `${callout.y}%` } as CSSProperties}
                >
                  <Link href={paths.division(locale, division)} className="home-hero__callout-link">
                    <span className="home-hero__callout-ring">
                      <Icon name={callout.icon} strokeWidth={1.6} />
                    </span>
                    <span className="home-hero__callout-label">
                      {first}
                      <br />
                      {second}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="home-hero__inner shell-wide">
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">{copy.eyebrow}</p>
          <h1 id="home-hero-title" className="home-hero__title">
            {copy.title} <span className="home-hero__accent">{copy.titleAccent}</span>
          </h1>
          <p className="home-hero__intro">{copy.intro}</p>
          <div className="home-hero__actions">
            <ButtonLink href={paths.page(locale, "contact")} variant="lime" className="home-hero__button">
              {common.inquire}
            </ButtonLink>
            <ButtonLink
              href="#solutions"
              variant="ghost"
              arrow={false}
              className="home-hero__button home-hero__button--outline"
            >
              {common.explore}
            </ButtonLink>
          </div>
          <ul className="home-hero__values" aria-label={copy.valuesLabel}>
            {copy.values.map(([first, second], index) => (
              <li key={first} className="home-hero__value">
                <Icon name={valueIcons[index] ?? "check"} strokeWidth={1.4} />
                <span>
                  {first}
                  <br />
                  {second}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
