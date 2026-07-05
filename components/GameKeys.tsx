"use client";

// components/GameKeys.tsx - gamer-friendly global keys.
//   W A S D  - mirror the arrow keys 1:1. A/D re-emit ArrowLeft/ArrowRight so
//              every existing arrow handler (section cycle, post newer/older,
//              tag archives, hero slider) does exactly what the arrow would;
//              W/S scroll up/down like the browser does on ArrowUp/ArrowDown.
//   Q / E    - aliases for A / D (left / right).
//   R        - jump to a random post (reroll / discovery).
//   H        - jump home (the front page).
// Skips when you're typing, a modifier is held, or an overlay (command palette /
// help / modal) owns the keyboard. Post-only keys (space, u/l, z/x/c) live in
// PostKeys; find (f) + help (?) live in CommandPalette / ShortcutsHelp.
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const SCROLL_STEP = 40; // px per press - matches a browser arrow-key line scroll

export default function GameKeys({ slugs = [] }: { slugs?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // plain keys only; let any modifier combo (shortcuts, selection) pass
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : "";
      if (!"wasdqerh".includes(key) || key === "") return;

      // don't hijack typing inside a field
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      )
        return;
      // an open command palette / help / modal owns the keyboard
      if (document.querySelector('.cmdk, [aria-modal="true"]')) return;

      // W / S -> scroll up / down (mirror ArrowUp / ArrowDown)
      if (key === "w" || key === "s") {
        e.preventDefault();
        window.scrollBy(0, key === "s" ? SCROLL_STEP : -SCROLL_STEP);
        return;
      }

      // H -> home (the front page); no-op if you're already there
      if (key === "h") {
        if (pathname === "/") return;
        e.preventDefault();
        router.push("/");
        return;
      }

      // R -> random post (never the one you're already on)
      if (key === "r") {
        const pool = slugs.filter((s) => `/${s}` !== pathname);
        if (!pool.length) return;
        e.preventDefault();
        const pick = pool[Math.floor(Math.random() * pool.length)];
        router.push(`/${pick}`);
        return;
      }

      // A / Q -> ArrowLeft, D / E -> ArrowRight. Re-emit the real arrow event
      // from the focused element (falls back to window) so it bubbles to
      // whichever handler owns left/right on this page, exactly as the arrow does.
      e.preventDefault();
      const arrow = key === "a" || key === "q" ? "ArrowLeft" : "ArrowRight";
      const target: EventTarget = document.activeElement ?? window;
      target.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: arrow,
          bubbles: true,
          cancelable: true,
        })
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname, slugs]);

  return null;
}
