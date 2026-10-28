import Image, { getImageProps } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ArtDirectedImage } from "@/components/ui/art-directed-image";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import type { Category, Division } from "@/src/content/types";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { cx } from "@/src/lib/cx";

/** Ids of the category page sections the hero's secondary link can scroll to. */
export const categorySectionIds = { scope: "scope", families: "families" } as const;

type Panorama = NonNullable<Category["heroPanorama"]>;

/** Transparent pixel: the fallback of a desktop-only panorama, so smaller screens load nothing. */
const emptyPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Art direction through the image pipeline: from 1100px the browser loads the panoramic
 * photo at full width; below it the regular photo, exactly as before. Without a regular
 * photo (a placeholder category) nothing loads below 1100px.
 */
function PanoramaPicture({
  panorama,
  photo,
  sizes,
  focus
}: {
  panorama: Panorama;
  photo?: string;
  sizes: string;
  focus?: string;
}) {
  const {
    props: { srcSet: desktop }
  } = getImageProps({ src: panorama.image, alt: "", width: panorama.width, height: panorama.height, sizes: "100vw" });
  const { props } = photo
    ? getImageProps({ src: photo, alt: "", fill: true, priority: true, sizes })
    : {
        props: {
          src: emptyPixel,
          decoding: "async" as const,
          fetchPriority: "high" as const,
          style: { position: "absolute" as const, inset: 0, width: "100%", height: "100%" }
        }
      };
  return (
    <picture>
      <source media="(min-width: 1100px)" srcSet={desktop} sizes="100vw" />
      <img {...props} alt="" style={{ ...props.style, ...(focus ? { objectPosition: focus } : {}) }} />
    </picture>
  );
}

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
  const photo = category.showcase?.image ?? category.image;
  const photoSizes = "(max-width: 900px) 100vw, 64vw";
  const { heroPanorama: panorama, heroDesktop } = category;
  const sectionStyle = {
    ...(panorama ? { "--panorama-focus": panorama.focus } : {}),
    ...(heroDesktop?.focus ? { "--hero-desktop-focus": heroDesktop.focus } : {})
  } as CSSProperties;

  return (
    <section
      className={cx(
        "detail-hero detail-hero--editorial section-dark",
        panorama && "detail-hero--panorama",
        heroDesktop?.focus && "detail-hero--desktop-focus"
      )}
      style={panorama || heroDesktop?.focus ? sectionStyle : undefined}
    >
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
              {panorama && (
                <span className="detail-hero__photo detail-hero__photo--desktop">
                  <PanoramaPicture panorama={panorama} sizes={photoSizes} />
                </span>
              )}
            </div>
          ) : (
            <div className="detail-hero__image">
              <span className="detail-hero__photo">
                {panorama ? (
                  <PanoramaPicture panorama={panorama} photo={photo} sizes={photoSizes} focus={focus} />
                ) : heroDesktop?.image ? (
                  <ArtDirectedImage
                    alt=""
                    desktop={{ ...heroDesktop.image, sizes: "64vw" }}
                    mobile={{ src: photo, sizes: photoSizes }}
                    priority
                    style={focus ? { objectPosition: focus } : undefined}
                  />
                ) : (
                  <Image
                    src={photo}
                    alt=""
                    fill
                    priority
                    sizes={photoSizes}
                    style={focus ? { objectPosition: focus } : undefined}
                  />
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
