# 07 — Building the Customizer as a Commercial Shopify App

**Status:** market + pricing research complete. Direction set by the owner.
**Goal on record:** build the functionality Butterlu needs, then package and
sell it as a Shopify app to **fund the development work**.

That framing matters and is different from speculative market entry. The build
cost is largely incurred either way; the app is a route to recouping it. This
doc is written to that goal.

## The "free isn't really free" critique is correct

Verified against live listing pages 2026-08-22. Data: `data/app-pricing.json`.

### Globo Product Options (4,823 reviews, 4.9)

| Plan | Price | What you get |
|---|---|---|
| Free | $0 | Unlimited option sets, products **and orders**. 15 option types. Conditional logic. Options on orders/packing slips. No watermark. |
| Premium | $9.90/mo | 20 option types, price add-ons, file upload 20MB, character limits, theme styling |
| **Advanced** | **$19.90/mo** | 30+ option types, **Product Personalizer — Live Preview**, cart editing, POS |

Globo's free tier is genuinely generous for **plain text capture**. But
**live preview — the feature Butterlu actually wants — is Advanced only, at
$19.90/mo.** Exactly the gate the owner predicted.

### Zepto Product Personalizer (1,311 reviews, 4.9)

| Plan | Price | Product cap | **Custom orders/month** |
|---|---|---|---|
| Starter | $9.99/mo | 50 | **100** |
| Basic | $19.99/mo | 200 | **300** |
| Pro | $29.99/mo | 500 | **500** |
| Unlimited | $49.99/mo | unlimited | unlimited |

**Zepto has no free plan at all** — the App Store label is "Free trial
available", not "Free plan available". And it **meters custom orders per
month**. For a 100%-personalized store, *every* order is a custom order, so
the meter runs on core sales volume. Growth raises the bill.

### What buying actually costs Butterlu

96 live products, every one personalized:

- Globo Advanced (for live preview): **$19.90/mo — $238.80/yr**
- Zepto Basic minimum viable: **$19.99/mo**, rising to **$49.99/mo — $599.88/yr** at volume

**Correction to earlier advice:** `06-personalization.md` said "buying beats
building" and pointed at Globo's free tier. That was right for plain text
capture and **wrong for live preview**, which is paywalled. `06` is amended.

### The strategic read this changes

Live preview is **not a differentiator** — every leader ships it. But it **is
the paywall line** in this category. It is the feature incumbents monetise.

That reframes it: building live preview is not "building something nobody has."
It is "attacking the price line of a category where the leader has 4,823
reviews." That is a real strategy — it is just a *price* strategy, not a
*product* strategy, and it should be entered knowingly.

## Market context (unchanged, still true)

Source: App Store *Custom products* category page one. Data:
`data/app-store-landscape.json`.

| Metric | Value |
|---|---|
| Apps on page one | 27 |
| Total reviews | 28,694 |
| Apps with 1,000+ reviews | 11 (81% of all reviews) |
| Median rating | 4.8 |

Incumbents are entrenched and well-reviewed. Review count drives App Store
ranking and compounds; a new entrant starts at zero.

## Funding arithmetic

This is the number that should drive the decision. It uses **no invented
install data** — Shopify does not publish installs, and review-to-install
ratios are unknowable from outside. It is just the arithmetic of the price
points above.

| Dev budget | At $9.90/mo | At $19.90/mo | At $29.99/mo |
|---|---|---|---|
| $60k/yr (part-time) | 505 installs | 251 installs | 167 installs |
| $120k/yr (full-time) | 1,010 installs | 503 installs | 333 installs |

**Sustained paying installs**, net of churn, minus Shopify's revenue share and
hosting.

Stated once, plainly: **funding development this way requires hundreds of
paying merchants.** That is a company with support obligations, not a
byproduct of building a feature for one store. If the plan is to fund dev work,
the plan is to run an app business. That is a legitimate choice — it should
just be made with the number visible.

## Choosing the wedge

Given the goal is to build what Butterlu needs *and* sell it, the wedge should
satisfy three tests:

1. **Butterlu genuinely needs it** (so the build is not speculative)
2. **It is not already commoditised at $0–20/mo** (so it can be charged for)
3. **A definable buyer has the same pain** (so it sells)

| Candidate | Needs it | Not commoditised | Buyer exists | Verdict |
|---|---|---|---|---|
| Generic product options | Yes | **No** — free at Globo | Yes | Fails |
| Live preview | Yes | **No** — $19.90 at Globo | Yes | Price play only |
| Print-ready production output | Yes | Partly — Customily does it | Yes | Contested |
| **Catalog generation from a design matrix** | **Yes** (see `08`) | **Yes — nobody does it** | Etsy migrators | **Strongest** |
| **Post-import Etsy consolidation** | **Yes** (this whole repo) | **Yes — nobody does it** | Etsy migrators | **Strongest** |

### The two uncontested candidates

Both come straight out of Butterlu's own needs, documented in this folder.

**Catalog generation from a design matrix** (`08-listing-architecture.md`).
Butterlu needs to build 100+ listings from 11 quote templates x 17
relationships, each with its own SEO copy and collection assignments, without
hand-writing them. No options app does this. It is a merchandising tool, not
an options tool.

**Post-import Etsy consolidation** (`01`, `04`, this repo's data). Every
Etsy→Shopify importer on the App Store — Easy:Import, SP Etsy Importer,
Salestio, shopUpz, InfoShore — imports listings 1:1. **That is the mechanism
that produced Butterlu's catalog**: 243 products carrying ~96 designs, 868
tags of which 530 are used once, no collections, no SEO. The importers create
the problem and stop. Nobody sells the cleanup.

These two are the same product viewed from two ends: **take a flooded,
keyword-farmed marketplace catalog and turn it into a properly modelled
Shopify store.** Consolidate what exists; generate what is missing.

The prototype logic already exists in this folder — hash-based duplicate
detection, cluster analysis, tag mining, template/relationship matrix
extraction, defect detection.

### Honest risks

- **Smaller TAM** than product options.
- **Migration is one-time**, which makes recurring revenue hard. Likely a
  one-off or short-subscription product — which fits *recouping* build cost
  better than it fits *funding ongoing* dev.
- **Unvalidated demand.** Nobody selling it may mean nobody wants it. Needs
  customer discovery before app code is written.
- **Correctness is the entire product.** See ground rule 3 in `README.md`:
  naive clustering merges "Grandpa", "Abuelo" and "Great Grandpa" into one
  product. Getting this wrong destroys a merchant's catalog. This is the
  hardest part and the reason it is defensible.

## Requirements for public App Store distribution

Confirmed from `shopify.dev`:

- **Shopify billing API is mandatory.** All charges must go through it.
  Bring-your-own-Stripe is not permitted.
- **Mandatory compliance webhooks** (`customers/data_request`,
  `customers/redact`, `shop/redact`) for **every** listed app, regardless of
  whether it collects personal data.
- **App review** against the published requirements checklist.
- **OAuth / managed installation** configured and tested — bad App URL or
  redirect URLs are a documented rejection cause.
- **Shopify Partner account** and a development store.

Budget for review iteration; first submissions commonly bounce.

## Do not couple the two timelines

Unchanged and still the most important operational point.

| Track | Action | Timeline |
|---|---|---|
| **Butterlu** | Ship `snippets/butterlu-personalization.liquid` (rung 1, free, already written). Optionally add Globo's **free** tier for richer option types. Do **not** pay for Advanced — live preview is what you intend to build. | Days |
| **Product** | Customer discovery on the consolidation/generation thesis before building. | Weeks |

Running Globo's free tier at Butterlu is also free competitive research: it
shows exactly where the paywall sits and what merchants get for $19.90.

## Open questions

1. Which wedge — price-attack on live preview, or the uncontested
   consolidation/generation angle? They imply very different products.
2. Is there appetite for customer discovery before building?
3. Does a Shopify Partner account exist yet?
4. What is the actual dev budget being funded? The arithmetic above is only
   meaningful against a real number.
