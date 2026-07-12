// lib/kind.ts - pure, client-safe. Maps a content/result type to the short
// label shown on a search / command-palette result row, so a row reads what it
// IS ("post" / "tag" / "go") instead of the raw frontmatter type ("note"/"log").
// Kept dependency-free so client components can import it without pulling in any
// server (fs) code from lib/content.
// findshq lexicon: a type:"note" is a GUIDE everywhere a reader sees it.
// Use this for any user-facing type label (cards, rails, post meta).
export function displayType(type: string): string {
  return type === "note" || type === "log" ? "guide" : type;
}

export function resultKind(type: string): string {
  switch (type) {
    case "note":
    case "log":
      return "guide";
    case "gear":
      return "post";
    case "go":
      return "go"; // a nav section (home / notes / gear / about)
    case "tag":
      return "tag";
    case "page":
      return "page";
    default:
      return type;
  }
}
