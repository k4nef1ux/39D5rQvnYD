// app/tags/[tag]/page.tsx - tag archive. Lists every post carrying a tag,
// beside the shared sidebar. Statically generated for each known tag.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllTags,
  getPostsByTag,
  getFeaturedPosts,
  getRandomPosts,
  getLatestPosts,
  tagSlug,
} from "@/lib/content";
import { site } from "@/config/site";
import { TAG_META } from "@/lib/tag-meta";
import InfiniteFeed from "@/components/InfiniteFeed";
import Sidebar from "@/components/Sidebar";
import KeyEdges from "@/components/KeyEdges";

// Pre-render every known tag. dynamicParams stays true (see [slug]/page.tsx:
// false throws NoFallbackError under next start). Unknown tags render not-found.
export const dynamicParams = true;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const meta = TAG_META[tagSlug(tag)];
  const label = tag.replace(/-/g, " ");
  return {
    title: meta?.title ?? `gifts for ${label}`,
    description:
      meta?.description ??
      `hand-picked gifts for ${label}, newest first - each one vetted against real owner reviews before it earned a place on the list.`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagArchive({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const [posts, allTags, featured, latest] = await Promise.all([
    getPostsByTag(tag),
    getAllTags(),
    getFeaturedPosts(site.sidebar.topCount),
    getLatestPosts(site.sidebar.latestCount),
  ]);
  const random = await getRandomPosts(
    site.sidebar.randomCount,
    [...featured, ...latest].map((p) => p.slug)
  );

  // resolve the human label from the slug; 404 if the tag isn't real
  const match = allTags.find((t) => t.slug === tagSlug(tag));
  if (!match) notFound();

  // keyboard left/right steps to the adjacent tag (same order as the tag list),
  // wrapping around the ends.
  const ti = allTags.findIndex((t) => t.slug === match.slug);
  const tn = allTags.length;
  const leftTag = tn > 1 ? allTags[(ti - 1 + tn) % tn] : null;
  const rightTag = tn > 1 ? allTags[(ti + 1) % tn] : null;

  return (
    <div className="layout layout-index">
      <KeyEdges
        leftHref={leftTag ? `/tags/${leftTag.slug}` : null}
        rightHref={rightTag ? `/tags/${rightTag.slug}` : null}
        swipe
      />
      <div className="layout-main">
        <div className="page-tag">findshq &nbsp;//&nbsp; tag</div>
        <h1 className="page-title">
          #{match.tag}
        </h1>
        <p className="lede page-lede">
          {match.count} {match.count === 1 ? "find" : "finds"} tagged{" "}
          <span className="hl">{match.tag}</span>.
        </p>
        <InfiniteFeed
          posts={posts.map((p) => ({
            slug: p.slug,
            title: p.title,
            type: p.type,
            date: p.date,
            updated: p.updated,
            description: p.description,
            tags: p.tags,
            cover: p.leadImage || p.cover,
            category: p.category,
            price: p.price,
            buyUrl: p.buyUrl,
            merchant: p.merchant,
            rating: p.rating,
          }))}
          initial={site.feed.initial}
          step={site.feed.step}
          layout="stream"
        />
      </div>

      <Sidebar
        top={featured.map((p) => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated }))}
        random={random.map((p) => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated }))}
        latest={latest.map((p) => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated }))}
        tags={allTags}
      />
    </div>
  );
}
