// Citable checker engine: can AI search engines reach, read and cite a URL?
// Pure functions + fetch. No dependencies, runs on Workers and Node 18+.

export const CRAWLERS = [
  // purpose: search = feeds AI answers/citations, user = fetches when a person asks, training = model training
  { token: 'OAI-SearchBot', operator: 'OpenAI', product: 'ChatGPT search', purpose: 'search', weight: 22,
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot' },
  { token: 'ChatGPT-User', operator: 'OpenAI', product: 'ChatGPT (on request)', purpose: 'user', weight: 8,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot' },
  { token: 'PerplexityBot', operator: 'Perplexity', product: 'Perplexity search', purpose: 'search', weight: 16,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)' },
  { token: 'Perplexity-User', operator: 'Perplexity', product: 'Perplexity (on request)', purpose: 'user', weight: 4,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)' },
  { token: 'Claude-SearchBot', operator: 'Anthropic', product: 'Claude search', purpose: 'search', weight: 12,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)' },
  { token: 'Claude-User', operator: 'Anthropic', product: 'Claude (on request)', purpose: 'user', weight: 4,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)' },
  { token: 'Googlebot', operator: 'Google', product: 'Google Search + AI Overviews', purpose: 'search', weight: 22, probe: false },
  { token: 'Bingbot', operator: 'Microsoft', product: 'Bing + Copilot', purpose: 'search', weight: 8, probe: false },
  { token: 'Applebot', operator: 'Apple', product: 'Siri / Spotlight', purpose: 'search', weight: 2, probe: false },
  { token: 'DuckAssistBot', operator: 'DuckDuckGo', product: 'DuckAssist', purpose: 'search', weight: 2, probe: false },
  { token: 'GPTBot', operator: 'OpenAI', product: 'Model training', purpose: 'training', weight: 0,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot' },
  { token: 'ClaudeBot', operator: 'Anthropic', product: 'Model training', purpose: 'training', weight: 0,
    ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)' },
  { token: 'Google-Extended', operator: 'Google', product: 'Gemini training', purpose: 'training', weight: 0, probe: false },
  { token: 'Applebot-Extended', operator: 'Apple', product: 'Apple AI training', purpose: 'training', weight: 0, probe: false },
  { token: 'CCBot', operator: 'Common Crawl', product: 'Open dataset', purpose: 'training', weight: 0, probe: false },
  { token: 'Meta-ExternalAgent', operator: 'Meta', product: 'Meta AI training', purpose: 'training', weight: 0, probe: false },
  { token: 'Bytespider', operator: 'ByteDance', product: 'Model training', purpose: 'training', weight: 0, probe: false },
  { token: 'Amazonbot', operator: 'Amazon', product: 'Alexa / training', purpose: 'training', weight: 0, probe: false },
];

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const CHECKER_UA = 'CitableChecker/1.0 (+https://citable.southouterspace.workers.dev/about)';

// ---------- URL safety ----------
export function normalizeTarget(input) {
  let s = String(input || '').trim();
  if (!s) throw new UserError('Enter a website address.');
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch { throw new UserError('That does not look like a web address.'); }
  if (!/^https?:$/.test(u.protocol)) throw new UserError('Only http and https sites can be checked.');
  if (u.port && !['80', '443'].includes(u.port)) throw new UserError('Only standard ports (80/443) are supported.');
  if (u.username || u.password) throw new UserError('Remove the username/password from the address.');
  const h = u.hostname.toLowerCase();
  if (!h.includes('.') || h.endsWith('.local') || h.endsWith('.internal') || h === 'localhost' || h.endsWith('.localhost'))
    throw new UserError('Enter a public website address.');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h.startsWith('[')) throw new UserError('Enter a domain name, not an IP address.');
  u.hash = '';
  return u;
}

export class UserError extends Error {}

// ---------- robots.txt (RFC 9309) ----------
export function parseRobots(text) {
  const groups = []; // { agents:[], rules:[{allow, path}] }
  const sitemaps = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of String(text || '').split(/\r\n|\r|\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === 'user-agent') {
      if (!lastWasAgent || !cur) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if (key === 'allow' || key === 'disallow') {
      lastWasAgent = false;
      if (!cur) continue; // rule before any user-agent: ignored
      if (key === 'disallow' && val === '') continue; // empty disallow = allow all
      cur.rules.push({ allow: key === 'allow', path: val });
    } else if (key === 'sitemap') {
      sitemaps.push(val);
    } else {
      lastWasAgent = false;
    }
  }
  return { groups, sitemaps };
}

function agentMatches(groupAgent, token) {
  // RFC 9309: match product token case-insensitively; ignore version etc.
  const g = groupAgent.split('/')[0].trim();
  return g !== '*' && g === token.toLowerCase();
}

export function rulesFor(parsed, token) {
  const specific = parsed.groups.filter(g => g.agents.some(a => agentMatches(a, token)));
  const chosen = specific.length ? specific : parsed.groups.filter(g => g.agents.includes('*'));
  return {
    matchedGroup: specific.length ? token : (chosen.length ? '*' : null),
    rules: chosen.flatMap(g => g.rules),
  };
}

function patternToRegex(p) {
  let anchored = false;
  if (p.endsWith('$')) { anchored = true; p = p.slice(0, -1); }
  const esc = p.split('*').map(s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*');
  return new RegExp('^' + esc + (anchored ? '$' : ''));
}

export function isAllowed(parsed, token, path) {
  const { rules, matchedGroup } = rulesFor(parsed, token);
  let best = null;
  for (const r of rules) {
    if (!r.path) continue;
    let ok;
    try { ok = patternToRegex(r.path).test(path); } catch { ok = false; }
    if (!ok) continue;
    const len = r.path.replace(/\$$/, '').length;
    if (!best || len > best.len || (len === best.len && r.allow && !best.rule.allow)) best = { len, rule: r };
  }
  return {
    allowed: best ? best.rule.allow : true,
    matchedGroup,
    rule: best ? `${best.rule.allow ? 'Allow' : 'Disallow'}: ${best.rule.path}` : null,
  };
}

// ---------- fetching ----------
async function readCapped(res, cap = 1_500_000) {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
    if (total >= cap) { try { await reader.cancel(); } catch {} break; }
  }
  const buf = new Uint8Array(Math.min(total, cap));
  let off = 0;
  for (const c of chunks) { const n = Math.min(c.byteLength, buf.length - off); buf.set(c.subarray(0, n), off); off += n; if (off >= buf.length) break; }
  return new TextDecoder('utf-8', { fatal: false }).decode(buf);
}

async function get(url, ua, { timeout = 9000, accept = 'text/html,application/xhtml+xml,*/*;q=0.8' } = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': ua, 'Accept': accept, 'Accept-Language': 'en-US,en;q=0.9' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeout),
    });
    const body = await readCapped(res);
    const headers = {};
    for (const k of ['server', 'cf-ray', 'cf-mitigated', 'x-robots-tag', 'content-type', 'x-vercel-id', 'x-amz-cf-id', 'x-sucuri-id', 'x-akamai-transformed', 'x-served-by', 'via', 'x-powered-by', 'x-shopify-stage', 'x-wix-request-id', 'x-nf-request-id'])
      { const v = res.headers.get(k); if (v) headers[k] = v; }
    return { ok: true, status: res.status, url: res.url, headers, body, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, status: 0, error: e?.name === 'TimeoutError' ? 'timed out' : (e?.message || 'network error'), ms: Date.now() - t0, headers: {}, body: '' };
  }
}

// ---------- HTML analysis ----------
const CHALLENGE_MARKERS = [
  /<title>\s*Just a moment\.\.\.\s*<\/title>/i,
  /Attention Required! \| Cloudflare/i,
  /cf-chl-|challenge-platform|cf_chl_opt/i,
  /<title>\s*Access denied/i,
  /Request unsuccessful\. Incapsula/i,
  /sucuri website firewall/i,
  /px-captcha|perimeterx/i,
  /DataDome|captcha-delivery\.com/i,
  /Pardon Our Interruption/i,
  /Vercel Security Checkpoint/i,
];

function looksLikeChallenge(r) {
  if (r.headers['cf-mitigated']) return true;
  return CHALLENGE_MARKERS.some(rx => rx.test(r.body.slice(0, 60000)));
}

export function visibleText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaContent(html, name) {
  const rx = new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, 'ig');
  const out = [];
  for (const m of html.matchAll(rx)) { const c = m[0].match(/content=["']([^"']*)["']/i); if (c) out.push(c[1].toLowerCase()); }
  return out;
}

function analyzeHtml(html) {
  const text = visibleText(html);
  const words = text ? text.split(' ').filter(w => /[a-z0-9]/i.test(w)).length : 0;
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const scripts = (html.match(/<script\b/gi) || []).length;
  const spaRoot = /<div[^>]+id=["'](root|app|__next|__nuxt|svelte|q-app)["'][^>]*>\s*<\/div>/i.test(html);
  const robotsMeta = [...metaContent(html, 'robots'), ...metaContent(html, 'googlebot')].join(',');
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const types = new Set();
  for (const j of jsonLd) for (const t of j.matchAll(/"@type"\s*:\s*(\[[^\]]*\]|"[^"]+")/g)) t[1].replace(/[\[\]"]/g, '').split(',').forEach(x => x.trim() && types.add(x.trim()));
  const desc = metaContent(html, 'description')[0] || '';
  return { words, title, scripts, spaRoot, robotsMeta, schemaTypes: [...types].slice(0, 12), hasDescription: !!desc };
}

function detectHost(headers, body) {
  const s = (headers.server || '').toLowerCase();
  if (headers['cf-ray'] || s.includes('cloudflare')) return 'Cloudflare';
  if (headers['x-vercel-id'] || s.includes('vercel')) return 'Vercel';
  if (headers['x-nf-request-id'] || s.includes('netlify')) return 'Netlify';
  if (headers['x-shopify-stage'] || /cdn\.shopify\.com/.test(body.slice(0, 50000))) return 'Shopify';
  if (headers['x-wix-request-id'] || s.includes('pepyaka')) return 'Wix';
  if (/static\.squarespace\.com/.test(body.slice(0, 50000))) return 'Squarespace';
  if (headers['x-sucuri-id'] || s.includes('sucuri')) return 'Sucuri';
  if (headers['x-amz-cf-id']) return 'AWS CloudFront';
  if (headers['x-akamai-transformed'] || s.includes('akamai')) return 'Akamai';
  if (/wp-content|wp-includes/.test(body.slice(0, 80000))) return 'WordPress';
  return null;
}

// ---------- main check ----------
export async function runCheck(input) {
  const target = normalizeTarget(input);
  const origin = target.origin;
  const path = (target.pathname || '/') + (target.search || '');
  const started = Date.now();

  const probeBots = CRAWLERS.filter(c => c.probe !== false);
  const [robotsRes, llmsRes, baseline, ...probes] = await Promise.all([
    get(origin + '/robots.txt', CHECKER_UA, { accept: 'text/plain,*/*' }),
    get(origin + '/llms.txt', CHECKER_UA, { accept: 'text/plain,text/markdown,*/*', timeout: 6000 }),
    get(target.href, BROWSER_UA),
    ...probeBots.map(b => get(target.href, b.ua)),
  ]);

  // robots
  let robots = { status: robotsRes.status, state: 'none', parsed: { groups: [], sitemaps: [] }, raw: '' };
  if (!robotsRes.ok) robots.state = 'unreachable';
  else if (robotsRes.status >= 500) robots.state = 'error5xx';
  else if (robotsRes.status >= 400) robots.state = 'missing';
  else if (/<html/i.test(robotsRes.body.slice(0, 500))) robots.state = 'html';
  else { robots.state = 'ok'; robots.raw = robotsRes.body.slice(0, 64000); robots.parsed = parseRobots(robots.raw); }

  const llms = { present: llmsRes.ok && llmsRes.status === 200 && !/<html/i.test(llmsRes.body.slice(0, 500)) && llmsRes.body.trim().length > 20 };

  const baseOk = baseline.ok && baseline.status >= 200 && baseline.status < 400 && !looksLikeChallenge(baseline);
  const base = baseline.ok ? analyzeHtml(baseline.body) : null;
  const host = detectHost(baseline.headers || {}, baseline.body || '');
  const xRobots = (baseline.headers?.['x-robots-tag'] || '').toLowerCase();

  const probeMap = Object.fromEntries(probeBots.map((b, i) => [b.token, probes[i]]));

  const crawlers = CRAWLERS.map(c => {
    let robotsVerdict;
    if (robots.state === 'error5xx') robotsVerdict = { allowed: false, rule: `robots.txt returned HTTP ${robots.status} (crawlers treat this as "block everything")`, matchedGroup: null };
    else if (robots.state === 'ok') robotsVerdict = isAllowed(robots.parsed, c.token, path.split('?')[0] === '' ? '/' : path);
    else robotsVerdict = { allowed: true, rule: null, matchedGroup: null };

    let live = null;
    const p = probeMap[c.token];
    if (p) {
      if (!p.ok) live = { state: 'error', detail: p.error };
      else if (looksLikeChallenge(p)) live = { state: 'blocked', status: p.status, detail: p.headers['cf-mitigated'] ? `Bot challenge (cf-mitigated: ${p.headers['cf-mitigated']})` : `Bot challenge page (HTTP ${p.status})` };
      else if ([401, 402, 403, 406, 429, 451, 503].includes(p.status) && baseOk) live = { state: 'blocked', status: p.status, detail: `HTTP ${p.status} for this bot, but HTTP ${baseline.status} for a normal browser` };
      else if (p.status >= 400) live = { state: baseOk ? 'blocked' : 'error', status: p.status, detail: `HTTP ${p.status}` };
      else {
        const a = analyzeHtml(p.body);
        if (base && base.words > 120 && a.words < base.words * 0.25) live = { state: 'degraded', status: p.status, detail: `Served ${a.words} words vs ${base.words} to a browser` };
        else live = { state: 'ok', status: p.status, detail: `HTTP ${p.status}` };
      }
      if (!baseOk && live.state === 'blocked') live.inconclusive = true;
    }

    let status;
    if (!robotsVerdict.allowed) status = 'blocked';
    else if (live && live.state === 'blocked' && !live.inconclusive) status = 'blocked';
    else if (live && live.state === 'degraded') status = 'partial';
    else if (live && (live.state === 'error' || live.inconclusive)) status = 'unknown';
    else status = 'allowed';

    return {
      token: c.token, operator: c.operator, product: c.product, purpose: c.purpose, weight: c.weight,
      status, robots: robotsVerdict, live,
      blockedBy: !robotsVerdict.allowed ? 'robots.txt' : (live?.state === 'blocked' && !live.inconclusive ? 'firewall' : null),
    };
  });

  // page-level findings
  const findings = [];
  const add = (severity, id, title, detail, fix) => findings.push({ severity, id, title, detail, fix });

  if (!baseline.ok) add('critical', 'unreachable', 'We could not load your page', `The request ${baseline.error}.`, 'Make sure the site is online and loads over HTTPS.');
  else if (!baseOk) add('warning', 'baseline-blocked', 'Your site challenged even a normal browser request', `A plain browser request got HTTP ${baseline.status}${looksLikeChallenge(baseline) ? ' with a bot-challenge page' : ''}. Your security settings may be very aggressive — AI crawlers almost certainly get the same treatment.`, 'Lower your bot/security level or allowlist verified bots.');

  const noindex = /noindex|none/.test(base?.robotsMeta || '') || /noindex|none/.test(xRobots);
  if (noindex) add('critical', 'noindex', 'This page tells search engines not to index it', `Found "noindex" in ${/noindex|none/.test(xRobots) ? 'the X-Robots-Tag header' : 'a robots meta tag'}. Google, Bing (and the AI answers built on them) will drop it.`, 'Remove the noindex directive from pages you want found.');
  if (/noai|noimageai/.test((base?.robotsMeta || '') + xRobots)) add('info', 'noai', 'Page carries a "noai" directive', 'Some AI tools respect "noai"; it is not a standard and does not affect search crawlers.', null);

  if (base && baseOk) {
    if (base.words < 80 && (base.spaRoot || base.scripts > 3))
      add('critical', 'js-only', 'Your content only appears after JavaScript runs', `The raw HTML contains about ${base.words} words of text. AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) do not run JavaScript, so they see an almost empty page.`, 'Enable server-side rendering or static pre-rendering for public pages (e.g. Next.js SSR/SSG, Astro, prerender.io).');
    else if (base.words < 200)
      add('warning', 'thin', 'Very little readable text on this page', `About ${base.words} words are visible in the raw HTML. AI answers quote text — give them something to quote.`, 'Add a clear, text-based description of what you do, who it is for, prices and location.');
    if (!base.schemaTypes.some(t => /Organization|LocalBusiness|Person|WebSite|Store|Restaurant|Product|Service/i.test(t)))
      add('warning', 'no-entity-schema', 'No structured data saying who you are', 'No Organization / LocalBusiness / WebSite JSON-LD found. It helps AI engines attribute and cite you correctly.', 'Add Organization or LocalBusiness JSON-LD with name, url, logo and sameAs links.');
    if (!base.title) add('warning', 'no-title', 'Missing <title>', 'Pages without titles are hard to cite.', 'Add a descriptive <title>.');
  }

  if (robots.state === 'error5xx') add('critical', 'robots-5xx', `robots.txt returns HTTP ${robots.status}`, 'When robots.txt errors, well-behaved crawlers assume they may crawl nothing.', 'Serve a valid robots.txt (even an empty one) with HTTP 200.');
  if (robots.state === 'html') add('info', 'robots-html', 'robots.txt returns an HTML page', 'Crawlers ignore it, which means "allow everything" — probably fine, but sloppy.', 'Serve a plain-text robots.txt.');
  if (!llms.present) add('info', 'no-llms', 'No llms.txt', 'Optional and not used by the major search crawlers yet, but some AI tools read it.', 'Optional: publish /llms.txt with a short summary and key links.');

  const searchBlocked = crawlers.filter(c => c.purpose !== 'training' && c.status === 'blocked');
  const firewallBlocked = crawlers.filter(c => c.blockedBy === 'firewall');
  const robotsBlocked = crawlers.filter(c => c.purpose !== 'training' && c.blockedBy === 'robots.txt');

  if (firewallBlocked.length) {
    const names = firewallBlocked.map(c => c.token).join(', ');
    let fix = 'Allowlist verified AI search crawlers in your firewall / bot-protection settings.';
    if (host === 'Cloudflare') fix = 'Cloudflare dashboard → your domain → Security → Settings → filter "Bot traffic" → "AI Crawler and Agent access policies": set Search and Agents to "Allow (do not block)". Then check AI Crawl Control → Crawlers and set OAI-SearchBot, PerplexityBot, Claude-SearchBot and ChatGPT-User to Allow, and make sure no WAF custom rule blocks them.';
    else if (host === 'Vercel') fix = 'Vercel → Project → Firewall: check Bot Protection / Attack Challenge Mode and add a bypass rule for verified AI search bots.';
    else if (host === 'Sucuri') fix = 'Sucuri firewall → Access Control: allowlist the AI crawler user agents / IP ranges.';
    else if (host === 'WordPress') fix = 'Check security plugins (Wordfence, All-In-One Security, Blackhole for Bad Bots) and your host\'s bot blocker for rules matching GPTBot / OAI-SearchBot / PerplexityBot.';
    add('critical', 'firewall', `Your firewall turns away ${firewallBlocked.length} AI crawler${firewallBlocked.length > 1 ? 's' : ''}`, `${names} got a block or challenge while a normal browser was let in. robots.txt can't fix this — the block happens before robots.txt is read.`, fix);
  }
  if (robotsBlocked.length) {
    add('critical', 'robots-block', `robots.txt blocks ${robotsBlocked.length} AI search crawler${robotsBlocked.length > 1 ? 's' : ''}`, `${robotsBlocked.map(c => `${c.token} (${c.robots.rule || 'blocked'})`).join(', ')}. Blocking these removes you from ${[...new Set(robotsBlocked.map(c => c.product.replace(/ \(on request\)/, '')))].join(', ')}.`, 'Use the corrected robots.txt below.');
  }

  // score: weighted share of search/user crawlers that can read the page, then penalties
  const weighted = crawlers.filter(c => c.weight > 0);
  const totalW = weighted.reduce((s, c) => s + c.weight, 0);
  const gotW = weighted.reduce((s, c) => s + c.weight * (c.status === 'allowed' ? 1 : c.status === 'partial' ? 0.4 : c.status === 'unknown' ? 0.6 : 0), 0);
  let score = Math.round((gotW / totalW) * 85);
  if (base && baseOk) {
    if (findings.some(f => f.id === 'js-only')) score = Math.round(score * 0.35);
    else if (findings.some(f => f.id === 'thin')) score -= 8;
    if (!findings.some(f => f.id === 'no-entity-schema')) score += 10; else score += 0;
    if (base.title && base.hasDescription) score += 5;
  }
  if (noindex) score = Math.min(score, 25);
  if (!baseline.ok) score = 0;
  score = Math.max(0, Math.min(100, score));

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : score >= 30 ? 'D' : 'F';
  let headline;
  if (!baseline.ok) headline = 'We could not reach this site';
  else if (searchBlocked.some(c => c.token === 'OAI-SearchBot')) headline = 'ChatGPT search cannot see this site';
  else if (searchBlocked.length) headline = `${searchBlocked.map(c => c.product.replace(/ \(on request\)/, '')).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).join(' and ')} cannot see this site`;
  else if (findings.some(f => f.id === 'js-only')) headline = 'AI crawlers get let in — but see a blank page';
  else if (noindex) headline = 'This page asks to be left out of search';
  else if (score >= 85) headline = 'AI search engines can read and cite this site';
  else headline = 'AI search engines can reach this site, with room to improve';

  const sevOrder = { critical: 0, warning: 1, info: 2 };
  findings.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  return {
    version: 1,
    url: target.href,
    host: target.hostname,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    score, grade, headline,
    platform: host,
    page: base ? { status: baseline.status, finalUrl: baseline.url, title: base.title, words: base.words, schemaTypes: base.schemaTypes, noindex } : { status: baseline.status, error: baseline.error },
    robots: { state: robots.state, status: robots.status, sitemaps: robots.parsed.sitemaps.slice(0, 5), lines: robots.raw ? robots.raw.split(/\r?\n/).length : 0 },
    llmsTxt: llms.present,
    crawlers,
    findings,
    suggestedRobots: robotsBlocked.length ? suggestRobots(robots.parsed, robotsBlocked.map(c => c.token)) : null,
    signature: crawlers.map(c => c.token + ':' + c.status).join('|') + '|noindex:' + noindex + '|js:' + findings.some(f => f.id === 'js-only'),
  };
}

// Build an addition to robots.txt that lets blocked search bots in while
// keeping the site's existing non-root Disallow rules for them.
export function suggestRobots(parsed, tokens) {
  const star = rulesFor(parsed, '*-nonexistent-').rules; // falls back to '*' group rules
  const keep = star.filter(r => !r.allow && r.path !== '/' && r.path !== '/*');
  const lines = ['# --- Added by Citable: let AI search & answer engines read your site ---'];
  for (const t of tokens) lines.push(`User-agent: ${t}`);
  lines.push('Allow: /');
  for (const r of keep) lines.push(`Disallow: ${r.path}`);
  lines.push('# Training crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot) are a separate choice — leave your rules for them as they are.');
  lines.push('');
  return lines.join('\n') +
    '\n# Note: if these bots already have their own "User-agent:" group above, remove the "Disallow: /" line in that group instead.';
}
