# 13 — Shopify live state: what the store is actually doing

**Date:** 2026-08-22
**Source:** Shopify Admin API + Analytics on `da0e1b-6c.myshopify.com`, read-only.
**Status:** supersedes the implicit assumption in `02`–`12` that catalog
structure is the binding constraint on Shopify revenue. It is not.

Every prior document in this directory analyses **Etsy** data to plan a
**Shopify** catalog. None of them looked at what the Shopify store is doing.
This one does, and the answer changes the order of work.

---

## 1. The headline

| Metric | Value | Window |
|---|---:|---|
| Orders | **0** | all time (13 months) |
| Gross sales | **$0.00** | all time |
| Sessions | 12,291 | last 90 days |
| Sessions with cart additions | 68 (0.55%) | last 90 days |
| Reached checkout | 4 | last 90 days |
| **Completed checkout** | **0** | last 90 days |
| Conversion rate | **0.0%** | last 90 days |

The store has never taken an order.

## 2. The 12,291 sessions are not customers

Three independent signals say this traffic is automated:

| Dimension | Observed | What real retail traffic looks like |
|---|---|---|
| Device | **99.5% desktop** (12,231 / 53 mobile) | 70–80% mobile for consumer gifting |
| Referrer | **99.7% direct** (12,252) | mostly search / social / paid |
| Weekly volume | 17 → 3,596 → 43 | smooth, seasonal |

A personalized-gift store whose Etsy buyers are overwhelmingly women shopping
on phones does not produce 99.5% desktop traffic. Direct-with-no-referrer,
desktop-only, wildly spiky volume is the signature of crawlers and scanners.

**Real human traffic, isolated:** filtering out `direct` leaves **39 sessions
in 90 days** — about 13 per month — and **zero** of them added to cart.

That is the real number to plan against. Not 12,291. Thirteen a month.

## 3. The store itself is fine

This is not a broken-storefront problem. Verified live on `www.butterlu.com`:

- Not password-protected; renders publicly.
- Products, prices, images, collections all display.
- Payment methods configured and advertised: Visa, Mastercard, Amex, Discover,
  Diners, PayPal, Apple Pay, Google Pay, Shop Pay.
- Navigation, policies, about/FAQ/contact pages all present.
- Design is competent and on-brand.

The 4 sessions that reached checkout and did not complete are too few to
diagnose. There is no evidence of a checkout fault — there is an absence of
anyone to fault it.

## 4. What this means for the plan

Docs `02`–`12` are a catalog-optimisation program: variants, collections,
palette, personalization, SEO. That work is sound and the evidence behind it
holds. But it answers *"if someone arrives, will they find and buy the right
thing?"*

The measured constraint is different: **almost nobody arrives.**

Etsy is not just a sales channel here, it is the entire demand engine — it
supplies the search traffic that produced ~$36k of 2026 revenue. Shopify
supplies none of it. A migrated, perfectly-structured catalog receiving 13
human visits a month earns approximately zero.

**This does not invalidate the catalog work.** It reorders it. Catalog quality
is a *conversion* multiplier; it multiplies traffic that must first exist.
Shipping the catalog without a demand plan multiplies zero.

The Q4 timing constraint in `12` (39.9% of annual revenue, ~12 weeks to the
mid-November cutoff) applies to the **demand** work at least as much as the
catalog work. A store with no traffic in November captures no Q4.

## 5. Live defects found

These are on the storefront right now, visible to any visitor.

### 5.1 A product named `test` is live

Handle `test`, price $11.00, status ACTIVE, published to Online Store.
It is a placeholder that was never removed.

### 5.2 Eight products are mispriced roughly 30% under catalog norm

Catalog norm for a 4x6 personalized frame is **$27.95** (or $29.95). These
eight sit at $15.55–$17.46:

| Price | Handle |
|---:|---|
| $16.06 | `personalized-baby-boy-picture-frame-68225` |
| $16.06 | `will-you-be-my-godfather-frame-02766` |
| $16.06 | `mothers-day-dog-mom-gift-just-a-72946` |
| $16.06 | `dog-loss-gift-rainbow-bridge-dog-18510` |
| $16.06 | `aunties-bestie-picture-frame-aunt-29399` |
| $16.06 | `birthday-gift-for-great-grandma-49865` |
| $17.46 | `pregnancy-gift-sonogram-ultrasound-97805` |
| $15.55 | `you-were-always-enough-frame-72754` |

$16.06 = $22.95 × 0.70 and $17.46 = $24.95 × 0.70, to the cent. These look like
a 30% haircut applied during import and never reverted — not deliberate prices.
Nobody sets a price of $16.06.

**This is not a rounding nit.** The affected designs include the godfather
proposal frame (top category by revenue), the baby boy frame (the growth
category per `12`), and the sonogram/pregnancy frame (a top Etsy earner). They
are the catalog's most valuable designs, discounted by accident.

They are also disproportionately what a visitor sees: the homepage
"Best Sellers" carousel surfaces $16.06 items directly.

**Requires an owner ruling before correcting** — this is a price change, and
prices are the owner's call. Flagged, not touched.

### 5.3 Homepage carousel renders `NaN / of-Infinity`

The Best Sellers section on the homepage prints the literal string
`NaN / of-Infinity` where a slide counter should be. A theme/section bug —
broken pagination arithmetic. Cosmetic, but it is on the front page and it
reads as a broken site.

### 5.4 Inventory quantities are meaningless

Active products carry inventory like 41,958 / 83,916 / 40,795 units. Import
artifacts. Harmless today (nothing will read as out of stock) but they make
any future inventory or sell-through report useless.

## 6. Catalog size correction

The directory refers to "243 Shopify products". That is the total row count.
The live catalog is:

| Status | Count |
|---|---:|
| **ACTIVE** | **99** |
| ARCHIVED | 129 |
| DRAFT | 15 |
| Total | 243 |

**Use 99 when reasoning about the storefront.** This matches the recon baseline
in `data/catalog.json` exactly — nothing has been archived since. The 129
archived products are the Etsy-style duplicate flood already identified in `01`
and `08`; they are correctly out of the way.

### Verification: the build list is unaffected

`data/etsy/shopify-build-list.csv` joins Etsy listings to Shopify products. If
that join had matched *archived* products, its coverage estimate would be
inflated and the 12.8%–42% range in `12` would be too optimistic.

Checked: of the 55 rows, 54 carry a Shopify match and **all 54 point to ACTIVE
products** (1 row has no match). The join used live inventory only. **The
12.8%–42% range in `12` stands unchanged.**

## 7. What this adds to the open-questions list

`12` named three gaps. This adds a fourth, and it outranks the others:

| Gap | Status |
|---|---|
| Design-level mapping (20 rows) | needs human ruling — unchanged |
| Unit economics (COGS + Etsy fees) | blocked on owner export — unchanged |
| Wedding / Jesus figurine rulings | needs owner — unchanged |
| **Demand: how does anyone find this store?** | **new, and it gates revenue** |

Nothing in this directory addresses demand. There is no channel plan, no paid
search plan, no email plan, and no measurement of what Etsy traffic could be
redirected. The sales channels are *installed* (Facebook & Instagram,
Pinterest, TikTok, Faire) but are producing 25 social sessions per 90 days,
which is indistinguishable from nothing.

The cheapest demand lever visible from the data already gathered: the Etsy
business has **~4,816 distinct past buyers** and the shop has 15,000+ reviews.
That is an owned audience that has bought this exact product. Whether it can be
contacted depends on what Etsy's terms permit and what contact data the owner
holds — an owner/legal question, not a data question, and it should be asked
before it is assumed.

---

## Provenance

All figures read from the Shopify Admin API and Analytics on 2026-08-22,
read-only. No mutations were performed. Storefront rendering confirmed by
fetching `www.butterlu.com` directly.

The pricing defects in 5.2 and the `test` product in 5.1 are **reported, not
fixed** — both are changes the owner must authorise.
