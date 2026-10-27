import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import type { Category, Division } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

/** Ids of the category page sections the hero's secondary link can scroll to. */
export const categorySectionIds = { scope: "scope", families: "families" } as const;

type CategoryHeroProps = { division: Division; category: Category; locale: Locale; inquiryHref: string };

/**
 * Hero of the category detail pages (all four divisions). It keeps the `detail-hero` markup,
 * so below 1100px the existing dark layout from globals.css applies; on desktop the photo
 * becomes one continuous background behind the whole hero, with the copy over a white fade
 * on the left (app/styles/detail-hero.css). The photo is the category's showcase photo when it
 * has one (sharper and specific to the category), otherwise its page image, framed by
 * `heroFocus`; categories without a suitable photo show a neutral panel. The secondary link
 * goes to the product families when the page has them, otherwise to the scope section.
 */
export function CategoryHero({ division, category, locale, inquiryHref }: CategoryHeroProps) {
  const { category: copy, common } = getDictionary(locale);
  const secondary = category.groups
    ? { label: copy.familiesLink, target: categorySectionIds.families }
    : { label: (category.heroSecondary ?? division.detailSecondary)[locale], target: categorySectionIds.scope };
  const placeholder = category.showcase?.placeholder;
  const focus = category.heroFocus ?? category.showcase?.focus;

  return (
    <section className="detail-hero detail-hero--editorial section-dark">
      <div className="shell">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: division.title[locale], href: paths.division(locale, division) },
            { label: category.title[locale] }
          ]}
        />
        <div className="detail-hero__grid">
          <div className="detail-hero__copy">
            <Eyebrow onDark>{division.title[locale]}</Eyebrow>
            <h1>{category.title[locale]}</h1>
            <p>{category.summary[locale]}</p>
            <div className="detail-hero__actions">
              <ButtonLink href={inquiryHref} variant="lime" className="detail-hero__primary">
                {common.inquire}
              </ButtonLink>
              <Link href={`#${secondary.target}`} className="detail-hero__secondary">
                {secondary.label}
                <Icon name="arrow" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
          {placeholder ? (
            <div className="detail-hero__image detail-hero__image--placeholder" aria-hidden="true">
              <Icon name={placeholder} strokeWidth={1} />
            </div>
          ) : (
            <div className="detail-hero__image">
              <span className="detail-hero__photo">
                <Image
                  src={category.showcase?.image ?? category.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 64vw"
                  style={focus ? { objectPosition: focus } : undefined}
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
