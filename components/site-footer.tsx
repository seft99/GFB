import Link from "next/link";
import { company, divisions, navigation } from "@/src/content/site-content";
import type { Locale } from "@/src/content/types";
import { Icon } from "./icon";

export function SiteFooter({ locale }: { locale: Locale }) {
  const es = locale === "es";
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-lead">
          <p className="eyebrow">GFB Solutions</p>
          <h2>{es ? "Conectemos su próximo reto con la solución adecuada." : "Connect your next challenge with the right solution."}</h2>
          <Link href={`/${locale}/contact`} className="text-link">{es ? "Hablar con el equipo comercial" : "Talk to the commercial team"}<Icon name="arrow" /></Link>
        </div>
        <div>
          <p className="footer-label">{es ? "Navegación" : "Navigate"}</p>
          <ul>{navigation(locale).map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}</ul>
        </div>
        <div>
          <p className="footer-label">{es ? "Soluciones" : "Solutions"}</p>
          <ul>{divisions.map((division) => <li key={division.slug}><Link href={`/${locale}/${division.slug}`}>{division.title[locale]}</Link></li>)}</ul>
        </div>
        <div className="footer-contact">
          <p className="footer-label">{es ? "Contacto" : "Contact"}</p>
          <a href={`mailto:${company.email}`}><Icon name="mail" />{company.email}</a>
          <a href={`tel:${company.phonePrimary.replace(/\s/g, "")}`}><Icon name="phone" />{company.phonePrimary}</a>
          <p><Icon name="pin" />{company.address}</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} GFB Solutions</p>
        <div><Link href={`/${locale}/legal/privacy`}>{es ? "Privacidad" : "Privacy"}</Link><Link href={`/${locale}/legal/cookies`}>Cookies</Link></div>
      </div>
    </footer>
  );
}
