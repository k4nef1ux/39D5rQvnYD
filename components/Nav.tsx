"use client";

// components/Nav.tsx - renders the menu from data. ZERO hardcoded links.
// Active item marked via usePathname. Two mobile presentations:
//  - the "menu" button toggles the TOP dropdown (unchanged).
//  - a swipe-right on a section page opens a LEFT slide-in DRAWER (sidebar),
//    which closes on a swipe, a tap on the scrim, route change, or Escape.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NavItem } from "@/config/site";
import type { SearchDoc } from "@/lib/search";
import Search from "@/components/Search";

export default function Nav({
  items,
  searchIndex,
}: {
  items: NavItem[];
  searchIndex: SearchDoc[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // top dropdown (menu button)
  const [drawer, setDrawer] = useState(false); // left sidebar (swipe)
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // swipe-right opens the drawer; a swipe while it's open (or the scrim) closes it
  useEffect(() => {
    const onOpen = () => setDrawer(true);
    const onClose = () => setDrawer(false);
    window.addEventListener("q1rk:open-menu", onOpen);
    window.addEventListener("q1rk:close-menu", onClose);
    return () => {
      window.removeEventListener("q1rk:open-menu", onOpen);
      window.removeEventListener("q1rk:close-menu", onClose);
    };
  }, []);

  // flag the open drawer so MobileNavSwipe routes a swipe to "close" not "navigate"
  useEffect(() => {
    document.documentElement.classList.toggle("drawer-open", drawer);
    return () => document.documentElement.classList.remove("drawer-open");
  }, [drawer]);

  // tapping outside the open top dropdown closes it
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && t.closest && t.closest(".nav")) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Escape closes the drawer
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  // any navigation closes both presentations
  useEffect(() => {
    setOpen(false);
    setDrawer(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const renderItems = (close: () => void) =>
    items.map((item) => (
      <li key={item.href} className={item.children ? "has-sub" : undefined}>
        <Link
          href={item.href}
          className={isActive(item.href) ? "active" : ""}
          onClick={close}
        >
          {item.label}
        </Link>
        {item.children && (
          <ul className="nav-sub" aria-label={`${item.label} pages`}>
            {item.children.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className={isActive(c.href) ? "active" : ""}
                  onClick={close}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));

  return (
    <nav className="nav" aria-label="primary">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="findshq home">
          finds<span className="one">hq</span>
        </Link>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "close" : "menu"}
        </button>

        <ul id="nav-menu" className={`nav-menu${open ? " open" : ""}`}>
          {renderItems(() => setOpen(false))}
        </ul>

        <div className="nav-right">
          <Search index={searchIndex} />
        </div>
      </div>

      {/* left slide-in drawer (swipe-opened). Portaled to <body> so it isn't
          trapped by the nav's backdrop-filter (which would make position:fixed
          resolve against the ~64px nav bar instead of the viewport). */}
      {mounted &&
        createPortal(
          <>
            <div
              className={`nav-scrim${drawer ? " show" : ""}`}
              onClick={() => setDrawer(false)}
              aria-hidden="true"
            />
            <aside
              className={`nav-drawer${drawer ? " show" : ""}`}
              aria-label="menu"
              aria-hidden={!drawer}
            >
              <div className="nav-drawer-head">
                <span className="nav-drawer-mark">
                  finds<span className="one">hq</span>
                </span>
              </div>
              <ul className="nav-drawer-menu">
                {renderItems(() => setDrawer(false))}
              </ul>
            </aside>
          </>,
          document.body
        )}
    </nav>
  );
}
