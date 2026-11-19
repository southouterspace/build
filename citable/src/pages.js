// Server-rendered HTML for Citable. All dynamic values pass through esc().
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeJson = o => JSON.stringify(o).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, '');

const CSS = `
:root{--bg:#fbfaf7;--card:#ffffff;--ink:#111827;--ink2:#374151;--muted:#6b7280;--line:#e8e4db;--soft:#f3f1ec;
--brand:#0f766e;--brand-ink:#ffffff;--brand-soft:#e6f4f1;--ok:#067647;--ok-soft:#ecfdf3;--bad:#b42318;--bad-soft:#fef3f2;--warn:#b54708;--warn-soft:#fffaeb;
--r:14px;--shadow:0 1px 2px rgba(17,24,39,.04),0 10px 30px rgba(17,24,39,.06)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0d1117;--card:#151b23;--ink:#f0f3f6;--ink2:#c9d1d9;--muted:#8b949e;--line:#2a313c;--soft:#1b222c;
--brand:#2dd4bf;--brand-ink:#04201d;--brand-soft:#0f2e2b;--ok:#3fb950;--ok-soft:#10261a;--bad:#ff7b72;--bad-soft:#2d1517;--warn:#e3b341;--warn-soft:#2b2111;--shadow:0 1px 2px rgba(0,0,0,.3)}}
:root[data-theme="dark"]{--bg:#0d1117;--card:#151b23;--ink:#f0f3f6;--ink2:#c9d1d9;--muted:#8b949e;--line:#2a313c;--soft:#1b222c;
--brand:#2dd4bf;--brand-ink:#04201d;--brand-soft:#0f2e2b;--ok:#3fb950;--ok-soft:#10261a;--bad:#ff7b72;--bad-soft:#2d1517;--warn:#e3b341;--warn-soft:#2b2111;--shadow:0 1px 2px rgba(0,0,0,.3)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--brand)}img{max-width:100%}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
nav.top{display:flex;align-items:center;justify-content:space-between;padding:18px 0;gap:12px}
.logo{display:flex;align-items:center;gap:9px;font-weight:700;font-size:18px;color:var(--ink);text-decoration:none;letter-spacing:-.01em}
.logo i{width:26px;height:26px;border-radius:7px;background:var(--brand);display:grid;place-items:center}
.logo i:after{content:"";width:10px;height:6px;border-left:2.6px solid var(--brand-ink);border-bottom:2.6px solid var(--brand-ink);transform:rotate(-45deg) translate(1px,-1px)}
nav.top .links{display:flex;gap:22px;align-items:center;font-size:15px}nav.top .links a{color:var(--ink2);text-decoration:none}
nav.top .links a.btn{color:var(--brand-ink)}
@media(max-width:720px){nav.top .links a:not(.btn){display:none}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-weight:600;padding:12px 18px;border-radius:11px;border:1px solid transparent;background:var(--brand);color:var(--brand-ink);cursor:pointer;text-decoration:none;white-space:nowrap}
.btn:hover{filter:brightness(1.06)}.btn.ghost{background:transparent;color:var(--ink);border-color:var(--line)}.btn.sm{padding:8px 12px;font-size:14px;border-radius:9px}
.btn[disabled]{opacity:.6;cursor:progress}
h1,h2,h3{letter-spacing:-.02em;line-height:1.15;margin:0}
.display{font-family:"Instrument Serif",Georgia,serif;font-weight:400;letter-spacing:-.01em}
.hero{padding:56px 0 28px;text-align:center}
.eyebrow{display:inline-flex;gap:8px;align-items:center;font-size:13px;font-weight:600;color:var(--brand);background:var(--brand-soft);padding:5px 12px;border-radius:99px;margin-bottom:22px}
.hero h1{font-size:clamp(40px,6.4vw,72px)}
.hero p.lead{font-size:clamp(17px,2vw,20px);color:var(--ink2);max-width:680px;margin:20px auto 30px}
.checker{display:flex;gap:10px;max-width:640px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:8px;box-shadow:var(--shadow)}
.checker input{flex:1;min-width:0;font:inherit;font-size:17px;border:0;background:transparent;color:var(--ink);padding:10px 12px;outline:none}
@media(max-width:520px){.checker{flex-direction:column}.checker .btn{width:100%}}
.hint{font-size:14px;color:var(--muted);margin-top:14px}
.err{color:var(--bad);font-size:15px;margin-top:12px;min-height:1px}
section{padding:64px 0}section h2{font-size:clamp(28px,4vw,42px);margin-bottom:12px}
.sub{color:var(--ink2);font-size:18px;max-width:640px;margin:0 0 34px}
.grid{display:grid;gap:16px}.g4{grid-template-columns:repeat(4,1fr)}.g3{grid-template-columns:repeat(3,1fr)}.g2{grid-template-columns:repeat(2,1fr)}
@media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr)}.g3{grid-template-columns:1fr}}@media(max-width:620px){.g4,.g2{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:22px}
.card h3{font-size:18px;margin-bottom:8px}.card p{margin:0;color:var(--ink2);font-size:15px}
.num-badge{font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px;display:block}
.price{font-size:44px;font-weight:800;letter-spacing:-.03em}.price small{font-size:16px;color:var(--muted);font-weight:500}
.plan ul{list-style:none;padding:0;margin:18px 0 22px;display:grid;gap:9px;font-size:15px;color:var(--ink2)}
.plan li{padding-left:24px;position:relative}.plan li:before{content:"";position:absolute;left:3px;top:8px;width:10px;height:6px;border-left:2px solid var(--brand);border-bottom:2px solid var(--brand);transform:rotate(-45deg)}
.plan.featured{border:2px solid var(--brand);position:relative}.plan .tag{position:absolute;top:-12px;left:22px;background:var(--brand);color:var(--brand-ink);font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px}
.plan .btn{width:100%}
details{border-top:1px solid var(--line);padding:16px 0}details summary{cursor:pointer;font-weight:600;font-size:17px;list-style:none}details summary::-webkit-details-marker{display:none}
details summary:after{content:"+";float:right;color:var(--muted)}details[open] summary:after{content:"–"}details p{color:var(--ink2);margin:10px 0 0}
footer{border-top:1px solid var(--line);padding:30px 0 50px;color:var(--muted);font-size:14px}footer .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}footer a{color:var(--muted)}
/* report */
.report{max-width:860px;margin:28px auto 0;text-align:left}
.rhead{display:flex;gap:22px;align-items:center;flex-wrap:wrap}
.dial{--v:0;--c:var(--bad);width:112px;height:112px;border-radius:50%;background:conic-gradient(var(--c) calc(var(--v)*1%),var(--soft) 0);display:grid;place-items:center;flex:none}
.dial div{width:88px;height:88px;border-radius:50%;background:var(--card);display:grid;place-items:center;text-align:center;line-height:1}
.dial b{font-size:32px;letter-spacing:-.03em}.dial span{font-size:11px;color:var(--muted);display:block;margin-top:3px}
.rhead h2{font-size:clamp(24px,3.4vw,32px)}.meta{color:var(--muted);font-size:14px;margin-top:6px;word-break:break-all}
.tbl{width:100%;border-collapse:collapse;font-size:15px}.tbl th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600;padding:10px 8px;border-bottom:1px solid var(--line)}
.tbl td{padding:11px 8px;border-bottom:1px solid var(--line);vertical-align:top}.tbl td small{color:var(--muted);display:block;font-size:13px}
.tblwrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.pill{display:inline-block;font-size:13px;font-weight:600;padding:2px 10px;border-radius:99px;white-space:nowrap}
.pill.allowed{background:var(--ok-soft);color:var(--ok)}.pill.blocked{background:var(--bad-soft);color:var(--bad)}.pill.partial,.pill.unknown{background:var(--warn-soft);color:var(--warn)}
.finding{border-left:3px solid var(--line);padding:12px 16px;margin:10px 0;background:var(--card);border-radius:0 10px 10px 0;border-top:1px solid var(--line);border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.finding.critical{border-left-color:var(--bad)}.finding.warning{border-left-color:var(--warn)}.finding.info{border-left-color:var(--muted)}
.finding h4{margin:0 0 4px;font-size:16px}.finding p{margin:0;color:var(--ink2);font-size:15px}.finding .fix{margin-top:8px;font-size:14.5px;color:var(--ink)}.finding .fix b{color:var(--brand)}
pre{background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:14px;overflow:auto;font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}
.upsell{background:var(--brand-soft);border:1px solid var(--line);border-radius:var(--r);padding:22px;display:flex;justify-content:space-between;gap:18px;align-items:center;flex-wrap:wrap;margin-top:22px}
.upsell p{margin:4px 0 0;color:var(--ink2)}
.section-t{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:700;margin:30px 0 10px}
.share{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}.share input{flex:1;min-width:200px;font:inherit;font-size:14px;padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:sp .7s linear infinite}@keyframes sp{to{transform:rotate(1turn)}}
.progress{max-width:640px;margin:22px auto 0;text-align:left;font-size:15px;color:var(--ink2)}.progress div{padding:4px 0;opacity:.45;transition:opacity .3s}.progress div.on{opacity:1}
.mock{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:var(--shadow)}
.mock .bar{height:12px;background:var(--soft);border-radius:6px;margin:8px 0}.mock .field{border:1px solid var(--line);border-radius:9px;padding:10px 12px;color:var(--muted);font-size:14px;margin-top:8px}
.kbd{font:13px ui-monospace,Menlo,monospace;background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:1px 6px}
.app input,.app textarea{font:inherit;width:100%;padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.app label{font-size:14px;font-weight:600;display:block;margin:12px 0 6px}
.muted{color:var(--muted)}
`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

function shell({ title, description, origin, path = '/', body, head = '', noindex = false }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${esc(origin + path)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${esc(origin + path)}"><meta name="twitter:card" content="summary">
<meta name="theme-color" content="#0f766e">${FONTS}<style>${CSS}</style>${head}</head><body>${body}</body></html>`;
}

const NAV = (cta = true) => `<div class="wrap"><nav class="top"><a class="logo" href="/"><i></i>Citable</a><div class="links"><a href="/#how">How it works</a><a href="/#agencies">For agencies</a><a href="/#pricing">Pricing</a>${cta ? '<a class="btn sm" href="/#check">Check my site</a>' : ''}</div></nav></div>`;
const FOOTER = `<footer><div class="wrap"><div>© ${new Date().getUTCFullYear()} Citable · Built on Cloudflare Workers</div><div style="display:flex;gap:18px"><a href="/about">Methodology</a><a href="/#pricing">Pricing</a><a href="/app">Dashboard</a><a href="/llms.txt">llms.txt</a></div></div></footer>`;

// Shared client-side report renderer (used on landing + report page).
const RENDER_JS = String.raw`
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var LABEL={allowed:'Can read',blocked:'Blocked',partial:'Partial',unknown:'Unclear'};
var PURPOSE={search:'AI search & answers',user:'Fetches when a person asks',training:'Model training'};
function renderReport(r, opt){
  opt = opt || {};
  var col = r.score>=70?'var(--ok)':r.score>=45?'var(--warn)':'var(--bad)';
  var h = '<div class="card"><div class="rhead"><div class="dial" style="--v:'+r.score+';--c:'+col+'"><div><div><b>'+r.score+'</b><span>of 100</span></div></div></div>'+
    '<div style="flex:1;min-width:240px"><h2>'+esc(r.headline)+'</h2><div class="meta">'+esc(r.url)+(r.platform?' · served by '+esc(r.platform):'')+' · checked '+esc(new Date(r.checkedAt).toLocaleString())+'</div></div></div>';
  if (opt.shareUrl) h += '<div class="share"><input readonly value="'+esc(opt.shareUrl)+'" onclick="this.select()" aria-label="Share link"><button class="btn ghost sm" type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(\''+esc(opt.shareUrl)+'\');this.textContent=\'Copied\'">Copy link</button></div>';
  h += '</div>';
  var crit = r.findings.filter(function(f){return f.severity!=='info';});
  if (r.findings.length){
    h += '<div class="section-t">'+(crit.length?'What to fix':'Notes')+'</div>';
    r.findings.forEach(function(f){
      h += '<div class="finding '+esc(f.severity)+'"><h4>'+esc(f.title)+'</h4><p>'+esc(f.detail)+'</p>'+(f.fix?'<div class="fix"><b>Fix:</b> '+esc(f.fix)+'</div>':'')+'</div>';
    });
  }
  if (r.suggestedRobots){ h += '<div class="section-t">Corrected robots.txt — add this</div><pre>'+esc(r.suggestedRobots)+'</pre>'; }
  ['search','user','training'].forEach(function(p){
    var rows = r.crawlers.filter(function(c){return c.purpose===p;});
    h += '<div class="section-t">'+PURPOSE[p]+(p==='training'?' <span style="text-transform:none;letter-spacing:0;font-weight:500">— blocking these is a legitimate choice and does not affect AI search</span>':'')+'</div><div class="card tblwrap" style="padding:6px 14px"><table class="tbl"><thead><tr><th>Crawler</th><th>robots.txt</th><th>Live test</th><th>Result</th></tr></thead><tbody>';
    rows.forEach(function(c){
      var rb = c.robots.allowed ? 'Allowed' : 'Disallowed';
      var rr = c.robots.rule ? '<small>'+esc(c.robots.rule)+(c.robots.matchedGroup?' (group: '+esc(c.robots.matchedGroup)+')':'')+'</small>' : '';
      var lv = c.live ? esc(c.live.detail||c.live.state)+(c.live.inconclusive?'<small>inconclusive</small>':'') : '<small>robots.txt only</small>';
      h += '<tr><td><b>'+esc(c.token)+'</b><small>'+esc(c.operator)+' · '+esc(c.product)+'</small></td><td>'+rb+rr+'</td><td>'+lv+'</td><td><span class="pill '+esc(c.status)+'">'+LABEL[c.status]+'</span></td></tr>';
    });
    h += '</tbody></table></div>';
  });
  if (r.page && r.page.words!=null) h += '<p class="muted" style="font-size:14px;margin-top:16px">Page: HTTP '+esc(r.page.status)+' · '+esc(r.page.words)+' words readable without JavaScript · structured data: '+esc((r.page.schemaTypes||[]).join(', ')||'none')+' · llms.txt: '+(r.llmsTxt?'yes':'no')+' · robots.txt: '+esc(r.robots.state)+'</p>';
  if (opt.brand){
    var b = opt.brand;
    h += '<div class="upsell"><div><b>'+(b.name?esc(b.name)+' can fix this for you':'Want help fixing this?')+'</b><p>Get these issues fixed and keep AI search engines reading your site.</p></div>'+(b.ctaUrl?'<a class="btn" href="'+esc(b.ctaUrl)+'" target="_blank" rel="noopener">'+esc(b.ctaLabel||'Book a call')+'</a>':'')+'</div>';
  } else if (!opt.noUpsell) {
    h += '<div class="upsell"><div><b>Access breaks quietly.</b><p>A CDN update, a new security plugin or a staging robots.txt can lock AI search out overnight. Citable Pro re-checks daily and alerts you the moment it changes.</p></div><a class="btn" href="/#pricing">Monitor this site — $19/mo</a></div>';
  }
  return h;
}
`;

export function landingPage({ origin, stripeOn, prefill }) {
  const faq = [
    ['Why would my site be invisible to ChatGPT?', 'The most common causes are (1) a CDN or security setting that turns AI crawlers away — on Cloudflare this is often a single "block AI bots" choice — (2) a robots.txt rule that blocks OAI-SearchBot or PerplexityBot, often copied from a "block AI" template, (3) a noindex tag left over from staging, and (4) pages that only render with JavaScript, which AI crawlers do not run.'],
    ['Is blocking GPTBot the same as blocking ChatGPT search?', 'No. GPTBot is OpenAI\'s training crawler. ChatGPT search uses OAI-SearchBot, and ChatGPT-User fetches pages when someone asks about them. You can opt out of training and still be cited. Citable reports each one separately.'],
    ['How do you detect firewall blocks?', 'We fetch your page as a normal browser and again as each AI crawler, from the same network, and compare. If the browser gets your page and the crawler gets a 403, 429, 503 or a challenge page, something upstream of robots.txt is blocking it.'],
    ['Is the check accurate?', 'It is a simulation: we send each crawler\'s real user-agent, but not from the operator\'s own IP addresses. Rules that only match on verified IPs can behave differently, and we mark results we cannot confirm as "unclear" rather than guessing.'],
    ['Does this help with Google AI Overviews?', 'AI Overviews use Googlebot, so we check that Googlebot is allowed and that your page is indexable. Google-Extended only controls Gemini training — blocking it does not remove you from Google Search.'],
    ['What does the agency widget do?', 'Agency customers embed the checker on their own site with two lines of HTML. Visitors enter their website and email to get a free AI-visibility report branded with your name and call-to-action, and each lead is sent to you by webhook (Slack, Zapier, Make, your CRM) and kept in your dashboard.'],
  ];
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', name: 'Citable', url: origin + '/', logo: origin + '/favicon.svg' },
    { '@type': 'WebSite', name: 'Citable', url: origin + '/' },
    { '@type': 'SoftwareApplication', name: 'Citable', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: [{ '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free check' }, { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Pro' }, { '@type': 'Offer', price: '49', priceCurrency: 'USD', name: 'Agency' }] },
    { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ] };

  const body = `${NAV()}
<main>
<div class="wrap hero" id="check">
  <span class="eyebrow">Free · ~15 seconds · no sign-up</span>
  <h1 class="display">Can ChatGPT actually<br>see your website?</h1>
  <p class="lead">Plenty of sites block AI search without knowing it — through a CDN bot setting, a security plugin, a copied robots.txt rule or a JavaScript-only page. Citable tests the crawlers behind ChatGPT, Perplexity, Claude, Google AI and Copilot and tells you exactly what to change.</p>
  <form class="checker" id="f" autocomplete="on"><input id="u" name="url" placeholder="yourbusiness.com" value="${esc(prefill)}" required inputmode="url" aria-label="Website address"><button class="btn" id="go" type="submit">Check my site</button></form>
  <div class="hint">We read robots.txt, then load your page as a browser and as each AI crawler and compare.</div>
  <div class="err" id="err" role="alert"></div>
  <div class="progress" id="prog" hidden><div>Reading robots.txt…</div><div>Loading your page as a normal browser…</div><div>Loading it as OAI-SearchBot, PerplexityBot, Claude-SearchBot, GPTBot…</div><div>Checking noindex, JavaScript rendering and structured data…</div></div>
  <div class="report" id="out" aria-live="polite"></div>
</div>

<section id="how"><div class="wrap">
  <h2 class="display">Four ways sites go invisible to AI</h2>
  <p class="sub">Most "AI visibility" checkers only read robots.txt. The blocks that hurt are usually somewhere else.</p>
  <div class="grid g4">
    <div class="card"><span class="num-badge">01 · FIREWALL / CDN</span><h3>Turned away at the door</h3><p>Bot protection on Cloudflare, Vercel, Sucuri or a WordPress plugin returns 403s or challenges to AI crawlers. robots.txt never even gets read.</p></div>
    <div class="card"><span class="num-badge">02 · ROBOTS.TXT</span><h3>The wrong bot blocked</h3><p>"Block AI" templates often block OAI-SearchBot and PerplexityBot — the crawlers that cite you — not just the training bots.</p></div>
    <div class="card"><span class="num-badge">03 · JAVASCRIPT</span><h3>A blank page</h3><p>AI crawlers don't run JavaScript. If your content is rendered in the browser, they see an empty shell.</p></div>
    <div class="card"><span class="num-badge">04 · NOINDEX</span><h3>Left over from staging</h3><p>A stray noindex tag or X-Robots-Tag header drops you from Google and Bing — and the AI answers built on them.</p></div>
  </div>
</div></section>

<section style="padding-top:0"><div class="wrap grid g3">
  <div><span class="num-badge">STEP 1</span><h3>Check</h3><p class="muted">Enter a URL. We test 18 crawlers across OpenAI, Anthropic, Perplexity, Google, Microsoft, Apple and more, separating search, on-request and training bots.</p></div>
  <div><span class="num-badge">STEP 2</span><h3>Fix</h3><p class="muted">Every problem comes with the exact fix — the setting to change on your platform, or a corrected robots.txt that keeps your existing rules.</p></div>
  <div><span class="num-badge">STEP 3</span><h3>Monitor</h3><p class="muted">Pro re-checks every day and alerts you in Slack, Discord or any webhook when a deploy, plugin or CDN change locks AI search out.</p></div>
</div></section>

<section id="agencies" style="background:var(--soft);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap grid g2" style="align-items:center;gap:40px">
  <div>
    <span class="eyebrow">For SEO &amp; web agencies</span>
    <h2 class="display">Turn "can AI see us?" into booked calls</h2>
    <p class="sub" style="margin-bottom:18px">Every client is asking about AI search. Put the checker on your own site, branded as yours. Visitors trade an email for a free report; you get the lead, their score and exactly what's broken — the perfect opener.</p>
    <div class="plan"><ul style="margin:0">
      <li>Two-line embed for any site builder — WordPress, Webflow, Framer, Wix, Squarespace</li>
      <li>Report pages with your name, colour and "Book a call" button</li>
      <li>Leads to Slack, Zapier, Make or your CRM by webhook, plus CSV export</li>
      <li>Daily monitoring for 25 client sites, with change alerts</li>
    </ul></div>
    <p style="margin-top:24px"><a class="btn" href="#pricing" data-plan="agency">Get the agency widget — $49/mo</a></p>
  </div>
  <div class="mock" aria-hidden="true">
    <b style="font-size:18px">Can ChatGPT see your website?</b>
    <div class="muted" style="font-size:14px">Free check from <b>Your Agency</b></div>
    <div class="field">yourclient.com</div><div class="field">owner@yourclient.com</div>
    <div class="btn" style="width:100%;margin-top:10px">Check my site</div>
    <div style="display:flex;gap:14px;align-items:center;margin-top:18px"><div class="dial" style="--v:38;--c:var(--bad);width:64px;height:64px"><div style="width:48px;height:48px"><b style="font-size:18px">38</b></div></div><div><b>ChatGPT search cannot see this site</b><div class="muted" style="font-size:13px">Firewall blocks OAI-SearchBot, PerplexityBot</div></div></div>
    <div class="btn" style="width:100%;margin-top:14px">Book a free AI-visibility call</div>
  </div>
</div></section>

<section id="pricing"><div class="wrap">
  <h2 class="display">Simple pricing</h2>
  <p class="sub">The check is free forever. Pay when you want it watched — or want it working for your agency.</p>
  <div class="grid g3">
    <div class="card plan"><h3>Free</h3><div class="price">$0</div><ul><li>Unlimited one-off checks</li><li>18 AI &amp; search crawlers</li><li>Firewall, robots.txt, noindex &amp; JavaScript tests</li><li>Shareable report link</li></ul><a class="btn ghost" href="#check">Run a check</a></div>
    <div class="card plan featured"><span class="tag">Most popular</span><h3>Pro</h3><div class="price">$19<small>/month</small></div><ul><li>Daily monitoring for 5 sites</li><li>Alerts to Slack, Discord or any webhook when access changes</li><li>Fresh re-checks on demand</li><li>Report history</li><li>Cancel anytime</li></ul><button class="btn" data-buy="pro">Start Pro</button></div>
    <div class="card plan"><h3>Agency</h3><div class="price">$49<small>/month</small></div><ul><li>Everything in Pro, for 25 sites</li><li>Embeddable lead-capture checker</li><li>Branded reports with your call-to-action</li><li>Lead webhooks + CSV export</li></ul><button class="btn ghost" data-buy="agency">Start Agency</button></div>
  </div>
  <div id="wl" class="card" hidden style="margin-top:16px;max-width:560px"><b id="wlt">Paid plans open shortly</b><p class="muted" style="margin:6px 0 12px;font-size:15px">Leave your email and we'll set you up first — founding members get 50% off for life.</p><form id="wlf" style="display:flex;gap:8px;flex-wrap:wrap"><input type="email" required placeholder="you@company.com" style="flex:1;min-width:200px;font:inherit;padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--ink)"><button class="btn">Notify me</button></form><div id="wlm" class="muted" style="margin-top:8px;font-size:14px"></div></div>
</div></section>

<section style="padding-top:0"><div class="wrap" style="max-width:820px">
  <h2 class="display" style="margin-bottom:18px">Questions</h2>
  ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
</div></section>
</main>
${FOOTER}
<script type="application/ld+json">${safeJson(ld)}</script>
<script>${RENDER_JS}
(function(){
  var f=document.getElementById('f'),u=document.getElementById('u'),go=document.getElementById('go'),out=document.getElementById('out'),err=document.getElementById('err'),prog=document.getElementById('prog');
  var timers=[];
  function progress(on){ prog.hidden=!on; var d=prog.children; timers.forEach(clearTimeout); timers=[]; for(var i=0;i<d.length;i++){ d[i].className=''; if(on)(function(i){timers.push(setTimeout(function(){d[i].className='on';},i*2600));})(i);} }
  f.addEventListener('submit',function(e){
    e.preventDefault(); err.textContent=''; out.innerHTML=''; go.disabled=true; go.innerHTML='<span class="spinner"></span> Checking'; progress(true);
    fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u.value})}).then(function(r){return r.json();}).then(function(d){
      progress(false); go.disabled=false; go.textContent='Check again';
      if(d.error){err.textContent=d.error;return;}
      out.innerHTML=renderReport(d.report,{shareUrl:d.reportUrl});
      try{history.replaceState(null,'','/?url='+encodeURIComponent(u.value));}catch(e){}
      out.scrollIntoView({behavior:'smooth',block:'start'});
    }).catch(function(){progress(false);go.disabled=false;go.textContent='Check my site';err.textContent='Could not reach the checker. Please try again.';});
  });
  if(u.value && /[?&]url=/.test(location.search)) f.requestSubmit ? f.requestSubmit() : go.click();
  var wl=document.getElementById('wl'),wlf=document.getElementById('wlf'),wlm=document.getElementById('wlm'),plan='pro';
  document.querySelectorAll('[data-buy]').forEach(function(b){b.addEventListener('click',function(){
    plan=b.getAttribute('data-buy'); b.disabled=true;
    fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:plan})}).then(function(r){return r.json();}).then(function(d){
      b.disabled=false; if(d.url){location.href=d.url;return;}
      wl.hidden=false; document.getElementById('wlt').textContent=(plan==='agency'?'Agency':'Pro')+' is opening to founding members'; wl.scrollIntoView({behavior:'smooth',block:'center'}); wlf.querySelector('input').focus();
    }).catch(function(){b.disabled=false;});
  });});
  wlf.addEventListener('submit',function(e){e.preventDefault();
    fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:wlf.querySelector('input').value,plan:plan})}).then(function(r){return r.json();}).then(function(d){wlm.textContent=d.error||"You're on the list. We'll email you as soon as your spot opens.";});
  });
})();
</script>`;
  return shell({ title: 'Can ChatGPT see your website? Free AI crawler checker — Citable', description: 'Free check: are ChatGPT search, Perplexity, Claude, Google AI Overviews and Copilot blocked from your site by robots.txt, your CDN/firewall, noindex or JavaScript-only pages? Get the exact fix, then monitor it daily.', origin, path: '/', body });
}

export function reportPage({ origin, id, report, brand }) {
  const title = `${report.host}: ${report.score}/100 — ${report.headline}`;
  const shareUrl = `${origin}/r/${id}${brand ? '' : ''}`;
  const top = brand
    ? `<div class="wrap"><nav class="top"><div class="logo">${brand.logoUrl ? `<img src="${esc(brand.logoUrl)}" alt="" style="height:28px">` : `<i style="background:${esc(brand.color || '#0f766e')}"></i>`}${esc(brand.name || 'AI visibility report')}</div>${brand.ctaUrl ? `<a class="btn sm" style="background:${esc(brand.color || '#0f766e')};color:#fff" href="${esc(brand.ctaUrl)}" target="_blank" rel="noopener">${esc(brand.ctaLabel || 'Book a call')}</a>` : ''}</nav></div>`
    : NAV();
  const body = `${top}<main class="wrap"><div class="report" id="out"></div>
${brand ? '' : `<div class="report" style="text-align:center;margin-top:30px"><a class="btn ghost" href="/">Check another site</a></div>`}</main>
${brand ? `<footer><div class="wrap"><div>AI visibility report${brand.name ? ' by ' + esc(brand.name) : ''}</div><div>Powered by <a href="${esc(origin)}/">Citable</a></div></div></footer>` : FOOTER}
<script type="application/json" id="data">${safeJson({ report, brand, shareUrl })}</script>
<script>${RENDER_JS}
var D=JSON.parse(document.getElementById('data').textContent);document.getElementById('out').innerHTML=renderReport(D.report,{shareUrl:D.brand?null:D.shareUrl,brand:D.brand});
</script>`;
  return shell({ title, description: `AI search visibility report for ${report.host}: which crawlers from ChatGPT, Perplexity, Claude, Google and Microsoft can read this site, and what to fix.`, origin, path: `/r/${id}`, body, noindex: true });
}

export function aboutPage({ origin }) {
  const body = `${NAV()}<main class="wrap" style="max-width:780px;padding-top:30px;padding-bottom:60px">
<h1 class="display" style="font-size:48px;margin-bottom:18px">How Citable checks AI visibility</h1>
<p>Citable answers one question: <b>when an AI search engine tries to read your page, does it get your content?</b> Each check runs four tests.</p>
<h3 style="margin-top:28px">1. robots.txt, parsed like crawlers parse it</h3>
<p>We fetch <span class="kbd">/robots.txt</span> and evaluate it per crawler using the rules in RFC 9309: a crawler obeys only the most specific group that names it (falling back to <span class="kbd">*</span>), the longest matching path wins, and Allow wins a tie. A robots.txt that returns a server error is treated as "disallow everything", because that is what crawlers do.</p>
<h3 style="margin-top:28px">2. Live firewall test</h3>
<p>We load your page once as a normal browser and once as each of these crawlers, from the same network: OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, GPTBot and ClaudeBot. If the browser gets your page but a crawler gets a 403/429/503, a challenge page, or a page with most of the content missing, something upstream of robots.txt is turning it away.</p>
<p class="muted">Limitation: we send each crawler's real user-agent but not from the operator's own IP addresses. Firewalls that only match on verified IPs can behave differently, and when even the browser request is challenged we mark results as unclear rather than guessing. We do not impersonate Googlebot or Bingbot in live tests, because many firewalls rightly block fake search bots — those two are checked through robots.txt and indexability only.</p>
<h3 style="margin-top:28px">3. Indexability</h3>
<p>We look for <span class="kbd">noindex</span> in robots meta tags and the <span class="kbd">X-Robots-Tag</span> header. Google AI Overviews and Copilot draw on the Google and Bing indexes, so a noindex removes you from those answers too.</p>
<h3 style="margin-top:28px">4. Can the content be read without JavaScript?</h3>
<p>The AI crawlers named above fetch HTML and do not execute JavaScript. We count the words readable in the raw HTML; if a page is a JavaScript shell, crawlers see an empty page even when they are allowed in. We also check for Organization/LocalBusiness structured data and an optional llms.txt.</p>
<h3 style="margin-top:28px">Crawlers checked</h3>
<p><b>Search &amp; answers:</b> OAI-SearchBot (ChatGPT search), PerplexityBot, Claude-SearchBot, Googlebot (Search &amp; AI Overviews), Bingbot (Bing &amp; Copilot), Applebot, DuckAssistBot.<br><b>On request:</b> ChatGPT-User, Perplexity-User, Claude-User.<br><b>Training</b> (blocking these is a legitimate choice and does not affect AI search): GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Meta-ExternalAgent, Bytespider, Amazonbot.</p>
<h3 style="margin-top:28px">The score</h3>
<p>85 points come from which search and on-request crawlers can read the page, weighted by reach (ChatGPT search and Google carry the most weight). Up to 15 more come from structured data and a title and description. JavaScript-only pages are scaled down sharply, and noindex caps the score at 25. Training crawlers carry no weight.</p>
<p style="margin-top:30px"><a class="btn" href="/#check">Run a free check</a></p>
</main>${FOOTER}`;
  return shell({ title: 'Methodology — how Citable checks AI crawler access', description: 'How Citable tests robots.txt, firewalls/CDNs, noindex and JavaScript rendering for ChatGPT, Perplexity, Claude, Google and Microsoft crawlers.', origin, path: '/about', body });
}

export function activatePage({ origin, account, error }) {
  const dash = account ? `${origin}/app#k=${account.secret}` : '';
  const body = `${NAV(false)}<main class="wrap" style="max-width:640px;padding:40px 20px 80px">
${error ? `<div class="card"><h2>Hmm.</h2><p>${esc(error)}</p><p><a href="/#pricing">Back to pricing</a></p></div>` : `
<div class="card"><span class="eyebrow">Payment received</span><h2 class="display" style="font-size:40px">Welcome to Citable ${account.plan === 'agency' ? 'Agency' : 'Pro'}</h2>
<p>Your private dashboard link is below. <b>Bookmark it</b> — it is your login. Anyone with this link can manage your account, so keep it private.</p>
<div class="share"><input readonly value="${esc(dash)}" onclick="this.select()"><button class="btn sm" type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(this.previousElementSibling.value);this.textContent='Copied'">Copy</button></div>
<p style="margin-top:22px"><a class="btn" href="${esc(dash)}">Open my dashboard</a></p>
<p class="muted" style="font-size:14px">Lost the link? Reply to your Stripe receipt and we'll send a new one.</p></div>`}
</main>`;
  return shell({ title: 'Activate — Citable', description: 'Activate your Citable account.', origin, path: '/activate', body, noindex: true });
}

export function notFoundPage({ origin }) {
  return shell({ title: 'Not found — Citable', description: 'Page not found.', origin, path: '/404', noindex: true,
    body: `${NAV()}<main class="wrap" style="padding:60px 20px;text-align:center"><h1 class="display" style="font-size:48px">Nothing here</h1><p class="muted">That report may have expired or the link is wrong.</p><p><a class="btn" href="/">Run a new check</a></p></main>${FOOTER}` });
}

export function appPage({ origin }) {
  const body = `${NAV(false)}<main class="wrap app" style="padding-bottom:70px">
<div id="login" class="card" hidden style="max-width:560px;margin:30px auto"><h2>Dashboard</h2><p class="muted">Open the private link from your activation page, or paste your key.</p><form id="lf" style="display:flex;gap:8px"><input id="lk" placeholder="ck_…" aria-label="Account key"><button class="btn">Open</button></form><p class="muted" style="font-size:14px;margin-top:14px">No account yet? <a href="/#pricing">See plans</a>.</p></div>
<div id="dash" hidden>
  <div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap;margin:18px 0 6px"><div><h1 class="display" style="font-size:40px">Your sites</h1><div class="muted" id="planline"></div></div><button class="btn ghost sm" id="logout" type="button">Sign out on this device</button></div>
  <div class="card" style="margin-top:14px"><form id="mf" style="display:flex;gap:8px;flex-wrap:wrap"><input id="mu" placeholder="Add a site to monitor daily — yourclient.com" style="flex:1;min-width:220px" aria-label="Site to monitor"><button class="btn" id="mb">Add &amp; check</button></form><div class="err" id="merr"></div>
  <div class="tblwrap"><table class="tbl" style="margin-top:8px"><thead><tr><th>Site</th><th>Score</th><th>Last checked</th><th>Last change</th><th></th></tr></thead><tbody id="mons"></tbody></table></div></div>

  <div class="grid g2" style="margin-top:16px;align-items:start">
    <div class="card"><h3>Alerts &amp; branding</h3>
      <form id="sf">
        <label for="s_wh">Alert webhook (Slack, Discord, Zapier, Make…)</label><input id="s_wh" placeholder="https://hooks.slack.com/services/…">
        <div class="agency-only"><label for="s_brand">Agency / brand name</label><input id="s_brand" placeholder="Acme Digital">
        <label for="s_color">Brand colour</label><input id="s_color" type="color" style="height:42px;padding:4px">
        <label for="s_logo">Logo URL (optional)</label><input id="s_logo" placeholder="https://…/logo.png">
        <label for="s_cta">Call-to-action link</label><input id="s_cta" placeholder="https://calendly.com/you/ai-visibility">
        <label for="s_ctal">Call-to-action label</label><input id="s_ctal" placeholder="Book a free AI-visibility call"></div>
        <label for="s_email">Account email</label><input id="s_email" type="email">
        <p><button class="btn" style="margin-top:14px">Save</button> <span id="smsg" class="muted"></span></p>
      </form>
    </div>
    <div class="card agency-only"><h3>Your lead-capture widget</h3><p class="muted" style="font-size:15px">Paste this where you want the checker to appear (WordPress: Custom HTML block · Webflow/Framer: Embed · Wix/Squarespace: Code block).</p><pre id="snip"></pre><button class="btn ghost sm" type="button" id="copysnip">Copy code</button>
      <h3 style="margin-top:24px">Leads <span class="muted" id="lcount"></span></h3><div class="tblwrap"><table class="tbl"><thead><tr><th>When</th><th>Email</th><th>Site</th><th>Score</th></tr></thead><tbody id="leads"></tbody></table></div>
      <p><button class="btn ghost sm" type="button" id="csv" style="margin-top:12px">Download CSV</button></p></div>
  </div>
</div>
</main>
<script>
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var K=null; try{var h=location.hash.match(/k=(ck_[A-Za-z0-9]+)/); if(h){K=h[1];localStorage.setItem('citable_k',K);history.replaceState(null,'','/app');} else K=localStorage.getItem('citable_k');}catch(e){var h2=location.hash.match(/k=(ck_[A-Za-z0-9]+)/);K=h2&&h2[1];}
function api(path,opt){opt=opt||{};opt.headers=Object.assign({'Authorization':'Bearer '+K,'Content-Type':'application/json'},opt.headers||{});return fetch(path,opt);}
function when(t){return t?new Date(t).toLocaleString():'—';}
function load(){
  if(!K){document.getElementById('login').hidden=false;return;}
  api('/api/me').then(function(r){if(r.status===401){try{localStorage.removeItem('citable_k')}catch(e){}K=null;document.getElementById('login').hidden=false;return null;}return r.json();}).then(function(d){
    if(!d)return; document.getElementById('dash').hidden=false; var a=d.account;
    document.getElementById('planline').textContent=(a.plan==='agency'?'Agency':'Pro')+' plan · '+a.status+' · '+d.monitors.length+' of '+a.limits.monitors+' sites monitored daily';
    document.querySelectorAll('.agency-only').forEach(function(el){el.hidden=!a.limits.widget;});
    document.getElementById('mons').innerHTML=d.monitors.map(function(m){return '<tr><td><a href="/r/'+esc(m.last_report)+'" target="_blank">'+esc(m.url)+'</a></td><td><b>'+esc(m.last_score)+'</b></td><td>'+when(m.last_checked)+'</td><td>'+when(m.last_changed)+'</td><td><button class="btn ghost sm" data-del="'+esc(m.id)+'">Remove</button></td></tr>';}).join('')||'<tr><td colspan="5" class="muted">No sites yet — add your first above.</td></tr>';
    document.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){api('/api/monitors/'+b.getAttribute('data-del')+'/delete',{method:'POST'}).then(load);};});
    document.getElementById('s_wh').value=a.webhookUrl||'';document.getElementById('s_brand').value=a.brand||'';document.getElementById('s_color').value=a.color||'#0f766e';document.getElementById('s_logo').value=a.logoUrl||'';document.getElementById('s_cta').value=a.ctaUrl||'';document.getElementById('s_ctal').value=a.ctaLabel||'';document.getElementById('s_email').value=a.email||'';
    if(d.embedSnippet){document.getElementById('snip').textContent=d.embedSnippet;}
    document.getElementById('lcount').textContent='('+d.leads.length+')';
    document.getElementById('leads').innerHTML=d.leads.map(function(l){return '<tr><td>'+when(l.created_at)+'</td><td>'+esc(l.email)+'</td><td><a target="_blank" href="/r/'+esc(l.report_id)+'?b='+esc(a.publicId)+'">'+esc(l.site.split('//').pop())+'</a></td><td>'+esc(l.score)+'</td></tr>';}).join('')||'<tr><td colspan="4" class="muted">Leads from your widget appear here.</td></tr>';
  });
}
document.getElementById('lf').onsubmit=function(e){e.preventDefault();K=document.getElementById('lk').value.trim();try{localStorage.setItem('citable_k',K)}catch(e){};document.getElementById('login').hidden=true;load();};
document.getElementById('logout').onclick=function(){try{localStorage.removeItem('citable_k')}catch(e){};location.href='/';};
document.getElementById('mf').onsubmit=function(e){e.preventDefault();var b=document.getElementById('mb'),er=document.getElementById('merr');er.textContent='';b.disabled=true;b.textContent='Checking…';
  api('/api/monitors',{method:'POST',body:JSON.stringify({url:document.getElementById('mu').value})}).then(function(r){return r.json();}).then(function(d){b.disabled=false;b.textContent='Add & check';if(d.error){er.textContent=d.error;return;}document.getElementById('mu').value='';load();});};
document.getElementById('sf').onsubmit=function(e){e.preventDefault();api('/api/me',{method:'POST',body:JSON.stringify({webhookUrl:s_wh.value,brand:s_brand.value,color:s_color.value,logoUrl:s_logo.value,ctaUrl:s_cta.value,ctaLabel:s_ctal.value,email:s_email.value})}).then(function(){document.getElementById('smsg').textContent='Saved';setTimeout(function(){document.getElementById('smsg').textContent='';},2000);load();});};
document.getElementById('copysnip').onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('snip').textContent);this.textContent='Copied';};
document.getElementById('csv').onclick=function(){api('/api/leads.csv').then(function(r){return r.blob();}).then(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='citable-leads.csv';a.click();});};
load();
</script>`;
  return shell({ title: 'Dashboard — Citable', description: 'Your Citable dashboard.', origin, path: '/app', body, noindex: true });
}
