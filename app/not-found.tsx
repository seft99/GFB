import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="not-found section-dark"><div><span>404</span><h1>That route is not in the portfolio.</h1><p>Return to the GFB Solutions overview or start a commercial inquiry.</p><div className="button-row"><Link href="/en" className="button button--lime">Go home</Link><Link href="/en/contact" className="button button--ghost">Contact GFB</Link></div></div></main>;
}
