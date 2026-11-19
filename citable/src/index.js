import { runCheck, UserError, normalizeTarget } from './checker.js';
import { landingPage, reportPage, appPage, activatePage, aboutPage, notFoundPage } from './pages.js';
import { EMBED_JS } from './embed.js';
import { createCheckoutSession, getCheckoutSession, verifyStripeSignature } from './stripe.js';

const PLANS = {
  pro: { name: 'Citable Pro', amount: 1900, monitors: 5, widget: false },
  agency: { name: 'Citable Agency', amount: 4900, monitors: 25, widget: true },
};
const FREE_CHECKS_PER_HOUR = 20;
const EMBED_CHECKS_PER_HOUR = 12;
const CACHE_MS = 30 * 60 * 1000;

// ---------- helpers ----------
const now = () => Date.now();
function rid(n = 12) {
  const a = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const b = crypto.getRandomValues(new Uint8Array(n));
  return [...b].map(x => a[x % a.length]).join('');
}
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}
const SEC_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SEC_HEADERS, ...extra } });
}
function text(body, type = 'text/plain; charset=utf-8', extra = {}) {
  return new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', ...extra } });
}
async function body(req) { try { return await req.json(); } catch { return {}; } }
const validEmail = e => typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function clientIp(req) { return req.headers.get('cf-connecting-ip') || 'unknown'; }

async function rateLimit(env, key, limit, windowMs) {
  const bucket = Math.floor(now() / windowMs);
  const k = `${key}:${bucket}`;
  const row = await env.DB.prepare(
    'INSERT INTO hits (k, n, expires) VALUES (?1, 1, ?2) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n'
  ).bind(k, (bucket + 1) * windowMs).first();
  return row.n <= limit;
}

async function authed(req, env) {
  const h = req.headers.get('Authorization') || '';
  const secret = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!secret || secret.length < 20) return null;
  return env.DB.prepare('SELECT * FROM accounts WHERE secret = ?1').bind(secret).first();
}

function publicAccount(a) {
  const plan = PLANS[a.plan] || PLANS.pro;
  return { id: a.id, email: a.email, plan: a.plan, status: a.status, publicId: a.public_id, brand: a.brand, color: a.color, logoUrl: a.logo_url,
    ctaUrl: a.cta_url, ctaLabel: a.cta_label, webhookUrl: a.webhook_url, limits: { monitors: plan.monitors, widget: plan.widget } };
}

// Run a check (or reuse a recent one) and persist it.
async function checkAndStore(env, input, { accountId = null, fresh = false } = {}) {
  const target = normalizeTarget(input).href;
  if (!fresh) {
    const hit = await env.DB.prepare('SELECT id, json FROM reports WHERE url = ?1 AND created_at > ?2 ORDER BY created_at DESC LIMIT 1')
      .bind(target, now() - CACHE_MS).first();
    if (hit) return { id: hit.id, report: JSON.parse(hit.json), cached: true };
  }
  const report = await runCheck(target);
  const id = rid(10);
  await env.DB.prepare('INSERT INTO reports (id, url, host, score, json, account_id, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
    .bind(id, report.url, report.host, report.score, JSON.stringify(report), accountId, now()).run();
  return { id, report, cached: false };
}

async function postWebhook(url, payload) {
  if (!url) return;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Citable-Webhook/1.0' }, body: JSON.stringify({ content: payload.text, ...payload }), signal: AbortSignal.timeout(8000) });
  } catch {}
}

async function createAccount(env, { plan, email, stripeCustomer = null, stripeSubscription = null, stripeSession = null }) {
  const a = { id: 'acc_' + rid(12), secret: 'ck_' + rid(32), public_id: 'pub_' + rid(14) };
  await env.DB.prepare(`INSERT INTO accounts (id, secret, public_id, email, plan, status, brand, color, cta_label, stripe_customer, stripe_subscription, stripe_session, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, 'active', ?6, '#0f766e', 'Book a free AI-visibility call', ?7, ?8, ?9, ?10)`)
    .bind(a.id, a.secret, a.public_id, email, plan, null, stripeCustomer, stripeSubscription, stripeSession, now()).run();
  return env.DB.prepare('SELECT * FROM accounts WHERE id = ?1').bind(a.id).first();
}

// ---------- routes ----------
async function route(req, env, ctx) {
  const url = new URL(req.url);
  const p = url.pathname;
  const origin = env.PUBLIC_ORIGIN || url.origin;
  const stripeOn = !!env.STRIPE_SECRET_KEY;

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  // ---- pages ----
  if (req.method === 'GET') {
    if (p === '/') return html(landingPage({ origin, stripeOn, prefill: url.searchParams.get('url') || '' }), 200, { 'Cache-Control': 'public, max-age=300' });
    if (p === '/about') return html(aboutPage({ origin }), 200, { 'Cache-Control': 'public, max-age=3600' });
    if (p === '/app') return html(appPage({ origin }));
    if (p === '/activate') return activate(req, env, url, origin);
    if (p.startsWith('/r/')) {
      const id = p.slice(3).replace(/[^A-Za-z0-9]/g, '');
      const row = await env.DB.prepare('SELECT json, created_at FROM reports WHERE id = ?1').bind(id).first();
      if (!row) return html(notFoundPage({ origin }), 404);
      let brand = null;
      const b = url.searchParams.get('b');
      if (b) {
        const acc = await env.DB.prepare("SELECT * FROM accounts WHERE public_id = ?1 AND plan = 'agency' AND status = 'active'").bind(b).first();
        if (acc) brand = { name: acc.brand, color: acc.color, logoUrl: acc.logo_url, ctaUrl: acc.cta_url, ctaLabel: acc.cta_label };
      }
      return html(reportPage({ origin, id, report: JSON.parse(row.json), brand }), 200, { 'Cache-Control': 'public, max-age=120' });
    }
    if (p === '/embed.js') return text(EMBED_JS.replaceAll('__ORIGIN__', origin), 'application/javascript; charset=utf-8', { ...CORS, 'Cache-Control': 'public, max-age=600' });
    if (p === '/robots.txt') return text(`User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /activate\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
    if (p === '/sitemap.xml') return text(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url><url><loc>${origin}/about</loc></url></urlset>`, 'application/xml');
    if (p === '/llms.txt') return text(`# Citable\n\n> Citable checks whether AI search engines (ChatGPT search, Perplexity, Claude, Google AI Overviews, Copilot) can reach, read and cite a website, then monitors it daily and alerts when access breaks.\n\n- [Free checker](${origin}/): enter any URL to see which AI crawlers are blocked by robots.txt, firewalls/CDNs, noindex or JavaScript-only rendering.\n- [How it works](${origin}/about): methodology, crawler list, limitations.\n\nPlans: Free one-off checks; Pro $19/mo (daily monitoring of 5 sites with alerts); Agency $49/mo (white-label lead-capture widget, branded reports, 25 monitored sites).\n`);
    if (p === '/favicon.svg' || p === '/favicon.ico') return text(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0f766e"/><path d="M9 16.5l4.5 4.5L23 11.5" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`, 'image/svg+xml');
    if (p === '/health') return json({ ok: true });
  }

  // ---- public API ----
  if (p === '/api/check' && req.method === 'POST') {
    const { url: target } = await body(req);
    if (!(await rateLimit(env, 'chk:' + clientIp(req), FREE_CHECKS_PER_HOUR, 3600_000)))
      return json({ error: 'You have run a lot of checks this hour. Try again shortly — or start monitoring with Pro.' }, 429);
    const { id, report } = await checkAndStore(env, target);
    return json({ id, report, reportUrl: `${origin}/r/${id}` });
  }

  if (p === '/api/waitlist' && req.method === 'POST') {
    const { email, plan } = await body(req);
    if (!validEmail(email)) return json({ error: 'Enter a valid email.' }, 400);
    await env.DB.prepare('INSERT OR IGNORE INTO waitlist (email, plan, created_at) VALUES (?1, ?2, ?3)').bind(email.toLowerCase(), String(plan || '').slice(0, 20), now()).run();
    if (env.ALERT_WEBHOOK) ctx.waitUntil(postWebhook(env.ALERT_WEBHOOK, { text: `Citable waitlist: ${email} (${plan})` }));
    return json({ ok: true });
  }

  if (p === '/api/checkout' && req.method === 'POST') {
    const { plan, email } = await body(req);
    if (!PLANS[plan]) return json({ error: 'Unknown plan' }, 400);
    if (!stripeOn) return json({ waitlist: true }, 503);
    const s = await createCheckoutSession(env, { plan, planInfo: PLANS[plan], origin, email: validEmail(email) ? email : undefined });
    return json({ url: s.url });
  }

  if (p === '/api/stripe/webhook' && req.method === 'POST') return stripeWebhook(req, env);

  // ---- embed (agency widget) ----
  if (p === '/api/embed/config' && req.method === 'GET') {
    const acc = await env.DB.prepare("SELECT * FROM accounts WHERE public_id = ?1").bind(url.searchParams.get('pid') || '').first();
    if (!acc || acc.plan !== 'agency' || acc.status !== 'active') return json({ error: 'Widget not active' }, 404, CORS);
    return json({ brand: acc.brand, color: acc.color, logoUrl: acc.logo_url, ctaUrl: acc.cta_url, ctaLabel: acc.cta_label }, 200, { ...CORS, 'Cache-Control': 'public, max-age=60' });
  }
  if (p === '/api/embed/check' && req.method === 'POST') {
    const b = await body(req);
    const acc = await env.DB.prepare("SELECT * FROM accounts WHERE public_id = ?1").bind(String(b.pid || '')).first();
    if (!acc || acc.plan !== 'agency' || acc.status !== 'active') return json({ error: 'This widget is not active.' }, 404, CORS);
    if (!validEmail(b.email)) return json({ error: 'Enter a valid email to get your report.' }, 400, CORS);
    if (!(await rateLimit(env, 'emb:' + clientIp(req), EMBED_CHECKS_PER_HOUR, 3600_000))) return json({ error: 'Too many checks — try again in a bit.' }, 429, CORS);
    const { id, report } = await checkAndStore(env, b.url, { accountId: acc.id });
    const lead = { id: 'lead_' + rid(10), email: b.email.toLowerCase().slice(0, 254), name: String(b.name || '').slice(0, 120) || null, site: report.url, score: report.score, report_id: id, page: String(b.page || '').slice(0, 500) || null };
    await env.DB.prepare('INSERT INTO leads (id, account_id, email, name, site, score, report_id, page, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)')
      .bind(lead.id, acc.id, lead.email, lead.name, lead.site, lead.score, lead.report_id, lead.page, now()).run();
    const reportUrl = `${origin}/r/${id}?b=${acc.public_id}`;
    ctx.waitUntil(postWebhook(acc.webhook_url, {
      type: 'lead.created', text: `New lead: ${lead.email} checked ${report.host} — score ${report.score}/100 (${report.headline}). ${reportUrl}`,
      lead: { ...lead, reportUrl, headline: report.headline, grade: report.grade },
    }));
    return json({ id, reportUrl, report: summarize(report) }, 200, CORS);
  }

  // ---- account API ----
  if (p.startsWith('/api/me') || p.startsWith('/api/monitors') || p.startsWith('/api/leads')) {
    const acc = await authed(req, env);
    if (!acc) return json({ error: 'Invalid or missing key' }, 401);
    return accountApi(req, env, ctx, acc, url, origin);
  }

  // ---- admin: comp an account (beta users, partners) ----
  if (p === '/api/admin/accounts' && req.method === 'POST') {
    if (!env.ADMIN_TOKEN || req.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: 'forbidden' }, 403);
    const { plan = 'agency', email = null } = await body(req);
    if (!PLANS[plan]) return json({ error: 'bad plan' }, 400);
    const acc = await createAccount(env, { plan, email });
    return json({ dashboard: `${origin}/app#k=${acc.secret}`, account: publicAccount(acc) });
  }

  return req.method === 'GET' ? html(notFoundPage({ origin }), 404) : json({ error: 'Not found' }, 404);
}

function summarize(r) {
  return { url: r.url, host: r.host, score: r.score, grade: r.grade, headline: r.headline, platform: r.platform,
    crawlers: r.crawlers.filter(c => c.purpose !== 'training').map(c => ({ token: c.token, product: c.product, status: c.status, blockedBy: c.blockedBy })),
    findings: r.findings.filter(f => f.severity !== 'info').slice(0, 5).map(f => ({ severity: f.severity, title: f.title })) };
}

async function accountApi(req, env, ctx, acc, url, origin) {
  const p = url.pathname;
  const plan = PLANS[acc.plan] || PLANS.pro;
  if (p === '/api/me' && req.method === 'GET') {
    const monitors = (await env.DB.prepare('SELECT id, url, last_score, last_report, last_checked, last_changed FROM monitors WHERE account_id = ?1 ORDER BY created_at').bind(acc.id).all()).results;
    const leads = plan.widget ? (await env.DB.prepare('SELECT id, email, name, site, score, report_id, page, created_at FROM leads WHERE account_id = ?1 ORDER BY created_at DESC LIMIT 200').bind(acc.id).all()).results : [];
    return json({ account: publicAccount(acc), monitors, leads, embedSnippet: plan.widget ? `<div data-citable="${acc.public_id}"></div>\n<script src="${origin}/embed.js" async></script>` : null });
  }
  if (p === '/api/me' && req.method === 'POST') {
    const b = await body(req);
    const clean = (v, n) => (v == null || v === '') ? null : String(v).slice(0, n);
    const okUrl = v => { if (!v) return null; try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; } };
    const color = /^#[0-9a-fA-F]{6}$/.test(b.color || '') ? b.color : acc.color;
    await env.DB.prepare('UPDATE accounts SET brand=?1, color=?2, logo_url=?3, cta_url=?4, cta_label=?5, webhook_url=?6, email=COALESCE(?7, email) WHERE id=?8')
      .bind(clean(b.brand, 80), color, okUrl(b.logoUrl), okUrl(b.ctaUrl), clean(b.ctaLabel, 60), b.webhookUrl && okUrl(b.webhookUrl)?.startsWith('https:') ? okUrl(b.webhookUrl) : null, validEmail(b.email) ? b.email : null, acc.id).run();
    return json({ ok: true });
  }
  if (acc.status !== 'active') return json({ error: 'Your subscription is not active.' }, 402);
  if (p === '/api/monitors' && req.method === 'POST') {
    const b = await body(req);
    const target = normalizeTarget(b.url).href;
    const count = (await env.DB.prepare('SELECT COUNT(*) AS n FROM monitors WHERE account_id = ?1').bind(acc.id).first()).n;
    if (count >= plan.monitors) return json({ error: `Your plan includes ${plan.monitors} monitored sites.` }, 400);
    const id = 'mon_' + rid(10);
    const { id: reportId, report } = await checkAndStore(env, target, { accountId: acc.id, fresh: true });
    await env.DB.prepare('INSERT OR IGNORE INTO monitors (id, account_id, url, last_signature, last_score, last_report, last_checked, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)')
      .bind(id, acc.id, target, report.signature, report.score, reportId, now(), now()).run();
    return json({ ok: true, reportId, score: report.score });
  }
  const m = p.match(/^\/api\/monitors\/(mon_[A-Za-z0-9]+)\/delete$/);
  if (m && req.method === 'POST') {
    await env.DB.prepare('DELETE FROM monitors WHERE id = ?1 AND account_id = ?2').bind(m[1], acc.id).run();
    return json({ ok: true });
  }
  if (p === '/api/leads.csv' && req.method === 'GET') {
    const rows = (await env.DB.prepare('SELECT created_at, email, name, site, score, report_id, page FROM leads WHERE account_id = ?1 ORDER BY created_at DESC').bind(acc.id).all()).results;
    const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) || /^[=+\-@]/.test(s) ? '"' + s.replace(/^([=+\-@])/, "'$1").replace(/"/g, '""') + '"' : s; };
    const csv = ['date,email,name,site,score,report,page', ...rows.map(r => [new Date(r.created_at).toISOString(), r.email, r.name, r.site, r.score, `${origin}/r/${r.report_id}?b=${acc.public_id}`, r.page].map(esc).join(','))].join('\n');
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="citable-leads.csv"' } });
  }
  return json({ error: 'Not found' }, 404);
}

async function activate(req, env, url, origin) {
  const sid = url.searchParams.get('session_id') || '';
  if (!env.STRIPE_SECRET_KEY || !/^cs_[A-Za-z0-9_]+$/.test(sid)) return html(activatePage({ origin, error: 'This activation link is not valid.' }), 400);
  const existing = await env.DB.prepare('SELECT * FROM accounts WHERE stripe_session = ?1').bind(sid).first();
  if (existing) return html(activatePage({ origin, account: existing }));
  const s = await getCheckoutSession(env, sid);
  if (s.status !== 'complete' || !['paid', 'no_payment_required'].includes(s.payment_status))
    return html(activatePage({ origin, error: 'We have not received payment for this checkout yet. If you just paid, refresh in a few seconds.' }), 402);
  const plan = PLANS[s.metadata?.plan] ? s.metadata.plan : 'pro';
  const acc = await createAccount(env, { plan, email: s.customer_details?.email || s.customer_email || null, stripeCustomer: s.customer || null, stripeSubscription: typeof s.subscription === 'string' ? s.subscription : s.subscription?.id || null, stripeSession: sid });
  if (env.ALERT_WEBHOOK) await postWebhook(env.ALERT_WEBHOOK, { text: `💰 New Citable ${plan} subscriber: ${acc.email}` });
  return html(activatePage({ origin, account: acc }));
}

async function stripeWebhook(req, env) {
  const raw = await req.text();
  if (!env.STRIPE_WEBHOOK_SECRET || !(await verifyStripeSignature(raw, req.headers.get('Stripe-Signature') || '', env.STRIPE_WEBHOOK_SECRET)))
    return json({ error: 'bad signature' }, 400);
  const evt = JSON.parse(raw);
  const obj = evt.data?.object || {};
  if (evt.type === 'customer.subscription.deleted' || evt.type === 'customer.subscription.updated') {
    const status = evt.type === 'customer.subscription.deleted' ? 'canceled' : (['active', 'trialing'].includes(obj.status) ? 'active' : obj.status === 'past_due' ? 'past_due' : 'canceled');
    await env.DB.prepare('UPDATE accounts SET status = ?1 WHERE stripe_subscription = ?2').bind(status, obj.id).run();
  }
  return json({ received: true });
}

// ---------- scheduled monitoring ----------
async function runMonitors(env, origin) {
  const batch = Number(env.MONITOR_BATCH || 4);
  const due = (await env.DB.prepare(`SELECT m.*, a.webhook_url, a.email, a.public_id, a.plan FROM monitors m JOIN accounts a ON a.id = m.account_id
    WHERE a.status = 'active' AND m.last_checked < ?1 ORDER BY m.last_checked LIMIT ?2`).bind(now() - 23 * 3600_000, batch).all()).results;
  for (const m of due) {
    try {
      const { id, report } = await checkAndStore(env, m.url, { accountId: m.account_id, fresh: true });
      const changed = m.last_signature && m.last_signature !== report.signature;
      await env.DB.prepare('UPDATE monitors SET last_signature=?1, last_score=?2, last_report=?3, last_checked=?4, last_changed=COALESCE(?5, last_changed) WHERE id=?6')
        .bind(report.signature, report.score, id, now(), changed ? now() : null, m.id).run();
      if (changed) {
        const before = Object.fromEntries(m.last_signature.split('|').map(s => s.split(':')));
        const diffs = report.crawlers.filter(c => before[c.token] && before[c.token] !== c.status && c.purpose !== 'training')
          .map(c => `${c.token}: ${before[c.token]} → ${c.status}`);
        const link = `${origin}/r/${id}`;
        await postWebhook(m.webhook_url, { type: 'monitor.changed', text: `⚠️ AI crawler access changed on ${report.host} (score ${m.last_score} → ${report.score}). ${diffs.join('; ') || report.headline}. ${link}`, url: m.url, before: m.last_score, after: report.score, changes: diffs, reportUrl: link });
      }
    } catch (e) {
      await env.DB.prepare('UPDATE monitors SET last_checked=?1 WHERE id=?2').bind(now(), m.id).run();
    }
  }
  await env.DB.prepare('DELETE FROM hits WHERE expires < ?1').bind(now()).run();
}

export default {
  async fetch(req, env, ctx) {
    try {
      return await route(req, env, ctx);
    } catch (e) {
      if (e instanceof UserError) return json({ error: e.message }, 400, CORS);
      console.error(e?.stack || e);
      return json({ error: 'Something went wrong on our side. Please try again.' }, 500, CORS);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runMonitors(env, env.PUBLIC_ORIGIN || 'https://citable.southouterspace.workers.dev'));
  },
};
