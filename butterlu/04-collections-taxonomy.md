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
   archived on Shopify — while **70 godparent listings are live on Etsy right
   now** (`09`). See below.
3. **`mom-dad-frames` and `mom-dad-frames-1` are a duplicate pair**, one of
   which is empty of live products.
4. **Only 1 product is in more than one collection.** Collections are being
   used as mutually-exclusive folders rather than overlapping facets. A
   "Godmother frame" is legitimately *godparent* AND *baptism* AND *gift for her*.
5. **`frontpage` contains 1 product.** The homepage featured set is effectively
   unused.

## The godparent question — SETTLED 2026-08-22

> **This no longer needs a decision on whether the category exists.** The Etsy
> export (`09`) shows **70 live godparent listings on Etsy** against **4 on
> Shopify**. The category is not gone; it is 94% absent from Shopify. Earlier
> search-sampling estimated 7–10 and was badly low.
>
> **But `10` complicates the revival case.** Godparent mentions in 2026 reviews
> are **0.9%** — the lowest occasion share on record, down from 3.0% in 2019.
> Seventy live listings producing the weakest occasion signal in the corpus is
> either listing bloat or genuine demand decay.
>
> **The revised decision is *how many*, not *whether*.** Build the godparent
> collection from the distinct designs behind those 70 listings — expect far
> fewer than 70 products — and let the Orders CSV set the ambition. Do not
> port 70 listings across.

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

**Superseded — see the settled note above.** The category is demonstrably alive
on Etsy (70 listings). What remains open is the *size* of the Shopify range and
whether 2026's 0.9% review share justifies it.

Note the archived listings are *listing variants of a smaller set of designs*,
so reviving does not mean unarchiving 100 products. It means selecting the
distinct designs and giving them one product each.

## Collection weighting is wrong against real demand — ADDED 2026-08-22

Live listing counts by occasion, matched on title + tags across the 618 live
Etsy listings (`09`), against what Shopify actually shows:

| Occasion | Etsy live | Shopify collection | Shopify active | 2026 review share (`10`) |
|---|---:|---|---:|---:|
| Grandparent | 225 (36%) | `grandparent-frames` + `grandpa-papa-pop` | 29 | 3.2% |
| **Baby / pregnancy** | **204 (33%)** | `baby-frames` + `pregnancy-baby` | **16** | **6.3% — highest on record** |
| Wedding | 94 (15%) | `wedding-thank-you-frames` | 11 | **0.0%** |
| Godparent | 68 (11%) | `godparent-frames` | 3 | 0.9% |
| Engagement | 38 (6%) | **none** | 0 | — |
| Pet | 38 (6%) | `pet-frames` + `pet-loss-memorial` | 11 | — |

Three readings:

1. **Baby is the growth category and the most under-built.** A third of live
   Etsy listings, the strongest 2026 review signal, 16 active Shopify products.
   Two independent datasets (review text in `10`, tag frequency in `09`) agree.
   **This should be the first collection built properly.**
2. **Engagement has 38 live Etsy listings and no Shopify collection at all** —
   while five orphaned engagement products sit in zero collections (problem 1
   above). That is a collection waiting to be created out of existing inventory.
3. **Wedding needs an owner ruling before any investment.** 94 listings are
   still live on Etsy, so the category was *not* deliberately retired — yet
   `10` records **zero wedding mentions across 754 text reviews in 2024–2026**,
   down from 6.5% in 2017. Ninety-four live listings generating no measurable
   demand signal is the single strangest thing in the dataset. Do not build
   wedding collections or fund wedding SEO until this is understood.

## Reviews are a collection-page asset — ADDED 2026-08-22

12,788 Etsy reviews averaging **4.918** exist and appear nowhere on Shopify
(`10`). Collection pages are where aggregate social proof does the most work,
and this store has twelve years of it sitting unused. Importing reviews should
be scoped alongside this workstream, not after it — see `02`.

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
- [ ] Godparent range **sized** (the existence question is settled — see above).
- [ ] `test` product deleted.
- [ ] Baby/pregnancy collection built out to match its share of live inventory.
- [ ] Wedding ruling recorded before any wedding collection work begins.
- [ ] Review import scoped (see `02`).
