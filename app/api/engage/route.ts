// app/api/engage/route.ts - same-origin engagement API (keeps the Upstash token
// server-side; the client only ever talks to our own origin, so CSP stays clean).
// GET  /api/engage?slugs=a,b,c  -> { a:{views,votes}, ... }   (batched read)
// POST /api/engage  {slug, action:"view"|"vote"|"unvote"}     -> new count
import { NextResponse } from "next/server";
import { getStats, incrView, castVote, safeSlug } from "@/lib/engage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugs = (url.searchParams.get("slugs") || "")
    .split(",")
    .map((s) => safeSlug(s.trim()))
    .filter((s): s is string => !!s)
    .slice(0, 50);
  try {
    return NextResponse.json(await getStats(slugs));
  } catch {
    return NextResponse.json({}); // degrade quietly
  }
}

export async function POST(req: Request) {
  let body: { slug?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const slug = safeSlug(body.slug);
  if (!slug) return NextResponse.json({ error: "bad slug" }, { status: 400 });
  try {
    if (body.action === "view")
      return NextResponse.json({ views: await incrView(slug) });
    if (body.action === "vote")
      return NextResponse.json({ votes: await castVote(slug, 1) });
    if (body.action === "unvote")
      return NextResponse.json({ votes: await castVote(slug, -1) });
    return NextResponse.json({ error: "bad action" }, { status: 400 });
  } catch {
    return NextResponse.json({}); // degrade quietly
  }
}
