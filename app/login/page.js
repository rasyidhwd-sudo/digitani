'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState('budi@digitani.test');
  const [password, setPassword] = useState('tani12345');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) { r.push('/dashboard'); r.refresh(); } else { setErr((await res.json()).error || 'Gagal masuk.'); setBusy(false); }
  }
  return (
    <main className="min-h-screen grid place-items-center p-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-sage"><Leaf size={20} />DigiTani</Link>
        <h1 className="text-xl font-bold">Masuk ke akun Anda</h1>
        <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi" required />
        {err && <p className="text-sm text-earth">{err}</p>}
        <button className="btn w-full justify-center" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
        <p className="text-sm text-stone">Belum punya akun? <Link href="/daftar" className="text-sage font-semibold">Daftar</Link></p><p className="text-xs text-stone">Akun demo sudah terisi. Data pengguna disimpan di data/users.json.</p>
      </form>
    </main>
  );
}
