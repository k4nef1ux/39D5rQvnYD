// app/llms.txt/route.ts - llms.txt: a plain-text map of the site for LLMs/AI
// assistants to discover and cite. https://llmstxt.org
import { site } from "@/config/site";
import { getPostsByType } from "@/lib/content";

export async function GET() {
  const base = site.url.replace(/\/$/, "");
  const [logs, notes, gear] = await Promise.all([
    getPostsByType("log"),
    getPostsByType("note"),
    getPostsByType("gear"),
  ]);

  const line = (p: { title: string; slug: string; description?: string }) =>
    `- [${p.title}](${base}/${p.slug})${p.description ? `: ${p.description}` : ""}`;

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    site.llmsIntro,
    "",
    "## Logs",
    ...logs.map(line),
    "",
    "## Notes",
    ...notes.map(line),
    "",
    "## Gear",
    ...gear.map(line),
    "",
    "## More",
    `- [About](${base}/about)`,
    `- [RSS feed](${base}/feed.xml)`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
