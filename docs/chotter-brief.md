# Chotter — Payments + Review Capture for Home Service Businesses

Working product & architecture brief. Status: brainstorm, not committed scope.

---

## 0. The premise, restated

A home service business (plumber, HVAC, electrician, pest, lawn, cleaning) finishes a job,
creates an invoice on a phone or in the office, and sends a link by SMS or email. The customer
opens it, is asked for a Google review, and pays. The business gets money faster and gets more
reviews without doing anything extra.

That premise is sound. The wedge is real: **the payment moment is the highest-intent moment a
home service business ever has with a customer, and almost nobody monetizes it for reputation.**
Podium charges ~$400/mo for a version of this bolted onto a chat widget. Housecall Pro and Jobber
bury it inside a full field-service suite you have to migrate onto. There is room for a cheap,
fast, standalone "payment link that gets you reviews."

Everything below is what has to be decided to make it real.

---

## 1. The one thing in the concept that must change

**You cannot condition the payment flow on review sentiment, and you should not ask for a star
rating before routing to Google.**

The pattern this concept naturally drifts toward — "How did we do? ⭐⭐⭐⭐⭐ → Google, ⭐–⭐⭐⭐ →
private feedback form" — is called **review gating**, and it is the single fastest way to get a
tenant's Google Business Profile penalized and to put both of you in front of a regulator.

- **Google's review policies prohibit it outright.** Their guidance to businesses is explicit:
  don't discourage or prohibit negative reviews, and don't selectively solicit positive ones.
  Enforcement ranges from filtering the affected reviews to disabling reviews on the profile.
- **The FTC's Rule on Consumer Reviews and Testimonials (16 CFR Part 465), effective October
  2024,** targets review suppression and deceptive review practices, with civil penalties per
  violation. The FTC has already brought suppression cases (Fashion Nova, $4.2M, 2022). A
  platform that ships gating as a feature is a far more attractive target than any one plumber.
- **Incentivized reviews are separately prohibited by Google.** This constrains the referral
  program in §16 — rewards must attach to *referred customers*, never to *reviews left*.

I want to be precise about what's a policy violation versus a legal question: the Google policy
part is unambiguous and is enough on its own to kill the feature. The FTC exposure is real but
worth confirming with counsel before you write marketing copy about it either way.

### What you build instead

**One unconditional ask, shown to everyone, with a single destination.** No star picker as a
router. If you want private feedback, it sits *beside* the review CTA as a peer option, visible
to everyone — never as the branch a low rating falls into.

The good news: this is not a downgrade. A star picker adds a tap and a decision. A single
"Leave Ray a review" button with Ray's face above it converts better than a two-step router. The
compliant design is also the faster one.

The one legitimate filter is **before the ask, not inside it**: don't send the review request at
all if the office has flagged the job as a complaint, callback, or warranty return. That's
suppression-adjacent, so keep it narrow and manual — a human marks the job, and the mark is
auditable. Never automate "predict unhappiness, skip the ask."

---

## 2. Pre-payment vs post-payment — the actual answer

The argument for pre-payment is right about intent and wrong about mechanics.

**The mechanic that breaks it:** tapping a Google review link on a phone doesn't open a modal. It
hands off to the Google Maps app or a new Safari/Chrome tab. Your payment page is now
backgrounded. Most people come back. Some don't — and the ones who don't are people who owed you
money and now have to be dunned. On a $340 drain cleaning that's an annoyance. On an $11,000 HVAC
replacement it's a cash-flow event.

**The mechanic that breaks post-payment:** the confirmation screen is a moment of relief and
closure, and a meaningful share of people close the tab the instant they see "Paid."

### Recommendation: prime → pay → ask

Three beats on what feels like one flow:

1. **Prime (pre-payment, non-blocking, no outbound link).** The tech's photo and one line sit
   *above* the payment form on the same screen. Not a separate step, not an interstitial, no
   button that leaves the page. Copy: *"Ray finished your job today. After you pay, he'd really
   appreciate a quick review."* This costs zero abandonment because there is nothing to click,
   and it does the real work of a pre-ask — it sets the expectation while attention is highest.
2. **Pay.** Payment Element, Apple Pay / Google Pay at the top, no account creation, no
   redirect if avoidable.
3. **Ask (post-payment confirmation).** Same face, now larger. One primary button to Google,
   opening in a new tab. Receipt and "text me a copy" sit below it, deliberately secondary.

This gets pre-payment attention capture without pre-payment exit risk, and it puts the
outbound link at the only point where leaving the page costs nothing.

### Still make it configurable — and then settle it with data

Tenants will have opinions and some verticals will genuinely differ. Ship three modes:

| Mode | Behavior | Fits |
|---|---|---|
| `prime_then_ask` *(default)* | Priming card above payment, full ask after | Everyone, until proven otherwise |
| `ask_first_soft` | Full review screen before payment with a persistent "Continue to payment" | High-trust recurring work, low ticket |
| `ask_after_only` | Nothing pre-payment | Large tickets, financed jobs, disputes-sensitive trades |

`ask_first_soft` must never block. "Skip" is always visible, never greyed, never delayed.

Then build the thing that makes this defensible: **per-tenant mode experimentation.** Chotter
randomizes mode per invoice, tracks review conversion and payment conversion separately, and
after enough volume tells the tenant *"Mode B gets you 31% more reviews and costs you nothing in
payment rate — want to switch?"* Nobody else in this category can say that, and it turns a
config screen into a reason to stay.

---

## 3. Recipient flow, screen by screen

The recipient is on a phone, one-handed, possibly standing in their driveway. Design for that.

**Screen 1 — the pay page** (`pay.chotter.com/{token}`)

- Above the fold, in order: business logo + name, amount due in the largest type on the page,
  one-line job summary ("Water heater replacement — 1420 Cedar Ln"), the priming card
  (tech photo, name, one sentence), then the Payment Element with Apple/Google Pay first.
- Line item detail is collapsed behind "View details." Nobody reads it before deciding to pay,
  and expanding it is a cheap trust signal for the people who do.
- Tip row (opt-in per tenant), presented as preset chips, not a slider, with a real "No tip"
  option that isn't styled as a penalty.
- Payment plan / financing offer inline if enabled and the amount qualifies.
- Zero login. Zero account creation. No email field unless it's missing from the record.

**Screen 2 — confirmation + ask**

- "Paid — thank you" resolves instantly and unambiguously. Amount, last four, date, receipt link.
- Then the ask: photo, name, one warm sentence, one big button ("Leave Ray a Google review").
- Below it, quiet: "Something wasn't right? Tell us privately" (goes to the tenant, not public)
  and "Text me my receipt."
- If a referral program is on, the "give $25 / get $25" card appears *after* the review ask,
  not competing with it.

**Screen 3 — return state**

If they come back (browser back, or reopening the link), don't re-run the flow. Show the receipt,
and if no review has been attributed yet, keep the ask present but calmer.

**The device detail that matters more than any of this:** the review only happens if the customer
is on *their own* phone, signed into *their own* Google account. This is the argument against
"tech collects payment on the tech's phone" and for "customer scans a QR from the tech's screen
and pays on their own device." Same money, and the review ask lands somewhere it can actually
convert. Make the QR handoff a first-class field flow, not an afterthought.

---

## 4. Review attribution, and the trap of review velocity

**You cannot observe whether a specific person left a review.** Google gives you no per-link
attribution. Plan the whole feature around that.

**What you can do:**

- **Deep link:** `https://search.google.com/local/writereview?placeid={PLACE_ID}`. Track the
  click as the primary funnel metric — it's the one thing you own end to end.
- **Google Business Profile OAuth:** the tenant connects their GBP account. You poll for new
  reviews and attribute probabilistically — new review appears within N hours of a click, and
  the reviewer's display name fuzzy-matches the customer record. Good enough to stop follow-ups
  and to report on. Never good enough to gate a reward on.
- **Access friction to plan for:** listing reviews still runs through the legacy My Business API
  v4 endpoint, and Google requires an approved API access request before you get quota. Start
  that application early — it is not instant, and the whole attribution story depends on it.
  Build the product to degrade gracefully to click-tracking-only if approval is slow.
- **Place ID discovery:** primary path is GBP OAuth (exact, gives you multi-location mapping for
  free). Fallback is a Places API search-by-name-and-address picker with a map confirmation.
- **Multi-location:** route to the location's Place ID that matches the job address or the
  assigned branch, not a tenant-level default. Franchises will be an early segment and they'll
  find this bug for you immediately.

**The non-obvious one — pace the asks.** A business averaging two reviews a month that suddenly
posts forty in a week gets those reviews filtered, and sometimes gets the profile flagged. This
is the most likely way Chotter quietly destroys value for a happy customer.

Build a **velocity governor** per location: cap daily and weekly asks, ramp the cap up over the
first 60 days from a baseline derived from their existing review count and age, spread sends
across business hours, and hold back overflow into a queue rather than dropping it. Surface it
honestly in the UI — *"We're spacing these out so Google doesn't filter them"* is a trust-building
message, not an apology.

**Suppression rules (all sentiment-neutral):** don't ask the same person twice within 90 days;
don't ask if attribution already matched them to a review; don't ask if the office flagged the
job; respect a per-contact opt-out.

**Destinations beyond Google.** Facebook, BBB, Angi, and Nextdoor are fine as tenant-selectable
targets. **Yelp must not be offered** — Yelp's guidelines prohibit soliciting reviews at all, and
they actively penalize businesses that do. If a tenant asks, the answer is a documented no.

---

## 5. Messaging: the 10DLC problem, and a better free tier

This is where the plan as sketched has the most operational risk.

**The proposed shared platform number will get filtered.** One number sending invoice links on
behalf of hundreds of unrelated businesses is a textbook pattern for carrier spam classifiers —
varied brand names, varied URLs, transactional-but-unrecognized sender. "Sent via Chotter" in the
body helps disclose the sender but does not fix the classification problem. Under 10DLC, campaigns
map to brands; a shared number means one brand's trust score gates everyone, and a single abusive
tenant degrades deliverability platform-wide.

### Recommended three-tier ladder

**Tier 0 — Native share sheet (free, ship first).** Chotter generates the link; the tech's phone
sends it via its own Messages app through the OS share sheet. Zero 10DLC exposure, zero carrier
cost, zero deliverability risk — and it *converts better*, because the text arrives from the
number of the person the customer just met and let into their house. Most home service texting
already works this way. Lean into it as a feature, not a limitation.

Trade-off to be honest about: you lose delivery receipts and inbound replies land on the tech's
personal phone. Track link-open instead of delivery, and make Tier 1 the upgrade for offices that
need the audit trail.

**Tier 1 — Shared Chotter number (registered, throttled, gated).** Chotter as the TCR brand, one
properly vetted campaign, "Sent via Chotter" in every body. Gate it: require a verified Stripe
account and a completed profile before enabling, cap volume per tenant, and monitor opt-out rate
per tenant with automatic suspension above a threshold. Treat this as a liability you're managing,
not a feature you're proud of.

**Tier 2 — Dedicated brand-registered number (paid).** Chotter registers as an ISV/reseller with
TCR; each tenant gets their own brand, campaign, and number. Full throughput, their identity, no
platform branding. The registration and monthly campaign fees are real per-tenant costs — model
them into the tier price rather than absorbing them.

**Tier 2+ — Text-enable their existing business line.** Telnyx supports hosted messaging on an
existing landline. For a 30-year-old plumbing company whose number is on every truck, van magnet,
and refrigerator magnet in the county, this is the single most compelling thing you can offer
them. It's also sticky in a way nothing else on this list is.

### Compliance mechanics that are not optional

- **Consent capture with provenance.** Every phone number needs a recorded consent event:
  timestamp, IP or device, the exact disclosure text shown, and the source (web form, field
  capture, import). Imports are the dangerous path — require an attestation and store it.
- **Transactional vs marketing.** The invoice link is transactional. A standalone review
  follow-up two days later is much closer to marketing. Separate the consent scopes and let
  contacts opt out of follow-ups while still receiving invoices.
- **STOP / HELP / START** handled at the platform layer, honored across all tenants for a given
  number, and reflected in the CRM immediately.
- **Quiet hours in the recipient's timezone** — derive from service address, not tenant timezone.
  8am–9pm federal floor, tighter where state mini-TCPA laws apply (Florida and Oklahoma are the
  usual traps).
- **Branded short links only.** Public shorteners (bit.ly, tinyurl) are widely blocked. Use a
  dedicated domain (`pay.chotter.com`, or a per-tenant vanity on Tier 2) and register the exact
  URL pattern in the campaign's sample messages.
- **Inbound replies need a home.** People reply to invoice texts — "can I pay Friday," "wrong
  address," "who is this." Route inbound SMS into a per-tenant thread in the CRM. This is not
  optional at Tier 1+; an unanswered reply is worse than no text.

**Email** goes through Resend (already the pattern in `fettle`). Per-tenant verified sending
domains on paid tiers, platform domain with visible "via Chotter" on free.

---

## 6. Payments architecture

### Stripe Connect shape

**Express accounts with direct charges and an application fee.** Reasoning:

- **Direct charges** put the connected account as merchant of record. The customer's card
  statement shows "BOB'S PLUMBING," not "CHOTTER" — which measurably reduces friendly-fraud
  chargebacks in a category where the customer already forgot the invoice. Chargeback liability
  and Stripe fees sit with the business, where an SMB actually expects them.
- **Express onboarding** is Stripe-hosted, handles KYC/KYB, and gets a plumber through
  underwriting without you touching identity documents.
- **`application_fee_amount`** is your take-rate lever, itemized and visible, which is the honest
  posture (see §7).

The cost: Chotter's dashboards must aggregate across connected accounts rather than reading one
balance, and platform-level reporting is more work. Worth it.

**Deferred onboarding matters.** Let a tenant create invoices and build their service library
before finishing Stripe onboarding — just block *sending*. Forcing KYB in the first five minutes
is the highest-drop-off thing you could possibly do.

### Payment methods, in priority order

1. **Apple Pay / Google Pay** — the whole "best in class" claim lives here. One tap, no typing,
   no card retrieval. Should be the top element of the payment sheet on every eligible device.
2. **Card** — table stakes. Link for returning customers.
3. **ACH Direct Debit with Financial Connections** — this is a strategic feature, not a checkbox.
   Home services routinely invoices $2,000–$15,000. At Stripe's US pricing (0.8% capped at $5 vs
   2.9% + 30¢), an $8,000 HVAC job costs $5 instead of $232. **For invoices above a
   tenant-configured threshold, make ACH the default and card the secondary option.** "Stop
   paying three percent on your big jobs" is a better ad than anything about reviews.
4. **BNPL / financing (Affirm, Klarna)** — arguably the highest-leverage feature on this list.
   A homeowner facing a surprise $9,000 system replacement is deciding between "yes" and
   "not this year." Financing converts jobs that otherwise don't happen, which the business
   values far above anything reputational. It also raises average ticket.
5. **Cash App Pay** — cheap to add, meaningful in some regional markets.

### Invoice mechanics home services actually needs

- **Deposits and progress payments.** Deposit at scheduling, balance at completion, sometimes a
  mid-job draw. Model an invoice as having one or more **payment requests**, each with its own
  link, amount, and status. Don't model it as a single amount with a paid flag — you'll rebuild
  it in month three.
- **Change orders.** The scope changed in the crawlspace. Amend an invoice with an audit trail
  and a customer-visible diff, and re-issue rather than silently editing.
- **Tips.** Real money in residential trades and a genuine morale lever if attributed to the
  tech. Needs a policy field (tech keeps / pooled / business) and reporting.
- **Card on file + recurring plans.** Maintenance memberships (biannual HVAC tune-ups, quarterly
  pest, monthly lawn) are the most valuable thing a home service business owns, and they're
  usually managed on paper. Stripe Subscriptions on the connected account. This is a Phase 3
  feature that could become the actual product.
- **Manual payment reconciliation.** Customers pay by check and cash constantly. Mark-as-paid
  with a method and reference must cancel dunning, cancel nothing about the review ask, and
  flow into the accounting export identically.
- **Refunds, partial refunds, voids** with a reason code that reaches the export.

### Surcharging — recommend deferring

Every home service owner will ask to pass card fees to the customer. It's a legal minefield:
Connecticut and Massachusetts prohibit credit card surcharges; New York requires the total price
be posted; card network rules cap the surcharge (Visa at 3%), require 30-day advance notice to
the networks, and **prohibit surcharging debit entirely** — which means you must reliably
distinguish debit at the point of decision.

**Recommendation:** don't ship surcharging in v1. Ship a **"convenience fee for card, no fee for
ACH"** differential instead, which is cleaner under network rules and pushes people toward the
payment method you want anyway. Revisit true surcharging with counsel and a state ruleset later.

### Disputes

Because the invoice already carries job photos, a signature, a timestamp, and the service address,
you can auto-assemble a Stripe dispute evidence packet that's better than what most SMBs submit
manually. Cheap to build, disproportionately loved, and a good reason to make photo capture a
default rather than an option.

---

## 7. Money model

Where revenue comes from, and the trap to avoid.

The instinct is a percentage take rate on payment volume. On a $12,000 roof, 0.5% is $60 — the
owner *will* notice, and will do the arithmetic on switching. Home services ticket sizes make
naive percentage rakes hostile.

**Recommended: flat SaaS + a small capped per-transaction fee, with Stripe pricing passed through
transparently.**

- Positioning: *"We don't mark up your processing. Your Stripe rate is your Stripe rate."*
  SMBs in this category have been burned by bundled processing markups inside field-service
  suites and are primed to respond to this.
- Application fee: something like 0.4% capped at $8, or a flat per-transaction fee. The cap is
  the important part.
- Tier the SaaS on the things that actually cost you money and correlate with value: dedicated
  number, custom domain, seat count, locations, follow-up automation, QBO sync.

**Free tier that's genuinely useful:** unlimited invoices, share-sheet delivery, post-payment
review ask, platform branding visible. Free tier costs you almost nothing (no messaging spend)
and every invoice sent carries your brand to a homeowner. That's the growth loop — protect it by
keeping messaging *out* of free rather than by crippling the payment flow.

---

## 8. Field UX

The tech is in a mechanical room, on a ladder, wearing gloves, in bright sun or no light, on one
bar of signal. Design constraints follow from that, not from the desktop dashboard.

- **Offline-first drafts.** Basements and crawlspaces have no signal. Invoice drafts persist
  locally and sync when connectivity returns. This is the difference between software techs
  tolerate and software techs abandon.
- **Service library:** name, description, default price, taxable flag, category, estimated
  duration, internal cost (for margin reporting), and optional good/better/best tiers. Tiered
  pricing is standard practice in HVAC and plumbing and its absence reads as amateur.
- **Line item types:** flat fee, hourly (rate × time with a minimum), quantity × unit price,
  material with markup, percentage or fixed discount.
- **Fast entry paths, ranked:** favorites and recents first, then search-as-you-type, then
  "copy from last job at this property," then browse the full library. Flat-fee freehand entry
  is always one tap away — it's the escape hatch that keeps the library from being a blocker.
- **Photos and signature** attached to the invoice. Dual purpose: customer trust on the pay page,
  dispute evidence later.
- **The QR handoff** (§3): tech shows a code, customer pays on their own phone. Make this the
  hero of the in-person flow.
- **What you cannot do on the web:** Tap to Pay on iPhone/Android requires Stripe's native
  Terminal SDK. A pure Cloudflare Workers + React app can't offer it without shipping a native
  wrapper. Worth knowing before someone promises it to a customer — and worth noting that the
  QR handoff is better for review capture anyway, so this is a deferral rather than a gap.
- **Touch targets, contrast, numeric keypads, minimal typing.** Assume gloves and glare.

---

## 9. CRM scope — draw the line hard

The temptation is to grow into field service management. Don't. ServiceTitan, Jobber, and
Housecall Pro own scheduling, dispatch, routing, and inventory, and competing there means
competing on migration cost. Chotter's job is **get paid, get reviewed**, and to be adoptable in
an afternoon *alongside* whatever they already run.

**The model insight: home services is property-centric, not contact-centric.** The durable entity
is the service address — that's where the equipment lives, the model and serial numbers, the
filter sizes, the gate code, the dog, the water shutoff location, the service history. A contact
can own several properties; a property can have several contacts (spouse, tenant, property
manager, adult child paying for a parent's repair). Getting this right early is nearly free;
retrofitting it is expensive.

**In scope:** contacts, properties, contact↔property relationships, job/invoice history per
property, communication timeline (SMS, email, link opens, payments), tags, notes, consent record
with provenance, lifetime value, review status, referral status.

**Out of scope for now:** scheduling, dispatch, routing, inventory, purchase orders, payroll,
estimates-as-a-workflow (a saved draft invoice is enough).

**Capture paths, which are the actual feature:**

- Public web form, tenant-branded, embeddable on their site.
- Field capture during an estimate visit — a fast form on the tech's phone, or better: a QR code
  the customer scans that opens the tenant's branded capture page on their own device, which
  gets you a verified number and a consent event in one motion.
- QR codes for yard signs, truck magnets, and invoice leave-behinds.
- CSV import, plus a QuickBooks customer import.

---

## 10. Accounting and the QuickBooks export

"QuickBooks friendly" hides the real requirement. Three deliverables, in ascending order of how
much a bookkeeper will love you:

**A. Transaction CSV.** Every payment with date, customer, invoice number, line items, gross,
Stripe fee, application fee, net, method, tax, and status. Shaped to QBO's Sales Receipt / Invoice
import column layout so it imports rather than needing to be re-keyed. Skip IIF — it's Desktop-only
legacy.

**B. Payout reconciliation report — this is the one that wins accountants.** Stripe deposits net,
in lumps. The bank feed shows one line: `$4,812.33`. The bookkeeper's actual job is explaining
that number. The report maps each payout to the invoices inside it, the gross, the fees, the
refunds, and the net, with a journal-entry-ready summary (debit Bank, debit Processing Fees,
credit Revenue, credit Sales Tax Payable). Nobody in the SMB payment link space does this well.
It is a small amount of work and a real reason an accountant recommends you.

**C. Direct QBO API sync (later).** OAuth, sync customers, invoices, payments, and deposits with
fees as expense lines. Phase 3. CSV first — it's 10% of the effort and covers most of the need.

**Sales tax: do not compute it automatically in v1.** Home service tax is genuinely hard — labor
vs. materials taxability varies by state, capital improvement vs. repair distinctions change the
answer, and it's destination-based on the service address. Let the tenant configure rates per
service item and per jurisdiction and own the answer, with a clear disclaimer. Consider Stripe Tax
later, but know that it doesn't resolve the labor/materials question for you.

---

## 11. Data model sketch

Core entities. Every tenant-scoped table carries `tenant_id`.

```
tenants                id, name, slug, plan, branding{logo,color}, timezone, created_at
tenant_locations       id, tenant_id, name, address, google_place_id, gbp_location_id, review_url
users                  id, email, name
memberships            id, tenant_id, user_id, role[owner|admin|office|tech], location_ids[]
technicians            id, tenant_id, user_id?, display_name, photo_url, review_blurb, active
                       -- user_id nullable: not every tech gets a login

contacts               id, tenant_id, first, last, email, phone, source, lifetime_value
properties             id, tenant_id, address, unit, geo, notes, gate_code, equipment[]
contact_properties     contact_id, property_id, relationship[owner|tenant|manager|payer]
consents               id, tenant_id, contact_id, channel[sms|email], scope[transactional|marketing],
                       granted_at, revoked_at, source, disclosure_text, ip, actor

service_items          id, tenant_id, name, description, default_price, unit_type,
                       taxable, category, cost, tier_group?
invoices               id, tenant_id, number, contact_id, property_id, technician_id,
                       location_id, status, subtotal, tax, tip, total, notes, created_by
invoice_lines          id, invoice_id, service_item_id?, description, qty, unit_price,
                       amount, taxable
invoice_media          id, invoice_id, kind[photo|signature], r2_key, captured_at
payment_requests       id, invoice_id, amount, kind[deposit|progress|balance|full],
                       token, expires_at, status
                       -- the link is per payment_request, not per invoice
payments               id, payment_request_id, stripe_payment_intent_id, method, gross,
                       stripe_fee, application_fee, net, status, paid_at, payout_id
manual_payments        id, invoice_id, method[check|cash|other], amount, reference, recorded_by

review_asks            id, tenant_id, invoice_id, contact_id, technician_id, location_id,
                       mode, destination, shown_at, clicked_at, queued_for, sent_at, status
review_matches         id, review_ask_id, gbp_review_id, rating, matched_at, confidence
messages               id, tenant_id, contact_id, direction, channel, provider_id,
                       body, status, delivered_at, invoice_id?
referrals              id, tenant_id, referrer_contact_id, code, referred_contact_id?,
                       qualifying_invoice_id?, reward_status, reward_amount
audit_log              id, tenant_id, actor_id, entity, entity_id, action, before, after, at
```

Two notes worth arguing about early:

- **`payment_requests` between invoice and payment** is what makes deposits, progress billing, and
  re-issued links work without special cases. Doing it later means migrating every link ever sent.
- **`technicians` separate from `users`** because most techs never log in but every tech needs a
  face and a name on the review screen.

---

## 12. Platform architecture on Cloudflare + Neon

Aligns with what `fettle/` already establishes (Workers + Hono + Drizzle + TanStack Router + Bun),
with Neon Postgres substituted for D1.

**Runtime.** One Worker serving the API (Hono) plus static assets. TanStack Router + React on the
client; TanStack Query for server state. Bun for local dev and scripts.

**Database.** Neon Postgres via **Hyperdrive** with the `pg` driver, rather than the Neon HTTP
serverless driver. Reason: real transactions and session-scoped `SET LOCAL app.tenant_id`, which
is what makes Postgres RLS usable as a backstop. The HTTP driver's one-shot query model makes RLS
sessions awkward.

- **Caution:** Hyperdrive query caching must be disabled for tenant-scoped queries. A cached
  result served across tenant boundaries is the worst bug this product could have.
- **Defense in depth:** application-layer scoping via a repository pattern where `tenant_id` is a
  required argument, *plus* RLS policies as the backstop. Neither alone.
- **Neon branching** gives you a real database per preview deploy — worth wiring into CI early.

**Payments plumbing.**

- Stripe webhooks land in a Worker, are verified, enqueued to **Cloudflare Queues**, and processed
  idempotently. Never process inline — Stripe retries, and out-of-order delivery is normal.
- **`payment_intent.succeeded` from the webhook is the only source of truth for "paid."** The
  browser redirect is a UI hint. The confirmation screen polls or subscribes for the real state.
- A **Durable Object per invoice** serializes state transitions and kills the duplicate-payment
  race (two family members opening the same link, or a double-tap).

**Scheduled work.** Cron Triggers for dunning, review follow-ups, the velocity governor's send
queue, and GBP review polling. Queues for anything that fans out.

**Media.** R2 for tech photos, job photos, and signatures. Cloudflare Images for the transform and
delivery of tech photos specifically — photo quality on the review screen directly affects
conversion, so a guided crop plus a consistent render matters more than it sounds.

**Tenant resolution.**

- App: subdomain (`bobsplumbing.chotter.com`) or path, resolved from session.
- Pay page: **resolved from the link token, never from the host.** `pay.chotter.com/{token}` where
  the token carries no tenant hint.
- Custom domains on paid tiers via **Cloudflare for SaaS** — this is the white-label story and
  it's a genuine differentiator against competitors who can't offer it.

**Auth.** better-auth, as in `fettle`. Add magic links — home service owners forget passwords, and
half the logins will happen on a phone.

---

## 13. Security and privacy

- **PCI: stay SAQ-A.** Stripe Elements in an iframe, card data never touches your origin. This is
  non-negotiable and shapes the whole payment page.
- **Link tokens:** 128-bit random, non-enumerable, no PII encoded, scoped to a single
  `payment_request`, expiring (default 90 days, configurable), revocable. Rate-limit by token and
  by IP. Someone will forward one of these links; assume it.
- **Public page exposure:** the pay page shows a service address and a name. That's necessary and
  fine behind a token, but it means a leaked link is a small privacy incident, not just a payment
  one. Log every view with IP and user agent.
- **Roles:** `tech` sees their own jobs and can create invoices; it must not see revenue reporting,
  the customer list, or payout data. Techs leave for competitors and take what they can see.
- **Audit log** on invoice amounts, refunds, payout settings, and role changes.
- **Consumer data rights:** CCPA/CPRA deletion and access requests will arrive. A per-contact
  delete that cascades correctly while preserving the financial record (which you're legally
  required to keep) needs designing once, deliberately.
- **Tenant offboarding:** they own their data. Full export on cancellation, and say so in
  marketing — SMBs in this category are actively afraid of lock-in.

---

## 14. Edge cases that will otherwise become support tickets

| Case | Handling |
|---|---|
| Paid by check after link sent | Mark paid + method + reference; cancels dunning, does **not** cancel the review ask |
| Two people pay the same link | Durable Object lock; second attempt sees "already paid"; auto-refund if it lands |
| Partial payment | `payment_requests` model handles it natively; remaining balance re-issues a link |
| Overpayment / tip on a zero balance | Allowed, recorded separately, flows to export as tip not revenue |
| Link expired | Friendly state + "request a new link" that pings the office, not a 404 |
| Wrong phone/email | Surface delivery failure in the office UI within minutes, not silently |
| Customer replies to the SMS | Inbound thread in the CRM with a notification (§5) |
| Tech deleted with open invoices | Soft-delete; the review screen keeps their face on already-sent links |
| Refund after a review was left | Do nothing to the review. Flag the job for the owner |
| Job flagged as a callback | Suppress the ask (manual, auditable — see §1) |
| Customer has no smartphone | Printable invoice with a QR and a short URL; phone payment via office |
| Stripe account restricted mid-stream | Block sending, keep drafting, surface the exact Stripe requirement inline |

---

## 15. Metrics

**The two headline numbers**, which are also the sales pitch:

- **Review conversion** = attributed reviews ÷ pay pages viewed. Email-based review requests
  typically land in the single digits; an in-flow ask at the payment moment should do
  substantially better. Instrument it from day one so you can make a real claim instead of a
  hopeful one.
- **Days sales outstanding.** "You used to get paid in 19 days; now it's 2." This is the number
  that gets a business owner to sign up, and it's independent of the review story.

**Supporting:** link open rate by channel, open→pay conversion, time-to-payment distribution,
review click-through, click→attributed-review rate, star average delta, review velocity vs. the
governor cap, ACH adoption rate on large invoices, tip attach rate, mode A/B deltas per tenant.

---

## 16. Referrals — design now, ship later

The mechanics are straightforward. The compliance and payout questions are not.

- **Reward referrals, never reviews.** Google prohibits incentivized reviews. Tie the reward to a
  *referred customer's completed, paid job* — a clean, defensible trigger with none of the
  exposure.
- **Two-sided:** "Give $25, get $25." One-sided referral offers underperform badly; the referrer
  needs something to say that isn't purely self-interested.
- **Attribution:** unique link or code per contact, generated on the confirmation screen after the
  review ask. Redemption either by link-click at capture time or by code entry at invoice creation.
  Support both — techs will type codes.
- **Payout rail, in order of preference:**
  1. **Account credit** against future service. Simplest, no tax or money-transmission questions,
     and it drives retention. Default.
  2. **Gift cards** via a fulfillment provider. Clean, popular, modest cost.
  3. **Cash.** Raises 1099 reporting questions above $600/year and potentially money-transmitter
     questions for the platform. Get counsel before offering it.

---

## 17. Suggested phasing

**Phase 0 — the loop works (~6 weeks).** Tenants + auth, service library, invoice creation,
payment links, Stripe Connect Express, card + Apple/Google Pay, post-payment review ask with
GBP-or-manual Place ID, email delivery via Resend, share-sheet SMS handoff, basic contacts.
*Goal: a real plumber sends a real invoice and gets a real review.*

**Phase 1 — it's a business.** Telnyx Tier 1 messaging with 10DLC, dunning + review follow-ups,
velocity governor, GBP OAuth + attribution, transaction CSV + payout reconciliation, properties
model, consent capture, field capture forms.

**Phase 2 — it's differentiated.** ACH + Financial Connections, BNPL, deposits and progress
payments, tips, dedicated numbers, custom domains via Cloudflare for SaaS, inbound SMS threads,
mode A/B experimentation, dispute evidence packets, offline drafts.

**Phase 3 — it's sticky.** Recurring service plans and memberships, referrals, QBO API sync,
multi-location and franchise roles, tech leaderboards, reputation reporting.

---

## 18. Open questions

1. **Vertical focus for v1.** HVAC/plumbing/electrical (high ticket, ACH and financing matter,
   fewer jobs) vs. cleaning/lawn/pest (low ticket, high frequency, recurring plans matter). These
   pull the roadmap in different directions and the answer changes what ships in Phase 1.
2. **Do they already run Jobber or Housecall Pro?** If yes, Chotter is a companion and needs to
   coexist gracefully — which means an import path and eventually integrations, not a migration
   pitch.
3. **Take rate vs. pure SaaS.** §7 recommends capped-and-transparent, but this is a positioning
   decision as much as a pricing one and it should be made deliberately.
4. **Is the review the wedge or the payment?** The review story sells the vision; the DSO and ACH
   savings numbers sell the subscription. Which one leads the landing page changes the product.
5. **"Chotter"** — worth a trademark and domain check, and worth saying out loud a few times.
   "Sent via Chotter" appears in every free-tier message, so it has to survive being heard, not
   just read.
6. **GBP API access approval** — start the application now (§4). The attribution feature is
   blocked on Google's timeline, not yours.
