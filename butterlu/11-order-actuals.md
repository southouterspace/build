# 11 — Order actuals (Etsy, 2024–2026)

**Source:** owner's Etsy "Sold Order Items" exports for 2024, 2025 and 2026,
retrieved 2026-08-22. 6,248 line items, 5,484 orders, 2024-01-01 → 2026-08-22.

**This document supersedes every revenue, demand and "what sells" inference in
`08`, `09` and `10`.** Those were built on listing counts and review proxies.
This is the transaction record.

## ⚠️ Data handling — the raw exports must never be committed

The raw files contain **5,184 distinct customer names and home addresses**
(`Buyer`, `Ship Name`, `Ship Address1/2`, `Ship City`, `Ship Zipcode`) across
~4,800 customers. This is third-party personal data belonging to people who
never agreed to be in a source repository.

What is in the repo is `data/etsy/orders-deidentified-2024-2026.csv`:

- **Dropped entirely:** buyer name, recipient name, street address, city,
  postcode, transaction ID, raw order ID.
- **Kept coarse:** `Ship State`, `Ship Country` — too broad to identify anyone,
  useful for geography.
- **Hashed:** `order_key` and `buyer_key` are salted SHA-256 prefixes, so line
  items still group into orders and repeat buyers are still countable, without
  storing an identity.
- **Redacted:** 23 listings titled `Custom order for <customer name>` had the
  name in the *product title* column. Those titles are replaced.
- **Redacted:** contact details customers typed into the personalization
  free-text field. One buyer entered a phone number. Free-text fields can
  contain anything, so phone numbers, emails and URLs are stripped from
  `Variations` regardless of where they appear.

**Any future export must be re-scanned, not assumed clean.** Two of the four
redactions above were in columns that look non-personal (`Item Name`,
`Variations`) and were only found by scanning content rather than trusting the
column schema.

`.gitignore` blocks `*SoldOrderItems*.csv`. Verified with `git check-ignore`.

---

## The headline reverses the story

Strictly comparable Jan 1 – Aug 21 windows. Net = item total minus discounts,
excluding shipping and tax.

| Window | Orders | Units | Net revenue |
|---|---:|---:|---:|
| 2024 | 1,305 | 1,593 | $33,463 |
| 2025 | 1,019 | 1,231 | $27,139 |
| **2026** | **1,310** | **1,763** | **$35,646** |

**2026 is +29% orders and +31% net revenue against 2025, and already ahead of
2024.** The business is not in decline. It bottomed in 2025 and is recovering
strongly.

`10` reached the right direction from review counts but understated it — it
called 2026 "up 14%". Reviews lag and under-sample. **Where `10` and this
document disagree, this document is correct.**

## The entire recovery is one category

Net revenue by occasion, same Jan–Aug window, matched on item title:

| Occasion | 2024 | 2025 | 2026 | 26 vs 25 |
|---|---:|---:|---:|---:|
| **Baby / pregnancy** | $4,335 | $3,784 | **$15,133** | **+300%** |
| Grandparent | $14,991 | $11,163 | $10,121 | −9% |
| Mom / Dad | $12,648 | $8,568 | $8,824 | +3% |
| Godparent | $9,097 | $6,326 | $4,215 | −33% |
| Aunt / Uncle | $3,596 | $3,025 | $3,310 | +9% |
| Baptism | $6,340 | $4,845 | $2,388 | −51% |
| Memorial | $406 | $1,050 | $2,230 | +112% |
| Pet | $102 | $1,191 | $1,803 | +51% |
| Engagement | $2,654 | $1,286 | $960 | −25% |
| Wedding | $1,936 | $1,573 | $865 | −45% |
| Graduation | $0 | $21 | $821 | new |
| **Total** | **$33,463** | **$27,139** | **$35,646** | **+31%** |

**Baby went from 13.9% of net revenue to 42.5% in one year.** It added ~$11,350
while everything else *lost* ~$2,850 combined. Strip baby out and 2026 is still
shrinking.

This is the clearest strategic signal in the entire project, and it confirms —
with money — what `09` found in tags and `10` found in review text. Three
independent datasets agree.

Also worth noting: **memorial (+112%), pet (+51%) and graduation (new)** are all
small but growing, while **baptism (−51%) and godparent (−33%)** are in real
decline. Baptism/godparent was the historic flagship.

### The wedding mystery is answered

`10` flagged 94 live wedding listings producing zero review mentions and asked
whether the category was dropped or lost. **It was lost.** Wedding net revenue
is $865 across the whole of 2026 — 2.4% of the business, down 45% year on year,
from 94 live listings. Those listings are not retired; they simply do not sell.

**Do not fund wedding SEO.** The "Featured on The Knot" badge is real but it is
selling nothing today.

## 95% of the catalog is dead weight

Of **618 live Etsy listings**, only **303 sold anything at all** in 2026:

| Threshold | Listings | Share of 2026 net revenue |
|---|---:|---:|
| ≥ $1,000 | 4 | 28.1% |
| ≥ $500 | 14 | 47.7% |
| ≥ $250 | 22 | 55.8% |
| **≥ $100** | **55** | **71.1%** |
| Sold anything | 303 | 100% |
| **Sold nothing** | **315** | **0%** |

**55 listings produce 71% of revenue. 315 produce nothing.**

This settles the central question of the whole restructure. The Etsy
listing-flood strategy is not translating into sales — it is a long tail of
near-zero performers. A Shopify catalog built from **the ~55 designs behind
those listings** would capture the overwhelming majority of the revenue with
roughly a tenth of the maintenance surface.

It also reframes `02`'s "one product = one design" target as far less
disruptive than it looked: most of what would be consolidated away is already
earning nothing.

### Top 10 listings, 2026

| # | Net | Units | vs 2025 | Listing |
|---:|---:|---:|---:|---|
| 1 | $4,391 | 189 | **NEW** | Personalized Baby Name Picture Frame / Custom Newborn Photo Frame |
| 2 | $3,083 | 132 | −44% | Grandpa Gift Christmas / I Love My Grandpa Picture Frame |
| 3 | $1,496 | 63 | +13% | Godfather Gift / Uncle Gift / Godfather Picture Frame |
| 4 | $1,097 | 45 | +35% | Love At First Sight / Ultrasound Picture Frame |
| 5 | $934 | 41 | +17% | Grandpa Personalized Christmas Gift |
| 6 | $904 | 37 | **NEW** | Twin Baby Picture Frame / Twins Nursery Decor |
| 7 | $886 | 39 | **NEW** | Baby Shower Gift Ultrasound Frame / Hello Little One |
| 8 | $688 | 31 | −57% | Godmother Gift / Godmothers Are A Blessing |
| 9 | $683 | 29 | −39% | Aunt Christmas Gift / Auntie Custom Frame |
| 10 | $659 | 29 | +663% | Graduation Picture Frame for College Girls |

**The single biggest listing in the business did not exist in 2025.** Four of
the top 20 are new baby listings. Whatever was changed in that range in 2026,
it worked, and it is the thing to replicate on Shopify first.

## Every order is discounted

| Year | Gross | Discounts | Discount rate | Orders with a coupon |
|---|---:|---:|---:|---:|
| 2024 | $78,825 | $18,935 | 24.0% | 2,212 / 2,215 (99.9%) |
| 2025 | $68,715 | $17,305 | 25.2% | 1,829 / 1,951 (93.7%) |
| **2026** | **$51,911** | **$16,074** | **31.0%** | **1,318 / 1,318 (100%)** |

**Not one 2026 order paid list price.** The discount rate has climbed seven
points in two years, and 24 distinct coupon codes were used in 2026 — a mix of
Etsy-generated codes (`WRBEQB`, `QHQRYJHR52J`) and hand-made recurring sales
(`MIDDLEAPRIL`, `ENDOFAPRIL`, `MIDENDMAY`, `MIDMARCHSALE`).

Two readings, and they are in tension:

- The 2026 growth was **partly bought**. Units are up 43% while net revenue is
  up 31% — net revenue per unit fell from $22.05 to $20.22.
- But a permanent 31% discount means **the list price is fiction**. The real
  price is what customers actually pay, and the sticker exists to make the
  coupon feel like a deal.

**This is the strongest financial argument for Shopify in the whole project.**
On Shopify there are no Etsy transaction and listing fees, and pricing is under
the owner's control. Moving even part of this volume at a lower discount rate
improves margin twice over. Whether to carry the discount habit across is a
real decision, not a default — and it should be made deliberately.

## Personalization: the spec, from 5,278 real payloads

84.5% of all line items carry a personalization payload (79.1% in 2026). This
is the requirements document for `06`, and it is stricter than what was assumed:

| Property | Measured |
|---|---|
| Median length | 38 chars |
| p90 / p99 / max | 113 / 243 / **292** |
| Truncated at 100 chars | **12.5% of orders** |
| Truncated at 255 chars | 0.4% |
| **Contain a newline** | **48.0%** |
| Contain emoji | 18.5% |
| Contain any non-ASCII | 33.3% |

Real examples:

```
Colton
SIENNA GRACE
I Love My Nana! (At the top) 💜 Saoirse (at the bottom)  please make the frame wide.
We Love Our Nana! (At the top) 💙 Flynn & Liam (at the bottom)
```

Four hard requirements fall out of this:

1. **Multi-line input is mandatory.** 48% of payloads contain newlines. A
   single-line `<input>` would corrupt nearly half of all orders.
2. **The limit must be ≥255, ideally 300.** A 100-character cap breaks one order
   in eight.
3. **Full UTF-8, including emoji.** A third of payloads are non-ASCII. Any
   ASCII-only validation or sanitising step destroys real orders.
4. **Buyers embed layout and production instructions** ("At the top", "at the
   bottom", "please make the frame wide"). The field is not just a name — it
   carries fabrication intent that a human currently reads and acts on. Do not
   design it as a structured name-only field.

> **CORRECTED 2026-08-22.** `snippets/butterlu-personalization.liquid` defaulted
> `max_chars` to **100**, which this data shows would have truncated 12.5% of
> real orders. Fixed to **300**, with the distribution recorded in the snippet
> so nobody lowers it casually. It was already a `<textarea>`, so the newline
> requirement was met by luck rather than evidence.

## Operations: they beat their own promise

Date paid → date shipped, 6,217 orders:

| Days | Share |
|---:|---:|
| 0 | 13.8% |
| 1 | 26.0% |
| 2 | 25.3% |
| 3 | 19.6% |
| 4 | 9.9% |
| 5+ | 5.3% |

**Median 2 days. 84.7% ship within 3 calendar days. 99.4% within 6.**

**Seasonality (`12`): December is 22.7% of annual revenue and Q4 is 39.9%** —
`10` estimated December at 18.3% from review counts, which under-weights the
peak because Q4 buyers review at a lower rate.

The shop advertises "3–4 business days" processing. **They are meaningfully
faster than they claim** and are under-selling their single most-praised
attribute — `10` found "fast shipping" to be the #1 praise theme at 17.5%.

Shopify product and collection copy should say **"most orders ship within 2
days"**, which is defensible from this data. That is a conversion asset being
left on the table.

## Repeat buyers — correcting `10`

| Measure | Value |
|---|---:|
| Distinct buyers (2024–2026) | 4,816 |
| Buyers with more than one order | **291 (6.0%)** |
| Most orders by one buyer | 10 |
| Share of net revenue from repeat buyers | 12.5% |

> **CORRECTION.** `10` estimated a ~26% repeat rate from reviewer-name matching
> and warned the method was unreliable. It was: the true figure is **6.0%**.
> First-name collisions inflated it more than four-fold. The claim in `10` is
> withdrawn — use 6.0%.

6% is a normal-to-low repeat rate for gift purchases, and it **weakens** the
"Etsy owns the customer relationship" argument. The opportunity is still real —
Shopify captures email, Etsy does not — but it should be sized against 6%, not
26%.

## Geography

**98.8% of 2026 net revenue is United States.** Canada is 0.8%; everything else
rounds to zero. Top states: NY $3,859 · CA $2,909 · PA $2,539 · TX $2,504 ·
NJ $2,307 · IL $2,176 · FL $2,088.

International shipping copy exists in the shop profile but the volume does not
justify prioritising it. US-only assumptions are safe for launch.

## Loose ends closed

- **The $0.20 listing** (open since `09`): it is not a product. `Custom order
  for <name>` placeholder listings, used to invoice bespoke work, plus a
  `fed ex 2 day upgrade` shipping add-on. 23 such rows, now redacted. **These
  should not migrate to Shopify as products** — Shopify has draft orders for
  exactly this.
- **Order channel:** 6,245 of 6,248 line items are `online`; 3 are
  `custom_shop`. There is no meaningful in-person or wholesale channel.

## What changes downstream

| Doc | Change |
|---|---|
| `02` | Consolidation is **low-risk**: 315 of 618 listings earn nothing. Sequence baby first. Reconsider discount strategy as an explicit decision. |
| `03` | Unchanged — but `Frame Orientation` appears in real order variations, confirming buyers use it. |
| `04` | Build **baby first** (42.5% of revenue, 16 active products). Wedding collections: **do not build**. Godparent: size down, −33% YoY. |
| `05` | Target the 55 revenue-producing designs, not 618 listings. Use "ships in 2 days". **Cut wedding keywords entirely.** |
| `06` | Spec hardened: ≥300 chars, multi-line, full UTF-8, layout instructions. Snippet corrected. |
| `08` | Matrix is superseded as a demand model. Cell counts measure listings, and listings do not predict revenue. |
| `09` | Listing counts ≠ demand. 70 godparent listings earn $4,215; 1 baby listing earns $4,391. |
| `10` | Repeat rate corrected 26% → 6.0%. Growth corrected +14% → +31%. Wedding question answered. |

## Still outstanding

- ~~**Why did the baby range take off in 2026?**~~ **ANSWERED in `12`.**
  **61.6% of 2026 baby revenue came from listings that first sold in 2026.**
  It is new design launches, not existing listings improving. The monthly curve
  steps from ~$400/month in 2025 to $1,900-2,800/month from April 2026 and
  holds — sustained, not a spike.
- **Cost of goods.** None of this is margin. Revenue is not profit, and the
  31% discount rate makes the gap wider than it looks.
- **Etsy fees.** Not in this export. Needed for a real Shopify-vs-Etsy
  economics comparison.
- **2023 and earlier orders**, if the peak years matter for seasonality.
