import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AboutPresence } from "@/components/about/about-presence";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClosingCta } from "@/components/sections/closing-cta";
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
import "../../styles/closing-cta.css";

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
  const missionCards: { item: typeof about.mission; icon: IconName }[] = [
    { item: about.mission, icon: "target" },
    { item: about.vision, icon: "growth" }
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
                {/* Grapes still life from the official GFB website (6048 × 4032 source). */}
                <Image
                  src="/images/about/grapes-still-life.webp"
                  alt={about.hero.imageAlt}
                  fill
                  fetchPriority="high"
                  sizes="58vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        Below 1100px the section keeps its light layout from globals.css; the dark editorial
        desktop design and the label are in app/styles/about-story.css.
      */}
      <section className="section story-section">
        <div className="shell story-grid">
          <div className="story-image">
            {/* Team photograph from the official GFB website (7500 × 4219 source). */}
            <Image
              src="/images/about/collaboration.webp"
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
            <p className="story-section__label">{about.story.label}</p>
          </div>
        </div>
      </section>

      {/*
        Below 1100px the cards keep their layout from globals.css; the intro, icons and the
        desktop card design are in app/styles/about-mission.css.
      */}
      <section className="section mission-section">
        <div className="shell mission-shell">
          <header className="mission-intro">
            <Eyebrow>{about.purpose.eyebrow}</Eyebrow>
            <h2>
              <span>{about.purpose.title}</span> <span>{about.purpose.titleMuted}</span>
            </h2>
          </header>
          <RevealList as="div" className="mission-grid">
            {missionCards.map(({ item, icon }, index) => (
              <article key={item.eyebrow}>
                <div className="mission-card__icon" aria-hidden="true">
                  <Icon name={icon} strokeWidth={1.6} />
                </div>
                <span aria-hidden="true">{ordinal(index)}</span>
                <Eyebrow>{item.eyebrow}</Eyebrow>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </RevealList>
        </div>
      </section>

      <AboutPresence locale={locale} />

      <ClosingCta
        eyebrow={about.cta.eyebrow}
        title={about.cta.title}
        text={about.cta.text}
        href={paths.page(locale, "contact")}
        label={common.inquire}
      />
    </main>
  );
}
