# 05 — SEO Program

**Status:** spec + verified capability, not executed.
**Sequencing:** run this **last** (see `02-target-model.md`). Driving traffic to
a store that cannot capture a custom order wastes the spend.

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
2. **The archive** (`data/keyword-assets.json`). 208 distinct tags across 129
   archived listings, plus 28 phrases with proven Etsy-era usage and zero live
   presence. Free, already mined, demand-validated.
3. **Google Search Console.** Free, real impressions and queries for
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
- Every description must carry at least one **concrete** trust/logistics signal
  drawn from the product's real description — handmade, ships from Texas, glass
  included, 4x6 photo, easel + wall mount. Do not invent shipping times,
  guarantees, or review counts that have not been confirmed by the owner.
- One primary phrase per product. **No two live products may target the same
  primary phrase** — that is the cannibalisation the Etsy model caused.
- Write for a human. No keyword lists in the description field.
- Collections get the same treatment and take the **broader head phrases**;
  products take the specific long-tail. This is the split that makes the
  collection layer do the work the Etsy listing flood used to do.

## Prerequisites

- [ ] `06-personalization.md` resolved — store can take a custom order
- [ ] `04-collections-taxonomy.md` done — pages exist to point head terms at
- [ ] Godparent decision made — don't optimise a 3-product category
- [ ] Google Search Console connected
- [ ] Etsy stats exported if obtainable

## Acceptance criteria

- [ ] Every live product has `seo.title` and `seo.description` within limits.
- [ ] Every collection has both fields populated.
- [ ] No duplicate primary phrase across live products.
- [ ] Every claim in every description traceable to the product's real copy or
      an owner-confirmed fact.
- [ ] Before-state captured so the whole program can be reverted to `null`.
