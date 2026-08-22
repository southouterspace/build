# 02 — Target Model & Migration Safety

## The core mismatch

On Etsy, **a listing is a keyword surface**. Flooding near-identical listings
is a rational marketplace strategy: each one is an independent entry in Etsy
search. That is what produced 243 products.

On Shopify, products are **not** the keyword surface — **collections are**.
Collection pages are indexable, carry their own title/description/SEO fields,
and are what Google ranks for category intent. Duplicating products on Shopify
produces keyword cannibalisation and thin-content penalties instead of reach.

So the Etsy strategy doesn't get deleted — it gets **relocated** from the
product layer to the collection and content layer.

## Target architecture

| Layer | Rule |
|---|---|
| **Product** | One product = one design (one printed quote/artwork). Already effectively true: 96 distinct designs across 99 live listings. |
| **Variant** | Background colour, drawn from **one canonical palette**, with consistent option naming. Secondary axes (bow colour, flowers) remain variants — the 2048-variant limit gives ample headroom. |
| **Personalization** | Customer's name/date/quote is captured as a **line item property**, never as a variant. See `06-personalization.md`. |
| **Collection** | The discovery and SEO layer. Faceted by recipient, occasion, and theme. Each collection gets real SEO copy. See `04-collections-taxonomy.md`. |
| **Content** | Long-tail phrases the archive proves had demand become collection pages and, where warranted, blog/landing pages — not products. See `05-seo-program.md`. |

## What NOT to do

- **Do not merge products that merely share a description.** Boilerplate reuse
  is rampant (88 distinct descriptions across 243 products). Grandma / Gigi /
  Grammie / GG are four real products sharing one blurb.
- **Do not model personalization as a variant.** It is unbounded free text.
- **Do not re-handle products casually.** Handles are live URLs. Every change
  needs a redirect.
- **Do not treat variant count as a quality signal.** See `01-store-facts.md`.

## Migration ordering

Ordered by risk-adjusted value. Each stage should be independently shippable
and reversible.

1. **Personalization capture** (`06`) — revenue-blocking. A custom-goods store
   that cannot collect the customisation is not functional. Everything else is
   optimisation on top of a broken funnel.
2. **Redirect infrastructure** (this doc, below) — must exist before anything
   moves.
3. **Variant normalization** (`03`) — mechanical, low-risk, reversible.
   Unblocks filtering and restores colour choices to 25 truncated products.
4. **Collections taxonomy** (`04`) — restores navigation; 10 live products are
   currently unreachable from any menu.
5. **SEO program** (`05`) — last. Traffic into a store that can't take a custom
   order is wasted spend.

## Redirect discipline (non-negotiable)

The store has **never had a single URL redirect** (`urlRedirectsCount` = 0).
That is fine today only because nothing has moved yet.

Before any product is archived, deleted, merged, or re-handled:

- Create a `urlRedirect` from the old `/products/<handle>` to its successor.
- Prefer the closest live equivalent; fall back to the relevant collection
  page. Never redirect to the homepage — it reads as a soft 404.
- For the four duplicate pet-memorial listings, three redirect to the survivor.
- Record every redirect in a migration log so it can be reversed.

Mutation: `urlRedirectCreate`. This has **not** been exercised against the
store yet — validate it on a single throwaway path before any batch.

## Reversibility

| Action | Reversible? | Notes |
|---|---|---|
| `seo.title` / `seo.description` write | Yes | Prior value was `null` everywhere; restoring means setting `null`. Capture before-state first. |
| Option rename | Yes | Renaming does not destroy variant data. |
| Adding option values to truncated products | Yes | Additive. |
| Adding a product to a collection | Yes | Additive. |
| Archiving a product | Yes | Status change; the 129 already-archived products prove it round-trips. |
| **Deleting a product** | **No** | Do not delete. Archive instead. |
| **Changing a handle** | Effectively no | Breaks the live URL. Requires a redirect and is not cleanly undoable once indexed. |

## Success criteria

- Every live product page can capture personalization and the value reaches the
  order and packing slip.
- Zero live products in zero collections.
- One canonical colour palette; one option name per concept.
- No live product truncated below its intended option grid.
- Every removed or moved URL has a redirect.
- `seo.title` and `seo.description` populated on every live product and collection.
