# Citable — "Can ChatGPT see your website?"

Live: https://citable.southouterspace.workers.dev

A Cloudflare Worker that checks whether AI search engines (ChatGPT search, Perplexity,
Claude, Google AI Overviews, Copilot) can reach, read and cite a site — and sells
monitoring plus an agency lead-capture widget on top.

## Why this exists (the need)

Through 2026 r/SEO, r/TechSEO, r/aeo and r/DigitalMarketing are full of the same story:
a site is missing from AI answers because it silently blocks the crawlers behind them —
most often one Cloudflare "block AI bots" setting, a security plugin, a robots.txt
"block AI" template that also blocks `OAI-SearchBot`/`PerplexityBot`, or a JavaScript-only
page the crawlers can't read. Free one-off robots.txt checkers are everywhere; what is
thin is (a) the live firewall test, (b) the JS-rendering test, (c) ongoing monitoring,
and (d) a white-label lead magnet for the agencies now selling "AI visibility" (GEO)
services — the SEOptimer embeddable-audit model applied to AI crawlers.

## Product

| Plan | Price | What |
|---|---|---|
| Free | $0 | Unlimited checks (20/hr/IP), shareable report `/r/:id` |
| Pro | $19/mo | Daily monitoring of 5 sites, change alerts to Slack/Discord/any webhook |
| Agency | $49/mo | Embeddable lead-capture checker, branded reports + CTA, lead webhooks, CSV, 25 sites |

## What a check does (`src/checker.js`)

1. robots.txt parsed per RFC 9309 for 18 crawlers (search / on-request / training).
2. Live probe: page fetched as a browser and as 8 AI crawler user-agents; 403/429/503,
   challenge pages (`cf-mitigated`, "Just a moment…", DataDome, PerimeterX, Vercel
   checkpoint…) or content collapse ⇒ firewall block. Inconclusive when the browser is
   also challenged. Googlebot/Bingbot are never spoofed.
3. noindex (meta + `X-Robots-Tag`), JavaScript-only rendering (raw-HTML word count),
   entity JSON-LD, llms.txt.
4. Platform detection (Cloudflare/Vercel/WordPress/…) ⇒ exact fix steps; corrected
   robots.txt snippet that preserves existing `*` disallows.

## Layout

```
src/index.js     router, API, D1, Stripe activation/webhook, hourly cron monitoring
src/checker.js   check engine (pure, no deps)
src/pages.js     landing, report, methodology, dashboard, activate (server-rendered)
src/embed.js     agency widget served at /embed.js (shadow DOM)
src/stripe.js    Checkout Session + webhook signature verification (no SDK)
schema.sql       D1 schema
build/worker.js  bundled deploy artifact (npm run build)
test/            node --test unit tests for the robots.txt parser + URL safety
```

## Turning on payments (one step left)

Until `STRIPE_SECRET_KEY` is set, "Start Pro/Agency" collects a founding-member
waitlist (table `waitlist`). To charge:

```bash
npx wrangler secret put STRIPE_SECRET_KEY        # sk_live_… (or rk_live_ with Checkout Sessions write)
npx wrangler secret put STRIPE_WEBHOOK_SECRET    # from a webhook endpoint pointing at
                                                 # https://citable.southouterspace.workers.dev/api/stripe/webhook
                                                 # events: customer.subscription.updated, customer.subscription.deleted
npx wrangler secret put ADMIN_TOKEN              # lets you comp accounts: POST /api/admin/accounts
npx wrangler secret put ALERT_WEBHOOK            # optional: Slack/Discord URL pinged on signups/waitlist
```

No Stripe products need creating — Checkout uses inline `price_data`.

Comp a beta agency account:
`curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"plan":"agency","email":"a@b.co"}' https://citable.southouterspace.workers.dev/api/admin/accounts`

## Develop

`npm test` · `npm run build` · `npx wrangler deploy`
