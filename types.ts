export type Role = 'super_admin' | 'editor' | 'author';
export type Status = 'draft' | 'published' | 'archived';
export type Stage = 'planned' | 'pilot' | 'active';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  role: Role;
  can_publish: boolean;
  active: boolean;
}
export interface Category { id: string; name: string; slug: string; description: string | null; sort_order: number }
export interface Tag { id: string; name: string; slug: string }

export interface Article {
  id: string; title: string; slug: string; subtitle: string | null; summary: string; content: string;
  featured_image_url: string | null; featured_image_alt: string | null; featured_image_caption: string | null;
  category_id: string | null; author_id: string | null; author_name: string; status: Status;
  is_featured: boolean; published_at: string | null; seo_title: string | null; seo_description: string | null;
  created_at: string; updated_at: string;
  categories?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  article_tags?: { tags: Tag | null }[];
}
export interface Story {
  id: string; title: string; slug: string; intro: string; content: string;
  featured_image_url: string | null; featured_image_alt: string | null; featured_image_caption: string | null;
  programme_id: string | null; author_id: string | null; author_name: string; status: Status;
  is_featured: boolean; published_at: string | null; consent_confirmed: boolean; consent_note: string | null;
  created_at: string; updated_at: string;
  programmes?: { title: string; slug: string } | null;
}
export interface Programme {
  id: string; title: string; slug: string; summary: string; description: string; objectives: string;
  target_audience: string; activities: string; stage: Stage; image_url: string | null; image_alt: string | null;
  status: Status; sort_order: number;
}
export interface EventItem {
  id: string; title: string; slug: string; description: string; venue: string | null; starts_at: string;
  ends_at: string | null; registration_url: string | null; image_url: string | null; image_alt: string | null;
  status: Status;
}
export interface TeamMember {
  id: string; name: string; role_title: string; bio: string; photo_url: string | null; sort_order: number; published: boolean;
}
export interface MediaItem {
  id: string; path: string; url: string; alt: string; mime_type: string | null; size_bytes: number | null; created_at: string;
}
export interface ContactSubmission {
  id: string; name: string; email: string; subject: string | null; message: string; is_read: boolean; created_at: string;
}
export interface ActivityRow {
  id: number; actor_name: string | null; action: string; entity: string; title: string | null; created_at: string;
}

export interface DonationChannel { label: string; details: string; url?: string }
export interface Stat { label: string; value: string; note?: string }

export interface SiteSettings {
  org: { name: string; tagline: string; email: string; phone: string; address: string; registration: string };
  social: Record<'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube' | 'whatsapp', string>;
  donation: { enabled: boolean; intro: string; channels: DonationChannel[] };
  impact: { stats: Stat[] };
  faq: { items: { q: string; a: string }[] };
  page_privacy: { html: string };
  page_terms: { html: string };
  page_accessibility: { html: string };
  about: { mission: string; vision: string; values: { title: string; text: string }[]; governance_html: string };
}
