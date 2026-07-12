// Content Security Policy. Permissive enough for Next's inline bootstrap and
// Google Analytics (no nonce yet); next/font self-hosts fonts under /_next.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn-reach.hostinger.com https://www.clarity.ms https://*.clarity.ms https://analytics.ahrefs.com",
  "style-src 'self' 'unsafe-inline' https://cdn-reach.hostinger.com",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://cdn-reach.hostinger.com",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.hostinger.com https://*.clarity.ms https://c.bing.com https://analytics.ahrefs.com",
  "frame-src https://*.hostinger.com",
  "form-action 'self' https://*.hostinger.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // inline the (small) CSS into the HTML so there's no render-blocking
  // stylesheet request on the critical path -> earlier first paint / Speed Index.
  experimental: { inlineCss: true },
  // canonicalize the host: 301 www.findshq.com -> findshq.com so Google
  // consolidates duplicate www/apex URLs onto one site (was splitting crawl
  // budget + indexing).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.findshq.com" }],
        destination: "https://findshq.com/:path*",
        statusCode: 301,
      },
      // index routes renamed from the parent clone's names to findshq's own -
      // 301 the old paths so typed links and any early crawls land right.
      { source: "/gear", destination: "/allfinds", permanent: true },
      { source: "/notes", destination: "/guides", permanent: true },
    ];
  },
  async headers() {
    return [
      // security headers everywhere
      { source: "/:path*", headers: securityHeaders },
      // static media + fonts in /public are content-addressed by path and don't
      // change without a new filename - cache them hard (was max-age=0 via the
      // catch-all below, which left images uncached on repeat visits).
      {
        source: "/(.*)\\.(webp|png|jpg|jpeg|gif|svg|ico|woff2|woff|ttf|avif|mp4)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // dynamic OG / twitter card images have no file extension, so the media
      // rule above misses them and the HTML catch-all below was tagging them
      // max-age=0 - which X's card cache is flaky about (Threads/Facebook were
      // fine either way). Make them cacheable so X reliably picks up the image.
      {
        source: "/(.*)opengraph-image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/(.*)twitter-image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      // never let a shared/CDN cache hold HTML (it would reference hashed chunk
      // files a later deploy deletes -> ChunkLoadError). Excludes /_next/* (kept
      // immutable by Next), the static media above, and the OG images above.
      {
        source:
          "/((?!_next/)(?!.*(?:opengraph-image|twitter-image))(?!.*\\.(?:webp|png|jpe?g|gif|svg|ico|woff2?|ttf|avif|mp4)$).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
