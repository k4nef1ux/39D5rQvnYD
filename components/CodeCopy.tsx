"use client";

// components/CodeCopy.tsx - progressively enhances rendered <pre><code> blocks
// in the prose with a copy button. No-op when there are no code blocks.
import { useEffect } from "react";

export default function CodeCopy({ selector = ".prose pre" }: { selector?: string }) {
  useEffect(() => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLPreElement>(selector)
    );
    const cleanups: Array<() => void> = [];

    blocks.forEach((pre) => {
      if (pre.dataset.copyReady) return;
      pre.dataset.copyReady = "1";
      pre.style.position ||= "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = "copy";
      btn.setAttribute("aria-label", "copy code");

      const onClick = async () => {
        const code = pre.querySelector("code")?.innerText ?? pre.innerText;
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "copied";
          setTimeout(() => (btn.textContent = "copy"), 1600);
        } catch {
          btn.textContent = "error";
          setTimeout(() => (btn.textContent = "copy"), 1600);
        }
      };
      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => {
        btn.removeEventListener("click", onClick);
        btn.remove();
        delete pre.dataset.copyReady;
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [selector]);

  return null;
}
