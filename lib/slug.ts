// lib/slug.ts - pure tag-slug helper. No server-only imports, so client
// components (HeroSlider, NextPostLoader) can use it to build /tags/<slug> links.
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}
