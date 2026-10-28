import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getDivisionById } from "@/src/content/catalog";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

/** Same GFB photograph as the concentrates category image, from its 1286 × 600 original. */
const featureImage = "/images/raw-materials/fruit-concentrates-juice.webp";

/**
 * Homepage "Portfolio discovery": the fruit-concentrate category, photo left and copy right.
 * The markup keeps the previous classes so the existing tablet/mobile styles still apply;
 * the desktop design lives in app/styles/home-showcase.css.
 */
export function HomeShowcase({ locale }: { locale: Locale }) {
  const { home } = getDictionary(locale);
  const copy = home.showcase;
  const rawMaterials = getDivisionById("raw-materials");
  const concentrates = rawMaterials?.categories.find((category) => category.id === "fruit-concentrates");
  if (!rawMaterials || !concentrates) return null;

  return (
    <section className="section showcase-section section-dark" aria-labelledby="showcase-title">
      <div className="shell showcase-grid">
        <div className="showcase-image">
          <Image src={featureImage} alt={copy.imageAlt} fill sizes="(max-width: 900px) 100vw, 54vw" />
        </div>
        <div className="showcase-copy">
          <Eyebrow onDark>{copy.eyebrow}</Eyebrow>
          <h2 id="showcase-title" className="showcase-title">
            {copy.titleLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
            <span className="showcase-title__accent">{copy.titleAccent}</span>
          </h2>
          <p>{copy.text}</p>
          <ButtonLink
            href={paths.category(locale, rawMaterials, concentrates)}
            variant="light"
            className="showcase-cta"
          >
            {copy.cta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
