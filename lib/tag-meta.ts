// lib/tag-meta.ts - per-tag SEO <title> + meta description for the tag archive
// pages. These feed generateMetadata only (the document <title> and the meta
// description) - they are NOT rendered as visible body copy, so the keyword
// context helps search without putting a wall of intro text in front of readers.
// Keyed by tag slug. Unknown tags fall back to a generic line in
// app/tags/[tag]/page.tsx.

export type TagMeta = { title: string; description: string };

export const TAG_META: Record<string, TagMeta> = {
  "adhd": { title: "adhd - building with the brain you have", description: "adhd and building anyway. notes on focus, systems that survive bad days, and shipping work without pretending your wiring is something it isn't." },
  "agents": { title: "ai agents - what they do, what they don't", description: "ai agents that act, not just chat. notes on building, wiring, and trusting autonomous tools, plus where the demos quietly fall apart in real use." },
  "ai": { title: "ai - tools, builds, and straight takes", description: "ai without the hype tax. what these models are good at, where they fail, and how to build things with them that hold up after the demo ends." },
  "assets": { title: "assets - things that work while you sleep", description: "build assets, not just income. notes on owning things that compound, pay out over time, and don't vanish the second you stop showing up." },
  "attention": { title: "attention - the thing they're selling", description: "attention is the product, and you're the inventory. notes on how feeds farm focus, what it costs you, and how to take some of it back." },
  "audience": { title: "audience - owned, not rented from a feed", description: "build an audience you actually own. notes on email over algorithms, real reach versus borrowed reach, and not renting your readers from a platform." },
  "automation": { title: "automation - let the machines do the boring", description: "automation for the work you hate. notes on wiring up scripts, no-code flows, and small systems that do the repetitive parts so you don't." },
  "blogging": { title: "blogging - the slow web that still pays", description: "blogging on land you own. notes on writing posts that rank, compound, and outlast feeds, on a site nobody can deplatform you from." },
  "chatgpt": { title: "chatgpt - prompts, limits, real workflows", description: "chatgpt past the parlor tricks. notes on prompts that work, where it quietly lies, and folding it into real workflows instead of just chatting." },
  "claude": { title: "claude - building with anthropic's model", description: "claude for building, not just chatting. notes on long-context work, coding with it, and where anthropic's model beats and trails the rest." },
  "coding": { title: "coding - shipping software you control", description: "coding to ship, not to flex. notes on building real software, what ai changes about it, and writing things you actually own and understand." },
  "content": { title: "content - making things worth finding", description: "content that earns its place. notes on writing, format, and making things people actually search for, instead of feeding a feed that forgets you." },
  "dropshipping": { title: "dropshipping - the model, minus the gurus", description: "dropshipping without the course-seller spin. notes on how the model really works, where the margins hide, and why most stores quietly fail." },
  "ecommerce": { title: "ecommerce - building a store you own", description: "ecommerce on your terms. notes on building a store, picking platforms, and selling things online without handing your whole business to a marketplace." },
  "freedom": { title: "freedom - the quiet kind, built not bought", description: "freedom as something you build. notes on owning your time, your work, and your platform, instead of buying the version they sell back to you." },
  "freelancing": { title: "freelancing - trading hours, but on your terms", description: "freelancing without the burnout trap. notes on finding clients, pricing your work, and turning hours-for-money into something that doesn't own you." },
  "gear": { title: "gear - the tools that earn their desk", description: "gear that earns its place on the desk. first-hand notes on the hardware and kit i actually use to build, write, and ship, with the misses left in." },
  "growth": { title: "growth - the real kind, not vanity counts", description: "growth that means something. notes on real reach over follower vanity, what actually compounds, and the metrics worth chasing instead of the loud ones." },
  "income": { title: "income - building it, owning it, keeping it", description: "income you build and keep. notes on streams worth starting, the difference between earning and owning, and money that doesn't vanish when you log off." },
  "independence": { title: "independence - off the platform leash", description: "independence from platforms and bosses alike. notes on owning your infrastructure, your audience, and the off-switch nobody else gets to hold." },
  "make-money-online": { title: "make money online - real methods, no hype", description: "make money online, minus the dropshipping fairy tales. notes on methods that actually move, the ones that don't, and how the few that genuinely work." },
  "make-money-with-ai": { title: "make money with ai - real uses, not hype", description: "make money with ai without the snake oil. notes on what these tools can actually monetize, where the easy money already dried up, and what holds." },
  "marketing": { title: "marketing - getting found without the slime", description: "marketing that doesn't make you feel gross. notes on getting found, telling the truth well, and reaching people without manipulation or fake scarcity." },
  "passive-income": { title: "passive income - the straight version", description: "passive income, told straight. notes on what's actually passive, what just looks it, and the upfront work nobody mentions before the income trickles in." },
  "platforms": { title: "platforms - whose land are you building on", description: "platforms give reach and take the rules. notes on the trade you make renting their land, when it's worth it, and how to never be fully captured." },
  "productivity": { title: "productivity - doing less, but the right less", description: "productivity past the app churn. notes on doing the right less, building systems that survive bad days, and output that isn't just busywork in disguise." },
  "review": { title: "review - tools and gear, tested for real", description: "straight reviews of the tools and gear i actually use. what works, what's overhyped, and where the affiliate-driven verdicts quietly leave the flaws out." },
  "seo": { title: "seo - getting found without the tricks", description: "seo that survives the next update. notes on writing for search and humans at once, what still works in an ai world, and the tricks that age badly." },
  "shipping": { title: "shipping - the part where you hit publish", description: "shipping over polishing. notes on finishing the thing, beating the urge to tweak forever, and why a published draft beats a perfect plan every time." },
  "side-hustle": { title: "side hustle - the one that might outgrow the job", description: "side hustle, started small and real. notes on the ones worth your nights, the ones that just buy you a second job, and how to tell them apart." },
  "small-business": { title: "small business - lean, owned, built to last", description: "small business done lean. notes on building something small you fully own, staying profitable without staff or funding, and lasting past the launch buzz." },
  "solopreneur": { title: "solopreneur - one person, real leverage", description: "solopreneur leverage, built right. notes on running real revenue solo, where automation and ai replace a team, and staying small completely on purpose." },
  "the-build": { title: "the build - watching this thing get made", description: "the build in the open. notes from making q1rk and what funds it: the decisions, the dead ends, and the work nobody shows when they sell you the result." },
  "tools": { title: "tools - the software that earns its keep", description: "tools that earn their keep. straight notes on the software i actually use to build, write, and ship, what's worth paying for, and what to quietly drop." },
  "web-hosting": { title: "web hosting - where your site really lives", description: "web hosting, explained without the jargon. notes on picking a host, what the specs really mean, and keeping your site fast on land you actually control." },
  "website": { title: "website - the home base you own outright", description: "your website is the one place online you fully own. notes on building it right, making it fast, and why a domain beats a profile on rented land." },
  "wordpress": { title: "wordpress - the old workhorse, used well", description: "wordpress without the bloat. notes on running it lean and fast, the plugins worth keeping, and when the old workhorse still beats the shiny alternatives." },
  "youtube": { title: "youtube - reach you rent, work you keep", description: "youtube without the burnout treadmill. notes on the reach it lends you, the work it demands, and turning views into something you actually own off-platform." },
};
