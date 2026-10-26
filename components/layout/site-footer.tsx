import Link from "next/link";
import { TextLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { divisions } from "@/src/content/catalog";
import { company, formatAddress, telHref } from "@/src/content/company";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { primaryNavigation } from "@/src/lib/navigation";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { footer } = getDictionary(locale);
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-lead">
          <Eyebrow onDark>{company.name}</Eyebrow>
          <h2>{footer.title}</h2>
          <TextLink href={paths.page(locale, "contact")} tone="light">
            {footer.cta}
          </TextLink>
        </div>
        <nav aria-labelledby="footer-navigate">
          <p className="footer-label" id="footer-navigate">
            {footer.navigate}
          </p>
          <ul>
            {primaryNavigation(locale).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-solutions">
          <p className="footer-label" id="footer-solutions">
            {footer.solutions}
          </p>
          <ul>
            {divisions.map((division) => (
              <li key={division.id}>
                <Link href={paths.division(locale, division)}>{division.title[locale]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="footer-contact">
          <p className="footer-label">{footer.contact}</p>
          <a href={`mailto:${company.email}`}>
            <Icon name="mail" />
            {company.email}
          </a>
          <a href={telHref(company.phonePrimary)}>
            <Icon name="phone" />
            {company.phonePrimary}
          </a>
          <p>
            <Icon name="pin" />
            {formatAddress(locale)}
          </p>
        </address>
      </div>
      <div className="shell footer-bottom">
        <p>
          © {new Date().getFullYear()} {company.name}
        </p>
        <div>
          <Link href={paths.legal(locale, "privacy")}>{footer.privacy}</Link>
          <Link href={paths.legal(locale, "cookies")}>{footer.cookies}</Link>
        </div>
      </div>
    </footer>
  );
}
