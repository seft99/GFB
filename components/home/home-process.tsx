import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import processHoney from "@/public/images/home/process-honey.webp";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { ordinal } from "@/src/lib/format";
import { RevealList } from "./reveal-list";

const stepIcons: IconName[] = ["search", "document", "nodes", "bars"];

/**
 * Homepage "Start with the application". The heading and step list keep their previous
 * classes, so tablet and mobile render as before; the photo, lead, nodes and connectors
 * are desktop additions styled in app/styles/home-process.css.
 */
export function HomeProcess({ locale }: { locale: Locale }) {
  const { home } = getDictionary(locale);
  const copy = home.process;

  return (
    <section className="section application-section process">
      <div className="process__media" aria-hidden="true">
        {/* Cover-cropped into a box narrower than the photo: it renders ~1030–1150px wide. */}
        <Image src={processHoney} alt="" fill placeholder="blur" sizes="1150px" className="process__image" />
        <svg className="process__arc" viewBox="0 0 800 640" preserveAspectRatio="none" focusable="false">
          <path d="M120 0C150 210 260 300 300 314S560 420 640 450 770 560 776 640" pathLength={1} />
        </svg>
        <span className="process__arc-dot" />
      </div>

      <div className="shell">
        <div className="process__intro">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={
              <>
                {copy.title} <span className="process__accent">{copy.titleAccent}</span>
              </>
            }
          />
          <p className="process__lead">{copy.text}</p>
        </div>

        <RevealList className="process-grid process__steps">
          {copy.steps.map((step, index) => (
            <li key={step.title} style={{ "--i": index } as CSSProperties}>
              <span className="process__node" aria-hidden="true">
                <Icon name={stepIcons[index] ?? "check"} strokeWidth={1.5} />
              </span>
              {index < copy.steps.length - 1 && (
                <span className="process__connector" aria-hidden="true">
                  <svg viewBox="0 0 100 12" preserveAspectRatio="none" focusable="false">
                    <path d="M0 6H100" pathLength={1} />
                  </svg>
                  <svg className="process__connector-head" viewBox="0 0 12 12" focusable="false">
                    <path d="m3 1.5 5 4.5-5 4.5" />
                  </svg>
                </span>
              )}
              <span aria-hidden="true">{ordinal(index)}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </RevealList>
      </div>
    </section>
  );
}
