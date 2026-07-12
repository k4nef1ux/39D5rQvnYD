"use client";

// components/Analytics.tsx - loads Google Analytics ONLY after the visitor has
// granted consent (opt-in). It mounts nothing until then, so non-consenting
// visitors (and first paint) carry zero analytics cost - which also keeps the
// Lighthouse budget intact. Withdrawing consent sets the gtag kill-switch and
// stops loading on subsequent navigations.
import Script from "next/script";
import { useEffect, useState } from "react";
import { getConsent, CONSENT_CHANGE, type Consent } from "@/lib/consent";

export default function Analytics({
  gaId,
  clarityId,
  ahrefsKey,
}: {
  gaId: string;
  clarityId?: string;
  ahrefsKey?: string;
}) {
  const [consent, setConsentState] = useState<Consent | null>(null);

  useEffect(() => {
    setConsentState(getConsent());
    const onChange = (e: Event) => {
      const v = (e as CustomEvent<Consent>).detail;
      setConsentState(v);
      // hard kill-switch so any already-loaded gtag stops sending immediately
      if (v === "denied") {
        (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = true;
      }
    };
    window.addEventListener(CONSENT_CHANGE, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE, onChange);
  }, [gaId]);

  if (consent !== "granted") return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="lazyOnload"
          />
          <Script id="ga-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {/* Microsoft Clarity - same consent gate + lazyOnload as GA, so it loads
          only after opt-in and never before paint (zero Lighthouse cost). The
          official snippet, with the project id templated in. */}
      {clarityId && (
        <Script id="ms-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}
      {/* Ahrefs Web Analytics - cookieless, same consent gate + lazyOnload as the
          others so it loads only after opt-in and never before paint (zero
          Lighthouse cost). Mirrors the official snippet: async analytics.js with
          the data-key set. */}
      {ahrefsKey && (
        <Script id="ahrefs-analytics" strategy="lazyOnload">
          {`var s=document.createElement('script');s.async=true;s.src='https://analytics.ahrefs.com/analytics.js';s.setAttribute('data-key','${ahrefsKey}');document.head.appendChild(s);`}
        </Script>
      )}
    </>
  );
}
