import { env } from './_lib/env';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import type { Context } from '@netlify/functions';
import { EMAIL_RE, clean, looksLikeBot, validateContact } from './_lib/validate';

const json = (status: number, message: string) =>
  new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const HOURLY_LIMIT = 5;

async function turnstileOk(token: string, ip: string): Promise<boolean> {
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!secret) return true; // not configured: honeypot, timing and rate limits still apply
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export default async (req: Request, context: Context): Promise<Response> => {
  if (req.method !== 'POST') return json(405, 'Method not allowed.');

  const url = env('SUPABASE_URL') ?? env('VITE_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json(503, 'The form is not set up yet. Please try again later.');

  // Basic cross-site guard: if the request names an origin it must be this site.
  const origin = req.headers.get('origin');
  if (origin) {
    const host = new URL(req.url).host;
    let originHost = '';
    try { originHost = new URL(origin).host; } catch { /* ignore */ }
    if (originHost !== host) return json(403, 'Request not allowed.');
  }

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > 20_000) return json(413, 'That message is too large.');
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return json(400, 'We could not read that request.');
  }

  const kind = body.kind;
  if (kind !== 'contact' && kind !== 'newsletter') return json(400, 'Unknown form.');

  // Bots get a friendly success so they learn nothing, but nothing is stored.
  if (looksLikeBot(body)) return json(200, 'Thank you.');

  const ip = context.ip || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ipHash = createHash('sha256').update(`${env('IP_HASH_SALT') ?? ''}|${ip}`).digest('hex');

  if (!(await turnstileOk(clean(body.turnstileToken, 4096), ip))) return json(400, 'The spam check failed. Please try again.');

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const table = kind === 'contact' ? 'contact_submissions' : 'newsletter_subscribers';
  const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
  if ((count ?? 0) >= HOURLY_LIMIT) return json(429, 'You have sent several messages recently. Please try again in an hour.');

  if (kind === 'contact') {
    const v = validateContact(body);
    if (!v.ok) return json(400, v.message);
    const { error } = await supabase.from('contact_submissions').insert({ ...v.value, subject: v.value.subject || null, ip_hash: ipHash });
    if (error) { console.error('contact insert failed', error.code); return json(500, 'We could not save your message. Please try again.'); }
    return json(200, 'Thank you. Your message has reached the foundation and we will reply by email.');
  }

  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return json(400, 'Please enter a valid email address.');
  const { error } = await supabase.from('newsletter_subscribers').insert({ email, ip_hash: ipHash });
  // Duplicate (23505) looks the same to the visitor so addresses cannot be probed.
  if (error && error.code !== '23505') { console.error('newsletter insert failed', error.code); return json(500, 'We could not subscribe you. Please try again.'); }
  return json(200, 'Thank you for subscribing.');
};
