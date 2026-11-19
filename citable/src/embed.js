// Agency lead-capture widget. Served at /embed.js; __ORIGIN__ is replaced at request time.
export const EMBED_JS = String.raw`(function(){
  var ORIGIN = "__ORIGIN__";
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function mount(el){
    if (el.__citable) return; el.__citable = true;
    var pid = el.getAttribute('data-citable');
    var root = el.attachShadow ? el.attachShadow({mode:'open'}) : el;
    root.innerHTML = '<div style="font:15px/1.5 system-ui,sans-serif;color:#555">Loading…</div>';
    fetch(ORIGIN + '/api/embed/config?pid=' + encodeURIComponent(pid)).then(function(r){return r.json();}).then(function(cfg){
      if (cfg.error) { root.innerHTML = ''; return; }
      var c = /^#[0-9a-f]{6}$/i.test(cfg.color||'') ? cfg.color : '#0f766e';
      var brand = cfg.brand || '';
      root.innerHTML =
        '<style>'+
        ':host{all:initial;display:block}'+
        '.w{font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;color:#111827;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:22px;max-width:640px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.06)}'+
        '.h{font-size:20px;font-weight:700;margin:0 0 4px;letter-spacing:-.01em}.s{color:#4b5563;margin:0 0 16px;font-size:14px}'+
        'form{display:grid;gap:10px}input{font:inherit;padding:12px 14px;border:1px solid #d1d5db;border-radius:10px;width:100%;box-sizing:border-box;background:#fff;color:#111827}'+
        'input:focus{outline:2px solid '+c+';outline-offset:1px;border-color:transparent}'+
        'button,.cta{font:inherit;font-weight:600;padding:12px 16px;border-radius:10px;border:0;background:'+c+';color:#fff;cursor:pointer;text-decoration:none;display:inline-block;text-align:center}'+
        'button[disabled]{opacity:.6;cursor:progress}.err{color:#b42318;font-size:14px;min-height:1px}'+
        '.score{display:flex;gap:16px;align-items:center;margin:4px 0 14px}.num{font-size:40px;font-weight:800;line-height:1;color:'+c+'}'+
        '.row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid #f0f0f0;font-size:14px}'+
        '.ok{color:#067647;font-weight:600}.bad{color:#b42318;font-weight:600}.part{color:#b54708;font-weight:600}'+
        '.f{font-size:14px;margin:4px 0;padding-left:18px;position:relative}.f:before{content:"";position:absolute;left:4px;top:8px;width:7px;height:7px;border-radius:50%;background:#b42318}'+
        '.f.warning:before{background:#b54708}.acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}.ghost{background:transparent;color:'+c+';border:1px solid '+c+'}'+
        '.pw{margin-top:14px;font-size:12px;color:#9ca3af}.pw a{color:inherit}'+
        '</style>'+
        '<div class="w"><p class="h">Can ChatGPT see your website?</p>'+
        '<p class="s">Free check'+(brand?' from '+esc(brand):'')+': ChatGPT, Perplexity, Claude, Google AI and Copilot crawlers. Takes about 15 seconds.</p>'+
        '<form><input name="url" required placeholder="yourbusiness.com" autocomplete="url" inputmode="url" aria-label="Website">'+
        '<input name="email" type="email" required placeholder="you@yourbusiness.com" autocomplete="email" aria-label="Email for your report">'+
        '<button type="submit">Check my site</button><div class="err" role="alert"></div></form>'+
        '<div class="out" aria-live="polite"></div>'+
        '<div class="pw">Powered by <a href="'+ORIGIN+'/?ref='+encodeURIComponent(pid)+'" target="_blank" rel="noopener">Citable</a></div></div>';
      var form = root.querySelector('form'), out = root.querySelector('.out'), err = root.querySelector('.err'), btn = root.querySelector('button');
      form.addEventListener('submit', function(e){
        e.preventDefault(); err.textContent=''; btn.disabled = true; btn.textContent = 'Checking… (~15s)';
        fetch(ORIGIN + '/api/embed/check', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({pid:pid, url:form.url.value, email:form.email.value, page: location.href})})
          .then(function(r){return r.json();}).then(function(d){
            btn.disabled = false; btn.textContent = 'Check another site';
            if (d.error) { err.textContent = d.error; return; }
            var r = d.report, label = {allowed:'Can read',blocked:'Blocked',partial:'Partial',unknown:'Unclear'}, cls={allowed:'ok',blocked:'bad',partial:'part',unknown:'part'};
            var rows = r.crawlers.filter(function(x){return ['OAI-SearchBot','PerplexityBot','Claude-SearchBot','Googlebot','Bingbot','ChatGPT-User'].indexOf(x.token)>-1;})
              .map(function(x){return '<div class="row"><span>'+esc(x.product)+' <span style="color:#9ca3af">'+esc(x.token)+'</span></span><span class="'+cls[x.status]+'">'+label[x.status]+(x.blockedBy?' · '+esc(x.blockedBy):'')+'</span></div>';}).join('');
            var fs = r.findings.map(function(f){return '<div class="f '+esc(f.severity)+'">'+esc(f.title)+'</div>';}).join('');
            out.innerHTML = '<div class="score"><div class="num">'+r.score+'</div><div><b>'+esc(r.headline)+'</b><div style="color:#6b7280;font-size:14px">'+esc(r.host)+' · AI visibility score out of 100</div></div></div>'+
              rows + (fs?'<div style="margin-top:12px">'+fs+'</div>':'') +
              '<div class="acts">'+(cfg.ctaUrl?'<a class="cta" target="_blank" rel="noopener" href="'+esc(cfg.ctaUrl)+'">'+esc(cfg.ctaLabel||'Get help fixing this')+'</a>':'')+
              '<a class="cta ghost" target="_blank" rel="noopener" href="'+esc(d.reportUrl)+'">Full report &amp; fixes</a></div>';
          }).catch(function(){ btn.disabled=false; btn.textContent='Check my site'; err.textContent='Could not reach the checker. Please try again.'; });
      });
    }).catch(function(){ root.innerHTML=''; });
  }
  function scan(){ var els = document.querySelectorAll('[data-citable]'); for (var i=0;i<els.length;i++) mount(els[i]); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();`;
