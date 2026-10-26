"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation, ui } from "@/src/content/site-content";
import type { Locale } from "@/src/content/types";
import { localizedPath, otherLocale } from "@/src/lib/i18n";
import { Icon } from "./icon";

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const copy = ui[locale];
  const alternate = otherLocale(locale);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link href={`/${locale}`} className="brand" aria-label={`${companyLabel(locale)} ${copy.home}`}>
          <Image src="/brand/gfb-logo.avif" alt="GFB Solutions" width={187} height={77} priority />
        </Link>

        <nav className="desktop-nav" aria-label={locale === "en" ? "Primary navigation" : "Navegación principal"}>
          {navigation(locale).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}>{item.label}</Link>;
          })}
        </nav>

        <div className="header-actions">
          <Link href={localizedPath(pathname, alternate)} className="language-link" aria-label={`${copy.language}: ${alternate.toUpperCase()}`}>
            <Icon name="globe" /> <span>{alternate.toUpperCase()}</span>
          </Link>
          <Link href={`/${locale}/contact`} className="button button--lime header-cta">{copy.inquire}<Icon name="arrow" /></Link>
          <button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? copy.menuClose : copy.menuOpen} onClick={() => setOpen((value) => !value)}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label={locale === "en" ? "Mobile navigation" : "Navegación móvil"}>
          {navigation(locale).map((item, index) => (
            <Link key={item.href} href={item.href} style={{ "--item-index": index } as React.CSSProperties}>
              <span>{String(index + 1).padStart(2, "0")}</span>{item.label}<Icon name="arrow" />
            </Link>
          ))}
          <Link href={`/${locale}/contact`} className="button button--lime">{copy.inquire}</Link>
        </nav>
      </div>
    </header>
  );
}

function companyLabel(locale: Locale) {
  return locale === "en" ? "Go to GFB Solutions home" : "Ir al inicio de GFB Solutions";
}
