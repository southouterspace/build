# Butterlu

Operational tooling and analysis for **Butterlu Gifts** — a personalised picture-frame and
keepsake-gift business running on Shopify (`www.butterlu.com`) and Etsy (`shop/ButterLu`).

This directory is self-contained and designed to be lifted wholesale into the Butterlu
monorepo. Nothing here imports from the surrounding repository.

## Start here

**`CLAUDE.md`** — the operating guide. Read it before doing anything. It carries the
verified ground truth, the hard constraints, gate status and conventions, so a fresh
session does not need the conversation that produced this work.

## Layout

```
butterlu/
├── CLAUDE.md              # agent operating guide — read first
├── docs/
│   ├── 01-diagnostic-findings.md      # 14 findings, severity × effort
│   ├── 02-pdp-audit.md                # product page content audit
│   ├── 03-competitor-serp.md          # who outranks us and why
│   ├── 04-review-pipeline-design.md   # Etsy → Shopify migration + sync
│   ├── 05-execution-plan.md           # dependency graph + 8 resumable loops
│   └── 06-etsy-tos-constraints.md     # what the Etsy API Terms permit
├── plans/                 # manifests — the loops read and checkpoint here
├── prompts/
│   └── wave-0-kickoff.md  # the next thing to run
└── .env.example           # required environment variables (no secrets)
```

## Intended monorepo shape

This directory is the `ops` / analysis half. The planned siblings:

- **`theme/`** — the Shopify theme. Note the connector cannot write to a *published*
  theme; work on a duplicate and publish by hand.
- **`extension/`** — Chrome extension.
- **`workers/`** — Cloudflare Workers. The review sync Worker is designed in `docs/04`.
  The Cloudflare account in use hosts `fourfold*` and `rps-worker`; name new workers
  distinctly (`butterlu-reviews`).

## State of play

The store has **0 orders, all time**, because checkout is disabled at the plan level. The
Etsy shop it was copied from has 13,635 reviews and 75,903 sales. Most of the work here is
about closing that gap — and the first step is read-only reconnaissance
(`prompts/wave-0-kickoff.md`).
