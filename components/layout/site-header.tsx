import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { slugTree } from "@/src/content/catalog";
import { otherLocale, type Locale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { paths } from "@/src/i18n/routes";
import { primaryNavigation } from "@/src/lib/navigation";
import { HeaderNavigation } from "./header-navigation";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  const { common } = getDictionary(locale);
  const target = otherLocale(locale);
  return (
    <header className="site-header">
      <div className="site-header__inner shell-wide">
        <Link href={paths.home(locale)} className="brand" aria-label={common.homeLinkLabel}>
          <Image src="/brand/gfb-logo.png" alt="" width={154} height={64} loading="eager" />
        </Link>
        <HeaderNavigation
          items={primaryNavigation(locale)}
          labels={{
            primary: common.primaryNavigation,
            mobile: common.mobileNavigation,
            open: common.menuOpen,
            close: common.menuClose,
            inquire: common.inquire
          }}
          contactHref={paths.page(locale, "contact")}
          languageSwitcher={<LanguageSwitcher target={target} label={common.switchLanguage} tree={slugTree} />}
          cta={
            <ButtonLink href={paths.page(locale, "contact")} variant="lime" className="header-cta">
              {common.inquire}
            </ButtonLink>
          }
        />
      </div>
    </header>
  );
}
