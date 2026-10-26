import Image from "next/image";
import Link from "next/link";
import { TextLink } from "@/components/ui/button-link";
import { ordinal } from "@/src/lib/format";

type CategoryCardProps = {
  href: string;
  title: string;
  summary: string;
  image: string;
  index: number;
  linkLabel: string;
};

export function CategoryCard({ href, title, summary, image, index, linkLabel }: CategoryCardProps) {
  return (
    <article className="category-card">
      {/* The image link duplicates the text link, so it is hidden from assistive tech and the tab order. */}
      <Link href={href} className="category-card__image" tabIndex={-1} aria-hidden="true">
        <Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
        <span>{ordinal(index)}</span>
      </Link>
      <div>
        <h3>{title}</h3>
        <p>{summary}</p>
        <TextLink href={href}>
          {linkLabel}
          <span className="visually-hidden">: {title}</span>
        </TextLink>
      </div>
    </article>
  );
}
