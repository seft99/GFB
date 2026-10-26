import Link from "next/link";
import type { Locale } from "@/src/content/types";
import { ui } from "@/src/content/site-content";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href={`/${locale}`}>{ui[locale].breadcrumbHome}</Link></li>
        {items.map((item) => <li key={item.label}>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}
      </ol>
    </nav>
  );
}
