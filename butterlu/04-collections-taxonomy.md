# 04 — Collections & Taxonomy

**Status:** spec, not executed. Collections are the SEO surface that replaces
the Etsy listing flood (see `02-target-model.md`).

## Current state

17 collections. The live nav is severely lopsided — `total` counts all
statuses, `active` counts what a shopper can actually see:

| Collection | Total | Active |
|---|---|---|
| `godparent-frames` | 103 | **3** |
| `pet-frames` | 28 | **3** |
| `grandparent-frames` | 24 | 20 |
| `baby-frames` | 14 | 13 |
| `pet-loss-memorial` | 12 | 8 |
| `wedding-thank-you-frames` | 12 | 11 |
| `grandpa-papa-pop` | 9 | 9 |
| `pregnancy-baby` | 9 | **3** |
| `aunt-uncle-frames` | 6 | 6 |
| `new-grandparent-to-be` | 5 | 5 |
| `mom-dad-frames-1` | 2 | 1 |
| `pet-ornament-car-hugs` | 2 | 2 |
| `photo-blocks-clip-frames` | 2 | 2 |
| `teacher-nanny-coach` | 2 | 2 |
| `frontpage` | 1 | 1 |
| `healing-affirmation` | 1 | 1 |
| `mom-dad-frames` | 1 | **0** |

Problems, in order of severity:

1. **10 live products belong to no collection at all** — unreachable from any
   menu. Five are the entire engagement line
   (`engagement-picture-frame-*`, `engagement-gift-*`,
   `engagement-countdown-*`, `engagement-gifts-for-couple-*`), plus
   `graduation-picture-frame-for-college`,
   `friends-frame-best-friend-gift-blonde`, `soul-sisters-*`,
   `print-out-photo-and-place-in-frame`, and `test`.
   There is **no engagement collection**, despite five live engagement products.
2. **`godparent-frames` shows 3 of 103.** The Etsy flagship category is 97%
   archived. See below.
3. **`mom-dad-frames` and `mom-dad-frames-1` are a duplicate pair**, one of
   which is empty of live products.
4. **Only 1 product is in more than one collection.** Collections are being
   used as mutually-exclusive folders rather than overlapping facets. A
   "Godmother frame" is legitimately *godparent* AND *baptism* AND *gift for her*.
5. **`frontpage` contains 1 product.** The homepage featured set is effectively
   unused.

## The godparent question (needs an owner decision)

Etsy-era tag frequency across archived listings — the demand signal from a
marketplace where these listings actually sold:

```
baptism gift 99 · personalized frame 87 · gift for baptism 78
godparents frame 78 · baptism frame 70 · godparents gift 64
will you be my 51 · godmother gift 47 · godfather gift 44
```

Godparent/baptism was the flagship. It is now 3 live products.

Additionally, **28 phrases appear 3+ times across archived listings and appear
nowhere in any live product title or tag** — entire abandoned intents:

```
dedication gift 16 · godmother proposal 11 · godmothers blessing 11
being my godmother 11 · gift for godmother 9 · christening gift 7
confirmation gift 6 · best friend promoted 6 · first communion gift 4
```

Full list in `data/keyword-assets.json` -> `keywordAssets.orphanedPhrases`.

**Decision required:** revive a curated godparent range, or accept the category
is gone. This gates `05-seo-program.md` — there is no point optimising for
"godmother frame" with three products behind it.

Note the archived listings are *listing variants of a smaller set of designs*,
so reviving does not mean unarchiving 100 products. It means selecting the
distinct designs and giving them one product each.

## Tag vocabulary — do not use as-is

868 distinct tags across 3,122 assignments. **530 are used exactly once.**
This is Etsy keyword residue, not a taxonomy. It is useful as *raw material*
for designing collections and as a demand signal, but it should not be lifted
directly into Shopify tags or filters.

## Proposed taxonomy

Three overlapping facets, products belonging to several:

- **Recipient** — grandma, grandpa, godparent, aunt/uncle, mom, dad, teacher,
  best friend, pet owner
- **Occasion** — baptism/christening, first communion, wedding, engagement,
  new baby, pregnancy announcement, graduation, memorial/sympathy,
  Mother's/Father's Day, Christmas
- **Theme** — pet, affirmation/self-love, milestone/promoted-to

Rules:
- Every live product lands in **at least one recipient and one occasion**
  collection. Zero orphans.
- Prefer **manual (curated)** collections over automated tag rules until the
  tag vocabulary is cleaned — automated rules over 868 noisy tags will produce
  garbage.
- Each collection gets a hand-written SEO title and description
  (see `05-seo-program.md`). This is where the abandoned keyword phrases go.
- Merge `mom-dad-frames` / `mom-dad-frames-1`, with a redirect.

## Acceptance criteria

- [ ] Zero live products in zero collections.
- [ ] An engagement collection exists and holds the five orphaned engagement products.
- [ ] `mom-dad-frames` duplicate resolved, redirect created.
- [ ] Every collection has a populated `seo.title` and `seo.description`.
- [ ] Godparent decision recorded, either way.
- [ ] `test` product deleted.
