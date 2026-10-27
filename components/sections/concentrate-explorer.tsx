"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";
import "../../app/styles/concentrate-explorer.css";

/** One family, already resolved to the page locale by the server page. */
export type ExplorerFamily = {
  id: string;
  name: string;
  heading: string;
  items: { label: string; highlight: boolean }[];
  note?: string;
  image?: { src: string; alt: string; focus?: string; fit?: "cover" | "contain" };
  thumb?: string;
  /** Contact link carrying the family in the `category` parameter. */
  href: string;
};

type ConcentrateExplorerProps = {
  eyebrow: string;
  title: string;
  text: string;
  families: ExplorerFamily[];
  defaultId: string;
  labels: { count: string; cta: string; tabs: string };
};

/** Rows reserved for the longest family, so the panel keeps its height when switching. */
const maxRows = (families: ExplorerFamily[]) => Math.ceil(Math.max(...families.map((f) => f.items.length)) / 2);

/**
 * Desktop family explorer (from 1100px; app/styles/concentrate-explorer.css): five family tabs
 * with a thumbnail and the number of catalogue entries, and one panel with the active family's
 * photograph, complete list and an inquiry link. WAI-ARIA tabs with roving tabindex; arrow keys,
 * Home and End move between families and select them. Only the active photograph is rendered.
 */
export function ConcentrateExplorer({ eyebrow, title, text, families, defaultId, labels }: ConcentrateExplorerProps) {
  const [activeId, setActiveId] = useState(defaultId);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = families.find((family) => family.id === activeId) ?? families[0];
  const rows = maxRows(families);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = families.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % families.length
        : event.key === "ArrowLeft"
          ? (index - 1 + families.length) % families.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveId(families[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div className="concentrates shell">
      <div className="concentrates__intro">
        <div>
          <p className="eyebrow concentrates__eyebrow">{eyebrow}</p>
          <h2 id="concentrates-title">{title}</h2>
        </div>
        <p>{text}</p>
      </div>

      <div className="concentrates__tabs" role="tablist" aria-label={labels.tabs}>
        {families.map((family, index) => {
          const selected = family.id === active.id;
          return (
            <button
              key={family.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`concentrate-tab-${family.id}`}
              aria-selected={selected}
              aria-controls="concentrate-panel"
              tabIndex={selected ? 0 : -1}
              className="concentrates__tab"
              onClick={() => setActiveId(family.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span className="concentrates__thumb" aria-hidden="true">
                {family.thumb && <Image src={family.thumb} alt="" fill sizes="96px" />}
              </span>
              <span className="concentrates__tab-text">
                <span className="concentrates__tab-name">{family.name}</span>
                <span className="concentrates__tab-count">
                  {family.items.length} {labels.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="concentrates__panel"
        role="tabpanel"
        id="concentrate-panel"
        aria-labelledby={`concentrate-tab-${active.id}`}
        style={{ "--rows": rows } as CSSProperties}
      >
        <div className="concentrates__media">
          {active.image && (
            <Image
              key={active.id}
              src={active.image.src}
              alt={active.image.alt}
              fill
              sizes="(min-width: 1440px) 576px, 45vw"
              className={active.image.fit === "contain" ? "concentrates__photo is-studio" : "concentrates__photo"}
              style={active.image.focus ? { objectPosition: active.image.focus } : undefined}
            />
          )}
        </div>
        <div className="concentrates__content" key={active.id}>
          <p className="eyebrow concentrates__eyebrow">{active.name}</p>
          <h3>{active.heading}</h3>
          <div className="concentrates__body">
            <ul
              className="concentrates__list"
              style={{ "--list-rows": Math.ceil(active.items.length / 2) } as CSSProperties}
            >
              {active.items.map((item) => (
                <li key={item.label} className={item.highlight ? "is-highlight" : undefined}>
                  {item.label}
                </li>
              ))}
            </ul>
            <div className="concentrates__note">{active.note && <p>{active.note}</p>}</div>
          </div>
          <Link href={active.href} className="concentrates__cta">
            {labels.cta}
            <Icon name="arrow" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </div>
  );
}
