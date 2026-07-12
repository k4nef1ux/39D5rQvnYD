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
          <h1 className="ghero-title">
            gifts worth <span className="ghero-accent">giving.</span>
          </h1>
          <p className="ghero-lede">
            every find here earned its place - checked against real owner
            reviews, priced honestly, chosen like it&apos;s for someone we know.
            for him, for her, for everyone on the list.
          </p>
          <div className="ghero-cta">
            <a className="btn-gold" href="#stream">
              browse the finds<span aria-hidden="true"> {"→"}</span>
            </a>
            <Link className="btn-ghost" href="/tags/occasions">
              shop by occasion
            </Link>
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
