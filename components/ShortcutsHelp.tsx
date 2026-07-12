"use client";

// components/ShortcutsHelp.tsx - a keyboard cheat-sheet overlay. Opens on "?"
// (the universal convention) or a "findshq:help" event (fired by the command
// palette's "? help" footer button). Esc or a backdrop click closes it. While
// open it is aria-modal, so the movement/post keys yield to it.
import { useEffect, useState } from "react";

type Row = { keys: string[]; desc: string };
const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "move",
    rows: [
      { keys: ["w", "s"], desc: "scroll up / down" },
      { keys: ["a", "d"], desc: "back / forward - newer / older, prev / next section" },
      { keys: ["q", "e"], desc: "same as a / d" },
    ],
  },
  {
    title: "browse",
    rows: [
      { keys: ["space"], desc: "next post" },
      { keys: ["r"], desc: "random post" },
      { keys: ["h"], desc: "home" },
      { keys: ["f", "/"], desc: "find - open the command palette" },
    ],
  },
  {
    title: "react (on a post)",
    rows: [
      { keys: ["u", "l"], desc: "upvote this post" },
      { keys: ["t"], desc: "share on threads" },
      { keys: ["x"], desc: "share on x" },
      { keys: ["c"], desc: "copy link" },
    ],
  },
  {
    title: "other",
    rows: [
      { keys: ["?"], desc: "this help" },
      { keys: ["esc"], desc: "close" },
    ],
  },
];

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // "?" is shift+/ - accept either the resolved char or the combo
      if (e.key !== "?" && !(e.key === "/" && e.shiftKey)) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      )
        return;
      // don't fight an already-open command palette
      if (document.querySelector(".cmdk")) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    const onEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("findshq:help", onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("findshq:help", onEvent);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="help"
      role="dialog"
      aria-modal="true"
      aria-label="keyboard shortcuts"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="help-box">
        <div className="help-head">
          <span className="help-title">keyboard</span>
          <button
            type="button"
            className="help-x"
            aria-label="close"
            onClick={() => setOpen(false)}
          >
            esc
          </button>
        </div>
        <div className="help-grid">
          {GROUPS.map((g) => (
            <div className="help-group" key={g.title}>
              <div className="help-group-title">{g.title}</div>
              {g.rows.map((r) => (
                <div className="help-row" key={r.desc}>
                  <span className="help-keys">
                    {r.keys.map((k) => (
                      <kbd className="help-key" key={k}>
                        {k}
                      </kbd>
                    ))}
                  </span>
                  <span className="help-desc">{r.desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
