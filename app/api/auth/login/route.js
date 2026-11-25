import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { makeToken } from '@/lib/auth';
export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  let u;
  try { u = await getUserByEmail((email || '').toLowerCase()); }
  catch (e) { console.error('[login]', e.message); return NextResponse.json({ error: 'Database tidak bisa dihubungi. Coba lagi nanti.' }, { status: 503 }); }
  if (!u || !verifyPassword(password || '', u.passwordHash)) return NextResponse.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('dt_user', makeToken(u.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
