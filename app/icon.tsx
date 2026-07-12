// app/icon.tsx - browser-tab favicon (PNG, generated). Same mark as the
// apple touch icon: an italic serif "f." on the champagne metal tile, on a
// near-black keyline so it reads on both light and dark tab bars.
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 14,
          fontSize: 40,
          fontStyle: "italic",
          letterSpacing: -1,
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
