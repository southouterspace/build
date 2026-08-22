# Butterlu — Shopify Restructure Working Docs

Staging docs for the Butterlu Gifts Shopify store (`www.butterlu.com`,
`da0e1b-6c.myshopify.com`). This folder is a **stepping stone**: it holds
recon findings and build specs produced before a real project repo exists.
Nothing here has been executed against the live store except one deliberate
write test (see `01-store-facts.md`).

## Read order

| Doc | Purpose |
|---|---|
| `01-store-facts.md` | Verified baseline. Read this first. Includes claims that were **disproven**. |
| `02-target-model.md` | Target architecture + migration ordering and safety. |
| `03-variant-normalization.md` | Workstream: fix the option/variant model. |
| `04-collections-taxonomy.md` | Workstream: rebuild the discovery layer. |
| `05-seo-program.md` | Workstream: SEO recon + drafting pipeline. |
| `06-personalization.md` | Workstream: capture customer personalization. **Revenue-blocking.** |

## Data files

| File | Contents |
|---|---|
| `data/catalog.json` | All 243 products. Full metadata, `descriptionHtml` length + SHA-256 (HTML itself excluded). |
| `data/clusters.json` | 26 duplicate/near-duplicate clusters. **Advisory only** — see the warning below. |
| `data/keyword-assets.json` | Etsy-era keyword map mined from archived listings, plus the variant/collection defect lists. |

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
