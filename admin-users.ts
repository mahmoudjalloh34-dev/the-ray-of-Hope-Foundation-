import { env } from './_lib/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Context } from '@netlify/functions';
import { EMAIL_RE, clean } from './_lib/validate';

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const ROLES = ['super_admin', 'editor', 'author'] as const;

async function requireSuperAdmin(req: Request, admin: SupabaseClient): Promise<{ id: string } | Response> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { message: 'Please sign in again.' });
  const { data: u, error } = await admin.auth.getUser(token);
  if (error || !u.user) return json(401, { message: 'Please sign in again.' });
  const { data: p } = await admin.from('profiles').select('role,active').eq('id', u.user.id).maybeSingle();
  if (!p || !p.active || p.role !== 'super_admin') return json(403, { message: 'Only a super administrator can do this.' });
  return { id: u.user.id };
}

export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== 'POST') return json(405, { message: 'Method not allowed.' });
  const url = env('SUPABASE_URL') ?? env('VITE_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json(503, { message: 'The server is not configured for user management.' });

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const who = await requireSuperAdmin(req, admin);
  if (who instanceof Response) return who;

  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; } catch { return json(400, { message: 'Bad request.' }); }

  const origin = (env('SITE_URL') || new URL(req.url).origin).replace(/\/$/, '');

  if (body.action === 'invite') {
    const email = clean(body.email, 254).toLowerCase();
    const fullName = clean(body.full_name, 120);
    const role = ROLES.find((r) => r === body.role);
    if (!EMAIL_RE.test(email) || !fullName || !role) return json(400, { message: 'Enter a name, a valid email and a role.' });
    const canPublish = role === 'super_admin' ? true : body.can_publish === true;

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName }, redirectTo: `${origin}/admin/set-password` });
    if (error || !data.user) return json(400, { message: error?.message ?? 'Could not send the invitation.' });

    // The auth trigger created an inactive author profile; grant the chosen access now.
    const { error: upErr } = await admin.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, role, can_publish: canPublish, active: true });
    if (upErr) return json(500, { message: 'The invitation was sent but the account could not be activated. Open Users and activate it manually.' });
    return json(200, { message: `Invitation sent to ${email}.` });
  }

  if (body.action === 'remove') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json(400, { message: 'Bad request.' });
    if (id === who.id) return json(400, { message: 'You cannot remove your own account.' });
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json(400, { message: error.message });
    return json(200, { message: 'Account removed.' });
  }

  return json(400, { message: 'Unknown action.' });
};
