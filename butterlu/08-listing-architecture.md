# 08 — Listing Architecture: the Design Matrix

Answers: *how do we build listings to capture keywords when a godparent frame
is the same design as a grandparent frame with the word swapped?*

> ## ⛔ SUPERSEDED AS A DEMAND MODEL — 2026-08-22
>
> **The matrix counts listings. Listings do not predict revenue.** `11` (order
> actuals) settles this with the transaction record:
>
> - **315 of 618 live Etsy listings earned $0 in 2026.** 55 listings produce
>   71% of revenue.
> - **70 godparent listings earned $4,215. One baby listing earned $4,391.**
>   A matrix cell's population tells you nothing about what it is worth.
> - **94 wedding listings earned $865**, −45% YoY. The matrix treats wedding as
>   a live template; the money says it is not.
>
> **What survives:** the structural rule below — that the product/variant
> boundary follows *search intent*, not manufacturing — is sound and unaffected.
> Relationship must still never be a variant.
>
> **What does not:** every cell count as a proxy for demand, and the build
> ambition implied by grid coverage. Do not build a cell because it is empty.
> Build it because `11` shows revenue, or a deliberate bet is being made.
>
> **Missing template:** `09` found a `first-time` / new-grandparent template
> the Shopify-derived matrix never saw (19 grandpa, 18 baby listings), and `11`
> shows the new-baby range is the growth engine. Both belong in any revision.
>
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
> **RESOLVED 2026-08-22 — the export was obtained.** See `09-etsy-actuals.md`
> for the real 618-listing census and `11-order-actuals.md` for what sold.
> The refresh instructions below are kept for the next time.
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

**Recommended input: the Etsy listings CSV.** Shop Manager → **Download Data**
→ **Currently for Sale Listings** → **Download CSV**. No API registration, no
scraping, and it is the authoritative source.

Per Etsy's own help documentation, that CSV contains: **Title, Description,
Price, Currency code, Quantity, Tags, Materials, Image URLs, SKU.** Tags are
the keyword goldmine — 13 per listing, chosen by the seller.

### There is no way to grant a third party access to an Etsy shop

Verified against Etsy help documentation and the Open API v3 scope list:

- **Etsy has no multi-user or staff-account model.** Unlike Shopify, a shop
  cannot invite a collaborator with scoped permissions.
- **"Shop members" / "Shop team"** (Settings → About your shop → Members) is a
  **public display** on the shop's About page. It grants **no access**.
- Etsy's own guidance for running more than one shop is to *create a separate
  account with a different email* — there is no delegation model at all.
- The only community-known workaround is **sharing login credentials**, which
  is contrary to Etsy's account terms, breaks under 2FA (every sign-in needs a
  code from the owner's phone), triggers new-device verification, produces no
  audit trail, and exposes payments, tax and personal data with no way to
  scope it down. **Do not plan around this.**

**Therefore: the shop owner must run the exports themselves and share the
files.** That is the supported path and it is fast.

### The API route, and why it does not help here

A developer can register an Etsy app and have the owner complete an OAuth flow
granting it scopes — genuine delegated access, no credential sharing. Relevant
scopes: `listings_r`, `shops_r`, `transactions_r`.

Two blockers:

1. **Scopes must be declared when the app is created** and cannot be added
   later without going through Etsy's app review.
2. **There is no analytics or statistics scope.** The full documented scope
   list is `address_r/w`, `email_r`, `listings_r/w/d`, `profile_r/w`,
   `shops_r/w`, `transactions_r/w`. None covers the Stats dashboard.
   `transactions_r` reads **sales and receipt data**, not traffic sources or
   search terms. *(Inferred from the absence of any such scope, not from an
   explicit statement that no stats API exists.)*

Community reports also indicate Etsy has tightened API approval and is slow to
grant it. The API is more work than the CSV and does not deliver the one thing
most wanted — search terms.

### The ask list to send the shop owner

**A formatted, forwardable version of this list is at
`etsy-export-request.html` in this folder** (published as an artifact for
sending to the owner directly).

All URLs below are confirmed from Etsy's own help documentation, not guessed.

| # | What | Direct URL | In-app path |
|---|---|---|---|
| 1 | **Currently for Sale Listings CSV** | `etsy.com/your/shops/me/download` | Shop Manager → Settings → Options → Download Data → Currently for Sale Listings |
| 2 | **Orders CSV** | `etsy.com/your/shops/me/download` | same page → Orders → CSV Type / Month / Year (leave Month blank for a full year) |
| 3 | **Shop settings + reviews** | `etsy.com/your/shops/me/download` | same page → Take your data with you |
| 4 | **Etsy search terms** ⚠ screenshots | `etsy.com/your/shops/me/stats/referrers/etsysearch` | Shop Manager → Stats → How shoppers found you → Etsy search |
| 5 | **Marketplace Insights** ⚠ screenshots | `etsy.com/your/shops/me/stats` | Shop Manager → Stats → Marketplace Insights |
| — | Full account archive (optional, slow) | `etsy.com/your/account/privacy` | Account settings → Privacy → Download Data → request, confirm by email, return |

Per Etsy's docs the listings CSV carries **Title, Description, Price, Currency
code, Quantity, Tags, Materials, Image URLs, SKU**.

**Items 4 and 5 have no export.** No download path exists for the Stats
dashboard and no API scope covers it, so they are screenshot-only. Item 4 is
the single best SEO input available (`05-seo-program.md`).

**Marketplace Insights (item 5) is real Etsy search-volume data** — searches
and listing counts over the last 30 days per keyword, 15 free lookups per
week. Choose the keywords deliberately; the cap is weekly. Suggested first
five, from the godparent gap in this doc: `godmother frame`, `godparent gift`,
`baptism gift`, `personalized picture frame`, `grandma frame`.

**Also confirm which shops are live** — `ButterLu`, `BoutiqueButterLu`,
`myfourlittlechicks`. Export from each active one, and retire any dead Etsy
URLs still printed in live product descriptions.