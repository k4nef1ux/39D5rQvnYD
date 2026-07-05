// lib/images.ts
// Build-time image dimension lookup for images under /public.
// Emitting intrinsic width/height on every <img> lets the browser reserve
// layout space before the file loads (CSS width:100%;height:auto keeps the
// rendered size responsive) - which is what keeps CLS at ~0 and the
// Lighthouse score >= 99 once posts start carrying images.

import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

const PUBLIC_DIR = path.join(process.cwd(), "public");

// content is read once per build/render pass; a tiny cache avoids re-reading
// the same file for every page that references it.
const cache = new Map<string, { width: number; height: number } | null>();

/**
 * Dimensions for a root-relative public asset (e.g. "/images/foo/cover.webp").
 * Returns null for remote URLs, image routes, or unreadable files - callers
 * just omit width/height in that case (no crash, no broken layout).
 */
export function getImageSize(
  src: string
): { width: number; height: number } | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null;
  const hit = cache.get(src);
  if (hit !== undefined) return hit;
  let out: { width: number; height: number } | null = null;
  try {
    // strip any query/hash, resolve inside /public only
    const clean = src.split(/[?#]/)[0];
    const file = path.join(PUBLIC_DIR, clean);
    if (file.startsWith(PUBLIC_DIR) && fs.existsSync(file)) {
      const dim = imageSize(fs.readFileSync(file));
      if (dim.width && dim.height) out = { width: dim.width, height: dim.height };
    }
  } catch {
    out = null;
  }
  cache.set(src, out);
  return out;
}
