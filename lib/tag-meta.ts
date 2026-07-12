// lib/tag-meta.ts - per-tag SEO <title> + meta description for the tag archive
// pages. These feed generateMetadata only (the document <title> and the meta
// description) - they are NOT rendered as visible body copy, so the keyword
// context helps search without putting a wall of intro text in front of readers.
// Keyed by tag slug. Unknown tags fall back to a generic line in
// app/tags/[tag]/page.tsx. Every tag used in content needs an entry here -
// npm run seo-check fails on gaps. Voice: quiet, curated, plain english.

export type TagMeta = { title: string; description: string };

export const TAG_META: Record<string, TagMeta> = {
  "for-him": { title: "gifts for him - picks that feel chosen", description: "gifts for him, curated slowly. the leather, the audio, the upgrades he keeps not buying himself - each pick vetted against real owner reviews first." },
  "for-her": { title: "gifts for her - considered, not guessed", description: "gifts for her that read as considered, not last-minute. jewelry, silk, the small luxuries - every pick checked against what owners actually report." },
  "for-them": { title: "gifts for them - safe for anyone, never boring", description: "gifts for them - couples, hosts, coworkers, the hard-to-shop-for. picks that suit anyone without feeling generic, vetted before they make the list." },
  "occasions": { title: "gifts by occasion - the date is the brief", description: "gifts sorted by the moment: weddings, birthdays, housewarmings, thank-yous. when the date is fixed and the idea is not, start with these picks." },
  "hobbies": { title: "gifts by hobby - feed the obsession", description: "gifts matched to what they already love: coffee, vinyl, photography, plants. picks that respect the hobby enough to get the details right." },
  "cozy": { title: "cozy gifts - comfort that reads as luxury", description: "cozy gifts done properly: weighted blankets, loungewear, the soft heavy things people never buy themselves. comfort picks that still look expensive." },
  "home": { title: "home gifts - upgrades for their space", description: "gifts for the home that earn their shelf space. quiet upgrades for kitchens, desks, and living rooms - picked for taste, checked for build quality." },
  "sleep": { title: "sleep gifts - the most welcome upgrade", description: "gifts for better sleep: silk sets, weighted blankets, wind-down upgrades. nobody buys these for themselves, which is exactly why they land as gifts." },
  "kitchen": { title: "kitchen gifts - for the one who feeds you", description: "kitchen gifts for hosts and home cooks: boards, brewers, the tools they reach for daily. picked for use, not for sitting pretty in a cupboard." },
  "personalized": { title: "personalized gifts - made about them", description: "personalized gifts that feel made, not printed: engraved boards, birth flower pieces, keepsakes. the monogram is the point - get the details right." },
  "wedding": { title: "wedding gifts - past the registry", description: "wedding gifts beyond the registry: keepsakes, upgrades for the first home, things the couple keeps. picks that survive the pile of identical boxes." },
  "vinyl": { title: "vinyl gifts - for the record collector", description: "gifts for the vinyl person: players, storage, the listening-corner upgrades. picked with the collector's standards in mind, not the gadget aisle's." },
  "travel": { title: "travel gifts - for the one always leaving", description: "travel gifts that earn a place in the bag: dopp kits, carry upgrades, the small organized luxuries. picked for the person who packs light and often." },
  "stationery": { title: "stationery gifts - paper, ink, intent", description: "stationery gifts for the analog holdouts: pens, paper, calligraphy kits. tactile, deliberate picks for people who still write things by hand." },
  "retro": { title: "retro gifts - old formats, done well", description: "retro gifts that are more than a costume: instant cameras, record players, formats that came back. picked for the ones that actually work daily." },
  "plants": { title: "plant gifts - green, alive, forgiving", description: "plant gifts for desks and windowsills: planters, low-effort greenery, the alive kind of decor. picked to survive the recipient's watering habits." },
  "photography": { title: "photography gifts - for the one who shoots", description: "gifts for the photographer in the group: instant cameras, film, display pieces for the shots they love. picked to be used, not shelved." },
  "party": { title: "party gifts - for hosts and gatherings", description: "gifts for hosts and gatherings: the icebreakers, the table pieces, the things that get passed around. picked to make the evening, not clutter it." },
  "music": { title: "music gifts - for the listener", description: "gifts for the music person: players, listening-room upgrades, the pieces that make a corner of the house theirs. picked by the listener's standards." },
  "morning": { title: "morning gifts - upgrade the ritual", description: "gifts for the morning ritual: pour-over sets, slow-coffee gear, the first-hour upgrades. picked for people whose day starts before their phone does." },
  "luxe": { title: "luxe gifts - the quiet expensive ones", description: "the quiet expensive picks: silk, leather, weight you can feel. gifts that signal taste without a logo doing the talking - vetted for real quality." },
  "loungewear": { title: "loungewear gifts - off-duty, elevated", description: "loungewear worth gifting: washed silk, soft sets, the off-duty pieces that still look intentional. picked for comfort that photographs well." },
  "leather": { title: "leather gifts - the ones that age well", description: "leather gifts that get better with use: dopp kits, small goods, full-grain over bonded every time. picked to look richer at year five than day one." },
  "learning": { title: "learning gifts - a new skill in a box", description: "gifts that teach something: calligraphy kits, starter sets, the first step into a craft. picked so the box actually gets opened and used." },
  "keepsake": { title: "keepsake gifts - made to be kept", description: "keepsake gifts made to outlast the occasion: engraved pieces, birth flower jewelry, the things that get kept in the family. sentiment, done tastefully." },
  "jewelry": { title: "jewelry gifts - small, personal, kept", description: "jewelry gifts that read as personal, not generic: birth flowers, meaningful pieces, everyday-wearable weight. picked for the story, not the sparkle." },
  "fun": { title: "fun gifts - joy, without the junk drawer", description: "fun gifts that dodge the junk drawer: instant cameras, party pieces, things that get used at every gathering. joy picks with actual staying power." },
  "everyday": { title: "everyday gifts - used daily, not shelved", description: "gifts that enter the daily rotation: the blanket on the couch, the kit in the bag, the board on the counter. picked to be used, not displayed." },
  "desk": { title: "desk gifts - for where they spend the day", description: "desk gifts for the eight-hour room: plants, small upgrades, the pieces that make a workspace personal. picked to look deliberate on camera too." },
  "creative": { title: "creative gifts - tools for making things", description: "gifts for the maker: calligraphy kits, cameras, the tools of a craft. picked for the person whose idea of rest is starting another project." },
  "coffee": { title: "coffee gifts - for the ritualist", description: "coffee gifts for the ritualist: pour-over sets, grinders, the slow-morning kit. picked by the standards of people who time their brews." },
};
