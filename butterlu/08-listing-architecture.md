# 08 — Listing Architecture: the Design Matrix

Answers: *how do we build listings to capture keywords when a godparent frame
is the same design as a grandparent frame with the word swapped?*

> ## ⚠️ Provenance: this matrix is Shopify-derived and ~16 months stale
>
> **The matrix has never seen Etsy.** It is mined entirely from the 243
> products in `data/catalog.json`, which are the *Shopify* catalog.
>
> Dating the snapshot from `publishedAt`: **all 99 published products entered
> Shopify in April–May 2025** (24 in April, 75 in May) and **nothing has been
> published since**. Product IDs cluster in batches consistent with bulk
> imports over a few weeks. Today is 2026-08-22.
>
> So the matrix represents **Etsy as of ~April/May 2025**, filtered through
> whatever that import captured, minus whatever was archived afterwards.
> **Any listing added to Etsy since then is absent from it.** The owner has
> confirmed new products were added to Etsy in the interim.
>
> Direct scraping of `etsy.com/shop/ButterLu` and `/shop/BoutiqueButterLu`
> **failed — Etsy blocks automated access**, including via stealth and
> enhanced proxies, on shop pages, review pages and individual listing pages.
> URL enumeration returns only the shop and reviews pages.
>
> **However: 38 live Etsy listings were recovered** by fingerprint-searching
> ButterLu's unique description boilerplate through search-engine indexes.
> Findings are in `data/etsy-recon.json` and summarised in
> "What Etsy actually looks like now" below. **They confirm the divergence.**
>
> **To refresh: export the Etsy listings CSV** (Etsy Shop Manager → Settings →
> Options → Download Data → "Currently for sale listings"). First-party,
> complete, includes title, description, price, SKU, quantity and **all 13
> tags per listing** — a far better keyword source than tags mined out of
> Shopify descriptions. See "Refreshing from Etsy" at the end of this doc.
>
> Treat every cell count below as a **floor**, not a current state.

## The rule

> **The product/variant boundary follows search intent and purchase decision —
> not manufacturing.**

Two shoppers searching "godmother frame" and "grandma frame" are **different
people with different intent**. They must land on different URLs.

One shopper choosing black-and-white versus a sage colourway is **the same
person making a style choice**. That belongs on one URL, as a variant.

That the two frames come off the same artwork template with one word swapped is
a **production** fact. It has no bearing on how the catalog is modelled.

**The owner's proposed model is correct**: separate products per relationship,
with the variant axis being the genuine design/colour difference.

## Why relationship must never be a variant

Collapsing godmother/grandma/auntie into a "Relationship" dropdown on one
product would:

- produce **one URL** where you need three, so you can rank for at most one head term
- make `?variant=` the only differentiator, and variant URLs are not
  independently indexed in any reliable way
- throw away the entire long-tail surface — the exact thing the Etsy strategy
  was capturing
- bury the shopper's own word. Someone searching "godmother" should see
  "Godmother" in the title, the H1, and the meta description

This is the single most expensive mistake available in this restructure.

## The matrix that is already in your catalog

Titles were mined for recurring quote templates and relationship terms. The
catalog is a **design template x relationship** grid. Data:
`data/design-matrix.json`.

**Templates found** (the reusable artwork/quote), with their search intent:

| Template | Intent |
|---|---|
| `Will You Be My {REL}` | Proposal / the ask |
| `Only The Best {A} Get Promoted To {B}` | Milestone / role change |
| `I Love My {REL}` | Gift from the child |
| `{REL}s Are A Blessing` | Sentimental tribute |
| `{REL}'s Little Girl / Little Guy` | Bond / nickname |
| `{REL}'s Bestie / Buddy` | Bond / nickname |
| `Thank You For Raising...` | Wedding thank-you |
| `Today A {REL}...` | Wedding milestone |
| `{REL} Est. 20XX` | Announcement / reveal |
| `Handpicked For Earth By My {REL}` | Memorial / heaven |
| `{REL} And Me` | Shared-photo bond |

**Relationship axis** (frequency across all 243 titles):

```
godmother 167 · godfather 151 · godparents 76 · grandpa 57 · grandma 47
mom 42 · aunt 28 · parents 27 · uncle 19 · great grandma 17 · bride 17
gigi 13 · groom 13 · sister 10 · godchild 10 · mimi 10 · best friend 8
```

**Proof the templates genuinely cross relationships:**

- `Only The Best {A} Get Promoted To {B}` — 13 products spanning godmother,
  aunt, grandma, great grandma, sister, godfather, best friend, uncle,
  grandpa, nana
- `I Love My {REL}` — 35 products spanning godmother, godfather, godparents,
  grandpa, great grandma, gigi
- `Will You Be My {REL}` — 19 products spanning godmother, godfather, godparents

## Grid coverage

11 templates x 17 relationships = **187 possible cells**.

| | Cells |
|---|---|
| Have a **live** product | 39 |
| **Archived only** — design exists, nothing live | 9 |
| **Never built** | 139 |

The 139 empty cells are not all worth building — many combinations are
nonsense (`Handpicked For Earth By My Teacher`). But the grid makes the real
question tractable: *which cells have search demand?*

## The godparent answer

Godparent is the highest-demand relationship in the entire catalog
(godmother 167, godfather 151, godparents 76 title mentions) and the Etsy tag
data confirms it converted (`baptism gift` 99, `godparents frame` 78).

**Live godparent products today: 4.** Only 3 are in `godparent-frames` —
"The Best Uncles Get Promoted to Godfather" sits in `aunt-uncle-frames` only,
invisible in the godparent category. (It legitimately belongs in **both**;
see the multi-collection point in `04-collections-taxonomy.md`.)

Godparent grid state:

| Template | godmother | godfather | godparents |
|---|---|---|---|
| `Will You Be My {REL}` | **0 live / 9 archived** | 1 live | 1 live |
| `Only The Best {A} Get Promoted To {B}` | **0 live / 5 archived** | 1 live | — |
| `I Love My {REL}` | 1 live | 1 live | 1 live |
| `{REL}s Are A Blessing` | **0 live / 14 archived** | 1 live | **0 live / 4 archived** |

**"Will You Be My Godmother" — a high-intent proposal keyword with nine
archived listings behind it — has zero live products.** Same for
"Godmothers Are A Blessing" with fourteen.

### Build plan: 4 products, not 103

To cover the godparent keyword space you do **not** unarchive 103 listings.
You build **one product per cell**:

- `Will You Be My Godmother` — proposal intent
- `Only The Best {Sisters/Friends/Aunts} Get Promoted To Godmother` — milestone
- `Godmothers Are A Blessing` — tribute
- `Godparents Are A Blessing` — tribute

Four products. The artwork already exists inside the archived listings — this
is recovery, not design work.

## Why matrix cells do not cannibalise

Each cell maps to a **distinct search phrase with distinct intent**:

```
"will you be my godmother frame"     -> asking someone (pre-baptism)
"i love my godmother frame"          -> gift from the godchild
"godmothers are a blessing frame"    -> sentimental gift to her
"best sisters promoted to godmother" -> milestone/announcement
```

These are different searches by different people at different moments. They do
not compete. This is exactly the long-tail capture the Etsy flood achieved —
rebuilt legitimately, at roughly 1/10th the listing count.

**The head term goes to the collection**, not a product:

| Layer | Owns | Example |
|---|---|---|
| Collection | Head term | `/collections/godmother-frames` -> "godmother frame", "godmother gift" |
| Product | Long-tail + intent | `/products/will-you-be-my-godmother-frame` |
| Variant | Colourway | `?variant=` sage / black-and-white / blush |

**Guard rail:** no two live products may target the same primary phrase
(`05-seo-program.md`). The matrix enforces this naturally — one cell, one phrase.

## Efficient build process

1. **Confirm the template list against artwork.** Detection here is
   phrase-matching on titles and is approximate. A human should confirm which
   templates are genuinely one reusable artwork.
2. **Score cells by demand** — Etsy tag frequency (`data/keyword-assets.json`)
   plus SERP recon (`05-seo-program.md`). Build only cells with evidence.
3. **Recover archived artwork** for archived-only cells. Nine such cells exist.
4. **Generate listings from the template**, since title, description, and SEO
   copy are all mechanical substitutions of `{REL}` into a per-template
   pattern. This is the "efficient and optimised" build the owner asked for —
   it is a data-driven generation step, not 100 hand-written listings.
5. **Assign each product to every collection it belongs to** — relationship
   AND occasion. The promoted-to-godfather/uncle product proves single
   assignment loses products.
6. **Redirect** archived handles to their new cell owner (`02-target-model.md`).

## Open questions

1. Confirm the template list against actual artwork — is `I Love My {REL}` one
   design or several?
2. Which of the 139 empty cells have real demand? Needs SERP + Etsy data.
3. Is the variant axis colourway only, or also a genuine artwork variant
   (black-and-white vs colour)? If both, that is two option axes, well within
   the 2048-variant limit.


## Refreshing from Etsy

The template list, the relationship axis, and every cell count here are
derived from a stale Shopify import. Refreshing them requires current Etsy data.

**Recommended input: the Etsy listings CSV.** Shop Manager → Settings →
Options → Download Data → "Currently for sale listings". No API registration,
no scraping, and it is the authoritative source.

Once that CSV exists, the same mining that produced this doc can be re-run to
yield materially more:

1. **Current Etsy matrix** — templates x relationships as they stand today,
   not as of April 2025.
2. **Etsy-vs-Shopify diff** — three buckets:
   - on Etsy, missing from Shopify (**new since the import — the owner's question**)
   - on Shopify, gone from Etsy (retired designs; check before reviving)
   - on both (the overlap the current matrix approximates)
3. **Real tag data.** Etsy allows 13 tags per listing and they are the seller's
   own keyword bets. `data/keyword-assets.json` currently infers these from
   Shopify tags, which are import residue. The CSV gives them first-hand.
4. **Price data**, absent from every analysis so far.

**This is the highest-value outstanding data pull in the project.** It feeds
this doc, `04-collections-taxonomy.md` (the godparent revival decision) and
`05-seo-program.md` (which already flags Etsy stats as beating any SERP scrape).

Note: the CSV covers *listings*. Etsy **shop stats** — the converting search
terms — are a separate export and are the single best SEO input available.

### Also unresolved: how many Etsy shops are there?

Three distinct Etsy references appear across the 88 product descriptions:

| Reference | Distinct descriptions mentioning it |
|---|---|
| `boutiquebutterlu.etsy.com` | 37 |
| `butterlu.etsy.com` | 27 |
| `myfourlittlechicks.etsy.com` | 2 |

`etsy.com/shop/ButterLu` is confirmed live. Whether `BoutiqueButterLu` is a
second active shop, a rename, or a legacy URL is **unknown** — and
`myfourlittlechicks` is unexplained.

This matters for the refresh: if there is more than one live shop, the export
is needed from each. It also matters for `05-seo-program.md`, since product
descriptions currently point customers at Etsy URLs that may be wrong, dead,
or a competitor's.


## What Etsy actually looks like now

**Method.** Etsy blocks scraping, so listings were recovered indirectly: three
phrases unique to ButterLu's boilerplate were searched against indexed Etsy
pages —

```
"photo turns to keep your photo in place"
"sanded to give it a warm, rustic touch"
"Primary color refers to the background color"
```

**38 unique live listings** recovered. Data: `data/etsy-recon.json`.

> **This is a sample, not a census.** It reflects what search engines have
> indexed, not the shop's true inventory. The Etsy CSV export remains the
> authoritative source. One near-match (`DreamyPresents`) used similar but
> not identical wording — copycats are a real risk with fingerprint matching.

### Finding 1 — Etsy titles have been rewritten. Shopify's have not.

Etsy now uses a benefit-led, colon-separated convention:

```
Personalized Abuela Gift: Rustic 4x6 Photo Frame
Personalized Godmother Picture Frame: Baptism Gift
Mother of Groom Gift: Rustic Wedding Photo Frame
Personalized Grammy Photo Frame: Rustic Nursery Decor
```

Shopify still carries the old keyword-stuffed run-ons:

```
Birthday Gift For Great Grandma  Personalized Gift For Great Grandma
Gift From Grandchild  I Love My Great Grandma  4x6 Frame
```

**Etsy has moved on from the listing-flood strategy.** The newest listings also
carry rewritten body copy ("Primary Color: Refers to the background color of
the design. Text is printed in white or black, depending on what contrasts
best."), cleaner than the Shopify-side boilerplate.

### Finding 2 — relationships on Etsy that do not exist on Shopify at all

Not live, not draft, **not even archived**:

| Relationship | On Etsy | Anywhere on Shopify |
|---|---|---|
| **Abuela** | 2 | **0** |
| **Grammy** | 1 | **0** |
| **Memaw** | 1 | **0** |

These are new matrix rows. The relationship axis in this doc is missing them.

### Finding 3 — godparent is alive on Etsy and archived on Shopify

In a 38-listing sample:

| | Etsy (sample) | Shopify (live) |
|---|---|---|
| godmother | **7** | 1 |
| godparent/godchild | **3** | 1 |
| grandpa | 0 | 17 |

Recovered godparent listings include `Godmother Proposal Gift: Rustic Photo
Frame With Bow`, `Personalized Godmother Picture Frame: Baptism Gift`,
`Godmother Gift From Godchild`, `Personalized Godparent Picture Frame` and
`Personalized Godmother Picture Frame: Rustic Burlap Bow`.

**This settles the godparent question in `04-collections-taxonomy.md`.** The
category was not retired — it is actively merchandised on Etsy with rewritten
titles, while Shopify shows 3 products in a 103-product collection. Reviving
it on Shopify is bringing Shopify in line with the live business, not a bet.

### Finding 4 — listings created after the Shopify import

Etsy IDs are roughly sequential by creation. The four newest recovered —
`1796129634`, `1796129988`, `1818445202`, `1832920613` — sit well above the
range implied by the April/May 2025 import, confirming new listings since.
`1818445202` is "Personalized Baby Girl Birth Announcement Picture Frame".

Age spread of the sample: 12 oldest (<600M), 14 (600–900M), 4 (900M–1.2B),
3 (1.2–1.6B), 5 newest (>1.6B). **The shop has been continuously active
throughout**, not frozen at the import.

### Finding 5 — a 2026 personalization failure, in public

A review surfaced on `etsy.com/shop/ButterLu/reviews`:

> *"I love my personalized picture frame I purchased, however it arrived not
> personalized. I typed in the dogs name 'Axel' 2026 The frame does not have
> that on it."*

A paying customer entered personalization and received a blank frame — on the
platform that **does** have a personalization field. This is direct evidence
for `06-personalization.md`: personalization capture and fulfilment is already
failing where it exists, which raises the stakes on building it correctly on
Shopify rather than bolting on a text box.

## Revised conclusion on the matrix

The matrix in this doc is **a subset of, and stylistically behind, the live
Etsy catalog.** It remains structurally sound — templates x relationships is
the right model, and Etsy's own rewritten titles follow it more cleanly than
Shopify's. But the axis is incomplete and the cell counts are floors.

Do not treat it as current until refreshed from the CSV export.
