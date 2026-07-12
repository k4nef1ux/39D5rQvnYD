// components/GiftHero.tsx - the homepage hero: the showroom opening. A large
// serif statement beside the "find of the week" vitrine (product image on a
// lit pedestal, plaque overlaid on the lower edge). Server component (no JS,
// no banner image to preload), so it renders instantly as the LCP block.
import Link from "next/link";

export type HeroFind = {
  slug: string;
  title: string;
  description?: string;
  price?: string;
  category?: string;
  cover?: string;
};

export default function GiftHero({ find }: { find?: HeroFind }) {
  return (
    <section className="ghero">
      <div className="ghero-grid">
        <div className="ghero-copy">
          <p className="ghero-eyebrow">the curated gift index</p>
          {/* the hero commits to ONE niche, spoken to specifically - the
              rankable version of this page. Swap the niche here if the site
              lands on a different one; the structure stays. */}
          <h1 className="ghero-title">
            gifts that look expensive.{" "}
            <span className="ghero-accent">under $50.</span>
          </h1>
          {/* proof above the fold - vetting-voiced, never fabricated
              ownership. If we start buying and testing products for real,
              THEN this line can say so (see CLAUDE.md review policy). */}
          <p className="ghero-lede">
            we read the one-star reviews first - the complaints, the
            month-three failures, the detail the product page hides. what
            survives goes on the list. nothing that ends up in a drawer.
          </p>
          <div className="ghero-cta">
            <Link className="btn-gold" href="/quiz">
              take the 30-second gift quiz
            </Link>
            <a className="btn-ghost" href="#stream">
              browse the vetted picks<span aria-hidden="true"> {"→"}</span>
            </a>
          </div>
        </div>

        {find ? (
          <Link href={`/${find.slug}`} className="ghero-feature" aria-label={find.title}>
            <span className="ghero-tile">
              {find.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={find.cover} alt={find.title} width={720} height={760} fetchPriority="high" decoding="async" />
              ) : (
                <span className="ghero-tile-mark" aria-hidden="true">{find.title.charAt(0)}</span>
              )}
              <span className="ghero-badge">find of the week</span>
              <span className="ghero-fcard">
                <span className="ghero-ftext">
                  <span className="ghero-ft-title">{find.title}</span>
                  {find.description ? <span className="ghero-ft-desc">{find.description}</span> : null}
                </span>
                {find.price ? <span className="ghero-ft-price">{find.price}</span> : null}
              </span>
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
