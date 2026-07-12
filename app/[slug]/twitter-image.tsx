// app/[slug]/twitter-image.tsx - same PNG card as opengraph-image, so X gets
// twitter:image + twitter:card=summary_large_image pointing at a PNG (not the
// webp cover, which X won't render).
export { default, alt, size, contentType, runtime } from "./opengraph-image";
