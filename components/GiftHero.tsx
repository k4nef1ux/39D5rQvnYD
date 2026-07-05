// components/GiftHero.tsx - the homepage hero. A warm headline + a "find of the
// week" product tile on the scroll-stopping yellow. Server component (no JS, no
// banner image to preload), so it renders instantly as the LCP block.
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
          <p className="ghero-eyebrow">cool finds, wholesome gifts.</p>
          <h1 className="ghero-title">
            gifts worth <span className="ghero-accent">giving.</span>
          </h1>
          <p className="ghero-lede">
            hand-picked things people actually want - for him, for her, for them,
            and every occasion in between. no filler, no guesswork. just the good
            stuff, found for you.
          </p>
          <div className="ghero-cta">
            <a className="btn-yellow" href="#stream">
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
