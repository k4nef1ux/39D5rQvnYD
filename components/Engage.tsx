"use client";

// components/Engage.tsx - upvote (single arrow + count) + share (x / threads /
// copy). Used on feed cards and at the foot of a post. Counts load after paint
// via the batched reader (one request per page); one vote per visitor tracked in
// localStorage with optimistic UI. Sits above the card's overlay link via z-index
// so clicks here don't navigate.
import { useEffect, useState } from "react";
import { readStats, post } from "@/components/engage-batch";
import { site } from "@/config/site";

function Icon({ kind }: { kind: "x" | "threads" | "link" }) {
  if (kind === "x")
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.29 19.49h2.04L6.49 3.24H4.3l13.31 17.4Z" />
      </svg>
    );
  if (kind === "threads")
    return (
      <svg viewBox="0 0 192 192" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5374 90.6052 61.6843 97.2286 61.6843C97.3051 61.6843 97.382 61.6843 97.4576 61.685C105.707 61.7376 111.932 64.1356 115.961 68.8918C118.893 72.3573 120.854 77.1458 121.825 83.1855C114.511 81.9415 106.601 81.5588 98.145 82.0480C74.3247 83.4205 59.0111 97.3164 60.0396 116.629C60.5615 126.42 65.4397 134.844 73.775 140.354C80.8224 145.012 89.899 147.29 99.3323 146.774C111.79 146.091 121.563 141.339 128.381 132.654C133.559 126.062 136.835 117.519 138.281 106.749C144.214 110.33 148.607 115.041 151.033 120.704C155.157 130.328 155.397 146.132 142.501 159.017C131.201 170.31 117.617 175.197 97.107 175.347C74.3536 175.179 57.1411 167.882 45.9788 153.66C35.5253 140.341 30.1233 121.107 29.9219 96.5C30.1233 71.8927 35.5253 52.6589 45.9788 39.3399C57.1411 25.1177 74.3531 17.8207 97.1065 17.6528C120.024 17.8219 137.537 25.1542 149.165 39.4014C154.866 46.3853 159.164 55.169 161.998 65.4097L178.18 61.0905C174.743 48.4861 169.331 37.6238 161.965 28.6062C147.048 10.3349 125.232 0.971333 97.1646 0.777771H97.0484C69.0389 0.970752 47.4669 10.3698 32.943 28.7269C20.0196 45.061 13.3528 67.795 13.1311 96.4326L13.13 96.5L13.1311 96.5674C13.3528 125.205 20.0196 147.939 32.943 164.273C47.4669 182.63 69.0389 192.029 97.0484 192.222H97.1646C122.05 192.05 139.58 185.534 154.013 171.103C172.99 152.149 172.42 128.392 165.92 113.737C161.245 103.236 152.379 94.7173 141.537 88.9883ZM98.4631 129.901C88.0179 130.49 77.1665 125.792 76.6319 115.762C76.2362 108.32 81.9162 100.015 98.7651 99.0467C100.689 98.9362 102.576 98.8809 104.43 98.8809C110.557 98.8809 116.288 99.4768 121.494 100.62C119.553 124.84 108.176 129.367 98.4631 129.901Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
      <path d="M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7A3.1 3.1 0 0 1 3.9 12Zm4.1 1h8v-2H8v2Zm9-6h-4v1.9h4a3.1 3.1 0 0 1 0 6.2h-4V17h4a5 5 0 0 0 0-10Z" />
    </svg>
  );
}

export default function Engage({
  slug,
  title,
  variant = "card",
}: {
  slug: string;
  title: string;
  variant?: "card" | "post";
}) {
  const [votes, setVotes] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    let on = true;
    setVoted(localStorage.getItem("voted:" + slug) === "1");
    readStats(slug).then((s) => on && setVotes(s.votes));
    return () => {
      on = false;
    };
  }, [slug]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggle = async (e: React.MouseEvent) => {
    stop(e);
    const next = !voted;
    setVoted(next);
    setVotes((v) => Math.max(0, (v ?? 0) + (next ? 1 : -1)));
    localStorage.setItem("voted:" + slug, next ? "1" : "0");
    const d = await post(slug, next ? "vote" : "unvote");
    if (d && typeof d.votes === "number") setVotes(d.votes);
  };

  const url = `${site.url}/${slug}`;
  const share = (e: React.MouseEvent, kind: "x" | "threads" | "copy") => {
    stop(e);
    if (kind === "copy") {
      navigator.clipboard?.writeText(url).then(() => {
        setToast(true);
        setTimeout(() => setToast(false), 1600);
      });
      return;
    }
    const t = encodeURIComponent(title);
    const u = encodeURIComponent(url);
    const href =
      kind === "x"
        ? `https://twitter.com/intent/tweet?text=${t}&url=${u}`
        : `https://www.threads.net/intent/post?text=${t}%20${u}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`engage engage-${variant}`}>
      <button
        type="button"
        className={`upvote${voted ? " on" : ""}`}
        onClick={toggle}
        aria-pressed={voted}
        aria-label="upvote"
      >
        <span className="up-arrow" aria-hidden="true">
          &#9650;
        </span>
        <span className="up-label">{voted ? "upvoted" : "upvote"}</span>
        <span className="up-num">{votes == null ? "·" : votes.toLocaleString()}</span>
      </button>

      <span className="engage-sep" aria-hidden="true" />

      {/* order matches the Z X C keyboard shortcuts left-to-right:
          Z = threads, X = x, C = copy. */}
      <div className="share" role="group" aria-label="share">
        <button type="button" className="sh" onClick={(e) => share(e, "threads")} aria-label="share on threads">
          <Icon kind="threads" />
        </button>
        <button type="button" className="sh" onClick={(e) => share(e, "x")} aria-label="share on x">
          <Icon kind="x" />
        </button>
        <button type="button" className="sh" onClick={(e) => share(e, "copy")} aria-label="copy link">
          <Icon kind="link" />
        </button>
      </div>

      {toast && (
        <span className="engage-toast" role="status">
          copied
        </span>
      )}
    </div>
  );
}
