// app/apple-icon.tsx - iOS home-screen icon (PNG). The SVG favicon covers
// browser tabs; Apple needs a raster touch icon, generated here at 180x180.
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
          // glossy phosphor tile - matches the new browser-tab favicon
          background: "linear-gradient(180deg, #abc9a0 0%, #6a8f60 100%)",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: -4,
          color: "#0a0b08",
          fontFamily:
            "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
        }}
      >
        q1
      </div>
    ),
    { ...size }
  );
}
