# 12 — Decision readiness: can we build the Shopify store from what we know?

**Purpose:** audit every decision the Shopify restructure requires against the
evidence actually in this directory, and close the gaps that data already in
hand can close.

**Answer:** yes for the big structural calls — build order, catalog size,
palette, options, timing. Three gaps remain and are named at the end.

This document was written by re-interrogating the order export for decisions the
earlier docs described but did not resolve. It closes four open questions that
`03`, `04` and `11` had left to "ask the owner."

---

## Scorecard

| # | Decision | Status | Evidence |
|---|---|---|---|
| 1 | Which products to build first | **Ready** | `11` + build list below |
| 2 | How many products | **Ready** | 55 designs = 71% of revenue |
| 3 | Canonical colour palette | **Ready — newly closed** | Demand data below |
| 4 | Option model (bow, flowers, orientation) | **Ready — newly closed** | Demand data below |
| 5 | Personalization field spec | **Ready** | `11`, 5,278 payloads |
| 6 | Collection structure | **Ready** | `04` + revenue weighting |
| 7 | Launch timing | **Ready — newly closed** | Seasonality below |
| 8 | What drove 2026 growth | **Ready — newly closed** | Launch analysis below |
| 9 | Which Etsy designs are missing from Shopify | **Partial** | Bounded, needs human ruling |
| 10 | Pricing / discount strategy | **Not ready** | No COGS, no fee data |
| 11 | Wedding: fix or retire | **Not ready** | Needs owner input |

---

## 1–2. The build list (new artifact)

`data/etsy/shopify-build-list.csv` — the 55 Etsy listings that earned ≥$100 in
2026, each joined to the Shopify catalog, with a blank `human_ruling` column.

Matching uses a **relationship signature** (godmother ≠ godfather, grandpa ≠
great grandpa), not title similarity. That distinction matters: a first attempt
using title-token overlap matched *Godmother* to *Godfather* and *Grandpa* to
*Great Grandpa* — the exact words that define a product in this catalog, per
`08`'s design-matrix rule. Those numbers were discarded.

| Verdict | Listings | 2026 net | Share |
|---|---:|---:|---:|
| Likely already on Shopify | 23 | $10,430 | 29.1% |
| Category exists, specific design uncertain | 20 | $10,451 | 29.2% |
| **No Shopify equivalent** | **12** | **$4,592** | **12.8%** |

**The honest range: between 12.8% and 42% of revenue-producing designs have no
Shopify home.** Category-level matching gives the floor; design-level gives the
ceiling. Closing that gap needs a human looking at 20 rows — an afternoon, and
the CSV is laid out for exactly that.

### The build queue — no Shopify equivalent at all

| 2026 net | New in 2026 | Design |
|---:|:---:|---|
| $904 | ● | Twin Baby Frame / Twins Nursery |
| $683 | | Aunt Mother's Day / Auntie Frame |
| $593 | | Tiny Jesus Figurine + Scripture Card |
| $431 | | Miscarriage / Baby Loss Ultrasound Frame |
| $428 | | Custom Pet Photo Frame / Dog Mom |
| $381 | ● | Ultrasound / Baby Shower / Pregnancy Announcement |
| $343 | ● | Toile Frame / Blue Floral Cottagecore |
| $180 | | "I'll Love You Forever" |
| $176 | ● | Easter Basket Mini Jesus Figurine |
| $161 | | Papa Frame from Grandkids |
| $158 | | Dad / Daddy's Little Girl |
| $153 | | Godmother Proposal |

**Two of these are not picture frames.** The Jesus figurines ($769 combined)
are a different product category that slipped into the catalog. They need a
deliberate keep-or-drop ruling, not a default port.

## 3. The canonical palette — question closed

`03` asked: *"are the 41-value products missing 'As Shown', or is 'As Shown' a
duplicate of a numbered colour? This determines whether the canon is 41 or 42."*

**5,938 real colour choices answer it. The canon is 42.**

**"As Shown" is the single most-chosen value in the catalog** — 532 units, 9.0%
of everything sold, rank 1 of 94. It is not a duplicate; it is the default that
outsells every named colour. Products offering 41 values are **missing the most
popular option**.

| Coverage | Share of units sold |
|---|---:|
| Top 5 colours | 33.5% |
| Top 10 | 51.9% |
| Top 15 | 66.2% |
| **Top 20** | **77.4%** |
| Top 25 | 84.7% |
| Top 41 | 95.7% |

Top ten by demand: `As Shown` · `22` · `17` · `37` · `21` · `24` · `3` · `19` ·
`31` · `25`.

**Recommendation:** carry all 42 on Shopify — the tail is cheap once variants
are properly modelled, and the 2048 limit gives room. But **merchandise the top
20**: they are 77% of demand and should lead the swatch order, drive the colour
facet, and be what product photography shows. 25 of 94 values were chosen two
times or fewer in three years.

Full ranking in `data/etsy/option-demand.json`.

## 4. The option model — questions closed

**Bow colour** — demand is concentrated and the casing split is visible in the
sales data itself: `White` 254 + `white` 164 = **418 units, one colour recorded
two ways**. `Natural Burlap` 205 + `natural/tan burlap` 40. Merging the casing
splits from `03` is not cosmetic; it is currently splitting the top-selling bow
colour in every report the shop runs.

**Frame orientation** — `03` decomposed 12 spellings into two axes. Demand after
normalisation:

| Edge style | Orientation | Units |
|---|---|---:|
| Scalloped | Landscape | 184 |
| Scalloped | Portrait | 80 |
| Straight | Portrait | 37 |
| Straight | Landscape | 16 |

**Scalloped outsells straight 264 to 53 — 5:1.** Landscape leads portrait 200 to
117. This is a merchandising fact nobody has stated: the scalloped edge is the
product, and it is the axis Shopify does not currently offer at all.

## 7. Launch timing — the constraint nobody has stated

Net revenue by month, 2024 + 2025 full years:

| Month | Share | |
|---|---:|---|
| **Dec** | **22.7%** | `####################################################` |
| Nov | 12.2% | `############################` |
| May | 12.1% | `############################` |
| Jun | 10.6% | `########################` |
| Apr | 8.3% | `###################` |
| Mar | 5.4% | `############` |
| Jan | 5.1% | `############` |
| Jul | 5.0% | `###########` |
| Oct | 4.9% | `###########` |
| Aug | 4.8% | `###########` |
| Feb | 4.5% | `##########` |
| Sep | 4.2% | `##########` |

**Q4 is 39.9% of the year. December alone is 22.7%.** `10` estimated December at
18.3% from review counts; orders say 22.7%. Reviews under-weight the peak because
Q4 buyers review at a lower rate.

**Today is 2026-08-22. Personalized goods stop converting for Christmas around
mid-November — roughly 12 weeks out.** Everything in `02`'s migration order that
is meant to earn in 2026 has to ship inside that window. Anything that slips is
not "late," it is targeting **May 2027**, because Jan–Mar is the annual trough
at 15% combined.

Category peaks differ and should drive collection merchandising:

| Category | Peak months |
|---|---|
| Baby | **May** 13.6%, Dec 12.8%, Nov 11.1% — flattest, sells year-round |
| Grandparent | **Dec** 23.4%, Jun 16.1%, May 15.5% |
| Godparent | **Dec** 14.7%, May 11.9% (baptism season) |
| Mom/Dad | **Jun** 21.9%, **May** 21.8% — Mother's/Father's Day |

Baby being the flattest curve makes it the *right* first build: it is the only
category that does not depend on hitting a single seasonal window.

## 8. What drove 2026 growth — answered

`11` called this "the single most valuable unanswered question." The order data
answers it.

**61.6% of 2026 baby revenue came from listings that first sold in 2026.**

| Source | 2026 net | Share |
|---|---:|---:|
| Listings first sold in 2026 | $9,403 | **61.6%** |
| Listings that existed before | $5,874 | 38.4% |

The #1 product in the entire business first sold **2026-01-25** and reached
$4,391 in seven months. Monthly baby revenue stepped from ~$400/month through
2025 to $1,900–2,800/month from April 2026 — sustained, not a spike.

**The growth engine is new design launches, not existing listings improving.**

That is the most transferable finding in this directory. It means the Shopify
plan should not be only a migration of what exists — a migration alone reproduces
the flat 38%. **New design launches are the growth lever**, and the store needs
to make launching a new design cheap and fast. That is an argument for the
template/variant discipline in `02` and `03` on commercial grounds, not just
tidiness.

## Basket economics (new)

| | |
|---|---|
| Single-unit orders | 86.9% |
| Multi-unit orders | 13.1% |
| AOV, single-unit | **$23.12** |
| AOV, multi-unit | **$54.28** |
| Multi-unit orders that are >1 of the *same* listing | 34% |

A multi-unit order is worth **2.3×** a single. One in three is someone buying the
same frame twice — grandma *and* grandpa, two godparents, twin sets. **Nothing
in the current storefront encourages it.** A quantity prompt or a "buy the pair"
bundle is a small build against a measured 2.3× basket, and it is the cheapest
revenue lever identified anywhere in this project.

---

## Gaps that remain

**1. Design-level catalog mapping (bounded, closeable today).**
20 listings worth $10,451 sit in "category exists, design uncertain." A human
ruling on 20 rows of `shopify-build-list.csv` converts the 12.8%–42% range into
a number. No further data needed.

**2. Unit economics — genuinely blocked.**
Everything here is *revenue*. There is no COGS, no Etsy fee data, no labour
cost. Consequences:
- The 31% discount rate cannot be judged. It may be sound or it may be
  destroying margin, and nothing here distinguishes those.
- Shopify-vs-Etsy economics cannot be modelled without Etsy's fee take.
- "Which products are worth building" is answered on revenue, and revenue is
  not profit. A $33 frame and a $3 figurine are not comparable at the same
  revenue.
**Ask:** Etsy Payments CSV (fees) and any per-unit material/labour figure,
however rough.

**3. Two owner rulings, no data required.**
- **Wedding** — 94 live listings, $865 and −45%. Fix or retire?
- **Jesus figurines** — $769, not a picture frame. In or out of the Shopify
  catalog?

## What changed in the other docs

| Doc | Change |
|---|---|
| `03` | Palette question **closed**: canon is 42, "As Shown" is rank 1. Top-20 merchandising rule added. Scalloped 5:1 finding added. |
| `04` | Category peak months added for collection merchandising. |
| `02` | Q4 deadline made explicit; new-design launch capability reframed as the growth lever. |
| `11` | "Why did baby take off" — **answered**, 61.6% from new launches. December corrected 18.3% → 22.7%. |
