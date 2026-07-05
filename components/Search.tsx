"use client";

// components/Search.tsx - client-side search over content POSTS ONLY.
// The index is built at compile time (lib/search.ts) and passed in as a prop,
// so there's no server call and no third party. cmd/ctrl-k or / focuses it.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchDoc } from "@/lib/search";
import { resultKind } from "@/lib/kind";

export default function Search({ index }: { index: SearchDoc[] }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // (cmd/ctrl-k and "/" are owned by the CommandPalette now; esc still blurs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close results when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const terms = needle.split(/\s+/);
    return index
      .filter((d) => terms.every((t) => d.text.includes(t)))
      .slice(0, 8);
  }, [q, index]);

  const showResults = focused && q.trim().length > 0;

  return (
    <div className="search" ref={wrapRef}>
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        placeholder="search"
        aria-label="search posts"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      {showResults && (
        <div className="search-results" role="listbox">
          {results.length === 0 ? (
            <div className="search-empty">no signal found</div>
          ) : (
            results.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="search-result"
                role="option"
                onClick={() => {
                  setQ("");
                  setFocused(false);
                }}
              >
                <div className="sr-label">{resultKind(r.type)}</div>
                <div className="sr-title">{r.title}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
