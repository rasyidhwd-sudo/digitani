import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getUserById } from './db';
const SECRET = process.env.AUTH_SECRET || 'ganti-secret-ini-di-env';
const sig = (id) => createHmac('sha256', SECRET).update(id).digest('hex');
export const makeToken = (id) => `${id}.${sig(id)}`;
function verify(token) {
  const [id, s] = (token || '').split('.');
  if (!id || !s) return null;
  const a = Buffer.from(s), b = Buffer.from(sig(id));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}
export async function getUser() {
  const id = verify(cookies().get('dt_user')?.value);
  if (!id) return null;
  let u = null;
  try { u = await getUserById(id); } catch (e) { console.error('[auth] database tidak bisa dihubungi:', e.message); }
  return u ? { id: u.id, name: u.name, role: u.role, email: u.email, location: u.location, commodities: u.commodities } : null;
}
