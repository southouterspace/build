# 03 — Variant Normalization

**Status:** spec, not executed. **Risk:** low. **Reversible:** yes.
Defect lists live in `data/keyword-assets.json` under `variantDefects`.

## Defect 1 — option names split by capitalization

Shopify treats option names as case-sensitive strings. These are stored as
*different options*, which breaks storefront filtering, faceted search, and
any reporting that groups by option.

| Concept | Names actually in use | Products |
|---|---|---|
| bow colour | `Bow Color` (22), `Bow color` (2), `bow color` (6) | 30 |
| background colour | `Background Color` (10), `Background color` (2) | 12 |

Full inventory of option names across all 243 products:

```
Color             210     Background Color   10
Bow Color          22     bow color           6
Title              20     Bow                 3
Flowers            12     Bow color           2
Background color    2     Burlap Color        1
one sided print     1     Heart Color         1
```

`Title` (20) is Shopify's placeholder for a product with no real options —
those are single-variant products, not a naming defect, but see Defect 4.

**Target:** one canonical name per concept, Title Case.
`Color` · `Bow Color` · `Flower Color` · `Heart Color`.
Decide whether `Background Color` (12 products) is semantically the same axis
as `Color` (210). Reading the descriptions ("Primary color refers to the
background color that the text will be printed on") suggests **yes, merge into
`Color`** — but confirm with the owner before collapsing.

`one sided print` (1 product) is not a colour axis and needs a human decision.

## Defect 2 — the colour palette is defined six ways

The same physical colour chart appears with six different lengths:

| Option values | Products |
|---|---|
| 42 | 157 |
| 41 | 39 |
| 34 | 11 |
| 25 | 2 |
| 7 | 12 |
| 2 | 1 |

There is no single source of truth for "what colours do we sell." A customer
filtering by colour gets fragmented results, and colour cannot be promoted to
a storefront facet.

**Target:** one canonical palette, defined once, applied everywhere. The `42`
variant (157 products) is the presumptive canon — it reads as
`As Shown` + `1`..`41`. The `41` group is the same list without `As Shown`.

**Open question for the owner:** are the 41-value products genuinely missing
the "As Shown" default, or is "As Shown" a duplicate of one numbered colour?
This determines whether the canon is 41 or 42.

**Also unresolved:** the option values are bare numbers (`1`, `2`, ... `41`).
These are meaningless to a shopper and unusable as a colour facet. Mapping them
to real names (with swatches) is a separate, higher-effort project worth
scoping — it is likely the single biggest storefront UX win available.

## Defect 3 — 25 products truncated at 100 variants

25 products sit at exactly 100 variants. Their option grids multiply past 100:

| Option shape | Implied combinations | Products |
|---|---|---|
| 7 x 16 | 112 | 12 |
| 34 x 3 | 102 | 11 |
| 25 x 4 | 100 | 2 |

This is a legacy artifact of Shopify's historic 100-variant cap. **The limit
was raised to 2048 for all merchants on 2025-10-15**
(`shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants`).

**18 of the 25 are ACTIVE.** They are live right now, missing purchasable
colour combinations. This is lost revenue, not a technical debt item.

**Target:** regenerate the full option grid for these 25 products.
Use `productSet` or `productOptionsCreate` / `productVariantsBulkCreate`
(GraphQL product APIs — the REST product APIs have a degraded experience above
100 variants per the changelog).

## Defect 4 — 9 live products have no colour option at all

Nine ACTIVE products carry only Shopify's `Title` / `Default Title`
placeholder — no colour choice — while the house standard is 42 colours.
Listed in `data/keyword-assets.json` -> `variantDefects.activeProductsWithNoColorOption`.

Some may be legitimately single-SKU (e.g. `print-out-photo-and-place-in-frame`
is a service listing, and `test` should be deleted outright). Each needs a
one-line human ruling: *intentional single-SKU, or missing its palette?*

## Execution notes

- Renames and additive option changes do not destroy variant data, but
  **capture the full before-state** (already in `data/catalog.json`) so any
  step can be reversed.
- Do this in batches by defect, not by product, so each batch has a single
  clear rollback.
- No handle changes in this workstream — therefore no redirects required.
- Validate every mutation with `validate_graphql_codeblocks` before running it.

## Acceptance criteria

- [ ] One option name per concept across all 243 products.
- [ ] One canonical palette; `colorPaletteSizes` collapses to a single entry
      (excluding deliberate single-SKU products).
- [ ] Zero products where `impliedCombinations != variantsCount`.
- [ ] Every one of the 9 no-colour live products has a recorded ruling.
