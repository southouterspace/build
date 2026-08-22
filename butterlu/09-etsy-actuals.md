# 09 — Etsy Actuals (Authoritative)

Source: **`data/etsy/etsy-listings-2026-08-22.csv`** — the "Currently for Sale
Listings" export, run by the shop owner 2026-08-22. **618 live listings.**
This supersedes every Etsy inference in `08-listing-architecture.md`, which was
mined from a stale Shopify import.

## ⚠️ Data handling

The owner also supplied `shop_settings.json`. **That file contains a personal
phone number, an SSN fragment, credit card details with a home billing
address, and bank account details. It is NOT in this repo and must never be.**
`.gitignore` blocks `**/shop_settings*.json`. Only
`data/etsy/shop-profile.sanitized.json` — merchandising copy with every
financial and identity field stripped — is committed.

The listings CSV was PII-scanned before being added: no emails, phones, SSNs
or addresses. (Regex hits on "card" were SKU digit strings; the "street" hit
was a product title containing "2 Custom Photo Car Coaster".)

## The headline

| | Etsy | Shopify |
|---|---|---|
| Live listings | **618** | 99 |
| Total incl. archived | — | 243 |

**Shopify carries roughly 16% of the live business.** Every prior estimate in
this project understated the gap, because it was reasoning from the import.

### Three-bucket diff

Fuzzy title match, Jaccard ≥ 0.55 on content words.

| Bucket | Count |
|---|---|
| On Etsy, **not** on Shopify | **489** |
| On both | 129 |
| On Shopify, not on Etsy | 87 — of which **40 still live on Shopify** |

The 40 Shopify-live-only products need a ruling: retired on Etsy deliberately,
or Shopify-only lines? Pet products dominate them (`Just a Girl and Her Cat`,
`Funny Dog Mom`, `Pet Photo Car Charm`), which suggests a discontinued or
Shopify-exclusive range rather than an oversight.

## Godparent: 70 live on Etsy, 4 on Shopify

Earlier estimates from search-index sampling suggested 7–10. **The real number
is 70.** Price range $33.55–$35.55, median $33.55.

This is the largest single gap in the catalog and it definitively closes the
revival question in `04-collections-taxonomy.md`. Godparent is not a retired
category — it is 11% of the live Etsy business and is 94% absent from Shopify.

## First price data in the project

| | |
|---|---|
| Median | **$33.55** |
| Mean | $34.87 |
| Range | $0.20 – $134.20 |

$33.55 is clearly the house price. The $0.20 floor is worth checking — likely
a sample, add-on or rush-fee listing.

## Real tags, at last

**7,965 assignments · 2,454 distinct · 12.9 per listing.** These are the
seller's own keyword bets, not import residue. Top of the list:

```
personalized_frame 147 · personalized_gift 95 · personalized 87
picture_frame 87 · grandma_gift 80 · baby_keepsake 73
grandparent_gift 71 · baby_photo_frame 68 · baby_announcement 64
baptism_gift 59 · pregnancy_reveal 55 · custom_photo_frame 54
```

**Baby/pregnancy is far larger than the Shopify catalog implies** — combining
`baby_keepsake`, `baby_photo_frame`, `baby_announcement`, `pregnancy_reveal`,
`baby_shower_gift`, `new_baby_gift` and `baby_girl_gift` puts it level with or
above the grandparent cluster. Shopify's `baby-frames` collection holds 13 live
products.

This replaces the inferred tag data in `data/keyword-assets.json` as the
keyword source for `05-seo-program.md`.

## The variant mess originated on Etsy

`03-variant-normalization.md` treated the option-name casing splits as an
import artifact. **They are not — they are faithfully reproduced from Etsy:**

- Variation 1: `Primary color` ×528, `Frame Orientation` ×25,
  `background color` ×6, `DESIGN` ×5, `Color` ×3, `Bulk Discounts` ×3,
  `one sided print` ×2, `Background color` ×1
- Variation 2: `Bow Color` ×64, `Flowers` ×43, `Primary color` ×24,
  `Heart Color` ×18, `bow color` ×17, `Flower` ×14, `Flower/Bow` ×12,
  `Bow color` ×5

Same three-way `bow color` split, same two-way `background color` split.
**Fixing this on Shopify alone leaves the source dirty** — it should be
normalised on Etsy too, or the next export re-imports the mess.

`Frame Orientation` (25 listings) has **no Shopify equivalent at all** — a
purchasable option customers cannot select on Shopify.

## Personalization is not a variation — confirmed

**Zero** of 618 listings use a personalization-like variation name. Etsy's
personalization box is a separate field entirely and is not exported as a
variation.

This directly confirms the architecture in `02-target-model.md` and
`06-personalization.md`: personalization is a **line item property**, never a
variant. The model was right; now it is evidenced.

## Content gold in the shop profile

`data/etsy/shop-profile.sanitized.json` carries copy Shopify does not have, and
it is exactly the trust and logistics material the SERP research
(`05-seo-program.md`) found the top-ranking competitor leading with:

- **Processing time: 3–4 business days (Mon–Fri)**
- US shipping standard 2–7 days, Priority 2–3 days
- **"Featured on The Knot – Best of Weddings"**
- MDF crafted from recycled wood fibers — sustainability angle
- Family-run since 2015, maker-owned

None of this appears anywhere on the Shopify store. It should feed collection
descriptions, the About page, and the SEO descriptions.

## Current Etsy design matrix

**61 of 208 cells populated** (vs 39 derived from Shopify). One new template
the Shopify-derived matrix missed entirely:

- **`first-time` / new-grandparent** — grandpa ×19, baby ×18, grandma ×9,
  dad ×4, mom ×3, uncle ×1. A significant template, essentially absent from
  the earlier analysis.

`littles` is also far bigger than Shopify suggested: dad ×13, grandpa ×12,
baby ×9, grandma ×7.

## What changes downstream

| Doc | Change |
|---|---|
| `04` | Godparent revival: **settled**. 70 live listings on Etsy. |
| `03` | Casing splits are an **Etsy-side** defect; fix at source too. Add `Frame Orientation`. |
| `05` | Use these tags, not `keyword-assets.json`. Add the trust copy above. |
| `08` | Matrix superseded; add the `first-time` template. |
| `02` | Personalization-as-line-item-property: confirmed by evidence. |

## Still outstanding

- **Orders CSV** — not yet supplied. Would show what actually *sells*, not just
  what is listed.
- **Search-terms screenshots** (`etsy.com/your/shops/me/stats/referrers/etsysearch`)
  and **Marketplace Insights** — still the best SEO inputs and still manual.
- **The 40 Shopify-live-only products** need a keep-or-retire ruling.
- **The $0.20 listing** needs identifying.
