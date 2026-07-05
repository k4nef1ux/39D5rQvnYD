// app/opengraph-image.tsx - default social share image for the site.
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b08",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "lowercase",
            color: "#8c877c",
          }}
        >
          {`${site.name} // cool finds, wholesome gifts`}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05, color: "#ece6da" }}>
            {site.ogHeadline.lead}
          </div>
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05, color: "#ffcf1a" }}>
            {site.ogHeadline.accent}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#8c877c" }}>
          {`${site.domain} - ${site.tagline}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
