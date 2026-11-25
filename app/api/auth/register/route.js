import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { makeToken } from '@/lib/auth';
export async function POST(req) {
  const { name, email, password, location } = await req.json().catch(() => ({}));
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 8)
    return NextResponse.json({ error: 'Lengkapi nama, email yang valid, dan kata sandi minimal 8 karakter.' }, { status: 400 });
  const mail = email.toLowerCase();
  const u = { id: 'u' + Date.now(), name: name.trim(), email: mail, role: 'petani', passwordHash: hashPassword(password), location: (location || '').trim() || '-', commodities: [] };
  try {
    if (await getUserByEmail(mail)) return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    await createUser(u);
  } catch (e) {
    if (e.code === 11000) return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    console.error('[register]', e.message);
    return NextResponse.json({ error: 'Pendaftaran belum tersedia: penyimpanan data tidak bisa dipakai. Isi MONGODB_URI untuk mengaktifkan database.' }, { status: 503 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('dt_user', makeToken(u.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
