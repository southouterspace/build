# 06 — Personalization Capture

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

Considerations:
- Add a per-product prompt (the descriptions already contain the wording).
- Use `properties[_Foo]` (leading underscore) for anything that should be
  hidden from the customer-facing cart.
- Blank-value behaviour: an empty property is dropped by Shopify. If
  personalization is mandatory, enforce it client-side.
- Verify it survives the theme's AJAX cart if one is in use.

**This unblocks revenue and can ship in an afternoon. Do it regardless of what
is decided about rungs 2 and 3.**

### Rung 2 — an existing options app

Infinite Options, Globo, Zepto and similar (~$10-20/mo) add conditional fields,
per-field character limits, required-field validation, and upcharges without
code. Reasonable if the owner wants to configure fields without a developer.

### Rung 3 — build it

Justified **only** for something the apps do not do. The candidate that
genuinely differentiates against PersonalizationMall and Amazon:

> **Live preview** — render the customer's actual text, in the chosen font, on
> the chosen background colour, on a frame mockup, before they add to cart.

That is a real competitive advantage for a made-to-order shop and the only
reason to justify custom build cost.

Architecture: a **Shopify theme app extension** (an app block the merchant
drops into the product page template), not a theme hack. This survives theme
updates and is the supported modern path.

The preview component would need:
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
