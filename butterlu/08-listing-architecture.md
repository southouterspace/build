# 08 — Listing Architecture: the Design Matrix

Answers: *how do we build listings to capture keywords when a godparent frame
is the same design as a grandparent frame with the word swapped?*

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
