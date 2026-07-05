// lib/nav.ts
// Builds the final nav by merging config/site.ts nav with any content pages
// whose frontmatter has nav: true. Sorted by order. Deduped by href.

import { site, type NavItem } from "@/config/site";
import { getAllPages } from "@/lib/content";

export async function getNav(): Promise<NavItem[]> {
  const fromConfig = [...site.nav];

  const pages = await getAllPages();
  const fromContent: NavItem[] = pages
    .filter((p) => p.nav === true)
    .map((p) => ({
      label: p.title.toLowerCase(),
      href: `/${p.slug}`,
      order: p.order ?? 999,
    }));

  // pages flagged navParent nest under that parent href as sub-nav children
  // (e.g. the legal/trust pages group under "/about") instead of becoming
  // their own top-level items.
  const children = new Map<string, NavItem[]>();
  for (const p of pages.filter((p) => p.navParent)) {
    const parent = p.navParent as string;
    const kids = children.get(parent) ?? [];
    kids.push({ label: p.title.toLowerCase(), href: `/${p.slug}`, order: p.order ?? 999 });
    children.set(parent, kids);
  }

  // merge, dedupe by href (config wins), sort by order then label
  const byHref = new Map<string, NavItem>();
  for (const item of [...fromConfig, ...fromContent]) {
    if (!byHref.has(item.href)) byHref.set(item.href, item);
  }

  return Array.from(byHref.values())
    .map((item) => {
      const kids = children.get(item.href);
      if (!kids) return item;
      // the parent's own page leads its dropdown, so the section (e.g. "about")
      // is reachable from the menu itself and the list reads as the page + its
      // sub-pages, not just the sub-pages.
      const self: NavItem = { label: item.label, href: item.href, order: item.order };
      return {
        ...item,
        children: [self, ...kids.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))],
      };
    })
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}
