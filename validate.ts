// Pure helpers, kept separate so they can be unit tested without a network.
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

export function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  // Remove control characters (except newline and tab) and trim.
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

export interface ContactInput { name: string; email: string; subject: string; message: string }

export function validateContact(body: Record<string, unknown>): { ok: true; value: ContactInput } | { ok: false; message: string } {
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const subject = clean(body.subject, 160);
  const message = clean(body.message, 4000);
  if (name.length < 2) return { ok: false, message: 'Please enter your name.' };
  if (!EMAIL_RE.test(email)) return { ok: false, message: 'Please enter a valid email address.' };
  if (message.length < 10) return { ok: false, message: 'Please write a little more in your message.' };
  return { ok: true, value: { name, email, subject, message } };
}

export function looksLikeBot(body: Record<string, unknown>): boolean {
  if (typeof body.website === 'string' && body.website.trim() !== '') return true; // honeypot filled
  const elapsed = Number(body.elapsedMs);
  return Number.isFinite(elapsed) && elapsed < 2000; // submitted faster than a person can type
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
