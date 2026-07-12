// app/apple-icon.tsx - iOS home-screen icon (PNG), generated at 180x180.
// The brand mark: an italic serif "f." engraved on the champagne metal tile.
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #d8b47f 0%, #86663c 100%)",
          fontSize: 110,
          fontStyle: "italic",
          letterSpacing: -4,
          color: "#17110a",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        f.
      </div>
    ),
    { ...size }
  );
}
