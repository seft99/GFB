import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CtaBand } from "@/components/sections/cta-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { company } from "@/src/content/company";
import { isLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { ordinal } from "@/src/lib/format";
import { pageMetadata } from "@/src/lib/metadata";
import "../../styles/about-hero.css";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { about } = getDictionary(locale);
  return pageMetadata({
    locale,
    paths: localizedPaths((item) => paths.page(item, "about")),
    title: about.metaTitle,
    description: about.metaDescription
  });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { about, common } = getDictionary(locale);

  return (
    <main id="main-content">
      {/*
        Below 1100px the hero keeps its dark layout from globals.css; the light editorial
        desktop design, the photo, trust row and orbit are in app/styles/about-hero.css.
      */}
      <section className="about-hero section-dark">
        <div className="shell">
          <Breadcrumbs locale={locale} items={[{ label: common.about }]} />
          <div className="about-hero__grid">
            <div className="about-hero__copy">
              <Eyebrow onDark>{about.hero.eyebrow}</Eyebrow>
              <h1>
                {about.hero.title} <span className="about-hero__accent">{about.hero.titleAccent}</span>
              </h1>
            </div>
            <p className="lead">{about.hero.lead}</p>
            <ul className="about-hero__trust" aria-label={about.hero.trustLabel}>
              {about.hero.trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="about-hero__media">
              <svg className="about-hero__orbit" viewBox="0 0 888 556" aria-hidden="true" focusable="false">
                <circle cx="535" cy="413" r="465" />
                <path d="M902 83C930 98 950 118 975 150" />
                <circle className="about-hero__node" cx="902" cy="83" r="10" />
              </svg>
              <div className="about-hero__photo">
                {/* Hidden below 1100px, so it stays lazy; high priority as the desktop LCP. */}
                <Image
                  src="/images/packaging/hero.avif"
                  alt={about.hero.imageAlt}
                  fill
                  fetchPriority="high"
                  sizes="72vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section story-section">
        <div className="shell story-grid">
          <div className="story-image">
            <Image
              src="/images/home/global-sourcing.avif"
              alt={about.story.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
          <div>
            <Eyebrow>{about.story.eyebrow}</Eyebrow>
            <h2>{about.story.title}</h2>
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section mission-section">
        <div className="shell mission-grid">
          {[about.mission, about.vision].map((item, index) => (
            <article key={item.eyebrow}>
              <span aria-hidden="true">{ordinal(index)}</span>
              <Eyebrow>{item.eyebrow}</Eyebrow>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section presence-section section-dark">
        <div className="shell">
          <Eyebrow onDark>{about.presence.eyebrow}</Eyebrow>
          <div className="presence-heading">
            <h2>{about.presence.title}</h2>
            <p>{about.presence.text}</p>
          </div>
          <ul className="presence-list">
            {company.locations.map((location, index) => (
              <li key={location.en}>
                <span aria-hidden="true">{ordinal(index)}</span>
                <strong>{location[locale]}</strong>
                {index === 0 && <small>{about.presence.headquarters}</small>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        eyebrow={about.cta.eyebrow}
        title={about.cta.title}
        href={paths.page(locale, "contact")}
        label={common.inquire}
      />
    </main>
  );
}
