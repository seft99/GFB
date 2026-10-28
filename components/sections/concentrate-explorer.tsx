"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icon";
import "../../app/styles/concentrate-explorer.css";

/** A catalogue entry; `href` only when a real product page exists (none today). */
export type ExplorerProduct = { id: string; label: string; highlight: boolean; href?: string };

/** One family, already resolved to the page locale by the server page. */
export type ExplorerFamily = {
  id: string;
  name: string;
  heading: string;
  items: ExplorerProduct[];
  note?: string;
  image?: { src: string; alt: string; focus?: string };
  thumb?: string;
  /** Contact link carrying the family in the `category` parameter. */
  href: string;
};

type Labels = { count: string; cta: string; tabs: string };

type ConcentrateExplorerProps = {
  eyebrow: string;
  title: string;
  text: string;
  families: ExplorerFamily[];
  defaultId: string;
  labels: Labels;
};

const tabId = (family: ExplorerFamily) => `concentrate-tab-${family.id}`;
const panelId = "concentrate-panel";

/**
 * Desktop family explorer of the fruit & vegetable concentrates page (from 1100px;
 * app/styles/concentrate-explorer.css): editorial intro, five family tabs and one panel with
 * the active family's photograph, numbered product list and inquiry link. The only state is
 * the selected family; the panel follows its content height (with a floor), so short
 * families do not leave blank space.
 */
export function ConcentrateExplorer({ eyebrow, title, text, families, defaultId, labels }: ConcentrateExplorerProps) {
  const [activeId, setActiveId] = useState(defaultId);
  const active = families.find((family) => family.id === activeId) ?? families[0];

  return (
    <div className="concentrates shell">
      <div className="concentrates__intro">
        <div className="concentrates__intro-heading">
          <p className="eyebrow concentrates__eyebrow">{eyebrow}</p>
          <h2 id="concentrates-title">{title}</h2>
        </div>
        <p className="concentrates__intro-text">{text}</p>
      </div>
      <ConcentrateFamilyTabs families={families} activeId={active.id} onSelect={setActiveId} labels={labels} />
      <ConcentrateFamilyPanel family={active} ctaLabel={labels.cta} />
    </div>
  );
}

/**
 * WAI-ARIA tabs with roving tabindex: arrow keys (wrapping), Home and End move the focus and
 * select the family, so the panel always matches the focused tab.
 */
function ConcentrateFamilyTabs({
  families,
  activeId,
  onSelect,
  labels
}: {
  families: ExplorerFamily[];
  activeId: string;
  onSelect: (id: string) => void;
  labels: Labels;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = families.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onSelect(families[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div className="concentrates__tabs" role="tablist" aria-label={labels.tabs}>
      {families.map((family, index) => {
        const selected = family.id === activeId;
        return (
          <button
            key={family.id}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tabId(family)}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className="concentrates__tab"
            onClick={() => onSelect(family.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span className="concentrates__thumb" aria-hidden="true">
              {family.thumb && <Image src={family.thumb} alt="" fill sizes="80px" />}
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
  );
}

/**
 * Photograph and content of the active family. The new photograph fades in over the previous
 * one once it has loaded (a crossfade without a blank frame); the previous one is unmounted
 * when the fade ends, so at most two family photos are ever mounted.
 */
function ConcentrateFamilyPanel({ family, ctaLabel }: { family: ExplorerFamily; ctaLabel: string }) {
  const [shown, setShown] = useState(family);
  const [previous, setPrevious] = useState<ExplorerFamily | null>(null);
  const [loaded, setLoaded] = useState(true);

  // State adjusted while rendering when the family changes (no effect, no extra paint).
  if (family.id !== shown.id) {
    setPrevious(shown);
    setShown(family);
    setLoaded(false);
  }

  const reveal = () => {
    setLoaded(true);
    // Without the fade there is no transitionend to clear the previous photo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPrevious(null);
  };

  return (
    <div className="concentrates__panel" role="tabpanel" id={panelId} aria-labelledby={tabId(family)}>
      <div className="concentrates__media">
        {previous?.image && (
          <FamilyPhoto key={previous.id} image={previous.image} className="concentrates__photo is-previous" />
        )}
        {family.image && (
          <FamilyPhoto
            key={family.id}
            image={family.image}
            className={loaded ? "concentrates__photo is-loaded" : "concentrates__photo"}
            onLoad={reveal}
            onTransitionEnd={() => setPrevious(null)}
          />
        )}
      </div>
      <div className="concentrates__content" key={family.id}>
        <p className="eyebrow concentrates__eyebrow">{family.name}</p>
        <h3>{family.heading}</h3>
        <ConcentrateProductList items={family.items} />
        {family.note && <p className="concentrates__note">{family.note}</p>}
        <Link href={family.href} className="concentrates__cta">
          {ctaLabel}
          <Icon name="arrow" strokeWidth={1.8} />
        </Link>
      </div>
    </div>
  );
}

function FamilyPhoto({
  image,
  className,
  onLoad,
  onTransitionEnd
}: {
  image: NonNullable<ExplorerFamily["image"]>;
  className: string;
  onLoad?: () => void;
  onTransitionEnd?: () => void;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes="(min-width: 1440px) 600px, 46vw"
      className={className}
      style={image.focus ? { objectPosition: image.focus } : undefined}
      onLoad={onLoad}
      onTransitionEnd={onTransitionEnd}
    />
  );
}

/** Numbered entries in two columns, read top to bottom; DOM order matches the visual order. */
function ConcentrateProductList({ items }: { items: ExplorerProduct[] }) {
  return (
    <ol className="concentrates__list" style={{ "--list-rows": Math.ceil(items.length / 2) } as CSSProperties}>
      {items.map((item, index) => (
        <ConcentrateProductRow key={item.id} item={item} index={index} />
      ))}
    </ol>
  );
}

/** Plain text unless the product has a real page; only then a link with an arrow. */
function ConcentrateProductRow({ item, index }: { item: ExplorerProduct; index: number }) {
  const content = (
    <>
      <span className="concentrates__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="concentrates__name">{item.label}</span>
    </>
  );
  return (
    <li className={item.highlight ? "concentrates__item is-highlight" : "concentrates__item"}>
      {item.href ? (
        <Link href={item.href} className="concentrates__item-link">
          {content}
          <Icon name="arrow" strokeWidth={1.8} />
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
