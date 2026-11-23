import { NextResponse } from 'next/server';
import { read } from '@/lib/db';
import { sha, makeToken } from '@/lib/auth';
export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  const u = (await read('users')).find((x) => x.email === (email || '').toLowerCase() && x.passwordHash === sha(password || ''));
  if (!u) return NextResponse.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('dt_user', makeToken(u.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
