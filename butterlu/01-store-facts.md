# 01 — Store Facts (Verified Baseline)

Snapshot date: **2026-08-22**. Source: Shopify Admin GraphQL API.
All counts computed from `data/catalog.json`, which holds all 243 products.

## Integrity of this data

The catalog was paginated to exhaustion (5 pages x 50, `hasNextPage` false on
the last page, cursors verified to chain) — 243 nodes, matching
`productsCount`.

Every `descriptionHtml` SHA-256 in `catalog.json` was **independently
cross-checked** against Shopify's own `translatableResources` `body_html`
digest. Shopify's digest was first confirmed to be plain SHA-256 of the raw
UTF-8 value (the empty `product_type` digest is `e3b0c442...b855`, the SHA-256
of the empty string; handle digests reproduce exactly). **243/243 hashes match,
0 mismatches.** The snapshot is byte-exact, not transcribed.

## Confirmed

| Fact | Value |
|---|---|
| Total products | 243 |
| Status split | 99 ACTIVE / 15 DRAFT / 129 ARCHIVED |
| Published / unpublished | 99 / 144 |
| Orders, all time | 0 |
| URL redirects ever created | 0 |
| `seo.title` populated | 0 of 243 |
| `seo.description` populated | 0 of 243 at snapshot time (1 written since — see below) |
| Distinct `descriptionHtml` values | 88 across all 243; 59 across the 99 live |
| Distinct normalised titles among live products | 96 of 99 |

## DISPROVEN — do not propagate these

| Claim inherited by this project | Reality |
|---|---|
| "Store is on the **Pause and Build** plan, checkout disabled." | **FALSE.** `shop.plan.displayName` and `get-shop-info` both return **Basic**. The storefront is live and checkout is enabled. This invalidated the project's core safety assumption. |
| "Underperformers have exactly 100 variants / 2 options." | **FALSE as a rule.** Only 25 of 243 products (10%) sit at 100 variants, and **18 of those 25 are ACTIVE**. 21 other 2-option products sit at 84, one at 82. Variant count does not map to performance. |
| "Top performers have 42 variants / 1 option." | **Not a signal.** 42 variants / 1 option is the house default, covering 136 of 243 products. |
| "The godparent cluster is ~104 products." | **Conflates two things.** 103 products sit in the `godparent-frames` *collection*. The largest actual duplicate *cluster* is **53**, of which 50 are already archived. |

The 100-variant ceiling itself **is** real in the data — 25 products have
option grids that multiply past 100 (7x16=112, 34x3=102) and were truncated on
import. But Shopify **raised the limit from 100 to 2048 for all merchants on
2025-10-15**, so that ceiling no longer binds. Those 25 products are simply
missing colour choices. See `03-variant-normalization.md`.

## Write test (the only mutation performed)

To establish whether Admin API writes were permitted:

- Product: `soul-sisters-picture-frame-best-70252` (ACTIVE, 1 variant, 0
  collections, not in any cluster — chosen as low-stakes)
- Mutation: `productUpdate(product: ProductUpdateInput!)`
- Field: `seo.description` only, 149 chars
- Result: **PASSED.** `userErrors: []`, confirmed by independent read-back,
  `updatedAt` advanced. A control product still read `null`.

**Conclusion: bulk SEO writes are mechanically possible.** This is recorded in
`catalog.json` under `writeTest`.

## Consolidation status — mostly already done

The premise that the catalog needs reducing from 243 to a smaller "true design"
count is **largely already satisfied**. The 129 archived products *are* the
Etsy listing flood. What remains live:

- 99 active listings, **96 distinct titles**, 96 distinct leading design phrases
- **One** genuine duplicate group among live products: four byte-identical
  `Pet Loss Gifts | Personalized Pet Memorial Frame` listings
  (`...-26738`, `...-77661`, `...-49914`, `...-77909`), all 100 variants,
  all published 2025-04-15, all in `pet-loss-memorial`

**Net live consolidation available: 99 -> 96. Three listings.**

`data/clusters.json` reports 188 products across 26 clusters. That number is
real but measures *text reuse*, not duplication — it is dominated by archived
twins and by genuinely different designs sharing copy-pasted boilerplate. Do
not act on it as a merge list.

## Open items requiring human verification

1. **Personalization capture on the storefront** — no product option anywhere
   collects customer text. See `06-personalization.md`. Treat as revenue-blocking
   until disproven.
2. **Whether the archived godparent category should be revived** — it was the
   Etsy-era flagship and is now 3 live products. See `04-collections-taxonomy.md`.
3. **A live product literally titled `test`** (handle `test`, empty description,
   published, no collection). Should be deleted.
