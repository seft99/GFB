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
      <section className="about-hero section-dark">
        <div className="shell">
          <Breadcrumbs locale={locale} items={[{ label: common.about }]} />
          <div className="about-hero__grid">
            <div>
              <Eyebrow onDark>{about.hero.eyebrow}</Eyebrow>
              <h1>{about.hero.title}</h1>
            </div>
            <p className="lead">{about.hero.lead}</p>
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
