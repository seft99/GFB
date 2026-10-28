import { getImageProps } from "next/image";
import type { CSSProperties } from "react";

type DesktopSource = { src: string; width: number; height: number; sizes: string };

type ArtDirectedImageProps = {
  alt: string;
  /** Loaded from 1100px (the desktop breakpoint). */
  desktop: DesktopSource;
  /** Loaded below 1100px; rendered as a `fill` image like next/image. */
  mobile: { src: string; sizes: string };
  priority?: boolean;
  style?: CSSProperties;
};

/**
 * A `fill` image whose desktop photograph differs from the mobile one, through the image
 * pipeline: the browser downloads only the source that matches the viewport, so a desktop
 * photo change never alters (or adds weight to) the mobile view.
 */
export function ArtDirectedImage({ alt, desktop, mobile, priority, style }: ArtDirectedImageProps) {
  const {
    props: { srcSet: desktopSrcSet }
  } = getImageProps({ src: desktop.src, alt: "", width: desktop.width, height: desktop.height, sizes: desktop.sizes });
  const { props } = getImageProps({ src: mobile.src, alt, fill: true, priority, sizes: mobile.sizes });
  return (
    <picture>
      <source media="(min-width: 1100px)" srcSet={desktopSrcSet} sizes={desktop.sizes} />
      <img {...props} alt={alt} style={{ ...props.style, ...style }} />
    </picture>
  );
}
