// Gives social-media and search crawlers a page with the right title, description and image
// for a news article or story (they do not run JavaScript, so the single-page app alone would
// show the same generic preview for every link). Real visitors pass straight through.
// If anything goes wrong this falls back to the normal site.
type Ctx = { next: () => Promise<Response> };

const BOT = /(facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|Googlebot|bingbot)/i;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default async (request: Request, context: Ctx): Promise<Response> => {
  try {
    if (!BOT.test(request.headers.get('user-agent') ?? '')) return context.next();
    const u = new URL(request.url);
    const m = u.pathname.match(/^\/(news|stories)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    if (!m) return context.next();
    const env = (k: string): string | undefined => Netlify.env.get(k);
    const base = env('SUPABASE_URL') ?? env('VITE_SUPABASE_URL');
    const key = env('VITE_SUPABASE_ANON_KEY');
    if (!base || !key) return context.next();

    const [, section, slug] = m;
    const table = section === 'news' ? 'articles' : 'stories';
    const cols = section === 'news' ? 'title,summary,seo_title,seo_description,featured_image_url' : 'title,intro,featured_image_url';
    const now = new Date().toISOString();
    const res = await fetch(`${base}/rest/v1/${table}?select=${cols}&slug=eq.${slug}&status=eq.published&published_at=lte.${encodeURIComponent(now)}&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return context.next();
    const rows = (await res.json()) as Record<string, string | null>[];
    const row = rows[0];
    if (!row) return context.next();

    const title = row.seo_title || row.title || 'The Ray of Hope Foundation';
    const desc = (row.seo_description || row.summary || row.intro || '').slice(0, 200);
    const image = row.featured_image_url;
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)} | The Ray of Hope Foundation</title>
<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(u.origin + u.pathname)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="The Ray of Hope Foundation">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(u.origin + u.pathname)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
</head><body><h1>${esc(title)}</h1><p>${esc(desc)}</p></body></html>`;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
  } catch {
    return context.next();
  }
};
