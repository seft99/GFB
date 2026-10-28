import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { CategoryCard } from "@/components/cards/category-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category, Division } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { ordinal } from "@/src/lib/format";
import { serviceCategoriesId } from "./service-hero";

type CardProps = { category: Category; href: string; index: number; locale: Locale };

/**
 * Photo for a showcase card (its own `showcase.card` derivative when set), or a neutral panel
 * with an icon when no relevant photo exists.
 */
function CardMedia({ category, sizes }: { category: Category; sizes: string }) {
  const { showcase } = category;
  if (showcase?.card) {
    return (
      <span className="showcase-card__media" aria-hidden="true">
        <Image
          src={showcase.card.image}
          alt=""
          fill
          sizes={sizes}
          style={showcase.card.focus ? { objectPosition: showcase.card.focus } : undefined}
        />
      </span>
    );
  }
  if (showcase?.placeholder) {
    return (
      <span className="showcase-card__media showcase-card__media--placeholder" aria-hidden="true">
        <Icon name={showcase.placeholder} strokeWidth={1.1} />
      </span>
    );
  }
  return (
    <span className="showcase-card__media" aria-hidden="true">
      <Image
        src={showcase?.image ?? category.image}
        alt=""
        fill
        sizes={sizes}
        style={showcase?.focus ? { objectPosition: showcase.focus } : undefined}
      />
    </span>
  );
}

/** First category: full-bleed photo with the copy over a navy gradient. */
function FeaturedCategoryCard({ category, href, index, locale }: CardProps) {
  const { common } = getDictionary(locale);
  return (
    <li className="showcase-card showcase-card--featured">
      <Link href={href} className="showcase-card__link">
        <CardMedia category={category} sizes="54vw" />
        <span className="showcase-card__body">
          <span className="showcase-card__number" aria-hidden="true">
            {ordinal(index)}
          </span>
          <h3 className="showcase-card__title">{category.title[locale]}</h3>
          <span className="showcase-card__text">{category.summary[locale]}</span>
          <span className="showcase-card__action" aria-hidden="true">
            <span className="showcase-card__arrow">
              <Icon name="arrow" strokeWidth={1.6} />
            </span>
            {common.learnMore}
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Other categories: photo on the left, copy and arrow on the right. */
function SecondaryCategoryCard({ category, href, index, locale }: CardProps) {
  return (
    <li className="showcase-card showcase-card--secondary">
      <Link href={href} className="showcase-card__link">
        <CardMedia category={category} sizes="20vw" />
        <span className="showcase-card__body">
          <span className="showcase-card__number" aria-hidden="true">
            {ordinal(index)}
          </span>
          <h3 className="showcase-card__title">{category.title[locale]}</h3>
          <span className="showcase-card__text">{category.summary[locale]}</span>
        </span>
        <span className="showcase-card__arrow" aria-hidden="true">
          <Icon name="arrow" strokeWidth={1.6} />
        </span>
      </Link>
    </li>
  );
}

/**
 * "Explore this area" on the four division pages. The desktop showcase (≥ 1100px, styled in
 * app/styles/division-showcase.css) puts the first category in a featured card and stacks the
 * others beside it; the stack adapts to the number of categories through `--secondary`. Below
 * 1100px the previous heading and category grid render unchanged. Only one variant is
 * displayed, so the hidden one's lazy images are never requested.
 */
export function DivisionCategoryShowcase({ division, locale }: { division: Division; locale: Locale }) {
  const { division: copy, common } = getDictionary(locale);
  const { showcase, categories } = division;
  const [featured, ...secondary] = categories;
  const href = (category: Category) => paths.category(locale, division, category);

  return (
    <section id={serviceCategoriesId} className="section category-section category-showcase">
      <div className="shell category-showcase__legacy">
        <SectionHeading eyebrow={copy.exploreEyebrow} title={copy.exploreTitle} />
        <div className="category-grid">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              href={href(category)}
              title={category.title[locale]}
              summary={category.summary[locale]}
              image={category.image}
              index={index}
              linkLabel={common.learnMore}
            />
          ))}
        </div>
      </div>

      <div className="category-showcase__desktop">
        <svg
          className="category-showcase__curves"
          viewBox="0 0 1672 941"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M1500 -10C1540 70 1590 120 1690 150" />
          <path d="M-10 840C20 815 40 805 70 800M330 870C350 900 365 920 385 950" />
        </svg>
        <div className="shell">
          <header className="category-showcase__intro">
            <div>
              <Eyebrow>{copy.exploreEyebrow}</Eyebrow>
              <h2>
                {showcase.before[locale]}{" "}
                <span className="category-showcase__highlight">{showcase.highlight[locale]}</span>
                {showcase.after[locale]}
              </h2>
            </div>
            <div className="category-showcase__aside">
              <p className="category-showcase__count">{showcase.countLabel[locale]}</p>
              <p>{showcase.text[locale]}</p>
            </div>
          </header>

          {featured && (
            <ul className="category-showcase__grid" style={{ "--secondary": secondary.length } as CSSProperties}>
              <FeaturedCategoryCard category={featured} href={href(featured)} index={0} locale={locale} />
              {secondary.map((category, index) => (
                <SecondaryCategoryCard
                  key={category.id}
                  category={category}
                  href={href(category)}
                  index={index + 1}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
