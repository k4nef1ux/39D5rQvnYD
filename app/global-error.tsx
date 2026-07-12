"use client";

// app/global-error.tsx - last-resort boundary (replaces the root layout on a
// fatal error, so it must render its own <html>/<body>).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#08080b",
          color: "#ede9e1",
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ letterSpacing: "0.2em", textTransform: "uppercase", color: "#8c877c" }}>
            findshq // fatal error
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 16,
              background: "none",
              border: "1px solid #32323b",
              color: "#d8b47f",
              padding: "10px 18px",
              cursor: "pointer",
              font: "inherit",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            retry
          </button>
        </div>
      </body>
    </html>
  );
}
