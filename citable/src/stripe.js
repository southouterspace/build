// Minimal Stripe REST client for Workers (no SDK needed).
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object' && !Array.isArray(v)) form(v, key, out);
    else if (Array.isArray(v)) v.forEach((item, i) => typeof item === 'object' ? form(item, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, item));
    else out.append(key, String(v));
  }
  return out;
}

async function stripe(env, method, path, params) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Version': '2024-06-20' },
    body: params ? form(params) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path}: ${data?.error?.message || res.status}`);
  return data;
}

export function createCheckoutSession(env, { plan, planInfo, origin, email }) {
  return stripe(env, 'POST', '/checkout/sessions', {
    mode: 'subscription',
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: planInfo.amount, recurring: { interval: 'month' }, product_data: { name: planInfo.name } } }],
    success_url: `${origin}/activate?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
    allow_promotion_codes: 'true',
    customer_email: email,
    metadata: { plan },
    subscription_data: { metadata: { plan } },
  });
}

export function getCheckoutSession(env, id) {
  return stripe(env, 'GET', `/checkout/sessions/${encodeURIComponent(id)}`);
}

// Verify Stripe-Signature header (t=...,v1=...) with HMAC-SHA256, 5 minute tolerance.
export async function verifyStripeSignature(payload, header, secret) {
  const parts = Object.fromEntries(header.split(',').map(kv => kv.split('=')).filter(x => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
  const sigs = header.split(',').filter(x => x.trim().startsWith('v1=')).map(x => x.trim().slice(3));
  if (!parts.t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${parts.t}.${payload}`)));
  const hex = [...mac].map(b => b.toString(16).padStart(2, '0')).join('');
  return sigs.some(s => s.length === hex.length && timingSafeEqual(s, hex));
}
function timingSafeEqual(a, b) { let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
