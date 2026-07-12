// app/[slug]/opengraph-image.tsx - per-post social card, rendered as PNG.
// X's card renderer silently drops webp (the raw cover.webp showed on
// Threads/Facebook but not on X), so the share image comes from here as a
// PNG title card instead of pointing at the webp cover. Mirrors the site
// default card in app/opengraph-image.tsx, with the post title.
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { getPageBySlug } from "@/lib/content";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs"; // getPageBySlug reads the filesystem

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  const title = page?.title ?? site.title;
  const kind = page?.type === "gear" ? "gear" : "note";
  const titleSize = title.length > 46 ? 58 : title.length > 30 ? 70 : 84;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080b",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8c877c",
          }}
        >
          {`findshq // ${kind}`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 1.08,
            color: "#ede9e1",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#8c877c" }}>
          {`${site.domain} - ${site.tagline}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
