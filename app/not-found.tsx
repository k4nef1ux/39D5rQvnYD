// app/not-found.tsx - 404 in the findshq aesthetic. Quiet, not apologetic.
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page">
      <div className="page-tag">findshq &nbsp;//&nbsp; 404</div>
      <h1 className="page-title">
        no signal <em>here.</em>
      </h1>
      <p className="lede" style={{ marginBottom: "6vh" }}>
        this door doesn&apos;t open onto anything. the page moved, or never was.
      </p>
      <Link href="/" className="back-link">
        &larr; back to the logs
      </Link>
    </section>
  );
}
