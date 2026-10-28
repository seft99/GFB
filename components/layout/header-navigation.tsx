"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { ordinal } from "@/src/lib/format";
import type { MegaMenuConfig, NavItem } from "@/src/lib/navigation";
import { MegaMenuIconGlyph } from "./mega-menu-icons";
import "../../app/styles/mega-menu.css";

type HeaderNavigationProps = {
  items: NavItem[];
  labels: {
    primary: string;
    mobile: string;
    open: string;
    close: string;
    inquire: string;
    toggle: string;
  };
  contactHref: string;
  languageSwitcher: ReactNode;
  cta: ReactNode;
};

const pathOf = (href: string) => href.split(/[?#]/)[0];
const HOVER_OPEN_MS = 60;
const HOVER_CLOSE_MS = 180;
/** A chevron click this soon after a hover opened the panel confirms it instead of closing it. */
const HOVER_CLICK_GRACE_MS = 600;
/** Viewport margin of a dropdown that is anchored to its trigger. */
const EDGE = 24;

/**
 * Header navigation. Desktop: each division is a real link (its landing page) followed by a
 * separate disclosure button that opens its mega menu; hover opens it too on pointer devices.
 * One menu at a time; Escape, a click outside, a destination link or a navigation closes it.
 * Every menu is in the server HTML (closed ones are `inert`), so all links stay crawlable.
 * Mobile: the existing full-screen menu, with an accordion per division from the same config.
 */
export function HeaderNavigation({ items, labels, contactHref, languageSwitcher, cta }: HeaderNavigationProps) {
  const pathname = usePathname();
  // Menus are open only for the path they were opened on, so any navigation closes them
  // without a state-syncing effect.
  const [mobileOpenedOn, setMobileOpenedOn] = useState<string | null>(null);
  const mobileOpen = mobileOpenedOn === pathname;
  const [expanded, setExpanded] = useState<{ id: string; path: string; left?: number; caret?: number } | null>(null);
  const openId = expanded?.path === pathname ? expanded.id : null;
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const toggles = useRef(new Map<string, HTMLButtonElement>());
  const navRef = useRef<HTMLElement>(null);

  const isActive = (item: NavItem) => {
    // Legacy public URLs are rewritten, so the pathname may be the internal route instead.
    for (const base of [pathOf(item.href), item.route])
      if (base && (pathname === base || pathname.startsWith(`${base}/`))) return true;
    // A division is also current on its category pages (e.g. /cans for Packaging).
    return item.menu?.sections[0].links.some((link) => pathOf(link.href) === pathname) ?? false;
  };

  /** Opens a menu, anchoring compact and two-column panels under their trigger. */
  const openMenu = useCallback(
    (item: NavItem) => {
      window.clearTimeout(timer.current);
      const menu = item.menu;
      if (!menu) return;
      const trigger = toggles.current.get(menu.id)?.parentElement?.getBoundingClientRect();
      const panel = document.getElementById(`mega-${menu.id}`);
      const width = panel?.offsetWidth ?? 0;
      const center = trigger ? trigger.left + trigger.width / 2 : window.innerWidth / 2;
      const left =
        menu.layout === "three-column"
          ? (window.innerWidth - width) / 2
          : Math.min(Math.max(EDGE, center - width / 2), window.innerWidth - width - EDGE);
      setExpanded({ id: menu.id, path: pathname, left, caret: center - left });
    },
    [pathname]
  );

  const close = useCallback((restoreFocus = false) => {
    window.clearTimeout(timer.current);
    setExpanded((current) => {
      if (restoreFocus && current) toggles.current.get(current.id)?.focus();
      return null;
    });
  }, []);

  // Escape and clicks outside the header close the open menu.
  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.closest("header")?.contains(event.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openId, close]);

  // Mobile menu: lock page scroll and close with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpenedOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onHover = (item: NavItem, entering: boolean) => {
    window.clearTimeout(timer.current);
    if (entering) {
      if (openId === item.menu?.id) return;
      timer.current = window.setTimeout(
        () => {
          hoverOpenedAt.current = performance.now();
          openMenu(item);
        },
        openId ? 0 : HOVER_OPEN_MS
      );
    } else {
      timer.current = window.setTimeout(() => close(), HOVER_CLOSE_MS);
    }
  };

  return (
    <>
      <nav className="desktop-nav" aria-label={labels.primary} ref={navRef}>
        {items.map((item) => {
          const active = isActive(item);
          if (!item.menu)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
              >
                {item.label}
              </Link>
            );
          const menu = item.menu;
          const isOpen = openId === menu.id;
          return (
            <div
              key={item.href}
              className={isOpen ? "desktop-nav__item is-expanded" : "desktop-nav__item"}
              onPointerEnter={(event) => event.pointerType === "mouse" && onHover(item, true)}
              onPointerLeave={(event) => event.pointerType === "mouse" && onHover(item, false)}
            >
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? "is-active" : undefined}
              >
                {item.label}
              </Link>
              <button
                type="button"
                className="desktop-nav__toggle"
                aria-expanded={isOpen}
                aria-controls={`mega-${menu.id}`}
                aria-label={labels.toggle.replace("{name}", item.label)}
                ref={(element) => {
                  if (element) toggles.current.set(menu.id, element);
                  else toggles.current.delete(menu.id);
                }}
                onClick={() => {
                  if (!isOpen) openMenu(item);
                  else if (performance.now() - hoverOpenedAt.current > HOVER_CLICK_GRACE_MS) close();
                }}
              >
                <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                  <path d="M2.5 4.5 6 8l3.5-3.5" />
                </svg>
              </button>
              <MegaMenuPanel
                menu={menu}
                open={isOpen}
                style={
                  isOpen && expanded?.left !== undefined
                    ? ({ left: expanded.left, translate: "none", "--caret-x": `${expanded.caret}px` } as CSSProperties)
                    : undefined
                }
                onNavigate={() => close()}
              />
            </div>
          );
        })}
      </nav>

      <div className="header-actions">
        {languageSwitcher}
        {cta}
        <button
          className="menu-button"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? labels.close : labels.open}
          onClick={() => setMobileOpenedOn(mobileOpen ? null : pathname)}
        >
          <Icon name={mobileOpen ? "close" : "menu"} />
        </button>
      </div>

      <div id="mobile-menu" className={mobileOpen ? "mobile-menu is-open" : "mobile-menu"} inert={!mobileOpen}>
        <nav aria-label={labels.mobile}>
          {items.map((item, index) => {
            const style = { "--item-index": index } as CSSProperties;
            const current = isActive(item) ? "page" : undefined;
            if (!item.menu)
              return (
                <Link key={item.href} href={item.href} aria-current={current} style={style}>
                  <span>{ordinal(index)}</span>
                  {item.label}
                  <Icon name="arrow" />
                </Link>
              );
            const sectionOpen = mobileSection === item.menu.id;
            const panelId = `mobile-${item.menu.id}`;
            // Categories plus the few quick-access shortcuts; no nested flyouts.
            const links = item.menu.sections.filter((section) => section.id !== "families").flatMap((s) => s.links);
            return (
              <div key={item.href} className="mobile-menu__group" style={style}>
                <div className="mobile-menu__row">
                  <Link href={item.href} aria-current={current}>
                    <span>{ordinal(index)}</span>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="mobile-menu__toggle"
                    aria-expanded={sectionOpen}
                    aria-controls={panelId}
                    aria-label={labels.toggle.replace("{name}", item.label)}
                    onClick={() => setMobileSection(sectionOpen ? null : item.menu!.id)}
                  >
                    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                      <path d="M2.5 4.5 6 8l3.5-3.5" />
                    </svg>
                  </button>
                </div>
                <ul id={panelId} className="mobile-menu__links" hidden={!sectionOpen}>
                  {links.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href}>
                        {link.label}
                        <Icon name="arrow" />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href={item.menu.footerHref} className="mobile-menu__all">
                      {item.menu.footerLabel}
                      <Icon name="arrow" />
                    </Link>
                  </li>
                </ul>
              </div>
            );
          })}
          <Link href={contactHref} className="button button--lime">
            {labels.inquire}
          </Link>
        </nav>
      </div>
    </>
  );
}

function MegaMenuPanel({
  menu,
  open,
  style,
  onNavigate
}: {
  menu: MegaMenuConfig;
  open: boolean;
  style?: CSSProperties;
  onNavigate: () => void;
}) {
  return (
    <div
      id={`mega-${menu.id}`}
      className={`mega-menu mega-menu--${menu.layout}${open ? " is-open" : ""}`}
      inert={!open}
      style={style}
    >
      <div className="mega-menu__columns">
        {menu.sections.map((section) => (
          <section
            key={section.id}
            className={`mega-menu__section mega-menu__section--${section.id}${section.variant === "featured" ? " is-featured" : ""}`}
            aria-labelledby={`mega-${menu.id}-${section.id}`}
          >
            <p className="mega-menu__heading" id={`mega-${menu.id}-${section.id}`}>
              {section.title}
            </p>
            <ul>
              {section.links.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="mega-menu__link" prefetch={false} onClick={onNavigate}>
                    {link.icon && <MegaMenuIconGlyph name={link.icon} />}
                    <span>{link.label}</span>
                    <Icon name="arrow" strokeWidth={1.8} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Link href={menu.footerHref} className="mega-menu__footer" prefetch={false} onClick={onNavigate}>
        {menu.footerLabel}
        <Icon name="arrow" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
