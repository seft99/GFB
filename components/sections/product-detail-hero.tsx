import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/src/i18n/config";
import type { Crumb } from "@/src/lib/structured-data";
import "../../app/styles/product-detail-hero.css";

export type ProductHeroVariant = "product" | "technical-document";

export type ProductHeroConfig = {
  variant: ProductHeroVariant;
  eyebrow: string;
  title: string;
  description?: string;
  /** Trail after "Home"; the last item is the current page. */
  breadcrumbs: Crumb[];
  image?: { src: string; alt: string; objectPosition?: string };
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  /** Small editorial identifier under the actions, e.g. "Product / Citrus". */
  identifier?: string;
};

/** Title length classes keep long technical names inside the editorial column. */
const titleSize = (title: string) => (title.length > 46 ? "is-xlong" : title.length > 24 ? "is-long" : "");

/**
 * Hero of every product-detail page (app/[locale]/legacy/[key]): breadcrumbs, family eyebrow,
 * display title, short description and the inquiry / back actions on the left, the product
 * photograph inside a large arc on the right with thin lime curves. Without a photograph the arc
 * becomes a soft neutral panel; the `technical-document` variant is more compact and uses a
 * technical grid instead of photography. Server-rendered; motion is CSS only.
 */
export function ProductDetailHero({ config, locale }: { config: ProductHeroConfig; locale: Locale }) {
  const { variant, image } = config;
  return (
    <section
      className={["product-hero", `product-hero--${variant}`, image ? "has-image" : "no-image", titleSize(config.title)]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="product-hero__media">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1100px) 55vw, 100vw"
            loading="eager"
            fetchPriority="high"
            quality={90}
            style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
          />
        ) : (
          <span className="product-hero__panel" aria-hidden="true" />
        )}
        <svg
          className="product-hero__curves"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M50 340 C 260 230 520 150 780 0" />
          <path d="M330 260 C 520 225 690 230 860 300" />
          <path d="M780 800 C 860 735 930 695 1000 675" />
        </svg>
      </div>

      <div className="shell product-hero__inner">
        <div className="product-hero__copy">
          <Breadcrumbs locale={locale} items={config.breadcrumbs} />
          <p className="product-hero__eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          {config.description && <p className="product-hero__lead">{config.description}</p>}
          <div className="product-hero__actions">
            <ButtonLink href={config.primaryAction.href} variant="dark" className="product-hero__primary">
              {config.primaryAction.label}
            </ButtonLink>
            <Link href={config.secondaryAction.href} className="product-hero__secondary">
              {config.secondaryAction.label}
              <Icon name="arrow" strokeWidth={1.8} />
            </Link>
          </div>
          {config.identifier && <p className="product-hero__identifier">{config.identifier}</p>}
        </div>
      </div>
    </section>
  );
}
