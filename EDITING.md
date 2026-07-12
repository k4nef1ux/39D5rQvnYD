# EDITING.md - the craft standard

The bar a q1rk post must clear as WRITING - separate from SEO.md (search
rules) and the brand voice rules in CLAUDE.md, which all still apply. This
file exists because a first draft is never the article: the owner caught
"momentum tonight matters more than perfection tonight" in a published post.
That class of mistake is what this standard and the pipeline below remove.

`npm run style-check <file>` enforces the countable rules mechanically.
The judgment rules are enforced by the editing pipeline (bottom of file).

## the countable rules (style-check enforces)

1. **No content word twice in one sentence.** "momentum tonight matters more
   than perfection tonight" fails. Rephrase or split.
2. **The "not x. y." reversal at most twice per post.** "not a verdict, a
   filter" is a punch the first time and a template the third.
3. **Hyphen-clause density under one per two sentences.** The brand bans em
   dashes; swapping the glyph but keeping em-dash syntax in every sentence
   makes a metronome. Most sentences must be plain: subject, verb, object.
4. **No two consecutive sentences opening with the same word** (paragraph
   scope, stopwords exempt).
5. **At most three paragraphs may end on a short punch fragment** (under 6
   words). Punchlines are rationed, not a house rhythm.

## the communication rules (owner, jul 2026 - these outrank everything below)

1. **Answer the title first.** The opening two sentences answer the title's
   question, plainly, for a beginner. Never open by narrowing or undercutting
   the title's promise ("why do only a few people make money..." under a
   how-to-make-money title = show's over).
2. **The stranger test.** Someone landing from google with zero context must
   understand every heading and every sentence on first read. Coined terms
   ("the library", "the morning") are introduced before use and NEVER carry
   a heading alone. Headings say what the section does: "tonight: set up the
   blog in one hour", not "tonight - the hour".
3. **Every referent is unmistakable.** No orphaned "they/it/this". No
   compressed noun phrases the reader must decompress ("the paying kind").
4. **One idea per paragraph, 1-3 sentences, 4 max.** A paragraph that needs
   a second read failed. Walls of text are an automatic reject.
5. **A sentence carries one thought.** If two claims share a sentence, the
   reader must not be able to fuse them into a third, false claim ("few
   people make real money + millions post into a void" fused = "people make
   money posting into a void").

## the source rules (fidelity - a post that breaks one does not publish)

Added jul 2026 after an audit found a published post inventing a scene,
dropping a source's own caveats, and anonymizing the person whose data
carried the piece. Voice rules make a post readable; these make it true.

1. **Name the source.** An external claim names its author or publication in
   the prose, not just behind an anchor link. "someone" / "a study" hides the
   person who did the work while borrowing its authority.
2. **No invented scenes.** Never dramatize a source's methodology (dates,
   actions, "bookmarked", "checked back") beyond what the source states.
   What the source says it did is what the post says it did.
3. **Keep the source's own caveats.** If the source says "estimates",
   "cohort, not a representative sample", or "the median hides x", the post
   carries that too. Keeping the number while dropping its caveat is
   misquoting with extra steps.
4. **Quotes are verbatim.** Quote marks mean the source's exact words. Trim
   only with a visible ellipsis; never silently cut an ending or splice.
   If the wording needs to change, paraphrase without quote marks.
5. **No borrowed superlatives.** Don't upgrade the source's finding ("a
   pattern" -> "the one pattern", correlation -> "decided who survived").
   The post's conviction lives in the reader's ACTION, never in inflating
   the evidence.
6. **One source can't carry a post.** If a single source supplies the
   skeleton and most of the evidence, the post is a retelling - bring
   independent sources, or frame it openly as a response to that source.
   **And one source gets used by ONE article, max (owner, jul 2026):**
   citing the same study/dataset/example across multiple posts turns the
   whole site into a retelling. Before reusing a source or a named
   example, grep /content for it - if it already appears in a post, find
   a new source and verify it fresh.
7. **Verify against the live source before publish.** Fetch every external
   link and check each sourced claim against what the page actually says.
   The pipeline's fact-check stage does this; a manual edit does it by hand.

## the judgment rules (editors enforce)

- **Aphorism budget: two per post.** Keep the two that carry the piece's
  spine, cut or flatten the rest into plain statements.
- **One controlling metaphor.** Pick it (the machine, the library, the
  road - one) and ride it the whole post. Secondary metaphors get one
  appearance or get cut. Never let pipes, ladders, doors, dials, and
  workers run simultaneously.
- **No unintended readings.** Read every line for the meaning you didn't
  intend ("the pipe goes in before the water" reads as a threat). If a
  cold reader can smirk at it, rewrite it.
- **Vary sentence shape.** Long flowing sentence, then a short one. A
  question sometimes. If three sentences in a row share a shape, break one.
- **Concrete beats abstract.** "momentum", "specificity", "value" are
  placeholders for the example you haven't given yet. Give it.
- **Every paragraph earns the next.** If the reader can stop comfortably
  at a paragraph's end, the handoff failed.
- **Read-aloud pass.** The final text gets read as speech. Anything you
  wouldn't say to a person across the table gets rewritten until you would.

## essay mode (owner, jul 2026)

Not every post is a utility post. An essay argues ONE original idea the
reader didn't arrive with, and it is judged by a different bar: does the
reader leave holding a claim they could disagree with and keep thinking
about anyway. Rules:

- **The thesis must be original.** Run it through the slop-engine gates
  (DELETE / 100-ARTICLES / TODDLER / ARGUE / DO). If the idea could sit
  unnoticed in a hundred existing posts, it is not an essay thesis.
- **Structure follows the argument**, not the utility skeleton: no
  "your hour" checklist, faq optional, 0-2 .vz blocks. The one-hour bar
  does not apply; the stranger test and the source rules still do.
- **q1rk is never the subject.** The doctrine (documentation over
  description) is advice for the READER's work. The site does not write
  about itself, its experiment, its numbers, or its tooling.
- The countable rules still run (`npm run style-check`), and a
  deliberate rhetorical repetition gets the style-ok annotation, not a
  workaround sentence.

## article visuals (.vz-* blocks)

Posts carry 2-4 HTML/CSS visual blocks - not images - that hold attention
and guide the read. Components live in `app/globals.css` (search "ARTICLE
VISUALS"); raw HTML passes through the markdown pipeline.

**The rule: a visual must carry information, never decoration.** It earns
its place by making something instantly graspable that prose delivers
slowly - a sequence, a comparison, a number that should be felt, a fork.
If removing the block loses nothing, remove it.

- `.vz-steps` - a vertical numbered path. For: the hour, any walk-through.
- `.vz-compare` - two panes side by side, winner marked `.hot`. For:
  before/after, the-machine-writes vs you-write.
- `.vz-stats` - a row of numbers, the key one `.hot`. For: money math,
  scale math.
- `.vz-flow` - a horizontal chain of nodes with `.vz-arrow` separators.
  For: cause feeding effect.
- `.vz-fork` - two separated panes, the taken road `.hot`. For: the
  two-futures close. Once per post, at most.
- `.vz-keys` - a shortcut rendered as keycaps (`.vz-keycap` per key,
  `.vz-key-plus` between, optional `.vz-key-then` for sequenced presses,
  `.vz-keys-does` naming the outcome, `.hot` on the combo to try first).
  For: utility posts where the answer IS a key combo - one glance, no
  prose. Example: <div class="vz-keys hot"><span class="vz-label">mac -
  part of the screen</span><span class="vz-keycap">cmd</span><span
  class="vz-key-plus">+</span><span class="vz-keycap">shift</span><span
  class="vz-key-plus">+</span><span class="vz-keycap">4</span><span
  class="vz-keys-does">drag, release - saved to the desktop</span></div>

Authoring rules:
- Write each block as ONE contiguous HTML chunk - no blank lines inside,
  or the markdown parser splits it.
- Blocks contain real text (they're readable, searchable, accessible) -
  never put load-bearing text in images.
- lowercase inside, brand rules apply (no emoji, hyphens only).
- Placement: where the prose makes the reader's eyes glaze - after a dense
  argument, not before it. The visual is the exhale.
- Optional `.vz-label` line names the block (e.g. "the hour / 00:00 -
  01:00") in small caps.

Example (a stats row):

    <div class="vz-stats"><div class="vz-stat"><span class="vz-stat-n">3-4%</span><span class="vz-stat-l">amazon cut</span></div><div class="vz-stat hot"><span class="vz-stat-n">20-50%</span><span class="vz-stat-l">software cut</span></div></div>

## the pipeline (how a post gets made)

No first draft publishes. Every post runs writer -> line editor -> cold
readers -> chief editor -> visuals -> gates, each stage a fresh context so
nobody grades their own homework. The workflow script lives at
`.claude/workflows/article-pipeline.js` (run via the Workflow tool with
`{scriptPath, args}`).

- **writer** - drafts from keyword + author persona, with CLAUDE.md voice
  rules and this file in hand. (Skipped when editing an existing post.)
- **line editor** - rewrites against this standard, sentence by sentence.
- **cold readers** (parallel, report only, never rewrite):
  - the tired 10pm reader: where did i stop reading, and why
  - the english teacher: what would i fail this for
  - the skeptic: where did i feel sold to, what claim didn't i believe
- **chief editor** - final pass with the reader reports; verdict publish
  or redo (one redo loop, then it goes to the owner instead of the site).
- **fact checker** - fetches every external link in the final text and
  checks each sourced claim against the source rules above; corrects in
  place, changes wording only where a claim misrepresents its source.
- **visuals** - places 2-4 .vz blocks per the rules above, after the text
  is final (visuals fit finished prose, not drafts).
- **gates** - `npm run style-check <file>` + `npm run seo-check` + build.

Inputs stay two: keyword, author. The pipeline replaces the single prompt,
not the owner's role.
