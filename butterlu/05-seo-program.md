# 05 — SEO Program

**Status:** spec + verified capability, not executed.
**Sequencing:** run this **last** (see `02-target-model.md`). Driving traffic to
a store that cannot capture a custom order wastes the spend.

> ## Retargeted 2026-08-22 — optimise 55 designs, not 618 listings
>
> `11` (order actuals) changes what this program should target:
>
> - **55 listings produce 71% of revenue; 315 produce nothing.** SEO effort
>   follows revenue, not listing count. Draft for the designs behind those 55.
> - **Baby/pregnancy is 42.5% of 2026 revenue, up 300%.** It is the first
>   niche in the pilot, not one of twelve.
> - **Cut wedding entirely.** $865 of 2026 revenue, −45% YoY, from 94 live
>   listings. Do not spend a keyword on it.
> - **Godparent and baptism are declining** (−33%, −51%). Reduce ambition; they
>   were the historic flagship and are no longer the business.
> - **Use "most orders ship within 2 days"** — measured median is 2 days, 84.7%
>   within 3 (`11`). The shop currently advertises a slower figure than it
>   achieves.
>
> Revised pilot order: **baby/pregnancy → grandparent → memorial/pet.**

## Baseline

- `seo.title`: **0 of 243** populated
- `seo.description`: **0 of 243** populated at snapshot (1 written as a test)
- Bulk writes are **proven to work** — `productUpdate` succeeded and persisted
  (`01-store-facts.md`)

With both fields blank, Google synthesises a snippet from page content. For
keyword-stuffed Etsy-import titles, the result is poor.

## Capability check (verified, not assumed)

Firecrawl web search was tested from this environment and works. A live query
for `personalized godmother picture frame baptism gift` returned a SERP whose
#1 result is a small specialist vendor, not a marketplace giant — **these
niches are winnable.**

Worth copying: the top result's meta description reads
*"...engraved in Indiana with godchild's name and baptism date. Ships in 1-2
days. 60-day guarantee."* Trust, provenance, and logistics signals — **not**
keyword stuffing. That is the template to beat.

### What agent recon CAN produce

- Who ranks for a given niche phrase, and their page structure
- Competitor title and meta-description patterns
- How competitors use collection pages vs product pages
- Drafted `seo.title` / `seo.description` grounded in the above

### What it CANNOT produce — do not fabricate these

- **Search volume.** Firecrawl returns ranked results, not volume. Volume and
  difficulty for *Google* require Ahrefs / Semrush / Google Keyword Planner.

  > **CORRECTED 2026-08-22.** An earlier revision said search volume was
  > unavailable full stop. **For Etsy specifically that is wrong.** Etsy ships
  > **Marketplace Insights** (Shop Manager → Stats → Marketplace Insights),
  > which exposes real Etsy search data — searches and listing counts over the
  > last 30 days for a given keyword. **15 free keyword searches per week**
  > (unlimited on Etsy Plus), results retained 7 days. That is genuine
  > first-party volume data for the marketplace this catalog actually sells on.
  > The weekly cap means keywords must be chosen deliberately, not sprayed.
- **Reliable rank positions.** SERP scrapes are un-personalized approximations,
  not rank tracking.
- **What butterlu.com currently ranks for.** That is Google Search Console only.

Any agent output claiming keyword volume from scraped SERPs is invented and
must be rejected.

## Better data sources — use these first

1. **Etsy shop stats.** First-party, converting search terms from the
   marketplace where this catalog actually sold. Beats any scrape. Highest
   priority to obtain.
2. **The real Etsy tag corpus** (`data/etsy/etsy-analysis.json`) — **use this,
   not `keyword-assets.json`.** 7,965 tag assignments across 618 *live* listings,
   2,454 distinct, 12.9 per listing. First-party and current. Top tags:
   `personalized_frame` 147 · `personalized_gift` 95 · `picture_frame` 87 ·
   `grandma_gift` 80 · `baby_keepsake` 73 · `grandparent_gift` 71 ·
   `baby_photo_frame` 68 · `baby_announcement` 64 · `baptism_gift` 59 ·
   `pregnancy_reveal` 55.
   **Weight these by revenue from `11` before using them** — tag frequency
   reflects how listings were built, not what sold. Baptism tags rank high and
   baptism revenue fell 51%.
3. **The archive** (`data/keyword-assets.json`) — superseded as a primary
   source, still useful for *abandoned* intents that no live listing targets.
4. **Google Search Console.** Free, real impressions and queries for
   butterlu.com. **Connect immediately if not already** — GSC only collects from
   the moment of verification, so every day unconnected is data permanently lost.

## Pipeline

```
1. Cluster the 96 live designs into ~12 niches (recipient x occasion)
2. Per niche: one recon subagent
     -> SERP landscape, competitor title/meta patterns, phrase set
     -> structured JSON, no prose dumps
3. Per product: draft seo.title (<=60 chars) and seo.description (<=155 chars)
     -> grounded in niche recon + that product's own description
     -> never invented claims (see constraints below)
4. HUMAN REVIEW GATE — spreadsheet, approve/reject/edit per row
5. Bulk write approved rows via productUpdate
6. Re-read to confirm persistence
```

Run a **2-3 niche pilot first** and judge output quality before committing to
all 96.

## Drafting constraints

- `seo.title` <= 60 chars; `seo.description` <= 155 chars (truncation limits)
- Every description must carry at least one **concrete** trust/logistics signal.
  These are now **verified against data** and may be used as written:

  | Claim | Evidence |
  |---|---|
  | "Most orders ship within 2 days" | Median 2 days, 84.7% ≤3 days, n=6,217 (`11`) |
  | "4.9 stars from 12,000+ reviews" | 4.918 across 12,788 reviews (`10`) |
  | "Handmade by a family shop since 2015" | Owner bio (`shop-profile.sanitized.json`) |
  | "Featured on The Knot – Best of Weddings" | Shop announcement — **true, but wedding-only; do not use on baby or grandparent pages** |
  | "Made from recycled wood fibre MDF" | Shop announcement |

  Anything **not** in this table or the product's own copy must be confirmed by
  the owner. Do not invent shipping times, guarantees, or review counts.
- One primary phrase per product. **No two live products may target the same
  primary phrase** — that is the cannibalisation the Etsy model caused.
- Write for a human. No keyword lists in the description field.
- Collections get the same treatment and take the **broader head phrases**;
  products take the specific long-tail. This is the split that makes the
  collection layer do the work the Etsy listing flood used to do.

## Prerequisites

- [ ] `06-personalization.md` resolved — store can take a custom order
- [ ] `04-collections-taxonomy.md` done — pages exist to point head terms at
- [ ] Godparent range sized (`04`) — declining, −33% YoY, don't over-invest
- [ ] Wedding formally dropped from scope (`11`)
- [ ] Google Search Console connected
- [ ] Etsy stats exported if obtainable

## Acceptance criteria

- [ ] Every live product has `seo.title` and `seo.description` within limits.
- [ ] Every collection has both fields populated.
- [ ] No duplicate primary phrase across live products.
- [ ] Every claim in every description traceable to the product's real copy or
      an owner-confirmed fact.
- [ ] Before-state captured so the whole program can be reverted to `null`.
