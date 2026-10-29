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
  /** `label` is visible (short); `accessibleName` names the full destination. */
  secondaryAction: { label: string; href: string; accessibleName?: string };
  /** Small editorial identifier under the actions, e.g. "Product / Citrus". */
  identifier?: string;
};

/** Title length classes keep long technical names inside the editorial column. */
const titleSize = (title: string) => (title.length > 46 ? "is-xlong" : title.length > 24 ? "is-long" : "");

/**
 * The published H1 is the page identity (checked by scripts/verify-seo-migration.mjs) and is
 * rendered verbatim. When it also carries a code or format (lines after the first, as in
 * "Slim can / D53 mm / 200# cap/lid", or the part after " / " in "52mm (202) Dia ISE Aluminium
 * End / SOT - Large Aperture (Botcherby)"), that part is shown as a smaller second line:
 * product name first, code below, same text content.
 */
function splitTitle(title: string): { name: string; separator?: string; code?: string } {
  const newline = title.indexOf("\n");
  if (newline > 0) return { name: title.slice(0, newline), separator: "\n", code: title.slice(newline + 1) };
  const slash = title.indexOf(" / ");
  if (slash > 0) return { name: title.slice(0, slash), separator: " / ", code: title.slice(slash + 3) };
  return { name: title };
}

/**
 * Hero of every product-detail page (app/[locale]/legacy/[key]): breadcrumbs, family eyebrow,
 * display title, short description and the inquiry / back actions on the left, the product
 * photograph inside a large arc on the right with thin lime curves. Without a photograph the arc
 * becomes a soft neutral panel; the `technical-document` variant is more compact and uses a
 * technical grid instead of photography. Server-rendered; motion is CSS only.
 */
export function ProductDetailHero({ config, locale }: { config: ProductHeroConfig; locale: Locale }) {
  const { variant, image } = config;
  const title = splitTitle(config.title);
  return (
    <section
      className={["product-hero", `product-hero--${variant}`, image ? "has-image" : "no-image", titleSize(title.name)]
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
          <h1>
            {title.name}
            {title.code && (
              <>
                <span className="visually-hidden">{title.separator}</span>
                <span className="product-hero__code">{title.code}</span>
              </>
            )}
          </h1>
          {config.description && <p className="product-hero__lead">{config.description}</p>}
          <div className="product-hero__actions">
            <ButtonLink href={config.primaryAction.href} variant="dark" className="product-hero__primary">
              {config.primaryAction.label}
            </ButtonLink>
            <Link
              href={config.secondaryAction.href}
              className="product-hero__secondary"
              aria-label={config.secondaryAction.accessibleName}
            >
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
