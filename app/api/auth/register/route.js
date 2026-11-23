import { NextResponse } from 'next/server';
import { read, write } from '@/lib/db';
import { sha, makeToken } from '@/lib/auth';
export async function POST(req) {
  const { name, email, password, location } = await req.json().catch(() => ({}));
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 8)
    return NextResponse.json({ error: 'Lengkapi nama, email yang valid, dan kata sandi minimal 8 karakter.' }, { status: 400 });
  const users = await read('users');
  const mail = email.toLowerCase();
  if (users.some((u) => u.email === mail)) return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
  const u = { id: 'u' + Date.now(), name: name.trim(), email: mail, role: 'petani', passwordHash: sha(password), location: (location || '').trim() || '-', commodities: [] };
  users.push(u); await write('users', users);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('dt_user', makeToken(u.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
