# 03 — Variant Normalization

**Status:** spec, not executed. **Risk:** low. **Reversible:** yes.
Defect lists live in `data/keyword-assets.json` under `variantDefects`.

> ## ⚠️ REVISED 2026-08-22 — these defects originate on Etsy
>
> This doc was written from the Shopify catalog alone and treated the option
> mess as a Shopify problem. The Etsy export (`09`) proves it is **inherited**.
> Every casing split below exists on Etsy first, in the same shape.
>
> Three consequences:
>
> 1. **Fixing Shopify alone leaves the source dirty.** The next Etsy import
>    re-introduces every defect. Normalization has to happen on both sides, or
>    Shopify has to stop being import-driven.
> 2. **Etsy is the *cause*, not just a copy.** Etsy caps variation values at
>    **20 characters** (proven below). Much of the palette drift is that cap
>    mangling names. Shopify allows 255 — so migrating actually *fixes* this,
>    provided we stop mirroring Etsy's truncations.
> 3. **This is causing customer harm.** `10` found **7 colour-mismatch
>    complaints** and **3 orientation complaints** in the negative reviews —
>    buyers ordering from an inconsistent swatch set and receiving something
>    else. These defects are not cosmetic debt.

## Defect 1 — option names split by capitalization

Shopify treats option names as case-sensitive strings. These are stored as
*different options*, which breaks storefront filtering, faceted search, and
any reporting that groups by option.

**Shopify side:**

| Concept | Names actually in use | Products |
|---|---|---|
| bow colour | `Bow Color` (22), `Bow color` (2), `bow color` (6) | 30 |
| background colour | `Background Color` (10), `Background color` (2) | 12 |

**Etsy side — the same splits, larger** (618 live listings, `09`):

| Concept | Spellings in use | Listings |
|---|---|---|
| bow colour | `Bow Color` (64), `bow color` (17), `Bow color` (6) | 87 |
| heart colour | `Heart Color` (18), `Heart color` (2) | 20 |
| background colour | `background color` (6), `Background color` (1), `BACKGROUND COLOR` (1) | 8 |

Note the background-colour group on Etsy: three spellings across **eight**
listings, and their value sets are 2, 42 and 2 values respectively. Three
listings, three different ideas of what the axis even is.

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
those are single-variant products, not a naming defect, but see Defect 5.

### The flower axis is three names for one vocabulary

Etsy carries `Flowers` (43 listings), `Flower` (14) and `Flower/Bow` (12) —
**69 listings** — and all three draw from the *same* value vocabulary,
`F1`–`F15`. They are one axis under three names; a clean, unambiguous merge.

`Flower Color` (4 listings) is **genuinely different** — its values are colour
names (`Gray`, `Peach`, `Teal`, `Off White`, `no flower/twine`), not F-codes.
Do not fold it in. This is the one place where near-identical option names are
not a defect.

**Target:** one canonical name per concept, Title Case.
`Color` · `Bow Color` · `Flower` · `Flower Color` · `Heart Color`.
Decide whether `Background Color` (12 products) is semantically the same axis
as `Color` (210). Reading the descriptions ("Primary color refers to the
background color that the text will be printed on") suggests **yes, merge into
`Color`** — but confirm with the owner before collapsing.

`one sided print` (1 product) is not a colour axis and needs a human decision.

## Defect 2 — the colour palette is defined six ways on Shopify, fifteen on Etsy

The same physical colour chart appears with six different lengths on Shopify:

| Option values | Products |
|---|---|
| 42 | 157 |
| 41 | 39 |
| 34 | 11 |
| 25 | 2 |
| 7 | 12 |
| 2 | 1 |

**On Etsy it is worse — a fifteen-way split.** `Primary color` appears on 552
of 618 live listings with these value-set sizes:

| Values offered | Listings |
|---:|---:|
| 42 | 354 |
| 41 | 91 |
| 16 | 41 |
| 27 | 12 |
| 13 | 12 |
| 4 | 10 |
| 12 | 6 |
| 2, 17, 6 | 5 each |
| 43 | 4 |
| 3 | 3 |
| 15, 18, 21 | 1 each |

Across all of them, `Primary color` carries **138 distinct values** — the 41
numbered swatches **plus 97 named ones** (`Blue Toile`, `Gray Checkers`,
`Blush Stripes`, `Brick`, `Burlap Bow`, `As Shown`...). Two incompatible
naming systems on a single axis.

There is no single source of truth for "what colours do we sell." A customer
filtering by colour gets fragmented results, and colour cannot be promoted to
a storefront facet. **Seven buyers have complained about receiving the wrong
colour** (`10`) — this is the mechanism.

### Root cause: Etsy truncates variation values at 20 characters

Measured across every variation value in the export: the length distribution
stops dead at 20, with **17 distinct values sitting exactly on the cap** and
visibly mangled.

```
Blue Stripe White Bw     Straight Edge/Portrt     Pink Stripe WhiteBow
Blue Stripe WhiteBow     Straight Edge/Lnscp      Pink Stripe White Bw
Blue Toile White Bow     Oatmeal Toile no bow     Sage Toile white bow
```

`Blue Stripe White Bw` and `Blue Stripe WhiteBow` are **the same colourway,
truncated two different ways**. That is not sloppiness — it is two people
hand-fitting a name into 20 characters on different days.

**Shopify's option-value limit is 255 characters.** So the constraint that
created this mess does not exist on the target platform. The canonical palette
should be written in full, readable names — and explicitly **not** mirror
Etsy's truncations. This turns a migration chore into a genuine storefront
improvement.

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

## Defect 3 — `Frame Orientation` exists on Etsy, not on Shopify, and conflates two axes

29 live Etsy listings carry a `Frame Orientation` option. **Shopify has no
equivalent** — the axis was dropped in the import, so Shopify buyers cannot
choose something Etsy buyers can.

Its 12 values are really **two axes crossed**, plus spelling drift:

| Value | Listings |
|---|---:|
| `Scalloped/Landscape` | 24 |
| `Scalloped/Portrait` | 24 |
| `Straight/Portrait` | 21 |
| `Straight/Vertical` | 15 |
| `Straight/Landscape` | 5 |
| `Straight Edge/Lnscp` | 3 |
| `Straight Edge/Portrt` | 3 |
| `Portrait/Vertical` | 3 |
| `Landscape/Horizontal` | 3 |
| `Vertical/Portrait` | 2 |
| `Horizontal/Landscape` | 2 |
| `Straight /Landscape` | 1 |

Decoded, there are only **two real decisions**:

- **Edge style** — `Straight` or `Scalloped`
- **Orientation** — `Portrait` or `Landscape`

`Straight/Portrait`, `Straight/Vertical`, `Straight Edge/Portrt` and
`Portrait/Vertical` are four spellings of one choice. Note also `Straight
/Landscape` with a stray space, and `White Bow/Horizontal` — which smuggles
*bow colour* into the orientation axis.

**This is the defect a customer complained about four days ago** (2026-08-18,
`10`): *"came standing vertical when I asked for it to be shipped as it was in
the display, horizontal with the bow on top."* A buyer facing
`Straight/Vertical` vs `Straight Edge/Portrt` vs `Portrait/Vertical` cannot
reasonably know what they are picking.

**Target:** two clean options on Shopify — `Edge Style` (Straight | Scalloped)
and `Orientation` (Portrait | Landscape) — with the orientation illustrated in
the product images, not just named. Fix the same split on Etsy at source.

## Defect 4 — 25 products truncated at 100 variants

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

## Defect 5 — 9 live products have no colour option at all

Nine ACTIVE products carry only Shopify's `Title` / `Default Title`
placeholder — no colour choice — while the house standard is 42 colours.
Listed in `data/keyword-assets.json` -> `variantDefects.activeProductsWithNoColorOption`.

Some may be legitimately single-SKU (e.g. `print-out-photo-and-place-in-frame`
is a service listing, and `test` should be deleted outright). Each needs a
one-line human ruling: *intentional single-SKU, or missing its palette?*

## Execution notes

- **Fix Etsy at source in the same pass**, or the next import undoes the work.
  Etsy option renames are manual (no bulk API for variation names) — 87 bow-colour
  listings and 29 orientation listings is a real but finite hand-edit job, and it
  is the owner's call whether it happens before or after the Shopify pass.
- **Do not carry Etsy's 20-character truncations into Shopify.** Write full
  names. `Blue Stripe White Bw` becomes `Blue Stripe, White Bow`.
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
- [ ] `Frame Orientation` decomposed into `Edge Style` + `Orientation`, present
      on Shopify for the products that offer it on Etsy, and illustrated in the
      product images.
- [ ] `Flowers` / `Flower` / `Flower/Bow` merged to one name; `Flower Color`
      deliberately left separate.
- [ ] No Shopify option value is a truncated Etsy string.
- [ ] Etsy-side casing normalized, or an explicit owner decision recorded not to.
