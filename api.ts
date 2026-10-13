import { db, isConfigured } from './supabase';
import { DEFAULT_SETTINGS } from './defaults';
import type { Article, Category, EventItem, Programme, SiteSettings, Story, Tag, TeamMember } from './types';
import { safeSearch } from './format';

export const PAGE_SIZE = 9;
const ARTICLE_COLS = 'id,title,slug,subtitle,summary,featured_image_url,featured_image_alt,featured_image_caption,category_id,author_name,is_featured,published_at,categories(id,name,slug)';

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isConfigured) return DEFAULT_SETTINGS;
  const { data, error } = await db().from('site_settings').select('key,value');
  fail(error);
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) {
    const base = (DEFAULT_SETTINGS as unknown as Record<string, unknown>)[row.key];
    merged[row.key] = base && typeof base === 'object' && !Array.isArray(base)
      ? { ...(base as object), ...(row.value as object) }
      : row.value;
  }
  return merged as unknown as SiteSettings;
}

export async function getCategories(): Promise<Category[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('categories').select('*').order('sort_order').order('name');
  fail(error);
  return (data ?? []) as Category[];
}

export async function getTags(): Promise<Tag[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('tags').select('*').order('name');
  fail(error);
  return (data ?? []) as Tag[];
}

export interface ArticleQuery { page: number; search?: string; categorySlug?: string; tagSlug?: string }

export async function listArticles(q: ArticleQuery): Promise<{ items: Article[]; total: number }> {
  if (!isConfigured) return { items: [], total: 0 };
  let articleIds: string[] | null = null;

  if (q.tagSlug) {
    const { data: tag } = await db().from('tags').select('id').eq('slug', q.tagSlug).maybeSingle();
    if (!tag) return { items: [], total: 0 };
    const { data: links, error } = await db().from('article_tags').select('article_id').eq('tag_id', tag.id);
    fail(error);
    articleIds = (links ?? []).map((l) => l.article_id as string);
    if (!articleIds.length) return { items: [], total: 0 };
  }

  let catId: string | null = null;
  if (q.categorySlug) {
    const { data: cat } = await db().from('categories').select('id').eq('slug', q.categorySlug).maybeSingle();
    if (!cat) return { items: [], total: 0 };
    catId = cat.id as string;
  }

  let query = db().from('articles').select(ARTICLE_COLS, { count: 'exact' })
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });
  if (catId) query = query.eq('category_id', catId);
  if (articleIds) query = query.in('id', articleIds);
  const term = q.search ? safeSearch(q.search) : '';
  if (term) query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);
  const from = (q.page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  fail(error);
  return { items: (data ?? []) as unknown as Article[], total: count ?? 0 };
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('articles').select(ARTICLE_COLS)
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .order('is_featured', { ascending: false }).order('published_at', { ascending: false }).limit(limit);
  fail(error);
  return (data ?? []) as unknown as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!isConfigured) return null;
  const { data, error } = await db().from('articles')
    .select('*,categories(id,name,slug),article_tags(tags(id,name,slug))')
    .eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle();
  fail(error);
  return (data as unknown as Article) ?? null;
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  if (!isConfigured) return [];
  let q = db().from('articles').select(ARTICLE_COLS)
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .neq('id', article.id).order('published_at', { ascending: false }).limit(limit);
  if (article.category_id) q = q.eq('category_id', article.category_id);
  const { data, error } = await q;
  fail(error);
  return (data ?? []) as unknown as Article[];
}

const STORY_COLS = 'id,title,slug,intro,featured_image_url,featured_image_alt,featured_image_caption,author_name,is_featured,published_at,programme_id,programmes(title,slug)';

export async function listStories(page: number, limit = PAGE_SIZE): Promise<{ items: Story[]; total: number }> {
  if (!isConfigured) return { items: [], total: 0 };
  const from = (page - 1) * limit;
  const { data, error, count } = await db().from('stories').select(STORY_COLS, { count: 'exact' })
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false }).range(from, from + limit - 1);
  fail(error);
  return { items: (data ?? []) as unknown as Story[], total: count ?? 0 };
}

export async function getStory(slug: string): Promise<Story | null> {
  if (!isConfigured) return null;
  const { data, error } = await db().from('stories').select('*,programmes(title,slug)')
    .eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle();
  fail(error);
  return (data as unknown as Story) ?? null;
}

export async function getRelatedStories(story: Story, limit = 3): Promise<Story[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('stories').select(STORY_COLS)
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .neq('id', story.id).order('published_at', { ascending: false }).limit(limit);
  fail(error);
  return (data ?? []) as unknown as Story[];
}

export async function getStoriesForProgramme(programmeId: string, limit = 3): Promise<Story[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('stories').select(STORY_COLS)
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .eq('programme_id', programmeId).order('published_at', { ascending: false }).limit(limit);
  fail(error);
  return (data ?? []) as unknown as Story[];
}

export async function listProgrammes(): Promise<Programme[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('programmes').select('*').eq('status', 'published').order('sort_order');
  fail(error);
  return (data ?? []) as Programme[];
}

export async function getProgramme(slug: string): Promise<Programme | null> {
  if (!isConfigured) return null;
  const { data, error } = await db().from('programmes').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  fail(error);
  return (data as Programme) ?? null;
}

export async function listEvents(): Promise<{ upcoming: EventItem[]; past: EventItem[] }> {
  if (!isConfigured) return { upcoming: [], past: [] };
  const { data, error } = await db().from('events').select('*').eq('status', 'published').order('starts_at', { ascending: true });
  fail(error);
  const now = Date.now();
  const all = (data ?? []) as EventItem[];
  const ended = (e: EventItem) => new Date(e.ends_at ?? e.starts_at).getTime() < now;
  return {
    upcoming: all.filter((e) => !ended(e)),
    past: all.filter(ended).reverse(),
  };
}

export async function listTeam(): Promise<TeamMember[]> {
  if (!isConfigured) return [];
  const { data, error } = await db().from('team_members').select('*').eq('published', true).order('sort_order');
  fail(error);
  return (data ?? []) as TeamMember[];
}

// ---- Submissions go through a Netlify Function so validation and spam checks run on the server.
export interface SubmitResult { ok: boolean; message: string }

export async function submitForm(kind: 'contact' | 'newsletter', payload: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const res = await fetch('/.netlify/functions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, ...payload }),
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    if (res.ok) return { ok: true, message: body.message ?? 'Thank you.' };
    return { ok: false, message: body.message ?? 'We could not send that. Please try again.' };
  } catch {
    return { ok: false, message: 'We could not reach the server. Check your connection and try again.' };
  }
}
