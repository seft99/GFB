import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { divisions } from "@/src/content/catalog";
import { company, formatAddress, telHref } from "@/src/content/company";
import { isLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localizedPaths, paths } from "@/src/i18n/routes";
import { pageMetadata } from "@/src/lib/metadata";

type Props = PageProps<"/[locale]/contact">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { contact } = getDictionary(locale);
  return pageMetadata({
    locale,
    paths: localizedPaths((item) => paths.page(item, "contact")),
    title: contact.metaTitle,
    description: contact.metaDescription
  });
}

/** Reads a single query value; repeated or non-string parameters are ignored. */
function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value.slice(0, 120) : undefined;
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const { contact, form, common } = getDictionary(locale);
  const interest = single(query.interest);

  return (
    <main id="main-content" className="contact-page section-dark">
      <div className="shell contact-layout">
        <div className="contact-copy">
          <Breadcrumbs locale={locale} items={[{ label: common.contact }]} />
          <Eyebrow onDark>{contact.eyebrow}</Eyebrow>
          <h1>{contact.title}</h1>
          <p className="lead">{contact.lead}</p>
          <address className="direct-contact">
            <a href={`mailto:${company.email}`}>
              <Icon name="mail" />
              <span>
                <small>{contact.email}</small>
                {company.email}
              </span>
            </a>
            <a href={telHref(company.phonePrimary)}>
              <Icon name="phone" />
              <span>
                <small>{contact.phone}</small>
                {company.phonePrimary}
              </span>
            </a>
            <p>
              <Icon name="pin" />
              <span>
                <small>{contact.office}</small>
                {formatAddress(locale)}
              </span>
            </p>
          </address>
          <p className="contact-note">
            {contact.privacyNote} <Link href={paths.legal(locale, "privacy")}>{contact.privacyLink}</Link>
          </p>
        </div>
        <div className="contact-form-panel">
          <div className="form-panel-heading">
            <h2>{contact.formHeading}</h2>
            <p>{contact.requiredNote}</p>
          </div>
          <ContactForm
            locale={locale}
            copy={form}
            email={company.email}
            interests={divisions.map((division) => ({ id: division.id, label: division.title[locale] }))}
            initial={{
              interest: divisions.some((division) => division.id === interest) ? interest : undefined,
              category: single(query.category)
            }}
          />
        </div>
      </div>
    </main>
  );
}
