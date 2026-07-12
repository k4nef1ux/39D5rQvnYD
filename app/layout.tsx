// app/layout.tsx - root shell: fonts, grain/vignette, Nav, Footer, metadata.
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { getNav } from "@/lib/nav";
import { getSearchIndex } from "@/lib/search";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ReachSignup from "@/components/ReachSignup";
import ScrollTop from "@/components/ScrollTop";
import CommandPalette from "@/components/CommandPalette";
import KeyboardNav from "@/components/KeyboardNav";
import GameKeys from "@/components/GameKeys";
import ShortcutsHelp from "@/components/ShortcutsHelp";
import MobileNavSwipe from "@/components/MobileNavSwipe";
import CardTouch from "@/components/CardTouch";
import HoverScrollFix from "@/components/HoverScrollFix";
import Analytics from "@/components/Analytics";
import ConsentBanner from "@/components/ConsentBanner";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  // 'optional' (not 'swap'): use the metric-matched fallback if the webfont
  // isn't ready at first paint, and never swap late -> kills the font-driven
  // layout shift Lighthouse flagged (mobile CLS 0.668, Slow-4G).
  display: "optional",
  // 'Fraunces Fallback' (defined in globals.css with size-adjust + metric
  // overrides) renders at the same visual size as the webfont, so the
  // optional miss/hit states look identical instead of resizing between
  // reloads. Raw Georgia/Times follow only if that face is somehow absent.
  fallback: ["Fraunces Fallback", "Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
  // don't emit a high-priority <link rel=preload as=font>: under display:'optional'
  // + the metric-matched fallback above, a webfont miss is invisible and
  // shift-free, so preloading buys nothing at first paint - it only steals
  // Slow-4G bandwidth from the LCP hero banner (was adding ~600ms of LCP
  // resource-load delay on mobile). The face still loads at normal priority off
  // the inlined @font-face and is cached for the next view. CLS stays 0.
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "optional",
  // 'Plex Mono Fallback' (defined in globals.css) is a metric-matched face:
  // size-adjust + ascent/descent overrides make the system monospace render
  // at the SAME visual size as IBM Plex Mono. That's what stops the nav/body
  // text resizing between reloads (the webfont winning vs missing the
  // 'optional' window). adjustFontFallback stays off so next/font doesn't
  // inject its Times-based (serif) metric face; under 'optional' there's no
  // swap -> no CLS. Raw system monospaces follow as a last resort.
  fallback: ["Plex Mono Fallback", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", "monospace"],
  adjustFontFallback: false,
  // see Fraunces above: no font preload under optional + metric-matched
  // fallback, so the LCP banner owns the high-priority lane on mobile.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNav();
  const searchIndex = await getSearchIndex();

  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body>
        <a href="#content" className="skip-link">
          skip to content
        </a>
        <div className="atmos-vignette" aria-hidden="true" />
        <div className="atmos-grain" aria-hidden="true" />
        <Nav items={nav} searchIndex={searchIndex} />
        <KeyboardNav items={nav} />
        <GameKeys slugs={searchIndex.map((d) => d.slug)} />
        <ShortcutsHelp />
        <MobileNavSwipe items={nav} />
        <CardTouch />
        <HoverScrollFix />
        <main id="content">{children}</main>

        {/* newsletter signup (Hostinger Reach) - lazy-loaded near the viewport */}
        <ReachSignup />

        <Footer items={nav} />
        <ScrollTop />
        <CommandPalette index={searchIndex} />
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: site.name,
              url: site.url,
              description: site.description,
              inLanguage: "en",
            },
            {
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.author,
              url: site.url,
            },
          ]}
        />
        {/* analytics loads ONLY after opt-in consent (see components/Analytics) */}
        <Analytics gaId={site.analytics.gaId} clarityId={site.analytics.clarityId} ahrefsKey={site.analytics.ahrefsKey} />
        <ConsentBanner />
      </body>
    </html>
  );
}
