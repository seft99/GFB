"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { NavItem } from "@/src/lib/navigation";
import { ordinal } from "@/src/lib/format";

type HeaderNavigationProps = {
  items: NavItem[];
  labels: { primary: string; mobile: string; open: string; close: string; inquire: string };
  contactHref: string;
  languageSwitcher: ReactNode;
  cta: ReactNode;
};

export function HeaderNavigation({ items, labels, contactHref, languageSwitcher, cta }: HeaderNavigationProps) {
  const pathname = usePathname();
  // The menu is open only for the path it was opened on, so any navigation closes it
  // without a state-syncing effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav className="desktop-nav" aria-label={labels.primary}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={isActive(item.href) ? "is-active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        {languageSwitcher}
        {cta}
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? labels.close : labels.open}
          onClick={() => setOpenedOn(open ? null : pathname)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>

      <div id="mobile-menu" className={open ? "mobile-menu is-open" : "mobile-menu"} inert={!open}>
        <nav aria-label={labels.mobile}>
          {items.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              style={{ "--item-index": index } as CSSProperties}
            >
              <span>{ordinal(index)}</span>
              {item.label}
              <Icon name="arrow" />
            </Link>
          ))}
          <Link href={contactHref} className="button button--lime">
            {labels.inquire}
          </Link>
        </nav>
      </div>
    </>
  );
}
