// app/[slug]/page.tsx - single dynamic route for every content page.
// Pre-renders all content slugs (generateStaticParams), sets per-page metadata
// from frontmatter (generateMetadata), and renders the body. Posts (log|note)
// also get tag chips, prev/next, and continuous "next post" reading.

import Link from "next/link";
import { displayType } from "@/lib/kind";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllSlugs,
  getPageBySlug,
  getAdjacentPosts,
  getLatestPosts,
  getFeaturedPosts,
  getRandomPosts,
  getAllTags,
} from "@/lib/content";
import { site } from "@/config/site";
import { tagSlug } from "@/lib/slug";
import { fmtDate } from "@/components/PostCard";
import PostNav from "@/components/PostNav";
import PostSideNav from "@/components/PostSideNav";
import KeyEdges from "@/components/KeyEdges";
import PostKeys from "@/components/PostKeys";
import PostSwipe from "@/components/PostSwipe";
import Sidebar, { type SidebarPost } from "@/components/Sidebar";
import MobileDiscover from "@/components/MobileDiscover";
import NextPostLoader, { type UpcomingPost } from "@/components/NextPostLoader";
import JsonLd from "@/components/JsonLd";
import CodeCopy from "@/components/CodeCopy";
import Engage from "@/components/Engage";
import Views from "@/components/Views";
import ReadingProgress from "@/components/ReadingProgress";

// Pre-render every known slug. dynamicParams stays true on purpose: under
// `next start`, dynamicParams:false throws NoFallbackError on every unknown-path
// hit (crawlers/bots) - which destabilized the app before. Unknown/draft paths
// render the not-found UI instead. Caching is handled via headers() in next.config.
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};
  const isPost = page.type === "note" || page.type === "gift";
  const metaTitle = page.seoTitle || page.title;
  // og:image + twitter:image are provided by the file-based opengraph-image /
  // twitter-image routes in this segment - they render a PNG title card. We
  // used to point them at the webp cover, but X's card renderer silently drops
  // webp (it showed on Threads/Facebook, blank on X). PNG renders everywhere.
  return {
    title: metaTitle,
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: metaTitle,
      description: page.description,
      url: `${site.url}/${slug}`,
      type: isPost ? "article" : "website",
      ...(isPost && page.date ? { publishedTime: page.date } : {}),
      ...(isPost && page.updated ? { modifiedTime: page.updated } : {}),
      authors: [site.author],
    },
  };
}

const UPCOMING_LIMIT = 3;

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const isPost =
    page.type === "note" || page.type === "gear" || page.type === "gift";
  const backHref =
    page.type === "note" ? "/guides" : isPost ? "/allfinds" : "/";
  const backLabel =
    page.type === "note" ? "all guides" : isPost ? "all finds" : "home";

  // the discovery rail (sidebar) shows on posts AND standalone pages
  // (about / legal), so those don't sit as a lone narrow column on wide
  // screens. prev/next + related + continuous-reading stay post-only.
  const hasRail = isPost || page.type === "page";
  let prev: { slug: string; title: string } | null = null;
  let next: { slug: string; title: string } | null = null;
  let upcoming: UpcomingPost[] = [];
  let related: { slug: string; title: string; type: string }[] = [];
  let railTop: SidebarPost[] = [];
  let railRandom: SidebarPost[] = [];
  let railLatest: SidebarPost[] = [];
  let railTags: Awaited<ReturnType<typeof getAllTags>> = [];
  if (hasRail) {
    const allPosts = await getLatestPosts(); // newest-first

    // sidebar data (desktop rail) - same modules as the homepage
    const toRail = (p: {
      slug: string;
      title: string;
      type: string;
      date?: string;
      updated?: string;
    }): SidebarPost => ({ slug: p.slug, title: p.title, type: p.type, date: p.date, updated: p.updated });
    const [featured, tags] = await Promise.all([
      getFeaturedPosts(site.sidebar.topCount),
      getAllTags(),
    ]);
    railLatest = allPosts.slice(0, site.sidebar.latestCount).map(toRail);
    railTop = featured.map(toRail);
    railTags = tags;
    railRandom = (
      await getRandomPosts(site.sidebar.randomCount, [
        slug,
        ...featured.map((p) => p.slug),
        ...railLatest.map((p) => p.slug),
      ])
    ).map(toRail);

    if (isPost) {
      const adj = await getAdjacentPosts(slug);
      prev = adj.prev ? { slug: adj.prev.slug, title: adj.prev.title } : null;
      next = adj.next ? { slug: adj.next.slug, title: adj.next.title } : null;

      // related = other posts sharing at least one tag (newest-first), max 3
      if (page.tags && page.tags.length) {
        const tagset = new Set(page.tags);
        related = allPosts
          .filter(
            (p) =>
              p.slug !== slug && (p.tags || []).some((t) => tagset.has(t))
          )
          .slice(0, 3)
          .map((p) => ({ slug: p.slug, title: p.title, type: p.type }));
      }
      const i = allPosts.findIndex((p) => p.slug === slug);
      if (i !== -1) {
        upcoming = allPosts.slice(i + 1, i + 1 + UPCOMING_LIMIT).map((p) => ({
          slug: p.slug,
          title: p.title,
          type: p.type,
          date: p.date,
          description: p.description,
          tags: p.tags,
          html: p.html,
        }));
      }
    }
  }

  const inner = (
    <PostSwipe
      className="page reading"
      prevSlug={prev?.slug ?? null}
      nextSlug={next?.slug ?? null}
    >
      {isPost && <ReadingProgress />}
      <div className="page-tag">
        findshq &nbsp;//&nbsp; {page.type === "page" ? "the index" : displayType(page.type)}
      </div>

      <h1 className="page-title">{page.title}</h1>

      {isPost && (
        <div className="post-meta">
          <span>{displayType(page.type)}</span>
          <span className="dot">·</span>
          <Link href="/about" rel="author" className="byline">
            by {site.author}
          </Link>
          {page.date && <span className="dot">·</span>}
          {page.date && <span>{fmtDate(page.date)}</span>}
          {page.updated && page.updated !== page.date && (
            <>
              <span className="dot">·</span>
              <span>updated {fmtDate(page.updated)}</span>
            </>
          )}
          <span className="dot">·</span>
          <span>{page.readingMinutes} min read</span>
          <span className="dot">·</span>
          <Views slug={page.slug} />
        </div>
      )}

      {isPost && page.tags && page.tags.length > 0 && (
        <div className="post-tags">
          {page.tags.map((t) => (
            <Link key={t} href={`/tags/${tagSlug(t)}`} className="chip chip-link">
              {t}
            </Link>
          ))}
        </div>
      )}

      {/* the buy bar: a gift page's plaque. Product image on the lit pedestal
          (when a cover exists), then price + owner rating + the outbound shop
          link (rel="sponsored" - see the affiliate rules in CLAUDE.md). */}
      {page.type === "gift" && (
        <section className="post-vitrine" aria-label="where to buy">
          {(page.leadImage || page.cover) ? (
            <span className="post-vitrine-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.leadImage || page.cover}
                alt={page.title}
                width={1200}
                height={900}
                fetchPriority="high"
                decoding="async"
              />
            </span>
          ) : null}
          <div className="post-plaque">
            <span className="post-plaque-meta">
              {page.price ? <strong className="post-plaque-price">{page.price}</strong> : null}
              {typeof page.rating === "number" ? (
                <span aria-label={`rated ${page.rating} out of 5 by owners`}>
                  {page.rating.toFixed(1)} / 5 owner rating
                </span>
              ) : null}
            </span>
            {page.buyUrl ? (
              <a className="shop" href={page.buyUrl} target="_blank" rel="sponsored noopener">
                shop{page.merchant ? ` at ${page.merchant}` : ""}
                <span aria-hidden="true"> {"→"}</span>
              </a>
            ) : null}
          </div>
        </section>
      )}

      {page.toc.length >= 3 && (
        <nav className="toc" aria-label="table of contents">
          <div className="toc-head">on this page</div>
          <ul>
            {page.toc.map((h) => (
              <li key={h.id} className={`toc-d${h.depth}`}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: page.html }} />
      <CodeCopy />

      {isPost && (
        <Engage slug={page.slug} title={page.title} variant="post" />
      )}

      <Link href={backHref} className="back-link">
        &larr; {backLabel}
      </Link>

      {isPost && <PostNav prev={prev} next={next} />}

      {isPost && related.length > 0 && (
        <aside className="related" aria-label="related logs">
          <div className="related-head">related</div>
          <ul>
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="related-link">
                  <span className="related-type">{displayType(p.type)}</span>
                  <span className="related-title">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {isPost && upcoming.length > 0 && (
        <NextPostLoader
          upcoming={upcoming}
          interludeEvery={2}
          interludes={[
            <MobileDiscover key="d1" top={railTop} tags={railTags} modules={["top", "tags"]} />,
            <MobileDiscover key="d2" random={railRandom} modules={["random"]} />,
          ]}
        />
      )}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": isPost ? "BlogPosting" : "WebPage",
            headline: page.title,
            description: page.description,
            ...(page.date
              ? { datePublished: page.date, dateModified: page.updated || page.date }
              : {}),
            author: { "@type": "Person", name: site.author },
            ...(isPost
              ? {
                  // point at the PNG OG route (a title card), not the webp
                  // cover - keeps ALL image references X/crawlers might read as
                  // PNG, and webp-free. (X drops webp; this leaves it nothing.)
                  image: `${site.url}/${page.slug}/opengraph-image`,
                  publisher: {
                    "@type": "Organization",
                    name: site.name,
                    url: site.url,
                  },
                }
              : {}),
            url: `${site.url}/${page.slug}`,
            mainEntityOfPage: `${site.url}/${page.slug}`,
            ...(page.tags && page.tags.length
              ? { keywords: page.tags.join(", ") }
              : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "home", item: site.url },
              {
                "@type": "ListItem",
                position: 2,
                name: backLabel,
                item: `${site.url}${backHref}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: page.title,
                item: `${site.url}/${page.slug}`,
              },
            ],
          },
        ]}
      />
    </PostSwipe>
  );

  // non-posts (e.g. about) stay single-column/centered; posts ride in the
  // two-column reading-shell so the sidebar appears on desktop too.
  if (!hasRail) return inner;

  return (
    <div className="reading-shell">
      {/* prev/next markers + keys are post-only; standalone pages (about/legal)
          get the shell + rail for layout/discovery, but no adjacent-post nav. */}
      {isPost && <PostSideNav prev={prev} next={next} />}
      {isPost && (
        // keyboard: left -> newer (prev), right -> older (next), same direction
        // as the edge markers + in-content PostNav links + the swipe gesture.
        <KeyEdges
          leftHref={prev ? `/${prev.slug}` : null}
          rightHref={next ? `/${next.slug}` : null}
        />
      )}
      {/* post-only keys: space -> next (older) post, u/l -> upvote,
          z/x/c -> share (threads / x / copy). */}
      {isPost && <PostKeys nextHref={next ? `/${next.slug}` : null} />}
      {inner}
      <MobileDiscover top={railTop} tags={railTags} />
      <Sidebar top={railTop} random={railRandom} latest={railLatest} tags={railTags} />
    </div>
  );
}
