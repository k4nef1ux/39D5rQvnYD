"use client";

// components/CommandPalette.tsx - terminal-style quick jump. Cmd/Ctrl-K or "/"
// opens an overlay to fuzzy-jump to any post or section. Owns those shortcuts
// (Search.tsx no longer binds them, to avoid double-handling). The overlay only
// renders when open, so it costs nothing until invoked.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchDoc } from "@/lib/search";
import { resultKind } from "@/lib/kind";

const NAV = [
  { href: "/", label: "home" },
  { href: "/notes", label: "notes" },
  { href: "/gear", label: "gear" },
  { href: "/about", label: "about" },
];

// `hay` is the lowercased haystack we match against - the post's full text
// (title + description + tags + body, same as the top-right search) for posts,
// or just the label for nav sections. Keeps "jump to" as capable as search.
type Item = { href: string; label: string; type: string; hay: string };

export default function CommandPalette({ index }: { index: SearchDoc[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const inField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;
      // open on cmd/ctrl-k, "/", or "f" (find). "f" is a plain key, so only
      // when not typing in a field.
      if (
        ((e.metaKey || e.ctrlKey) && k === "k") ||
        ((k === "/" || k === "f") && !inField && !e.metaKey && !e.ctrlKey && !e.altKey)
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (k === "escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo<Item[]>(() => {
    const nav: Item[] = NAV.map((n) => ({ ...n, type: "go", hay: n.label }));
    const posts: Item[] = index.map((d) => ({
      href: `/${d.slug}`,
      label: d.title,
      type: d.type,
      hay: d.text, // full text (title + desc + tags + body), already lowercased
    }));
    const all = [...nav, ...posts];
    const needle = q.trim().toLowerCase();
    if (!needle) return all.slice(0, 8);
    const terms = needle.split(/\s+/);
    // every term must appear somewhere in the haystack - same full-text match
    // as the top-right search, so "/" finds body words and tags, not just titles.
    return all.filter((r) => terms.every((t) => r.hay.includes(t))).slice(0, 8);
  }, [q, index]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  // arrow/enter handled right on the input so the search box keeps focus and
  // the down/up arrows move the highlight into the options below with no Tab.
  // (the list buttons are tabIndex -1 so Tab never pulls focus out of here.)
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[sel];
      if (r) go(r.href);
    }
  };

  return (
    <div
      className="cmdk"
      role="dialog"
      aria-modal="true"
      aria-label="command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="cmdk-box">
        <input
          ref={inputRef}
          className="cmdk-input"
          placeholder="jump to..."
          aria-label="jump to"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <ul className="cmdk-list" role="listbox">
          {results.length === 0 ? (
            <li className="cmdk-empty">no signal</li>
          ) : (
            results.map((r, i) => (
              <li key={r.href + i}>
                <button
                  type="button"
                  tabIndex={-1}
                  className={`cmdk-item${i === sel ? " on" : ""}`}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(r.href)}
                >
                  <span className="cmdk-type">{resultKind(r.type)}</span>
                  <span className="cmdk-label">{r.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="cmdk-foot">
          <span>&uarr;&darr; navigate</span>
          <span>&crarr; open</span>
          <span>esc close</span>
          <button
            type="button"
            className="cmdk-help"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("findshq:help"));
            }}
          >
            ? help
          </button>
        </div>
      </div>
    </div>
  );
}
