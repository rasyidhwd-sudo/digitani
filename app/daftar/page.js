'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
export default function Daftar() {
  const r = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '', location: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    if (res.ok) { r.push('/dashboard'); r.refresh(); } else { setErr((await res.json()).error || 'Gagal mendaftar.'); setBusy(false); }
  }
  return (
    <main className="min-h-screen grid place-items-center p-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-sage"><Leaf size={20} />DigiTani</Link>
        <h1 className="text-xl font-bold">Buat akun baru</h1>
        <input className="inp" placeholder="Nama lengkap" value={f.name} onChange={set('name')} required />
        <input className="inp" type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input className="inp" type="password" placeholder="Kata sandi (minimal 8 karakter)" value={f.password} onChange={set('password')} required />
        <input className="inp" placeholder="Lokasi lahan (opsional)" value={f.location} onChange={set('location')} />
        {err && <p className="text-sm text-earth">{err}</p>}
        <button className="btn w-full justify-center" disabled={busy}>{busy ? 'Memproses…' : 'Daftar'}</button>
        <p className="text-sm text-stone">Sudah punya akun? <Link href="/login" className="text-sage font-semibold">Masuk</Link></p>
      </form>
    </main>
  );
}
