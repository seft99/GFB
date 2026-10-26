import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DivisionCard } from "@/components/cards/division-card";
import { CtaBand } from "@/components/sections/cta-band";
import { ButtonLink, TextLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { divisions, getDivisionById } from "@/src/content/catalog";
import { company } from "@/src/content/company";
import { isLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { ordinal } from "@/src/lib/format";
import { pageMetadata } from "@/src/lib/metadata";
import { organizationSchema } from "@/src/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { home } = getDictionary(locale);
  return pageMetadata({
    locale,
    paths: localizedPaths(paths.home),
    title: home.metaTitle,
    description: home.metaDescription
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { home, common } = getDictionary(locale);
  const rawMaterials = getDivisionById("raw-materials");
  const concentrates = rawMaterials?.categories.find((category) => category.id === "fruit-concentrates");

  return (
    <main id="main-content">
      <JsonLd data={organizationSchema()} />

      <section className="hero section-dark">
        <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <Eyebrow onDark>{home.hero.eyebrow}</Eyebrow>
            <h1>
              {home.hero.title}
              <br />
              <em>{home.hero.titleAccent}</em>
            </h1>
            <p className="hero-intro">{home.hero.intro}</p>
            <div className="button-row">
              <ButtonLink href={paths.page(locale, "contact")} variant="lime">
                {common.inquire}
              </ButtonLink>
              <ButtonLink href="#solutions" variant="ghost" arrow={false}>
                {common.explore}
              </ButtonLink>
            </div>
          </div>
          <div className="hero-visual" role="img" aria-label={home.hero.visualLabel}>
            <div className="hero-image hero-image--main">
              <Image
                src="/images/home/food-industry.avif"
                alt={home.hero.mainImageAlt}
                fill
                priority
                sizes="(max-width: 900px) 92vw, 45vw"
              />
            </div>
            <div className="hero-image hero-image--secondary">
              <Image
                src="/images/packaging/cans.avif"
                alt={home.hero.secondaryImageAlt}
                fill
                sizes="(max-width: 900px) 45vw, 18vw"
              />
            </div>
            <div className="hero-index">
              <strong>{String(divisions.length).padStart(2, "0")}</strong>
              <span>{home.hero.indexLabel}</span>
            </div>
          </div>
        </div>
        <div className="capability-rail">
          <ul aria-label={home.capabilitiesLabel}>
            {divisions.map((division) => (
              <li key={division.id}>
                {division.shortTitle[locale]}
                <i aria-hidden="true">✦</i>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section intro-section">
        <div className="shell split-intro">
          <div>
            <Eyebrow>{home.intro.eyebrow}</Eyebrow>
            <h2>{home.intro.title}</h2>
          </div>
          <div>
            <p className="lead">{home.intro.lead}</p>
            <p>{home.intro.body}</p>
          </div>
        </div>
      </section>

      <section id="solutions" className="section solutions-section">
        <div className="shell">
          <SectionHeading eyebrow={home.solutions.eyebrow} title={home.solutions.title} text={home.solutions.text} />
        </div>
        <div className="shell division-list">
          {divisions.map((division, index) => (
            <DivisionCard
              key={division.id}
              division={division}
              locale={locale}
              index={index}
              linkLabel={common.viewDivision}
            />
          ))}
        </div>
      </section>

      {rawMaterials && concentrates && (
        <section className="section showcase-section section-dark">
          <div className="shell showcase-grid">
            <div className="showcase-image">
              <Image
                src={concentrates.image}
                alt={home.showcase.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </div>
            <div className="showcase-copy">
              <Eyebrow onDark>{home.showcase.eyebrow}</Eyebrow>
              <h2>{home.showcase.title}</h2>
              <p>{home.showcase.text}</p>
              <ButtonLink href={paths.category(locale, rawMaterials, concentrates)} variant="light">
                {home.showcase.cta}
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      <section className="section application-section">
        <div className="shell">
          <SectionHeading eyebrow={home.process.eyebrow} title={home.process.title} />
          <ol className="process-grid">
            {home.process.steps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">{ordinal(index)}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section world-section section-dark">
        <div className="shell world-grid">
          <div>
            <Eyebrow onDark>{home.world.eyebrow}</Eyebrow>
            <h2>{home.world.title}</h2>
            <p>{home.world.text}</p>
            <TextLink href={paths.page(locale, "about")} tone="light">
              {home.world.cta}
            </TextLink>
          </div>
          <div className="location-map" aria-label={home.world.mapLabel} role="group">
            <div className="map-grid" aria-hidden="true" />
            {company.locations.map((location, index) => (
              <div className={`location location--${index + 1}`} key={location.en}>
                <i />
                <span>{location[locale]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={home.cta.eyebrow}
        title={home.cta.title}
        href={paths.page(locale, "contact")}
        label={common.inquire}
      />
    </main>
  );
}
