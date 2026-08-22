# 10 — Review intelligence (Etsy, 2014–2026)

**Source:** owner's Etsy review export, 7 files, retrieved 2026-08-22.
**Data:** `data/etsy/etsy-reviews-2026-08-22.json` (12,788 unique reviews),
derived stats in `data/etsy/review-analysis.json`.

Reviewer display names are replaced with a salted SHA-256 prefix. Repeat-buyer
analysis still works; the names are not recoverable from this repo.
No PII patterns (email, phone, address, card, SSN) were found in the review text.

## ⚠️ Read this before quoting any number here

**Reviews are a proxy for orders, not orders.** Etsy review rates typically run
30–50% of orders and drift over time. Every trend below assumes a roughly stable
review rate, which is unverified. The **Orders CSV is still the missing input** and
would replace this entire document's volume analysis with fact.

Treat direction as reliable. Treat magnitude as indicative.

---

## The headline: volume fell ~84% from peak, then stopped falling

Comparable Jan 1 – Aug 21 windows, so no partial-year distortion:

| Year | Reviews (Jan–Aug 21) | vs peak |
|---:|---:|---:|
| 2017 | 717 | |
| 2018 | 793 | |
| 2019 | 853 | |
| **2020** | **1,276** | peak |
| 2021 | 1,175 | −8% |
| 2022 | 820 | −36% |
| 2023 | 616 | −52% |
| 2024 | 337 | −74% |
| 2025 | 201 | −84% |
| **2026** | **229** | **−82%** |

**2026 is up 14% on 2025.** The five-year slide bottomed out in 2025. That changes
the framing of this whole project: this is not a rescue of a dying shop, it is a
recovering shop with an untapped second channel. Full-year totals: 2020 peak 2,360
reviews / 2,254 distinct orders; 2025 was 365.

## Quality is not the problem

| | |
|---|---|
| Average rating | **4.918** across 12,788 reviews |
| 5★ | 12,155 (95.05%) |
| 4★ | 404 (3.16%) |
| ≤3★ | 229 (1.79%) |
| Reviews with written text | 6,839 (53.5%) |

Worst year for negatives was 2021 at 2.8% ≤3★. 2026 sits at 2.6%. A twelve-year
4.92 average across 12k+ reviews is a genuine asset and it is **currently invisible
on Shopify** — there are no reviews on the Shopify storefront at all.

## What customers actually praise (5★ text reviews, n=6,348)

| Theme | Count | Share |
|---|---:|---:|
| Fast shipping | 1,112 | 17.5% |
| Quality / sturdy / well-made | 1,082 | 17.0% |
| Repeat purchase | 411 | 6.5% |
| Recipient's reaction (loved it / cried) | 404 | 6.4% |
| Matches the listing photo | 280 | 4.4% |
| Seller communication | 210 | 3.3% |
| Custom request honored | 193 | 3.0% |

Speed and build quality are the two pillars, near-identically weighted. Both are
claims the Shopify site currently makes nowhere.

**"Custom request honored" at 3.0% is a product signal, not a service signal.**
Buyers repeatedly praise getting something the listing did not offer — "having aunt
changed to titi was the cherry on top." That is unstructured personalization
demand arriving through Etsy's message channel. It is exactly what the
personalization work in `06` productizes.

## What goes wrong (≤3★ with text, n=198)

| Theme | Count | Share of negatives |
|---|---:|---:|
| Quality / cheap / crooked / peeling | 61 | 30.8% |
| Shipping late or lost | 15 | 7.6% |
| Arrived damaged | 15 | 7.6% |
| Communication | 12 | 6.1% |
| Color mismatch vs. swatch | 7 | 3.5% |
| Size smaller than expected | 4 | 2.0% |
| Orientation wrong | 3 | 1.5% |
| Wrong personalization | 1 | 0.5% |

Two of these are **fixable in the catalog**, not the workshop:

- **Color mismatch (7)** — buyers order from a swatch and receive a different shade.
  This is the same palette-drift defect `03` documents from the other end: six
  competing color option sets, 42/41/34/25/7/2 values. A buyer choosing "navy" from
  an inconsistent swatch set is a merchandising defect.
- **Orientation (3)** — including the most recent one, 2026-08-18: *"came standing
  vertical when I asked for it to be shipped as it was in the display, horizontal
  with the bow on top."* `09` found `Frame Orientation` as a real option on 25 Etsy
  listings with **no Shopify equivalent**. Buyers care about this and are being
  asked to specify it in free text.

Only **one** review in twelve years complains about wrong personalization. Whatever
the current manual process is, it is accurate. Any system we build must not regress
that.

## Occasion mix — the demand signal we were missing

Mentions across 6,839 text reviews (multi-label; a review can hit several):

| Occasion | Mentions | Share of text reviews |
|---|---:|---:|
| Grandparent | 360 | 5.26% |
| Christmas | 334 | 4.88% |
| Baby / pregnancy | 162 | 2.37% |
| Wedding | 158 | 2.31% |
| Godparent | 156 | 2.28% |
| Mother's Day | 92 | 1.35% |
| Aunt / uncle | 89 | 1.30% |
| Father's Day | 78 | 1.14% |
| Baptism | 37 | 0.54% |
| Memorial / pet | 16 | 0.23% |

Only about a fifth of buyers name an occasion, so these are floors, not shares of
sales. Ranking between them is the usable part.

### Two trends that should change what we build first

Seasonality-neutral (Jan–Aug window only, so Christmas can't distort it):

| Year | Wedding | Baby/pregnancy | Godparent |
|---:|---:|---:|---:|
| 2017 | **6.5%** | 1.6% | 1.6% |
| 2018 | 5.8% | 2.2% | 1.9% |
| 2019 | 4.5% | 3.8% | 3.0% |
| 2020 | 1.4% | 2.1% | 2.6% |
| 2021 | 2.6% | 2.8% | 2.6% |
| 2022 | 0.8% | 1.6% | 2.9% |
| 2023 | 0.0% | 3.5% | 1.7% |
| 2024 | 0.3% | 2.1% | 2.1% |
| 2025 | 0.0% | 1.0% | 2.5% |
| 2026 | **0.0%** | **6.3%** | 0.9% |

**The wedding segment is gone.** From 6.5% to zero mentions in 2023, 2025 and 2026.
This is not seasonal and not a small-n artifact — 2024–2026 is 754 text reviews with
one wedding mention between them. Yet "Featured on The Knot – Best of Weddings" is
still the shop's headline trust badge, and `08` treats wedding as a live template.
Either weddings were deliberately dropped, or they were lost. **This needs an
owner ruling before any wedding SEO work is funded.**

**Baby/pregnancy is 2026's strongest occasion at 6.3%** — its highest share on
record, and it is the one segment growing while everything else flattens. This
corroborates `09`'s tag finding from a completely independent direction: combined
baby tags there outweighed grandparent. Shopify's `baby-frames` collection has
13 products. Two independent datasets now say the same thing.

Godparent at 0.9% in 2026 is worth flagging against `09`'s finding of **70 live
godparent listings on Etsy**. Seventy listings, lowest occasion share on record.
That is either a listing-count problem or a demand problem, and the Orders CSV
would settle which.

## Seasonality

| Month | Reviews | Share | |
|---|---:|---:|---|
| Dec | 2,342 | 18.3% | `########################################` |
| May | 1,557 | 12.2% | `##########################` |
| Jun | 1,537 | 12.0% | `##########################` |
| Jan | 1,054 | 8.2% | `##################` |
| Nov | 1,051 | 8.2% | `#################` |
| Jul | 825 | 6.5% | `##############` |
| Apr | 797 | 6.2% | `#############` |
| Aug | 760 | 5.9% | `############` |
| Mar | 736 | 5.8% | `############` |
| Oct | 722 | 5.6% | `############` |
| Sep | 716 | 5.6% | `############` |
| Feb | 691 | 5.4% | `###########` |

Reviews lag orders by roughly one to three weeks, so order peaks sit slightly
earlier than this. Two peaks: **December (Christmas)** and **May–June**, which is
Mother's Day, Father's Day, graduations and the wedding/baptism season together.
May+June combined (24.2%) beats December.

**Implication for sequencing:** the Q4 window closes around mid-November for
personalized goods. Anything meant to earn in 2026 needs to ship before then.
Anything that slips is really targeting May 2027.

## Repeat buyers

1,177 reviewer IDs appear more than once, out of 4,583 identified reviewers —
**about 26%**. 411 five-star reviews explicitly mention reordering. One 2026 review:
*"I LOVE it just like I LOVED the other 7 frames I've ordered from them."*

This is a caveated number in both directions: it undercounts buyers who ordered
without reviewing, and overcounts because common first names collide. But a repeat
rate anywhere near 26% on a gift purchase is high, and Etsy owns that relationship
today. Nothing on Shopify currently captures an email address.

## Testimonials cleared for site use

All 5★, 2026, no names, no PII. Verbatim.

> "This ultrasound photo frame was a heartfelt gift for my mom. She got emotional as
> soon as she saw the ultrasound photo inside. The frame is beautiful, well made, and
> made sharing our exciting news even more special." — May 2026

> "It's elegant, sturdy, and displays the ultrasound photo perfectly. A wonderful
> keepsake and a meaningful way to celebrate a growing family." — May 2026

> "I LOVE it just like I LOVED the other 7 frames I've ordered from them, great work,
> great people!!!!!!!!" — June 2026

> "Very cute photo frame and loved how the seller can customize. Helpful and prompt
> customer feedback as well :)" — June 2026

> "I am very pleased with the quality of this picture frame. It's lovely and
> personalized. It was delivered in a timely fashion and for a reasonable price too."
> — July 2026

Note the top two are both baby/ultrasound — consistent with 2026's occasion shift.

## What changes downstream

| Doc | Change |
|---|---|
| `02` | Add review import as a migration step. 12k reviews at 4.92 is the single strongest conversion asset available and it is not on Shopify. |
| `03` | Palette drift is now **evidenced by customer harm** — 7 colour-mismatch complaints. Add `Frame Orientation`; buyers complain when it is missing. |
| `04` | Baby collection is underweight: 13 products against 2026's strongest occasion. Wedding collections need an owner ruling before investment. |
| `05` | Prioritise baby/pregnancy and grandparent. **Do not fund wedding keywords** pending the ruling. Use the praise themes — speed, sturdiness — as description copy. |
| `06` | "Custom request honored" (193 mentions) is demand evidence for structured personalization. One wrong-personalization complaint in 12 years sets the accuracy bar. |
| `08` | Wedding template is questionable. Baby template is under-served. |
| `09` | Corroborated independently: baby outweighs grandparent in 2026. |

## Open questions this raises

1. **Were weddings dropped on purpose, or lost?** Blocks all wedding-related work.
2. **What caused the 2020→2025 decline** — Etsy algorithm, competition, deliberate
   scale-back, or capacity? Determines whether Shopify growth is additive or a
   replacement channel.
3. **Godparent: 70 listings, 0.9% of 2026 mentions.** Listing bloat or real demand?
4. **Orders CSV** would convert every proxy here into fact, and add revenue per
   occasion — which reviews cannot show at all.
