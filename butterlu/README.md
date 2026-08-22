# Butterlu — Shopify Restructure Working Docs

Staging docs for the Butterlu Gifts Shopify store (`www.butterlu.com`,
`da0e1b-6c.myshopify.com`). This folder is a **stepping stone**: it holds
recon findings and build specs produced before a real project repo exists.
Nothing here has been executed against the live store except one deliberate
write test (see `01-store-facts.md`).

## ⚠️ Data handling — read before adding any export

The Etsy `shop_settings.json` export contains **a personal phone number, an SSN
fragment, credit card details with a home billing address, and bank account
details**. It is not in this repo and must never be committed.
`.gitignore` blocks `**/shop_settings*.json`. Only the sanitized extract at
`data/etsy/shop-profile.sanitized.json` is tracked.

**PII-scan every new export before adding it.** The listings CSV was scanned
(emails, phones, SSNs, card numbers, street addresses) and is clean.

## Read order

| Doc | Purpose |
|---|---|
| `01-store-facts.md` | Verified baseline. Read this first. Includes claims that were **disproven**. |
| `02-target-model.md` | Target architecture + migration ordering and safety. |
| `03-variant-normalization.md` | Workstream: fix the option/variant model. |
| `04-collections-taxonomy.md` | Workstream: rebuild the discovery layer. |
| `05-seo-program.md` | Workstream: SEO recon + drafting pipeline. |
| `06-personalization.md` | Workstream: capture customer personalization. **Revenue-blocking.** |
| `07-app-productization.md` | Market research on selling the customizer as a Shopify App Store app. |
| `08-listing-architecture.md` | **The design matrix** — how to model listings to capture keywords. Answers the godparent question. |
| `09-etsy-actuals.md` | **Authoritative Etsy data** from the owner's export. Supersedes Etsy inferences in `08`. |
| `10-review-intelligence.md` | **Demand and quality signal** from 12,788 Etsy reviews, 2014–2026. Volume trend, occasion mix, defect themes, seasonality. |

## Data files

| File | Contents |
|---|---|
| `data/catalog.json` | All 243 products. Full metadata, `descriptionHtml` length + SHA-256 (HTML itself excluded). |
| `data/clusters.json` | 26 duplicate/near-duplicate clusters. **Advisory only** — see the warning below. |
| `data/keyword-assets.json` | Etsy-era keyword map mined from archived listings, plus the variant/collection defect lists. |
| `data/app-store-landscape.json` | Shopify App Store *Custom products* category: 27 competitors, ratings, review counts, pricing. |
| `data/etsy/etsy-listings-2026-08-22.csv` | The real export: 618 live Etsy listings with tags, prices, variations. |
| `data/etsy/etsy-analysis.json` | Derived stats: prices, top-100 tags, variation names, godparent counts. |
| `data/etsy/shop-profile.sanitized.json` | Shop announcement and buyer message. Financial/identity fields stripped. |
| `data/etsy/etsy-reviews-2026-08-22.json` | 12,788 unique reviews, 2014–2026. Reviewer names pseudonymized to salted hashes. |
| `data/etsy/review-analysis.json` | Derived review stats: yearly volume, occasion mix, complaint and praise themes, seasonality. |
| `data/etsy-recon.json` | 38 live Etsy listings recovered by fingerprint search. Sample, not a census. |
| `data/app-pricing.json` | Real pricing tiers for Globo and Zepto — what the free tiers actually gate. |
| `data/design-matrix.json` | Design template x relationship grid: 11 templates, 17 relationships, 187 cells. |

## Code

| Path | Contents |
|---|---|
| `etsy-export-request.html` | Forwardable data request for the Etsy shop owner. Confirmed deep links to every export. |
| `snippets/butterlu-personalization.liquid` | Rung 1 personalization capture. Working, **untested against the live theme**. |

## Ground rules for any agent working from these docs

1. **Do not bulk-mutate the live store.** It is a real, live storefront on the
   Basic plan taking real traffic. Every write needs a named human approver.
2. **Redirects before removal.** The store has never had a single URL redirect
   created. Archiving or re-handling anything without one silently breaks links.
3. **`clusters.json` is not a delete list.** Most clusters are products that
   share copy-pasted boilerplate, not duplicates. "Grandpa", "Abuelo" and
   "Great Grandpa" frames cluster together and are three real products.
   Only byte-identical titles among live products are safe merge candidates,
   and there are exactly four such listings (one group).
4. **Verify before trusting a prior claim.** Several "known facts" handed to
   this project were wrong. `01-store-facts.md` records which, and how they
   were checked. Re-derive rather than inherit.
5. **Counts in these docs are exact**, computed from `data/catalog.json`, not
   estimated. If you change the catalog, regenerate the data files.
6. **Corrections are recorded in place, not silently edited.** Where earlier
   advice was disproven by later evidence, the doc says so and points at the
   data. See the correction block in `06-personalization.md` and the top of
   `07-app-productization.md`.
