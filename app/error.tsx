"use client";

// app/error.tsx - route error boundary in the findshq aesthetic. If a stale chunk
// fails to load after a deploy, hard-reload once to fetch the current assets.
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message || "";
    if (/ChunkLoadError|Loading chunk|importing a module/i.test(msg)) {
      if (!sessionStorage.getItem("findshq-chunk-reload")) {
        sessionStorage.setItem("findshq-chunk-reload", "1");
        window.location.reload();
      }
    } else {
      sessionStorage.removeItem("findshq-chunk-reload");
    }
  }, [error]);

  return (
    <section className="page">
      <div className="page-tag">findshq &nbsp;//&nbsp; error</div>
      <h1 className="page-title">
        signal <em>dropped.</em>
      </h1>
      <p className="lede" style={{ marginBottom: "6vh" }}>
        something failed loading. try again, or head back to the logs.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="back-link"
        style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
      >
        &#x21bb; retry
      </button>
      {"   "}
      <Link href="/" className="back-link">
        &larr; back to the logs
      </Link>
    </section>
  );
}
