import { env } from './_lib/env';
import { createClient } from '@supabase/supabase-js';
import type { Context } from '@netlify/functions';
import { escapeXml } from './_lib/validate';

const STATIC = ['/', '/about', '/programmes', '/news', '/stories', '/events', '/get-involved', '/contact', '/faq', '/privacy', '/terms', '/accessibility'];

export default async (req: Request, _ctx: Context): Promise<Response> => {
  const origin = (env('SITE_URL') || new URL(req.url).origin).replace(/\/$/, '');
  const url = env('SUPABASE_URL') ?? env('VITE_SUPABASE_URL');
  const key = env('VITE_SUPABASE_ANON_KEY') ?? env('SUPABASE_ANON_KEY');
  const entries: { loc: string; lastmod?: string }[] = STATIC.map((p) => ({ loc: `${origin}${p}` }));

  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const now = new Date().toISOString();
    const [a, s, p] = await Promise.all([
      supabase.from('articles').select('slug,updated_at').eq('status', 'published').lte('published_at', now),
      supabase.from('stories').select('slug,updated_at').eq('status', 'published').lte('published_at', now),
      supabase.from('programmes').select('slug,updated_at').eq('status', 'published'),
    ]);
    for (const r of a.data ?? []) entries.push({ loc: `${origin}/news/${r.slug}`, lastmod: r.updated_at });
    for (const r of s.data ?? []) entries.push({ loc: `${origin}/stories/${r.slug}`, lastmod: r.updated_at });
    for (const r of p.data ?? []) entries.push({ loc: `${origin}/programmes/${r.slug}`, lastmod: r.updated_at });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map((e) => `  <url><loc>${escapeXml(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
