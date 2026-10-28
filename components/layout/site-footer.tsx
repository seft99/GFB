import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { divisions } from "@/src/content/catalog";
import { company, telHref } from "@/src/content/company";
import type { Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";

/**
 * Site footer: identity, company and solution-area navigation, contact details and legal
 * links. The closing call to action lives in the page above it, so the footer adds no second
 * promotional invitation. On the Home page (desktop) the identity column also shows a
 * positioning headline and the brand decoration; elsewhere it shows the logo and a
 * descriptor. Styles in app/styles/footer.css.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { footer, common } = getDictionary(locale);
  return (
    <footer className="site-footer">
      {/* Decoration and identity headline below are the Home variant (see app/styles/footer.css). */}
      <svg
        className="footer-decor footer-decor--orbit"
        viewBox="0 0 360 711"
        preserveAspectRatio="xMinYMin meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="footer-orbit-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.25" stopColor="#b3ec3e" stopOpacity="0.75" />
            <stop offset="1" stopColor="#b3ec3e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 50C18 160 52 236 90 272S220 362 350 384" stroke="url(#footer-orbit-fade)" />
        <circle cx="90" cy="272" r="9" className="footer-decor__node" />
      </svg>
      <svg
        className="footer-decor footer-decor--mark"
        viewBox="0 0 520 711"
        preserveAspectRatio="xMaxYMin meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="footer-stripe" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#7cc520" />
            <stop offset="0.55" stopColor="#2e8f6a" />
            <stop offset="1" stopColor="#2a6cf0" />
          </linearGradient>
          <clipPath id="footer-mark-clip">
            <circle cx="470" cy="285" r="190" />
          </clipPath>
        </defs>
        <path className="footer-decor__curve" d="M240 470C340 420 440 330 520 250" />
        <path className="footer-decor__curve footer-decor__curve--blue" d="M330 560C410 510 470 462 520 420" />
        <g clipPath="url(#footer-mark-clip)" fill="url(#footer-stripe)" opacity="0.85">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <rect
              key={i}
              x={250 + i * 34}
              y="40"
              width="15"
              height="520"
              rx="7.5"
              transform={`rotate(35 ${250 + i * 34} 300)`}
            />
          ))}
        </g>
      </svg>
      <div className="shell footer-grid">
        <div className="footer-lead">
          <Link href={paths.home(locale)} className="footer-brand" aria-label={common.homeLinkLabel}>
            <Image src="/brand/gfb-logo.png" alt="" width={154} height={64} />
          </Link>
          <p className="footer-descriptor">{footer.descriptor}</p>
          <div className="footer-home">
            <h2 className="footer-home__title">
              {footer.homeTitleLines.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </h2>
            <p className="footer-home__tagline">{footer.homeTagline}</p>
          </div>
        </div>
        <nav aria-labelledby="footer-company">
          <p className="footer-label" id="footer-company">
            {footer.company}
          </p>
          <ul>
            <li>
              <Link href={paths.page(locale, "about")}>{common.about}</Link>
            </li>
            <li>
              <Link href={paths.page(locale, "contact")}>{common.contact}</Link>
            </li>
            <li>
              <Link href={paths.page(locale, "product-index")}>{footer.productIndex}</Link>
            </li>
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
            {/* Same text as formatAddress; the two parts stack on desktop. */}
            <span className="footer-address">
              <span>{company.address.street},</span>{" "}
              <span>
                {company.address.postalCode} {company.address.locality}, {company.address.country[locale]}
              </span>
            </span>
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
