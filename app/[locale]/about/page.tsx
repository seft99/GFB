import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AboutCta } from "@/components/about/about-cta";
import { AboutPresence } from "@/components/about/about-presence";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RevealList } from "@/components/home/reveal-list";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon, type IconName } from "@/components/ui/icon";
import { isLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { ordinal } from "@/src/lib/format";
import { pageMetadata } from "@/src/lib/metadata";
import "../../styles/about-hero.css";
import "../../styles/about-story.css";
import "../../styles/about-mission.css";
import "../../styles/about-presence.css";
import "../../styles/about-cta.css";

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
  // Decorative curve and node per card, drawn in a 733 × 472 box anchored to its lower
  // outer corner, so a taller card moves its copy away from the curve, never onto it.
  const missionCards: { item: typeof about.mission; icon: IconName; curve: string; node: [number, number] }[] = [
    {
      item: about.mission,
      icon: "target",
      curve: "M-4 396C60 440 170 452 277 446C370 441 470 450 545 476",
      node: [277, 446]
    },
    {
      item: about.vision,
      icon: "growth",
      curve: "M737 262C716 290 704 306 692 330C670 400 600 460 380 482",
      node: [692, 330]
    }
  ];

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

      {/*
        Below 1100px the section keeps its light layout from globals.css; the dark editorial
        desktop design, brand lines and contact callout are in app/styles/about-story.css.
      */}
      <section className="section story-section">
        <svg
          className="story-section__lines"
          viewBox="0 0 1672 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M830 0C868 48 918 88 978 100C1120 128 1310 128 1460 196C1560 242 1630 286 1700 344" />
          <path d="M-20 616C110 700 270 820 430 920" />
          <circle className="story-section__halo" cx="978" cy="100" r="17" />
          <circle className="story-section__node" cx="978" cy="100" r="10" />
        </svg>
        <div className="shell story-grid">
          <div className="story-image">
            <Image
              src="/images/home/global-sourcing.avif"
              alt={about.story.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, (max-width: 1099px) 50vw, 52vw"
            />
          </div>
          <div className="story-copy">
            <Eyebrow>{about.story.eyebrow}</Eyebrow>
            <h2>
              {about.story.titleLines.map((line, index) => (
                <span key={line} className={index === about.story.titleAccent ? "story-section__accent" : undefined}>
                  {line}{" "}
                </span>
              ))}
            </h2>
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="story-section__contact">
              <span className="story-section__contact-node" aria-hidden="true" />
              <span className="story-section__contact-label">{about.story.contact}</span>
            </p>
          </div>
        </div>
      </section>

      {/*
        Below 1100px the cards keep their layout from globals.css; the intro, icons, brand
        curves and the desktop card design are in app/styles/about-mission.css.
      */}
      <section className="section mission-section">
        <svg
          className="mission-section__lines"
          viewBox="0 0 1672 941"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M1422 -10C1370 70 1320 130 1258 156C1130 210 1000 250 936 362" />
          <circle className="mission-section__halo" cx="1258" cy="156" r="15" />
          <circle className="mission-section__node" cx="1258" cy="156" r="8.5" />
        </svg>
        <div className="shell mission-shell">
          <header className="mission-intro">
            <Eyebrow>{about.purpose.eyebrow}</Eyebrow>
            <h2>
              <span>{about.purpose.title}</span> <span>{about.purpose.titleMuted}</span>
            </h2>
          </header>
          <RevealList as="div" className="mission-grid">
            {missionCards.map(({ item, icon, curve, node }, index) => (
              <article key={item.eyebrow}>
                <svg
                  className="mission-card__curve"
                  viewBox="0 0 733 472"
                  preserveAspectRatio={index === 0 ? "xMinYMax slice" : "xMaxYMax slice"}
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d={curve} />
                  <circle className="mission-card__halo" cx={node[0]} cy={node[1]} r="14" />
                  <circle className="mission-card__node" cx={node[0]} cy={node[1]} r="8" />
                </svg>
                <div className="mission-card__icon" aria-hidden="true">
                  <Icon name={icon} strokeWidth={1.6} />
                </div>
                <span aria-hidden="true">{ordinal(index)}</span>
                <Eyebrow>{item.eyebrow}</Eyebrow>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
            <span className="mission-grid__link" aria-hidden="true" />
          </RevealList>
        </div>
      </section>

      <AboutPresence locale={locale} />

      <AboutCta locale={locale} />
    </main>
  );
}
