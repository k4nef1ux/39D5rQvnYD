// components/PostCard.tsx - two shapes share one component:
//  - a PRODUCT card (type "gift" or anything with a price/buyUrl): a big yellow
//    image tile + category tag + warm blurb + price + shop CTA. Used on the feed
//    stream + section/tag indexes.
//  - a REVIEW/GUIDE card (note/gear): the restrained editorial card.
// The shop button is an outbound affiliate link (rel="sponsored"); the tile +
// title link to the on-site review page.
import Link from "next/link";
import Engage from "@/components/Engage";

export type PostCardData = {
  slug: string;
  title: string;
  type: string;
  date?: string;
  updated?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  // product fields
  category?: string;
  price?: string;
  buyUrl?: string;
  merchant?: string;
  rating?: number;
};

export function fmtDate(d?: string): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date
    // pin UTC so the server (UTC) and client render the same string regardless
    // of the viewer's timezone - otherwise dates parsed as UTC midnight flip a
    // day in behind-UTC zones and trigger a React hydration mismatch (#418).
    .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" })
    .toLowerCase();
}

function isProduct(post: PostCardData): boolean {
  return post.type === "gift" || Boolean(post.price) || Boolean(post.buyUrl);
}

function ProductCard({ post }: { post: PostCardData }) {
  const href = `/${post.slug}`;
  return (
    <div className="card-product">
      <Link href={href} className="pcard-tile-link" aria-label={post.title}>
        <span className="pcard-tile">
          {post.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover} alt={post.title} loading="lazy" decoding="async" width={800} height={800} />
          ) : (
            <span className="pcard-tile-mark" aria-hidden="true">{post.title.charAt(0)}</span>
          )}
          {post.category ? <span className="pcard-tag">{post.category}</span> : null}
        </span>
      </Link>
      <div className="pcard-body">
        <Link href={href} className="pcard-title">{post.title}</Link>
        {post.description ? <p className="pcard-desc">{post.description}</p> : null}
        <div className="pcard-foot">
          <span className="pcard-price">
            {post.price || "see price"}
            {typeof post.rating === "number" ? (
              <span className="pcard-rating" aria-label={`rated ${post.rating} out of 5`}>
                {post.rating.toFixed(1)}
              </span>
            ) : null}
          </span>
          {post.buyUrl ? (
            <a className="shop" href={post.buyUrl} target="_blank" rel="sponsored noopener">
              shop<span aria-hidden="true"> {"→"}</span>
            </a>
          ) : (
            <Link className="shop" href={href}>
              view<span aria-hidden="true"> {"→"}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post }: { post: PostCardData }) {
  if (isProduct(post)) return <ProductCard post={post} />;

  // with a cover, the card is a grid: image (top-left), text (right, spanning),
  // and the engage row tucked under the image (grid-area: engage). Without a
  // cover it's a simple stack. Engage stays a sibling (never nested in a link).
  return (
    <div className={`card${post.cover ? " card-has-cover" : ""}`}>
      {post.cover ? (
        <Link href={`/${post.slug}`} className="card-cover-link" aria-hidden="true" tabIndex={-1}>
          <span className="card-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt={post.title} loading="lazy" decoding="async" width={1280} height={720} />
          </span>
        </Link>
      ) : null}
      <Link href={`/${post.slug}`} className="card-link">
        <div className="card-top">
          <span className="card-label">{post.type}</span>
          <span className="card-date">
            {post.updated && post.updated !== post.date
              ? `updated ${fmtDate(post.updated)}`
              : fmtDate(post.date)}
          </span>
        </div>
        <div className="card-title">{post.title}</div>
        {post.description ? (
          <p className="card-desc">{post.description}</p>
        ) : null}
        {post.tags && post.tags.length > 0 && (
          <div className="card-tags" aria-hidden="true">
            {post.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}
      </Link>
      <Engage slug={post.slug} title={post.title} variant="card" />
    </div>
  );
}
