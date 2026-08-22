# 07 — Selling the Customizer on the Shopify App Store

**Status:** market research complete, no build decision made.
**Owner preference on record:** build the customizer as a commercial app for
the Shopify App Store, with Butterlu as design partner / first install.

## Correction to earlier advice in `06-personalization.md`

An earlier version of `06` recommended building a customizer whose
differentiator was **live preview** — rendering the customer's text on their
chosen colour before add-to-cart — and called it "the one thing worth custom
building."

**That was wrong, and the research below disproves it.** Live preview is not a
gap in this category. It is the standard feature that market leaders lead
their listing copy with. `06` has been amended.

## Market reality

Source: Shopify App Store category *Custom products*, page 1, scraped
2026-08-22. Raw data in `data/app-store-landscape.json`.

| Metric | Value |
|---|---|
| Apps on page one alone | 27 |
| Total reviews represented | 28,694 |
| Apps with 1,000+ reviews | 11 (81% of all reviews) |
| Apps offering a free tier | **23 of 27** |
| Rating range | 3.7 – 5.0, **median 4.8** |

Top of category by review volume:

```
4,823  4.9  Free plan       Globo Product Options, Variant
2,930  4.9  Free plan       Easify Custom Product Options
2,836  5.0  Free plan       Color Swatch King: Variants
2,434  4.7  Free trial      Infinite Options
2,267  4.9  Free plan       OPTIS Product Options, Variant
1,715  5.0  Free plan       GLO Color Swatch Variant Image
1,620  4.9  Free plan       Aris Product Options, Variants
1,311  4.9  Free trial      Zepto Product Personalizer
```

Apps that **already ship live preview** and say so in their tagline:
LPO Live Product Options · Live Preview Options by Webyze · Zepto Product
Personalizer · Globo Product Options · Customily Product Personalizer ·
Inkybay.

Customily goes further than preview: *"Live Previews & **Auto Fulfillment**"*
and *"print ready files"* — i.e. the production-output problem is also taken.

### Read on this

Three signals, all bad for a general-purpose entrant:

1. **Saturation.** Eleven apps with four-figure review counts. Review count is
   a proxy for install base and for App Store ranking, and it compounds — new
   entrants start at zero against incumbents with a decade of accumulated
   social proof.
2. **No quality gap.** A median rating of 4.8 across 27 apps means merchants
   are not dissatisfied. There is no "they're all bad, we'll do it properly"
   opening.
3. **Price floor is zero.** 23 of 27 have a free tier. Willingness to pay for
   generic product options is approximately nil, so a paid general-purpose
   entrant must be dramatically better *and* overcome free.

**Verdict: building a general-purpose product-options / personalization app to
sell is a poor bet.** Not impossible, but the evidence does not support it, and
it should not be entered into on the assumption that live preview is a wedge.

## What the research does suggest

A specific, evidenced gap surfaced while checking the adjacent category.

Etsy→Shopify import apps exist and are established: Easy:Import, SP Etsy
Importer, Salestio, shopUpz ($14.99/mo unlimited), InfoShore. **Every one of
them imports listings 1:1.**

That is precisely the mechanism that produced the mess documented in
`01-store-facts.md`: 243 Shopify products carrying roughly 96 real designs,
868 tags of which 530 are used once, no collection structure, no SEO, an
option model split across 12 inconsistent names and six palette definitions.

**Nobody sells the consolidation step.** The importers create the problem and
stop. There is no app that takes a flooded, imported catalog and:

- groups near-duplicate listings into candidate products (advisory, human-ruled)
- collapses listing-per-keyword into product + variants
- derives a collection taxonomy from the noisy imported tag vocabulary
- preserves the marketplace keyword surface as collections rather than losing it
- generates the redirects so the collapse doesn't break inbound links
- writes SEO fields the marketplace never had

This is a **post-migration cleanup** product, not an importer and not an
options app.

### Why this is a stronger candidate

- **Lived experience.** Butterlu is a worked example, end to end, with the
  before-state captured in `data/`.
- **Working prototype logic already exists.** The clustering, hash-based
  duplicate detection, tag mining, and defect detection in this folder are the
  core algorithms.
- **The buyer has budget and pain.** Someone who just paid to import 500 Etsy
  listings and now has an unnavigable store has an acute, dated, expensive problem.
- **It is adjacent to a proven category** rather than head-on against eleven
  entrenched incumbents.

### Honest risks

- **Smaller TAM** than product options. Migration is a one-time event, which
  makes recurring revenue hard — likely a one-off or short-subscription product.
- **Unvalidated demand.** Nobody selling it may mean nobody wants it. This
  needs customer discovery before a line of app code is written.
- **Correctness is the whole product**, and it is genuinely hard — see the
  false-positive clustering problem in `README.md` ground rule 3. Getting this
  wrong destroys a merchant's catalog.

## Requirements for public App Store distribution

Confirmed from `shopify.dev`. Applies to whatever gets built.

- **Shopify billing API is mandatory.** All charges for App Store apps must go
  through Shopify's billing system. Bring-your-own-Stripe is not permitted.
- **Mandatory compliance webhooks** (`customers/data_request`,
  `customers/redact`, `shop/redact`) are required for **every** listed app,
  *regardless of whether the app collects personal data*.
- **App review** against the published requirements checklist — the same
  checklist the App Review team uses.
- **OAuth / managed installation** must be configured and tested; incorrect App
  URL or redirect URLs are a rejection cause.
- Requires a **Shopify Partner account** and a development store.

Budget for review iteration. First submissions commonly bounce.

## Do not couple the two timelines

This is the most important operational point in this doc.

**Butterlu is losing money today** because the store cannot capture
personalization (`06-personalization.md`). A public app is a months-long
project including review. These must not be sequenced together.

| Track | Action | Timeline |
|---|---|---|
| **Butterlu** | Ship line item properties (`06` rung 1), or install one of the free incumbents — Globo or Zepto give live preview immediately at no or low cost. | Days |
| **Product** | Customer discovery on the consolidation thesis *before* building. Talk to Etsy→Shopify migrators. | Weeks |

Using an incumbent app at Butterlu is also **free competitive research** — it
shows exactly what the leaders do well and where they fall short, from the
position of a real merchant with a real catalog.

## Open questions for the owner

1. Is the goal a **product business**, or a **funded way to solve Butterlu**?
   These lead to different decisions. If the latter, buying an app is faster
   and cheaper than building one.
2. Willingness to do customer discovery before building? The consolidation
   thesis is evidenced but **not validated**.
3. Is Butterlu willing to install a competitor app in the interim? Recommended.
4. Does a Shopify Partner account exist yet?
