import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.gfb-solutions.com"),
  title: { default: "GFB Solutions | Food & Beverage Industry Solutions", template: "%s | GFB Solutions" },
  description: "Packaging, ingredients, flavours and industrial consulting for food and beverage companies.",
  applicationName: "GFB Solutions",
  icons: { icon: "/brand/gfb-logo.avif" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
