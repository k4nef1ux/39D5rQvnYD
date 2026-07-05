// app/api/consent/route.ts - records a cookie-consent choice (allow/withdraw)
// to the append-only audit log. Same-origin POST so nothing leaves the site;
// stores no direct identifiers. force-dynamic: never cached/prerendered.
import { NextResponse } from "next/server";
import { logConsent } from "@/lib/consent-log";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { choice?: unknown; version?: unknown; path?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const choice = body.choice === "granted" || body.choice === "denied" ? body.choice : null;
  if (!choice) return NextResponse.json({ ok: false }, { status: 400 });

  const version = typeof body.version === "string" ? body.version.slice(0, 16) : "0";
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "/";

  // coarse country from whatever the edge/proxy provides; never store the IP.
  const h = req.headers;
  const country =
    h.get("cf-ipcountry") ||
    h.get("x-vercel-ip-country") ||
    h.get("x-country-code") ||
    "unknown";

  // random, non-identifying id for the record
  const id =
    (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) ||
    Math.random().toString(36).slice(2);

  await logConsent({ id, choice, version, path, country });
  return NextResponse.json({ ok: true });
}
