// components/Footer.tsx - global footer. Links mirror the nav + quieter pages.
import Link from "next/link";
import { site } from "@/config/site";
import type { NavItem } from "@/config/site";
import ConsentLink from "@/components/ConsentLink";

export default function Footer({ items }: { items: NavItem[] }) {
  // nested legal/trust pages (children of e.g. "about") get their own quiet row
  const legal = items.flatMap((i) => i.children ?? []);

  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="mark">
          finds<span className="one">hq</span>
        </div>
        <div className="tagline">{site.tagline}</div>
      </div>

      <nav className="footer-links" aria-label="footer">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        {site.links.map((l) =>
          l.href.startsWith("/") ? (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ) : (
            <a key={l.href} href={l.href} rel="me noopener">
              {l.label}
            </a>
          )
        )}
      </nav>

      {legal.length > 0 && (
        <nav className="footer-legal" aria-label="legal">
          {legal.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <ConsentLink />
        </nav>
      )}

      <div className="footer-meta">
        {site.domain}
      </div>
    </footer>
  );
}
