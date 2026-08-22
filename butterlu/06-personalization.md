# 06 — Personalization Capture

> ## Field spec is now measured, not assumed — 2026-08-22
>
> `11` derives the requirements from **5,278 real personalization payloads**.
> Four are hard constraints, and one of them corrected a defect in this
> project's own snippet:
>
> | Requirement | Evidence |
> |---|---|
> | **Multi-line input mandatory** | 48.0% of payloads contain newlines |
> | **Limit ≥255, use 300** | max 292, p99 243; a 100-char cap truncates **12.5%** of orders |
> | **Full UTF-8 incl. emoji** | 33.3% non-ASCII, 18.5% contain emoji |
> | **Free text, not a name field** | Buyers embed layout and production instructions |
>
> Real payload: `I Love My Nana! (At the top) 💜 Saoirse (at the bottom)
> please make the frame wide.`
>
> **`snippets/butterlu-personalization.liquid` defaulted to 100 characters and
> has been corrected to 300.** It was already a `<textarea>`, so the newline
> requirement was met — by luck, not by evidence.
>
> Also from `11`: **84.5% of all order line items carry a personalization
> payload.** This is not an edge case, it is the main path. And `10` found
> **one** wrong-personalization complaint in twelve years — the manual process
> is accurate, and any system built here must not regress that.

**Status:** REVENUE-BLOCKING. Confirmed by the store owner that the Shopify
site has no customization functionality. **This outranks every other workstream.**

## The problem

Butterlu sells made-to-order personalized frames. The customer must supply a
name, date, or custom quote. On Etsy this was the personalization box at
checkout.

On Shopify, **nothing captures it.** Every product option across all 243
products is one of:

```
Color · Bow Color · Background Color · Flowers · Heart Color
Burlap Color · Bow · one sided print · Title (placeholder)
```

None collects customer text. Meanwhile the product descriptions still instruct
customers to *"enter your pet's name or custom message in the personalization
box at checkout"* — an instruction referring to a field that exists on Etsy and
not here.

**Consequence:** orders arrive with no idea what to print, or customers bounce
because they cannot see how to personalise. On a live storefront on the Basic
plan. This is not a technical debt item, it is a broken funnel.

## Solution ladder — climb only as far as needed

### Rung 1 — line item properties (ship first, free, native)

A text input inside the product form:

```liquid
<input type="text" name="properties[Personalization]" form="{{ product_form_id }}">
```

Shopify carries the value through to the cart, the order, the admin, and the
packing slip automatically. No app, no subscription, no data model change.
This is how most made-to-order shops do it.

**A working implementation is in `snippets/butterlu-personalization.liquid`.**
It renders the field, enforces a character limit, supports per-product prompts
and limits via metafields, and blocks add-to-cart when a required field is
empty — including on themes that submit the cart via fetch, where the native
`required` attribute never fires. Install instructions are in the file header.

**It has not been tested against the live Butterlu theme.** Validate on a
duplicated, unpublished theme before publishing.

Considerations:
- Add a per-product prompt (the descriptions already contain the wording).
- Use `properties[_Foo]` (leading underscore) for anything that should be
  hidden from the customer-facing cart.
- Blank-value behaviour: **Shopify silently drops an empty property.** If
  personalization is mandatory this must be enforced client-side, or orders
  arrive blank with no error. The snippet does this.
- Verify it survives the theme's AJAX cart if one is in use.

**This unblocks revenue and can ship in an afternoon. Do it regardless of what
is decided about rungs 2 and 3.**

### Rung 2 — an existing options app

Infinite Options, Globo, Zepto and similar (~$10-20/mo) add conditional fields,
per-field character limits, required-field validation, and upcharges without
code. Reasonable if the owner wants to configure fields without a developer.

### Rung 3 — build it

> **CORRECTED 2026-08-22.** An earlier version of this doc claimed live preview
> was a gap in the market and "the only reason to justify custom build cost."
> **That was wrong.** Live preview is the category standard — Zepto, Globo,
> Customily, LPO and Webyze all lead their App Store listings with it, and 23
> of 27 apps in the category have a free tier. See `07-app-productization.md`
> for the data.

> **AMENDED 2026-08-22.** An earlier revision said "buying beats building"
> and pointed at free tiers. Pricing research disproved that for the feature
> that matters: **Globo gates live preview behind its $19.90/mo Advanced
> plan**, and **Zepto has no free plan at all** and meters custom orders per
> month (100/mo at $9.99), which for a 100%-personalized store meters core
> sales volume. See `data/app-pricing.json`.

For Butterlu, buying beats building **for plain text capture only** — Globo's
free tier covers that with unlimited products and orders. **Live preview is
paywalled at $19.90/mo**, so there is a real, recurring cost to buying the
feature Butterlu actually wants.

Custom build is justified only by a *product* thesis — selling the result — and
`07-app-productization.md` argues the general-purpose options category is the
wrong place to enter. Read that before committing engineering time.

If something is built anyway, the shape is a **Shopify theme app extension**
(an app block the merchant drops into the product page template), not a theme
hack — it survives theme updates and is the supported path. It would need:

- the canonical colour palette (blocked on `03-variant-normalization.md` —
  today the palette is defined six different ways and its values are bare
  numbers `1`..`41` with no colour mapping)
- a text renderer honouring per-design character limits
- output written back into a line item property so fulfilment sees it

**Dependency:** rung 3 is not buildable until the palette is canonical and its
values map to actual colours. Rung 1 has no such dependency.

## Note on this repo

`/home/user/build` currently contains a React 19 + Vite + TanStack Router
project with `@react-three/fiber`, `three`, a `color-picker` component, and
`react-dropzone` — roughly the toolkit a live-preview customizer would need.
It also contains an unrelated charts playground and a spinning-cube route, and
a `fettle/` Cloudflare Worker. Treat it as **scaffolding and dependency
precedent, not an existing implementation.** A Shopify app extension is a
different deployment target from this Vite SPA.

## Immediate verification checklist

Someone should do this on www.butterlu.com today:

- [ ] Open any live product page. Is there any field to enter a name or quote?
- [ ] Add to cart. Does the cart show personalization?
- [ ] Check whether the theme is a stock Shopify theme or customised.
- [ ] Confirm with the owner how the (zero) orders were expected to arrive.

## Acceptance criteria

- [ ] Every personalizable live product exposes a personalization input.
- [ ] The value reaches the order and prints on the packing slip.
- [ ] Product descriptions no longer reference an Etsy checkout box that does
      not exist on this store.
- [ ] Required-vs-optional behaviour is explicit and enforced.
