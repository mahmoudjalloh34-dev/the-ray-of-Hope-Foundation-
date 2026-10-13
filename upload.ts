import { db } from '../lib/supabase';
import type { MediaItem } from '../lib/types';

export const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
export const MAX_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 1800;

/** Shrink large photos in the browser so pages stay light on slow connections. */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 600_000) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch { return file; }
}

export async function uploadMedia(raw: File, alt: string, userId: string): Promise<MediaItem> {
  if (!ALLOWED.includes(raw.type)) throw new Error('Only JPG, PNG, WebP, GIF images and PDF files can be uploaded.');
  const file = await shrink(raw);
  if (file.size > MAX_BYTES) throw new Error('That file is larger than 5 MB. Please choose a smaller one.');
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db().storage.from('media').upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' });
  if (error) throw new Error(error.message);
  const { data: pub } = db().storage.from('media').getPublicUrl(path);
  const { data, error: e2 } = await db().from('media')
    .insert({ path, url: pub.publicUrl, alt, mime_type: file.type, size_bytes: file.size, uploaded_by: userId })
    .select('*').single();
  if (e2) { await db().storage.from('media').remove([path]); throw new Error(e2.message); }
  return data as MediaItem;
}
